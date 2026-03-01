import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, authHeaders } from "../utils/api";

const SERVICES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Nail Care",
  "Facial Treatment",
  "Hair Treatment",
  "Eyebrow Shaping",
  "Makeup Application",
  "Other",
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    notes: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to book appointment.");
        return;
      }

      setMessage("Appointment booked successfully! Redirecting to your bookings...");
      setForm({ service: "", date: "", time: "", notes: "" });
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (err) {
      setError("Network error. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Book an Appointment</h1>
          <p style={subtitleStyle}>Choose your service, date, and time — we'll take care of the rest.</p>
        </div>

        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={fieldGroupStyle}>
            <label htmlFor="service" style={labelStyle}>Service *</label>
            <select
              id="service"
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select a service...</option>
              {SERVICES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={rowStyle}>
            <div style={fieldGroupStyle}>
              <label htmlFor="date" style={labelStyle}>Date *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={today}
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="time" style={labelStyle}>Time *</label>
              <input
                id="time"
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label htmlFor="notes" style={labelStyle}>Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Any special requests or additional information..."
              value={form.notes}
              onChange={handleChange}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && <p style={errorStyle}>{error}</p>}
          {message && <p style={successStyle}>{message}</p>}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}

const pageStyle = {
  padding: "2rem 1rem 3rem",
  minHeight: "80vh",
};

const containerStyle = {
  maxWidth: "620px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: "2rem",
};

const titleStyle = {
  margin: "0 0 0.5rem",
  color: "#22274C",
  fontFamily: "var(--font-heading)",
  fontSize: "2rem",
};

const subtitleStyle = {
  margin: 0,
  color: "#6B6F8E",
  fontSize: "0.95rem",
};

const formStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(34, 39, 76, 0.1)",
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  flex: 1,
};

const rowStyle = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
};

const labelStyle = {
  fontWeight: "600",
  color: "#22274C",
  fontSize: "0.875rem",
};

const inputStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "1px solid #D4CACE",
  outline: "none",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  backgroundColor: "#FFFFFF",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  marginTop: "0.25rem",
  padding: "0.9rem 1rem",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#1952A6",
  color: "#FFFFFF",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background 0.2s",
};

const errorStyle = {
  margin: 0,
  color: "#B42318",
  backgroundColor: "#FEF2F2",
  padding: "0.6rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
};

const successStyle = {
  margin: 0,
  color: "#166534",
  backgroundColor: "#F0FDF4",
  padding: "0.6rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
};