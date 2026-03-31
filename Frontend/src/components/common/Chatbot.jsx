import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./chatbot.css";

const quickReplies = [
  "What are your prices?",
  "What add-ons do you offer?",
  "How do I book?",
  "Contact details",
];

const initialMessage = {
  sender: "bot",
  text: "Hi! Welcome to DebugDames Salon. How can I help you today?",
  timestamp: Date.now(),
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    []
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const resetChat = () => {
    setMessages([{ ...initialMessage, timestamp: Date.now() }]);
    setInput("");
  };

  const sendMessage = async (rawMessage) => {
    const text = rawMessage.trim();
    if (!text || isTyping) return;

    const userMsg = { sender: "user", text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(`${apiBase}/chatbot`, { message: text });
      const botText =
        res?.data?.reply ||
        res?.data?.response ||
        "I can help with bookings, services, prices, and contact details.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botText,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      const apiFallbackBase = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;

      if (status === 404 && apiFallbackBase !== apiBase) {
        try {
          const res = await axios.post(`${apiFallbackBase}/chatbot`, { message: text });
          const botText =
            res?.data?.reply ||
            res?.data?.response ||
            "I can help with bookings, services, prices, and contact details.";
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: botText,
              timestamp: Date.now(),
            },
          ]);
          return;
        } catch {
          // fall through to error message below
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I could not reach the chatbot service right now. Please try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMessageText = (message) => {
    const bookingCta = "Click here to proceed to book your appointment.";
    const isBookingCta =
      message.sender === "bot" && message.text.includes(bookingCta);

    if (!isBookingCta) return <p>{message.text}</p>;

    const textWithoutCta = message.text.replace(bookingCta, "").trim();

    return (
      <p>
        {textWithoutCta}{" "}
        <a href="/book-appointment">Click here to proceed to book your appointment.</a>
      </p>
    );
  };

  return (
    <div className="chatbot-shell">
      {isOpen ? (
        <section className="chatbot-container" aria-label="Salon Assistant">
          <header className="chatbot-header">
            <div className="chatbot-header-profile">
              <div className="chatbot-avatar" aria-hidden="true">
                DD
              </div>
              <div>
                <p className="chatbot-title">Salon Assistant</p>
                <p className="chatbot-subtitle">
                  <span className="chatbot-status-dot" aria-hidden="true" />
                  Online now · Avg reply under 1 min
                </p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={resetChat}
                title="Clear chat"
                aria-label="Clear chat"
              >
                Clear
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chatbot"
                aria-label="Minimize chatbot"
              >
                _
              </button>
            </div>
          </header>

          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.map((message, idx) => (
              <article
                key={`${message.timestamp}-${idx}`}
                className={message.sender === "user" ? "chatbot-message user" : "chatbot-message bot"}
              >
                {renderMessageText(message)}
                <span>{formatTime(message.timestamp)}</span>
              </article>
            ))}

            {isTyping ? (
              <div className="chatbot-typing" aria-label="Assistant is typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-replies">
            {quickReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>

          <form className="chatbot-input" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bookings, prices, or add-ons..."
              aria-label="Type a message"
            />
            <button type="submit" disabled={isTyping}>
              {isTyping ? "..." : "Send"}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "Close" : "Chat"}
      </button>
    </div>
  );
}
