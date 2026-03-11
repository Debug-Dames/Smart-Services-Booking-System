// backend/src/modules/Chat/ChatbotServices.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createBooking } from "../bookings/bookings.service.js";
import prisma from "../../config/database.js";
import { env } from "../../config/env.js";

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = env.GEMINI_MODEL;
const DAILY_GEMINI_LIMIT = env.GEMINI_DAILY_LIMIT;
const dailyUsage = new Map();
const bookingSessions = new Map();

const getSessionKey = (userKey) => userKey || "anonymous";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const canUseGemini = (userKey) => {
  if (!userKey) return false;
  const today = getTodayKey();
  const current = dailyUsage.get(userKey);
  if (!current || current.date !== today) {
    dailyUsage.set(userKey, { date: today, count: 0 });
    return true;
  }
  return current.count < DAILY_GEMINI_LIMIT;
};

const incrementGeminiUsage = (userKey) => {
  const today = getTodayKey();
  const current = dailyUsage.get(userKey);
  if (!current || current.date !== today) {
    dailyUsage.set(userKey, { date: today, count: 1 });
    return;
  }
  current.count += 1;
  dailyUsage.set(userKey, current);
};

const getGeminiModel = () => {
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

const extractServiceFallback = (text) => {
  const normalized = text.toLowerCase();
  const knownServices = [
    "precision haircut",
    "haircut",
    "signature manicure",
    "manicure",
    "event makeup",
    "makeup",
    "protective braids",
    "braids",
    "color refresh",
    "gloss",
  ];
  const match = knownServices.find((service) => normalized.includes(service));
  return match ? match : "";
};

const parseStartDateTime = (date, time) => {
  if (!date || !time) return null;
  const iso = `${date}T${time}:00Z`;
  const start = new Date(iso);
  return Number.isNaN(start.getTime()) ? null : start;
};

const toTimeLabel = (dateObj) =>
  dateObj.toISOString().slice(11, 16);

const findServiceRecord = async (serviceName) => {
  const normalized = safeString(serviceName);
  if (!normalized) return null;
  return prisma.service.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
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

const extractBookingDetails = async (text) => {
  const model = getGeminiModel();
  if (!model) return null;

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

  const result = await model.generateContent(prompt);
  const raw = result?.response?.text?.() || "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

const buildOrUpdateSession = async (message, session, userKey) => {
  let details = null;
  if (userKey && canUseGemini(userKey)) {
    incrementGeminiUsage(userKey);
    details = await extractBookingDetails(message);
  }

  const extractedService =
    safeString(details?.service) || extractServiceFallback(message);
  const extractedDate = safeString(details?.date) || extractDate(message);
  const extractedTime = safeString(details?.time) || extractTime(message);

  session.service = session.service || extractedService;
  session.date = session.date || extractedDate;
  session.time = session.time || extractedTime;

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

  if (!userId) {
    return "Please log in to book an appointment.";
  }

  const serviceRecord = await findServiceRecord(session.service);
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

  try {
    await createBooking({
      userId,
      service: serviceRecord.name,
      date: session.date,
      time: session.time,
    });
    bookingSessions.delete(sessionKey);
    return `Your appointment is booked for ${session.date} at ${session.time}.`;
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
  if (!message) return "Sorry, I didn't understand. You can ask about services, prices, add-ons, or bookings.";

  // normalize: lowercase and trim spaces
  const text = message.toLowerCase().trim();
  const sessionKey = getSessionKey(userKey);
  const activeSession = bookingSessions.get(sessionKey);

  if (activeSession?.active) {
    if (containsAny(["cancel", "stop", "never mind", "nevermind"], text)) {
      bookingSessions.delete(sessionKey);
      return "Booking canceled. Let me know if you need anything else.";
    }
    return handleBookingFlow(message, { userId, userKey, sessionKey });
  }

  // now use `text` in all checks


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
    containsAny(
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
    )
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
  return "Sorry, I didn't understand. You can ask about services, prices, add-ons, or bookings.";
};
