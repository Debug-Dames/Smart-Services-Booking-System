import { useEffect, useMemo, useState } from "react";
import { cancelBooking, getMyBookings, updateBooking, getServices } from "../api/services";
import "../Styles/myBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateDrafts, setDateDrafts] = useState({});
  const [timeDrafts, setTimeDrafts] = useState({});
  const [actionState, setActionState] = useState({});
  const [serviceMap, setServiceMap] = useState({});

  const fetchBookings = () => {
    setLoading(true);
    getMyBookings()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list);
        setDateDrafts((prev) =>
          list.reduce((acc, booking) => {
            const bookingId = booking?.id ?? booking?.bookingId;
            if (bookingId != null) {
              acc[bookingId] = toDateInput(
                booking?.date || booking?.appointment_date || booking?.startTime
              );
            }
            return acc;
          }, { ...prev })
        );
        setTimeDrafts((prev) =>
          list.reduce((acc, booking) => {
            const bookingId = booking?.id ?? booking?.bookingId;
            if (bookingId != null) {
              acc[bookingId] = toTimeInput(
                booking?.startTime || booking?.time || booking?.appointment_time || booking?.date
              );
            }
            return acc;
          }, { ...prev })
        );
        setError("");
        setActionNote("");
      })
      .catch((err) => {
        setBookings([]);
        setError(err?.response?.data?.message || "Failed to load your bookings.");
        setActionNote("");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getServices();
        const list = Array.isArray(data) ? data : data?.data || [];
        if (!mounted) return;
        const map = list.reduce((acc, svc) => {
          if (svc?.id != null) acc[Number(svc.id)] = svc?.name;
          return acc;
        }, {});
        setServiceMap(map);
      } catch {
        if (mounted) setServiceMap({});
      }
    })();
    return () => { mounted = false; };
  }, []);

  function setActionFor(id, value) {
    setActionState((prev) => ({ ...prev, [id]: value }));
  }

  function clearActionFor(id) {
    setActionState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const handleCancel = async (booking) => {
    const bookingId = booking?.id ?? booking?.bookingId;
    const numericId = Number(bookingId);
    if (!Number.isInteger(numericId)) return;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setError("");
      setActionNote("");
      setActionFor(numericId, "cancelling");
      await cancelBooking(numericId);
      setBookings((prev) => prev.filter((b) => b.id !== numericId));
      setActionNote("Booking cancelled.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      clearActionFor(numericId);
    }
  };

  const handleUpdate = async (booking) => {
    const bookingId = booking?.id ?? booking?.bookingId;
    const numericId = Number(bookingId);
    if (!Number.isInteger(numericId)) return;

    try {
      setError("");
      setActionNote("");
      setActionFor(numericId, "updating");
      const dateValue =
        dateDrafts[numericId] ||
        toDateInput(booking?.date || booking?.appointment_date || booking?.startTime);
      const timeValue =
        timeDrafts[numericId] ||
        toTimeInput(booking?.startTime || booking?.time || booking?.appointment_time || booking?.date);
      const updated = await updateBooking(numericId, { date: dateValue, time: timeValue });
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== numericId) return b;
          const next = { ...b, ...updated };
          if (timeValue) {
            next.time = timeValue;
            const baseDate =
              dateValue ||
              toDateInput(b?.date || b?.appointment_date || b?.startTime || b?.time);
            if (baseDate) {
              next.startTime = `${baseDate}T${timeValue}:00`;
            }
          }
          if (!updated?.date && dateValue) {
            next.date = dateValue;
          }
          return next;
        })
      );
      setDateDrafts((prev) => ({
        ...prev,
        [numericId]: toDateInput(updated?.date || dateValue),
      }));
      setTimeDrafts((prev) => ({
        ...prev,
        [numericId]: toTimeInput(updated?.startTime || timeValue),
      }));
      setActionNote("Booking updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update booking.");
    } finally {
      clearActionFor(numericId);
    }
  };

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
    if (typeof value === "string") {
      const isoMatch = value.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) {
        return `${isoMatch[1]}:${isoMatch[2]}`;
      }
      const match = value.match(/^(\d{2}):(\d{2})/);
      if (match) {
        const today = new Date();
        today.setHours(Number(match[1]), Number(match[2]), 0, 0);
        return today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return String(value);
  }

  function normalizeStatus(status) {
    return String(status || "pending").toLowerCase();
  }

  function getBookingDateTime(booking) {
    const dateValue = booking?.date || booking?.appointment_date;
    const timeValue = booking?.startTime || booking?.time || booking?.appointment_time;
    if (timeValue) {
      const isoMatch = String(timeValue).match(/T(\d{2}):(\d{2})/);
      const timePart = isoMatch ? `${isoMatch[1]}:${isoMatch[2]}` : String(timeValue).slice(0, 5);
      const datePart = toDateInput(dateValue || timeValue);
      if (datePart && timePart) {
        return new Date(`${datePart}T${timePart}:00`);
      }
    }
    if (dateValue) {
      return new Date(dateValue);
    }
    return null;
  }

  const nextBooking = useMemo(() => {
    const now = new Date();
    const candidates = bookings
      .map((booking) => ({
        booking,
        when: getBookingDateTime(booking),
      }))
      .filter(({ booking, when }) => {
        if (!when || Number.isNaN(when.getTime())) return false;
        const status = normalizeStatus(booking?.status);
        return status !== "cancelled" && when >= now;
      })
      .sort((a, b) => a.when - b.when);
    return candidates[0] || null;
  }, [bookings]);

  function toDateInput(value) {
    if (!value) return "";
    if (typeof value === "string") {
      const dateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) return dateMatch[1];
    }
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  }

  function toTimeInput(value) {
    if (!value) return "";
    if (typeof value === "string") {
      const isoMatch = value.match(/T(\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
      const match = value.match(/^(\d{2}):(\d{2})/);
      if (match) return `${match[1]}:${match[2]}`;
    }
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return "";
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
          <div className="my-bookings-next">
            {nextBooking ? (
              <>
                <span>Next appointment</span>
                <strong>
                  {(nextBooking.booking?.service?.name || nextBooking.booking?.service || "Service")} •{" "}
                  {formatDate(nextBooking.booking?.date || nextBooking.booking?.appointment_date)} at{" "}
                  {formatTime(nextBooking.booking?.startTime || nextBooking.booking?.time || nextBooking.booking?.appointment_time || nextBooking.booking?.date)}
                </strong>
              </>
            ) : (
              <>
                <span>Next appointment</span>
                <strong>No upcoming appointments</strong>
              </>
            )}
          </div>
          <div className="my-bookings-count">
            <span>{bookings.length}</span>
            <p>Total appointments</p>
          </div>
        </header>

        {loading && <p className="my-bookings-note">Loading bookings...</p>}
        {error && <p className="my-bookings-note my-bookings-note--error">{error}</p>}
        {actionNote && (
          <p className="my-bookings-note my-bookings-note--success">{actionNote}</p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="my-bookings-empty">
            <h3>No bookings yet</h3>
            <p>Your confirmed appointments will appear here once you book a service.</p>
          </div>
        )}

        <div className="my-bookings-grid">
          {bookings.map((booking) => {
            const serviceName =
              booking?.service?.name ||
              booking?.service?.title ||
              booking?.serviceName ||
              serviceMap[Number(booking?.serviceId)] ||
              booking?.service ||
              "N/A";
            const status = normalizeStatus(booking?.status);
            const timeValue = booking?.startTime || booking?.time || booking?.appointment_time || booking?.date;
            const bookingId = booking?.id ?? booking?.bookingId;
            const numericId = Number(bookingId);
            const hasValidId = Number.isInteger(numericId);
            const action = hasValidId ? actionState[numericId] : null;
            const isCancelled = status === "cancelled";
            const isBusy = action === "updating" || action === "cancelling";

            return (
              <article
                key={
                  hasValidId
                    ? numericId
                    : `${serviceName}-${booking?.date || booking?.appointment_date || booking?.createdAt || timeValue || "booking"}`
                }
                className="my-booking-card"
              >
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

                <div className="my-booking-actions">
                  <label className="my-booking-field">
                    <span>Date</span>
                    <input
                      type="date"
                      value={hasValidId ? dateDrafts[numericId] || "" : ""}
                      onChange={(event) =>
                        setDateDrafts((prev) => ({
                          ...prev,
                          [numericId]: event.target.value,
                        }))
                      }
                      disabled={isBusy || isCancelled || !hasValidId}
                    />
                  </label>

                  <label className="my-booking-field">
                    <span>Time</span>
                    <input
                      type="time"
                      value={hasValidId ? timeDrafts[numericId] || "" : ""}
                      onChange={(event) =>
                        setTimeDrafts((prev) => ({
                          ...prev,
                          [numericId]: event.target.value,
                        }))
                      }
                      disabled={isBusy || isCancelled || !hasValidId}
                    />
                  </label>

                  <div className="my-booking-buttons">
                    <button
                      type="button"
                      className="my-booking-button my-booking-button--primary"
                      onClick={() => handleUpdate(booking)}
                      disabled={isBusy || isCancelled || !hasValidId}
                    >
                      {action === "updating" ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      className="my-booking-button my-booking-button--ghost"
                      onClick={() => handleCancel(booking)}
                      disabled={isBusy || isCancelled || !hasValidId}
                    >
                      {action === "cancelling" ? "Cancelling..." : "Cancel"}
                    </button>
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
