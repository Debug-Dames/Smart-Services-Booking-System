import { useEffect, useState } from "react";
import { getMyBookings } from "../api/services";
import "../Styles/myBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyBookings()
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        setBookings([]);
        setError(err?.response?.data?.message || "Failed to load your bookings.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function formatDate(value) {
    if (!value) return "N/A";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value) {
    if (!value) return "N/A";
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (typeof value === "string") {
      const match = value.match(/^(\d{2}):(\d{2})/);
      if (match) {
        const today = new Date();
        today.setHours(Number(match[1]), Number(match[2]), 0, 0);
        return today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }

    return String(value);
  }

  function normalizeStatus(status) {
    return String(status || "pending").toLowerCase();
  }

  return (
    <section className="my-bookings-page">
      <div className="my-bookings-shell">
        <header className="my-bookings-header">
          <p className="my-bookings-kicker">Your Schedule</p>
          <h2>My Bookings</h2>
          <p className="my-bookings-subtitle">
            Keep track of upcoming visits, status updates, and appointment times.
          </p>
          <div className="my-bookings-count">
            <span>{bookings.length}</span>
            <p>Total appointments</p>
          </div>
        </header>

        {loading ? <p className="my-bookings-note">Loading bookings...</p> : null}
        {error ? <p className="my-bookings-note my-bookings-note--error">{error}</p> : null}

        {!loading && !error && bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <h3>No bookings yet</h3>
            <p>Your confirmed appointments will appear here once you book a service.</p>
          </div>
        ) : null}

        <div className="my-bookings-grid">
          {bookings.map((booking) => {
            const serviceName = booking?.service?.name || booking?.service || "N/A";
            const status = normalizeStatus(booking?.status);
            const timeValue = booking?.startTime || booking?.time || booking?.appointment_time || booking?.date;

            return (
              <article key={booking.id} className="my-booking-card">
                <div className="my-booking-card-top">
                  <h3>{serviceName}</h3>
                  <span className={`my-booking-status my-booking-status--${status}`}>
                    {status}
                  </span>
                </div>

                <div className="my-booking-meta">
                  <div>
                    <p>Date</p>
                    <strong>{formatDate(booking?.date || booking?.appointment_date)}</strong>
                  </div>
                  <div>
                    <p>Time</p>
                    <strong>{formatTime(timeValue)}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
