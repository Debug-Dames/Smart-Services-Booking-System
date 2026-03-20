// backend/src/modules/Chat/ChatbotServices.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createBooking } from "../bookings/bookings.service.js";
import prisma from "../../config/database.js";
import { env } from "../../config/env.js";

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = env.GEMINI_MODEL;
const DAILY_GEMINI_LIMIT = env.GEMINI_DAILY_LIMIT;
const SHORT_TERM_WINDOW_MS = 60_000;
const SHORT_TERM_LIMIT = 3;
const GLOBAL_SHORT_TERM_LIMIT = 10;
const GEMINI_COOLDOWN_MS = 60_000;
const GEMINI_CACHE_TTL_MS = 120_000;
const dailyUsage = new Map();
const shortTermUsage = new Map();
const globalShortTermUsage = new Map();
const geminiCooldowns = new Map();
const geminiCache = new Map();
const bookingSessions = new Map();
const isTestEnv = () =>
  process.env.NODE_ENV === "test" ||
  typeof process.env.JEST_WORKER_ID !== "undefined";
let lastGeminiErrorLogAt = 0;

const getSessionKey = (userKey) => {
  const base = userKey || "anonymous";
  if (isTestEnv()) {
    return `${base}:test:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  }
  return base;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const getCooldownKey = (userKey) => userKey || "anonymous";

const getWindowRecord = (map, key, now) => {
  const current = map.get(key);
  if (!current || now > current.resetAt) {
    const fresh = { resetAt: now + SHORT_TERM_WINDOW_MS, count: 0 };
    map.set(key, fresh);
    return fresh;
  }
  return current;
};

const isInCooldown = (key) => {
  const until = geminiCooldowns.get(key);
  return Boolean(until && Date.now() < until);
};

const setCooldown = (key, ms) => {
  geminiCooldowns.set(key, Date.now() + ms);
};

const hashText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
};

const getCacheKey = (userKey, text) =>
  `${userKey || "anonymous"}:${hashText(text || "")}`;

const canUseGemini = (userKey) => {
  if (!userKey) return false;
  const now = Date.now();
  const cooldownKey = getCooldownKey(userKey);
  if (isInCooldown("__global__") || isInCooldown(cooldownKey)) return false;
  const today = getTodayKey();
  const current = dailyUsage.get(userKey);
  if (!current || current.date !== today) {
    dailyUsage.set(userKey, { date: today, count: 0 });
  } else if (current.count >= DAILY_GEMINI_LIMIT) {
    return false;
  }

  const globalRecord = getWindowRecord(globalShortTermUsage, "__global__", now);
  if (globalRecord.count >= GLOBAL_SHORT_TERM_LIMIT) return false;

  const windowRecord = getWindowRecord(shortTermUsage, userKey, now);
  return windowRecord.count < SHORT_TERM_LIMIT;
};

const incrementGeminiUsage = (userKey) => {
  const now = Date.now();
  const today = getTodayKey();
  const current = dailyUsage.get(userKey);
  if (!current || current.date !== today) {
    dailyUsage.set(userKey, { date: today, count: 1 });
  } else {
    current.count += 1;
    dailyUsage.set(userKey, current);
  }

  const globalRecord = getWindowRecord(globalShortTermUsage, "__global__", now);
  globalRecord.count += 1;
  globalShortTermUsage.set("__global__", globalRecord);

  const windowRecord = getWindowRecord(shortTermUsage, userKey, now);
  windowRecord.count += 1;
  shortTermUsage.set(userKey, windowRecord);
};

const getGeminiModel = () => {
  if (isTestEnv()) return null;
  if (!GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(GEMINI_API_KEY);
  return client.getGenerativeModel({ model: GEMINI_MODEL });
};

const extractDate = (text) => {
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
};

const extractTime = (text) => {
  const normalized = text.toLowerCase();
  const ampmMatch = normalized.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampmMatch) {
    let hour = Number(ampmMatch[1]);
    const minute = Number(ampmMatch[2] || "0");
    const period = ampmMatch[3];
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return "";
    if (period === "am") {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const timeMatch = normalized.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (timeMatch) {
    return `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}`;
  }

  return "";
};

const safeString = (value) => (typeof value === "string" ? value.trim() : "");

const SERVICE_CATALOG = new Map([
  ["Precision Haircut & Styling", { price: 200, duration: 60 }],
  ["Signature Manicure", { price: 180, duration: 45 }],
  ["Spa Pedicure", { price: 240, duration: 60 }],
  ["Event Makeup Session", { price: 500, duration: 75 }],
  ["Protective Braids", { price: 450, duration: 120 }],
  ["Color Refresh & Gloss", { price: 350, duration: 90 }],
]);

const resolveServiceName = (text) => {
  const normalized = text.toLowerCase();
  const aliases = [
    { match: ["precision haircut", "haircut"], name: "Precision Haircut & Styling" },
    { match: ["signature manicure", "manicure"], name: "Signature Manicure" },
    { match: ["spa pedicure", "pedicure"], name: "Spa Pedicure" },
    { match: ["event makeup session", "event makeup", "makeup"], name: "Event Makeup Session" },
    { match: ["protective braids", "braids"], name: "Protective Braids" },
    { match: ["color refresh", "gloss", "color refresh & gloss"], name: "Color Refresh & Gloss" },
  ];

  const found = aliases.find((entry) =>
    entry.match.some((label) => normalized.includes(label))
  );
  return found ? found.name : "";
};

const extractServiceFallback = (text) => {
  return resolveServiceName(text);
};

const parseStartDateTime = (date, time) => {
  if (!date || !time) return null;
  const iso = `${date}T${time}:00Z`;
  const start = new Date(iso);
  return Number.isNaN(start.getTime()) ? null : start;
};

const toTimeLabel = (dateObj) =>
  dateObj.toISOString().slice(11, 16);

const findOrCreateServiceRecord = async (serviceName) => {
  const normalized = safeString(serviceName);
  if (!normalized) return null;
  const exact = await prisma.service.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });
  if (exact) return exact;

  const partial = await prisma.service.findFirst({
    where: { name: { contains: normalized, mode: "insensitive" } },
  });
  if (partial) return partial;

  const catalogEntry = SERVICE_CATALOG.get(normalized) || SERVICE_CATALOG.get(resolveServiceName(normalized));
  if (!catalogEntry) return null;

  return prisma.service.create({
    data: {
      name: normalized,
      price: catalogEntry.price,
      duration: catalogEntry.duration,
    },
  });
};

const isSlotAvailable = async ({ serviceId, start, end }) => {
  const existing = await prisma.booking.findFirst({
    where: {
      serviceId,
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
  return !existing;
};

const getSuggestedSlots = async ({ date, durationMinutes, serviceId }) => {
  const suggestions = [];
  const dayStart = new Date(`${date}T08:00:00Z`);
  const dayEnd = new Date(`${date}T20:00:00Z`);
  const stepMinutes = 30;

  for (
    let cursor = new Date(dayStart);
    cursor < dayEnd && suggestions.length < 3;
    cursor = new Date(cursor.getTime() + stepMinutes * 60000)
  ) {
    const end = new Date(cursor.getTime() + durationMinutes * 60000);
    if (end > dayEnd) break;
    const available = await isSlotAvailable({ serviceId, start: cursor, end });
    if (available) suggestions.push(toTimeLabel(cursor));
  }

  return suggestions;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetryableGeminiError = (err) => {
  const status = err?.status;
  return status === 429 || status === 503;
};

const extractBookingDetails = async (text, userKey) => {
  const model = getGeminiModel();
  if (!model) return { details: null, didCall: false, didSucceed: false };

  const prompt = [
    "Extract booking details from the user's message.",
    "Return ONLY valid JSON with keys: service, date, time, missing.",
    "service: string or empty string.",
    "date: YYYY-MM-DD or empty string if not explicit.",
    "time: HH:mm 24h or empty string if not explicit.",
    "missing: array containing any of [\"service\",\"date\",\"time\"] that are missing.",
    "User message:",
    text,
  ].join("\n");

  const maxAttempts = 3;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result?.response?.text?.() || "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        return { details: null, didCall: true, didSucceed: true };
      }
      try {
        return {
          details: JSON.parse(match[0]),
          didCall: true,
          didSucceed: true,
        };
      } catch {
        return { details: null, didCall: true, didSucceed: true };
      }
    } catch (err) {
      attempt += 1;
      const retryable = isRetryableGeminiError(err);
      if (attempt < maxAttempts && retryable) {
        const backoff = 400 + attempt * 600;
        await wait(backoff);
        continue;
      }
      if (err?.status === 429) {
        const cooldownKey = getCooldownKey(userKey);
        setCooldown(cooldownKey, GEMINI_COOLDOWN_MS);
        setCooldown("__global__", GEMINI_COOLDOWN_MS);
      }
      // External model hiccup; fall back to heuristic extraction.
      if (!isTestEnv()) {
        const now = Date.now();
        if (now - lastGeminiErrorLogAt > 60_000) {
          lastGeminiErrorLogAt = now;
          console.warn(
            "Gemini extractBookingDetails failed:",
            err?.status || err?.message || err
          );
        }
      }
      return { details: null, didCall: true, didSucceed: false };
    }
  }

  return { details: null, didCall: true, didSucceed: false };
};

const buildOrUpdateSession = async (message, session, userKey) => {
  const extractedService = extractServiceFallback(message);
  const extractedDate = extractDate(message);
  const extractedTime = extractTime(message);

  session.service = session.service || extractedService;
  session.date = session.date || extractedDate;
  session.time = session.time || extractedTime;

  const missingAny = !session.service || !session.date || !session.time;
  if (missingAny && userKey && canUseGemini(userKey)) {
    const cacheKey = getCacheKey(userKey, message);
    const cached = geminiCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      const details = cached.details;
      session.service = session.service || safeString(details?.service);
      session.date = session.date || safeString(details?.date);
      session.time = session.time || safeString(details?.time);
      return session;
    }

    const result = await extractBookingDetails(message, userKey);
    const details = result.details;
    if (result.didCall && result.didSucceed) {
      incrementGeminiUsage(userKey);
      geminiCache.set(cacheKey, {
        details,
        expiresAt: Date.now() + GEMINI_CACHE_TTL_MS,
      });
    }
    session.service = session.service || safeString(details?.service);
    session.date = session.date || safeString(details?.date);
    session.time = session.time || safeString(details?.time);
  }

  return session;
};

const handleBookingFlow = async (message, { userId, userKey, sessionKey }) => {
  const session = bookingSessions.get(sessionKey) || { active: true, service: "", date: "", time: "" };
  session.active = true;

  await buildOrUpdateSession(message, session, userKey);
  bookingSessions.set(sessionKey, session);

  if (!session.service) {
    return "Which service would you like to book?";
  }
  if (!session.date) {
    return "What date would you like? (YYYY-MM-DD)";
  }
  if (!session.time) {
    return "What time should I book? (HH:mm)";
  }

  const serviceRecord = await findOrCreateServiceRecord(session.service);
  if (!serviceRecord) {
    return "I couldn't find that service. Please choose another service name.";
  }

  const start = parseStartDateTime(session.date, session.time);
  if (!start) {
    session.time = "";
    bookingSessions.set(sessionKey, session);
    return "That time doesn't look right. Please provide time in HH:mm format.";
  }

  const durationMinutes = Number(serviceRecord.duration) || 60;
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const available = await isSlotAvailable({ serviceId: serviceRecord.id, start, end });

  if (!available) {
    const suggestions = await getSuggestedSlots({
      date: session.date,
      durationMinutes,
      serviceId: serviceRecord.id,
    });
    session.time = "";
    bookingSessions.set(sessionKey, session);
    if (suggestions.length > 0) {
      return `That time is not available. Available times include ${suggestions.join(", ")}. What time works for you?`;
    }
    return "That time is not available. Please choose a different time.";
  }

  if (!userId) {
    bookingSessions.delete(sessionKey);
    return `Great! I have your appointment details for ${serviceRecord.name} on ${session.date} at ${session.time}. Click here to proceed to book your appointment.`;
  }

  try {
    await createBooking({
      userId,
      serviceId: serviceRecord.id,
      date: session.date,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    bookingSessions.delete(sessionKey);
    return `Your appointment is booked for ${session.date} at ${session.time}. Click here to proceed to book your appointment.`;
  } catch (err) {
    return err?.message || "I couldn't complete the booking. Please try again.";
  }
};

// Helper function
export const containsAny = (keywords, text) => {
  // text must be a string
  if (!text) return false;
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

export const processMessage = async (message, { userId, userKey } = {}) => {
  if (!message) return "Sorry, I didn't understand that. Please ask about salon services.";

  // normalize: lowercase and trim spaces
  const text = message.toLowerCase().trim();
  const sessionKey = getSessionKey(userKey);
  const activeSession = bookingSessions.get(sessionKey);
  const bookingIntent = containsAny(
    [
      "appointment",
      "book",
      "booking",
      "how do i book",
      "how can i book",
      "schedule",
      "reserve",
    ],
    text
  );
  const inferredService = extractServiceFallback(message);

  if (activeSession?.active) {
    if (containsAny(["cancel", "stop", "never mind", "nevermind"], text)) {
      bookingSessions.delete(sessionKey);
      return "Booking canceled. Let me know if you need anything else.";
    }
    return handleBookingFlow(message, { userId, userKey, sessionKey });
  }

  // now use `text` in all checks

  if (bookingIntent && inferredService) {
    const session = {
      active: true,
      service: inferredService,
      date: "",
      time: "",
    };
    bookingSessions.set(sessionKey, session);
    return `Sure! I can help you book a ${inferredService}. What date would you like? (YYYY-MM-DD)`;
  }

  // 1️⃣ Greetings
  if (containsAny(["hello", "hi", "hey"], text)) {
    return "Hello! Welcome to Smart Salon! How can I help you?";
  }

  // 2️⃣ Services & Durations
  if (
    containsAny(
      [
        "services",
        "service",
        "what services do you offer",
        "what do you offer",
        "available services",
        "what can i book",
      ],
      text
    )
  ) {
    return (
      "We offer the following services:\n" +
      "- Precision Haircut & Styling: 60 minutes\n" +
      "- Signature Manicure: 45 minutes\n" +
      "- Event Makeup Session: 75 minutes\n" +
      "- Protective Braids: 120 minutes\n" +
      "- Color Refresh & Gloss: 90 minutes"
    );
  }

  if (containsAny(["haircut", "precision haircut"], text)) {
    return "Precision Haircut & Styling: 60 minutes.";
  }

  if (containsAny(["manicure", "signature manicure"], text)) {
    return "Signature Manicure: 45 minutes.";
  }

  if (containsAny(["event makeup", "event makeup session"], text)) {
    return "Event Makeup Session: 75 minutes.";
  }

  if (containsAny(["protective braids", "braids"], text)) {
    return "Protective Braids: 120 minutes.";
  }

  if (containsAny(["color refresh", "gloss", "color refresh & gloss"], text)) {
    return "Color Refresh & Gloss: 90 minutes.";
  }

  // 3️⃣ Booking & Appointments
  if (
    bookingIntent
  ) {
    return handleBookingFlow(message, { userId, userKey, sessionKey });
  }

  // 4️⃣ Pricing & Rates
  if (
    containsAny(
      ["price", "prices", "cost", "pricing", "how much", "rate", "rates"],
      text
    )
  ) {
    return "Precision Haircut & Styling R200, Color Refresh & Gloss R350, Protective Braids R450, Signature Manicure R180, Spa Pedicure R240, Event Makeup Session R500.";
  }

  // 5️⃣ Add-ons & Extras
  if (
    containsAny(
      ["add-on", "add on", "add ons", "addon", "addons", "extras", "extra services"],
      text
    )
  ) {
    return "Add-ons available: Deep Conditioning Treatment R120, French Tip Upgrade R60, Scalp Detox R90, Brow Shape & Tint R140.";
  }

  // 6️⃣ Contact & Location
  if (containsAny(["contact", "phone", "email"], text)) {
    return "You can find us at this address: 123 Beauty Avenue, Rosebank City. Contact us at +27 12 345 6789 or email us at hello@damessalon.com.";
  }

  // 7️⃣ Cancellation & Policies
  if (
    containsAny(
      ["cancellation", "cancelation", "cancel", "policy", "policies"],
      text
    )
  ) {
    return "Our cancellation policy: please cancel at least 24 hours in advance to avoid a no-show fee.";
  }

  // 8️⃣ Thank you / Goodbye
  if (
    containsAny(
      ["thank you", "thanks", "no more questions", "that's all", "thats all", "no further questions", "all good"],
      text
    )
  ) {
    return "Thank you, bye.";
  }

  // 9️⃣ Fallback
  return "Sorry, I didn't understand that. Please ask about salon services.";
};
