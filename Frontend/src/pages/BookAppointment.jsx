import { useState } from "react";
import { API_URL, authHeaders } from "../utils/api";

export default function BookAppointment() {
  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    notes: ""
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/bookings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) return setMessage(data.message);

    setMessage("Appointment booked successfully!");
    setForm({ service: "", date: "", time: "", notes: "" });
  }

  return (
    <div>
      <h2>Book Appointment</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="service"
          placeholder="Service"
          value={form.service}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit">Book</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}