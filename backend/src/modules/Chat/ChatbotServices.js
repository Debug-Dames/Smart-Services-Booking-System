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
const conversationSessions = new Map();
const isTestEnv = () =>
  process.env.NODE_ENV === "test" ||
  typeof process.env.JEST_WORKER_ID !== "undefined";
let lastGeminiErrorLogAt = 0;

const getSessionKey = (userKey) => {
  const base = userKey || "anonymous";
  if (isTestEnv()) {
    const workerId = process.env.JEST_WORKER_ID || "0";
    return `${base}:test:${workerId}`;
  }
  return base;
};

const getConversation = (sessionKey) =>
  conversationSessions.get(sessionKey) || { lastTopic: "", lastService: "" };

const updateConversation = (sessionKey, updates) => {
  const current = getConversation(sessionKey);
  conversationSessions.set(sessionKey, { ...current, ...updates });
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

const SERVICE_DETAILS = new Map([
  [
    "Precision Haircut & Styling",
    {
      category: "Hair",
      price: 200,
      duration: 60,
      description:
        "Face-shape focused consultation, precision cut, and signature blow-dry finish for everyday elegance.",
    },
  ],
  [
    "Color Refresh & Gloss",
    {
      category: "Hair",
      price: 350,
      duration: 90,
      description:
        "Tone balancing and shine gloss to revive faded color while keeping hair healthy and vibrant.",
    },
  ],
  [
    "Protective Braids",
    {
      category: "Protective",
      price: 450,
      duration: 120,
      description:
        "Neat, long-lasting braids with scalp-friendly sectioning and clean parting.",
    },
  ],
  [
    "Signature Manicure",
    {
      category: "Nails",
      price: 180,
      duration: 45,
      description:
        "Cuticle care, shaping, nourishing treatment, and polish application for a clean premium finish.",
    },
  ],
  [
    "Spa Pedicure",
    {
      category: "Nails",
      price: 240,
      duration: 60,
      description:
        "Soak, exfoliation, callus smoothing, massage, and polish designed for comfort and durability.",
    },
  ],
  [
    "Event Makeup Session",
    {
      category: "Makeup",
      price: 500,
      duration: 75,
      description:
        "Camera-ready makeup with skin prep and look matching for weddings, graduations, and events.",
    },
  ],
]);

const SERVICE_CATALOG = new Map(
  Array.from(SERVICE_DETAILS.entries()).map(([name, details]) => [
    name,
    { price: details.price, duration: details.duration },
  ])
);

const ADD_ONS = [
  { name: "Deep Conditioning Treatment", price: 120 },
  { name: "French Tip Upgrade", price: 60 },
  { name: "Scalp Detox", price: 90 },
  { name: "Brow Shape & Tint", price: 140 },
];

const BOOKING_NOTES = [
  "Please arrive 10 minutes before your scheduled slot.",
  "Late arrivals may reduce treatment time during peak periods.",
  "Rescheduling is available up to 24 hours before your booking.",
  "Walk-ins are welcome when slots are available.",
];
const CONTACT_DETAILS = [
  "123 Beauty Avenue, Rosebank City",
  "+27 12 345 6789",
  "hello@damessalon.com",
];

const BOOKING_CTA = "Click here to proceed to book your appointment.";

const buildServiceCatalogResponse = () => {
  const services = Array.from(SERVICE_DETAILS.entries())
    .map(
      ([name, details]) =>
        `- ${name} (${details.category})\n  ${details.description}\n  ${details.duration} min · R${details.price}`
    )
    .join("\n\n");

  return [
    "Our Service Catalog",
    "Transparent prices, practical durations, and specialist care from our team.",
    "",
    "Services",
    "",
    services,
  ].join("\n");
};

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
  updateConversation(sessionKey, { lastTopic: "booking" });

  await buildOrUpdateSession(message, session, userKey);
  bookingSessions.set(sessionKey, session);

  if (!session.service) {
    return "Which service would you like to book? You can say a name like \"Signature Manicure\" or \"Protective Braids\".";
  }
  if (!session.date) {
    return "What date would you like? Please use YYYY-MM-DD (for example, 2026-04-10).";
  }
  if (!session.time) {
    return "What time should I book? Please use HH:mm (for example, 14:30).";
  }

  const serviceRecord = await findOrCreateServiceRecord(session.service);
  if (!serviceRecord) {
    return "I couldn't find that service. Please choose another service name.";
  }

  const start = parseStartDateTime(session.date, session.time);
  if (!start) {
    session.time = "";
    bookingSessions.set(sessionKey, session);
    return "That time doesn't look right. Please provide time in HH:mm format (for example, 14:30).";
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
      return `That time is not available. Available times include ${suggestions.join(", ")}. Which time works for you?`;
    }
    return "That time is not available. Please choose a different time.";
  }

  if (!userId) {
    bookingSessions.delete(sessionKey);
    updateConversation(sessionKey, { lastTopic: "booking_complete", lastService: serviceRecord.name });
    return `All set! I have your appointment for ${serviceRecord.name} on ${session.date} at ${session.time}. ${BOOKING_CTA}`;
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
    updateConversation(sessionKey, { lastTopic: "booking_complete", lastService: serviceRecord.name });
    return `All set! Your appointment is booked for ${session.date} at ${session.time}. ${BOOKING_CTA}`;
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
  const conversation = getConversation(sessionKey);
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
  const isAffirmative = containsAny(
    ["yes", "yeah", "yep", "sure", "please", "okay", "ok", "sounds good", "that works"],
    text
  );
  const isNegative = containsAny(["no", "nope", "not now", "maybe later", "nah"], text);

  const nonBookingIntent =
    containsAny(["hello", "hi", "hey"], text) ||
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
    ) ||
    containsAny(["price", "prices", "cost", "pricing", "how much", "rate", "rates"], text) ||
    containsAny(["add-on", "add on", "add ons", "addon", "addons", "extras", "extra services"], text) ||
    containsAny(["contact", "phone", "email", "whatsapp", "address", "location", "hours", "business hours"], text) ||
    containsAny(["booking notes", "notes", "arrival", "late", "reschedule", "walk-ins", "walk ins"], text) ||
    containsAny(["cancellation", "cancelation", "cancel", "policy", "policies"], text) ||
    containsAny([
      "thank you",
      "thanks",
      "no more questions",
      "that's all",
      "thats all",
      "no further questions",
      "all good",
    ], text);
  const isBookingRequest = bookingIntent && !nonBookingIntent;

  if (activeSession?.active) {
    if (containsAny(["cancel", "stop", "never mind", "nevermind"], text)) {
      bookingSessions.delete(sessionKey);
      updateConversation(sessionKey, { lastTopic: "booking_canceled" });
      return "Booking canceled. Let me know if you need anything else.";
    }
    return handleBookingFlow(message, { userId, userKey, sessionKey });
  }

  if (isNegative && conversation.lastTopic) {
    updateConversation(sessionKey, { lastTopic: "", lastService: "" });
    return "No problem. Is there anything else I can help with?";
  }

  if (isAffirmative) {
    if (conversation.lastTopic === "service_detail" && conversation.lastService) {
      const session = { active: true, service: conversation.lastService, date: "", time: "" };
      bookingSessions.set(sessionKey, session);
      return `Great! What date and time work for you? You can say: \"Book a ${conversation.lastService} on 2026-04-10 at 14:30.\"`;
    }
    if (conversation.lastTopic === "catalog") {
      return "Great! Which service would you like to book?";
    }
    if (conversation.lastTopic === "add_ons") {
      return "Which add-on would you like to include?";
    }
  }

  // now use `text` in all checks

  if (isBookingRequest && inferredService) {
    const session = {
      active: true,
      service: inferredService,
      date: "",
      time: "",
    };
    bookingSessions.set(sessionKey, session);
    updateConversation(sessionKey, { lastTopic: "booking", lastService: inferredService });
    return `Great choice! I can help you book a ${inferredService}. What date and time work for you? You can say: \"Book a ${inferredService} on 2026-04-10 at 14:30.\"`;
  }

  // 1ï¸âƒ£ Greetings
  if (containsAny(["hello", "hi", "hey"], text)) {
    updateConversation(sessionKey, { lastTopic: "greeting", lastService: "" });
    return "Hi! Welcome to DebugDames Salon. How can I help you today? I can share services, prices, add-ons, or book an appointment.";
  }

  // 2ï¸âƒ£ Services & Durations
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
    updateConversation(sessionKey, { lastTopic: "catalog", lastService: "" });
    return buildServiceCatalogResponse() + "\n\nWould you like help booking any of these?";
  }

  if (containsAny(["haircut", "precision haircut"], text)) {
    const details = SERVICE_DETAILS.get("Precision Haircut & Styling");
    updateConversation(sessionKey, { lastTopic: "service_detail", lastService: "Precision Haircut & Styling" });
    return `Precision Haircut & Styling\n${details.description}\n${details.duration} min · R${details.price}\nWould you like to book this service?`;
  }

  if (containsAny(["manicure", "signature manicure"], text)) {
    const details = SERVICE_DETAILS.get("Signature Manicure");
    updateConversation(sessionKey, { lastTopic: "service_detail", lastService: "Signature Manicure" });
    return `Signature Manicure\n${details.description}\n${details.duration} min · R${details.price}\nWould you like to book this service?`;
  }

  if (containsAny(["event makeup", "event makeup session"], text)) {
    const details = SERVICE_DETAILS.get("Event Makeup Session");
    updateConversation(sessionKey, { lastTopic: "service_detail", lastService: "Event Makeup Session" });
    return `Event Makeup Session\n${details.description}\n${details.duration} min · R${details.price}\nWould you like to book this service?`;
  }

  if (containsAny(["protective braids", "braids"], text)) {
    const details = SERVICE_DETAILS.get("Protective Braids");
    updateConversation(sessionKey, { lastTopic: "service_detail", lastService: "Protective Braids" });
    return `Protective Braids\n${details.description}\n${details.duration} min · R${details.price}\nWould you like to book this service?`;
  }

  if (containsAny(["color refresh", "gloss", "color refresh & gloss"], text)) {
    const details = SERVICE_DETAILS.get("Color Refresh & Gloss");
    updateConversation(sessionKey, { lastTopic: "service_detail", lastService: "Color Refresh & Gloss" });
    return `Color Refresh & Gloss\n${details.description}\n${details.duration} min · R${details.price}\nWould you like to book this service?`;
  }

  // 3ï¸âƒ£ Booking & Appointments
  if (containsAny(["how do i book", "how can i book", "book an appointment", "book appointment"], text)) {
    return "I can book it for you right here. Please share the service, date (YYYY-MM-DD), and time (HH:mm). For example: \"Book a manicure on 2026-04-10 at 14:30.\"";
  }

  if (isBookingRequest) {
    const session = {
      active: true,
      service: "",
      date: "",
      time: "",
    };
    bookingSessions.set(sessionKey, session);
    updateConversation(sessionKey, { lastTopic: "booking", lastService: "" });
    return "Great! What service would you like, and what date/time works for you? You can say: \"Book a manicure on 2026-04-10 at 14:30.\"";
  }

  // 4ï¸âƒ£ Pricing & Rates
  if (
    containsAny(
      ["price", "prices", "cost", "pricing", "how much", "rate", "rates"],
      text
    )
  ) {
    updateConversation(sessionKey, { lastTopic: "catalog", lastService: "" });
    return buildServiceCatalogResponse() + "\n\nWant me to help you book one?";
  }

  // 5ï¸âƒ£ Add-ons & Extras
  if (
    containsAny(
      ["add-on", "add on", "add ons", "addon", "addons", "extras", "extra services"],
      text
    )
  ) {
    updateConversation(sessionKey, { lastTopic: "add_ons", lastService: "" });
    return (
      "Add-On Treatments\n" +
      ADD_ONS.map((addon) => `- ${addon.name} · R${addon.price}`).join("\n") +
      "\n\nWould you like to add any of these to your booking?"
    );
  }

  // 6ï¸âƒ£ Contact & Location
  if (containsAny(["contact", "phone", "email", "whatsapp", "address", "location", "hours", "business hours"], text)) {
    updateConversation(sessionKey, { lastTopic: "contact", lastService: "" });
    return ["Contact", ...CONTACT_DETAILS].join("\n");
  }

  // 7ï¸âƒ£ Booking Notes
  if (containsAny(["booking notes", "notes", "arrival", "late", "reschedule", "walk-ins", "walk ins"], text)) {
    updateConversation(sessionKey, { lastTopic: "booking_notes", lastService: "" });
    return ["Booking Notes", ...BOOKING_NOTES].join("\n");
  }

  // 8ï¸âƒ£ Cancellation & Policies
  if (
    containsAny(
      ["cancellation", "cancelation", "cancel", "policy", "policies"],
      text
    )
  ) {
    return "Our cancellation policy: please cancel at least 24 hours in advance to avoid a no-show fee. Would you like help booking instead?";
  }

  // 9ï¸âƒ£ Thank you / Goodbye
  if (
    containsAny(
      ["thank you", "thanks", "no more questions", "that's all", "thats all", "no further questions", "all good"],
      text
    )
  ) {
    return "You're welcome! If you'd like to book or ask anything else, I'm here.";
  }

  // ðŸ"Ÿ Fallback
  return "Sorry, I didn't quite catch that. You can ask about services, prices, add-ons, booking notes, or say \"book an appointment.\"";
};







