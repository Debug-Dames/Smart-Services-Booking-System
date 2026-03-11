import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { bookingService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import "../Styles/bookAppointment.css";
import "../Styles/calendar.css";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00",
];

const MAX_BOOKINGS_PER_DAY = 4;

const SERVICES = [
  { value: "Haircut", label: "Haircut — R150", price: 150 },
  { value: "Hair Styling", label: "Hair Styling — R200", price: 200 },
  { value: "Hair Coloring", label: "Hair Coloring — R350", price: 350 },
  { value: "Nails", label: "Nails — R220", price: 220 },
  { value: "Braids", label: "Braids — R350", price: 350 },
];

function pad(n) { return String(n).padStart(2, "0"); }

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

export default function BookAppointment() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 form data
  const [details, setDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    service: "",
  });

  // Step 2 calendar/slots
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [dayBookingCount, setDayBookingCount] = useState(0);
  const [monthlyBookings, setMonthlyBookings] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Step 3 state
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState("");

  // Fetch monthly booking counts when month changes
  const fetchMonthly = useCallback(async (date) => {
    try {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const res = await bookingService.getMonthlyBookings(y, m);
      setMonthlyBookings(res.data || {});
    } catch {
      // silent – calendar will just show no color info
    }
  }, []);

  useEffect(() => {
    fetchMonthly(calendarDate);
  }, []);

  // Fetch slots for a selected day
  const fetchSlots = async (dateStr) => {
    setSlotsLoading(true);
    try {
      const res = await bookingService.getBookingsByDate(dateStr);
      const bookings = res.data || [];
      setBookedSlots(bookings.map(b => b.time));
      setDayBookingCount(bookings.length);
    } catch {
      setBookedSlots([]);
      setDayBookingCount(0);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function handleConfirmPayment() {
    await submitBooking({ payLater: false });
  }

  async function handleBookNowPayLater() {
    await submitBooking({ payLater: true });
  }

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setSelectedTime(null);
    fetchSlots(dateStr);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCalendarDate(activeStartDate);
    fetchMonthly(activeStartDate);
  };

  // Calendar tile coloring
  const tileClassName = ({ date, view }) => {
  if (view !== "month") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) return "cal-tile--past";

  const ds = formatDate(date);
  const count = monthlyBookings[ds] || 0;

  if (count >= MAX_BOOKINGS_PER_DAY) {
    return "cal-tile--full";
  }

  return "cal-tile--available";
};

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Step 1 validation
  const canProceedStep1 = details.name.trim() && details.email.trim() && details.service;

  // Step 2 validation
  const isFullyBooked = dayBookingCount >= MAX_BOOKINGS_PER_DAY;
  const isSlotBooked = (slot) => bookedSlots.includes(slot);
  const isSlotDisabled = (slot) => isSlotBooked(slot) || isFullyBooked;

  const handleConfirmBooking = async () => {
  setBookingError("");
  setConfirming(true);

  try {
    const res = await bookingService.createBooking({
      service: details.service,
      date: selectedDate,
      time: selectedTime,
    });

    setBookingResult(res);   // ✅ FIX
    setConfirmed(true);

  } catch (err) {
    console.log(err.response?.data); // helps debug errors
    const msg = err?.response?.data?.message || "Booking failed. Please try again.";
    setBookingError(msg);
  } finally {
    setConfirming(false);
  }
  };

  const selectedService = SERVICES.find(s => s.value === details.service);

  return (
    <div className="book-page">
      <div className="book-shell">
        {/* Progress bar */}
        <div className="book-progress">
          {["Your Details", "Date & Time", "Confirmation"].map((label, i) => (
            <div key={i} className={`book-progress-step ${step > i + 1 ? "done" : ""} ${step === i + 1 ? "active" : ""}`}>
              <div className="book-progress-dot">
                {step > i + 1 ? <span>✓</span> : <span>{i + 1}</span>}
              </div>
              <span className="book-progress-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ─── STEP 1: DETAILS ─── */}
        {step === 1 && (
          <div className="book-card">
            <div className="book-card-header">
              <h1>Your Details</h1>
              <p>Tell us a bit about yourself to get started</p>
            </div>
            <div className="book-fields">
              <div className="book-field-row">
                <div className="book-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Thabo Mokoena"
                    value={details.name}
                    onChange={e => setDetails(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="book-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={details.email}
                    onChange={e => setDetails(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="book-field-row">
                <div className="book-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    value={details.phone}
                    onChange={e => setDetails(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="book-field">
                  <label>Service *</label>
                  <select
                    value={details.service}
                    onChange={e => setDetails(p => ({ ...p, service: e.target.value }))}
                  >
                    <option value="">— Select a service —</option>
                    {SERVICES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="book-actions">
              <button
                className="book-btn book-btn--primary"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Next: Choose a Date →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: CALENDAR + SLOTS ─── */}
        {step === 2 && (
          <div className="book-card book-card--wide">
            <div className="book-card-header">
              <h1>Choose Date &amp; Time</h1>
              <p>Select an available date then pick your preferred slot</p>
            </div>

            <div className="book-cal-layout">
              {/* Calendar */}
              <div className="book-cal-left">
                <Calendar
                  onChange={handleDateClick}
                  onActiveStartDateChange={handleActiveStartDateChange}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  minDate={new Date()}
                  className="salon-calendar"
                />
              <div className="book-cal-legend">
  <span className="leg-item"><span className="leg-dot leg-available"></span>Available</span>
  <span className="leg-item"><span className="leg-dot leg-full"></span>Fully Booked</span>
</div>
</div>

              {/* Time slots */}
              <div className="book-slots-right">
                {!selectedDate && (
                  <div className="book-slots-placeholder">
                    <span className="book-slots-icon">📅</span>
                    <p>Select a date on the calendar to view available time slots</p>
                  </div>
                )}

                {selectedDate && (
                  <>
                    <div className="book-slots-header">
                      <h3>{formatDisplayDate(selectedDate)}</h3>
                      {isFullyBooked && (
                        <div className="book-slots-full-badge">Fully Booked</div>
                      )}
                      {!isFullyBooked && (
                        <div className="book-slots-avail-badge">
                          {MAX_BOOKINGS_PER_DAY - dayBookingCount} slot{MAX_BOOKINGS_PER_DAY - dayBookingCount !== 1 ? 's' : ''} remaining
                        </div>
                      )}
                    </div>

                    {slotsLoading ? (
                      <div className="book-slots-loading">
                        <div className="book-spinner"></div>
                        <span>Loading slots...</span>
                      </div>
                    ) : (
                      <div className="book-slots-grid">
                        {TIME_SLOTS.map(slot => {
                          const booked = isSlotBooked(slot);
                          const disabled = isSlotDisabled(slot);
                          const selected = selectedTime === slot;
                          return (
                            <button
                              key={slot}
                              className={`book-slot ${booked ? "book-slot--booked" : disabled ? "book-slot--booked" : "book-slot--open"} ${selected ? "book-slot--selected" : ""}`}
                              disabled={disabled}
                              onClick={() => setSelectedTime(slot)}
                            >
                              <span className="book-slot-time">{slot}</span>
                              <span className="book-slot-status">
                                {booked ? "Booked" : disabled ? "Full" : "Open"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="book-actions book-actions--between">
              <button className="book-btn book-btn--ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="book-btn book-btn--primary"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continue to Confirmation →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: CONFIRMATION / PAYMENT ─── */}
        {step === 3 && (
          <div className="book-card book-card--confirm">
            {!confirmed ? (
              <>
                <div className="book-card-header">
                  <h1>Confirm Your Booking</h1>
                  <p>Review your appointment details below</p>
                </div>

                <div className="book-summary">
                  <div className="book-summary-row">
                    <span>Name</span>
                    <strong>{details.name}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Email</span>
                    <strong>{details.email}</strong>
                  </div>
                  {details.phone && (
                    <div className="book-summary-row">
                      <span>Phone</span>
                      <strong>{details.phone}</strong>
                    </div>
                  )}
                  <div className="book-summary-row">
                    <span>Service</span>
                    <strong>{details.service}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Date</span>
                    <strong>{formatDisplayDate(selectedDate)}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Time</span>
                    <strong>{selectedTime}</strong>
                  </div>
                  {selectedService && (
                    <div className="book-summary-row book-summary-row--total">
                      <span>Total</span>
                      <strong>R{selectedService.price}</strong>
                    </div>
                  )}
                </div>

                {bookingError && (
                  <p className="book-error-msg">{bookingError}</p>
                )}

                <div className="book-actions book-actions--between">
                  <button className="book-btn book-btn--ghost" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button
                    className="book-btn book-btn--primary"
                    onClick={handleConfirmBooking}
                    disabled={confirming}
                  >
                    {confirming ? "Processing..." : "Confirm Booking ✓"}
                  </button>
                </div>
              </>
            ) : (
              /* ── Success screen ── */
              <div className="book-success-screen">
                <div className="book-success-icon">✓</div>
                <h2>Booking Confirmed!</h2>
                <p className="book-success-sub">
                  Your appointment has been successfully booked.
                </p>
                <div className="book-success-details">
                  <div className="book-summary-row">
                    <span>Service</span>
                    <strong>{details.service}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Date</span>
                    <strong>{formatDisplayDate(selectedDate)}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Time</span>
                    <strong>{selectedTime}</strong>
                  </div>
                  <div className="book-summary-row">
                    <span>Reference</span>
                    <strong>#{bookingResult?.id || "—"}</strong>
                  </div>
                </div>
                <p className="book-success-note">
                  A confirmation has been noted for <strong>{details.email}</strong>.<br />
                  We look forward to seeing you!
                </p>
                <div className="book-success-actions">
                  <button
                    className="book-btn book-btn--primary"
                    onClick={() => {
                      setStep(1);
                      setDetails({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", service: "" });
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setConfirmed(false);
                      setBookingResult(null);
                    }}
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}