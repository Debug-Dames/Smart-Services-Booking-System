// backend/src/modules/Chat/ChatbotServices.js

// Helper function
export const containsAny = (keywords, text) => {
  // text must be a string
  if (!text) return false;
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

export const processMessage = (message) => {
  if (!message) return "Sorry, I didn't understand. You can ask about services, prices, add-ons, or bookings.";

  // normalize: lowercase and trim spaces
  const text = message.toLowerCase().trim();

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
    return "You can book an appointment through our booking page. Click here to proceed to book your appointment.";
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