import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { bookingService, getServices, paymentsService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import "../Styles/bookAppointment.css";
import "../Styles/calendar.css";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const MAX_BOOKINGS_PER_DAY = TIME_SLOTS.length;

const DEFAULT_DURATION_MINUTES = 60;

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

function addMinutesToTime(timeStr, minutes) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + minutes;
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${pad(hh)}:${pad(mm)}`;
}

function toTimeSlot(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);

  // Step 1 form data
  const [details, setDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    serviceId: "",
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
  const [showPayment, setShowPayment] = useState(false);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  // Fetch services once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getServices();
        if (mounted) setServices(Array.isArray(data) ? data : data?.data || []);
      } catch {
        if (mounted) setServices([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch monthly booking counts when month changes
  const fetchMonthly = useCallback(async (date, serviceId) => {
    try {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      if (!serviceId) {
        setMonthlyBookings({});
        return;
      }
      const res = await bookingService.getMonthlyBookings(y, m, serviceId);
      setMonthlyBookings(res || {});
    } catch {
      setMonthlyBookings({});
    }
  }, []);

  useEffect(() => {
    fetchMonthly(calendarDate, details.serviceId);
  }, [calendarDate, details.serviceId, fetchMonthly]);

  // Fetch slots for a selected day
  const fetchSlots = async (_dateStr) => {
    // Temporarily keep all slots available (backend data has been unreliable).
    setSlotsLoading(true);
    try {
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
    fetchMonthly(activeStartDate, details.serviceId);
  };

  // Calendar tile coloring
  const tileClassName = ({ date, view }) => {
  if (view !== "month") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) return "cal-tile--past";
  return "cal-tile--available";
};

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Step 1 validation
  const canProceedStep1 = details.name.trim() && details.email.trim() && details.serviceId;

  // Step 2 validation
  const isFullyBooked = dayBookingCount >= MAX_BOOKINGS_PER_DAY;
  const isSlotBooked = (slot) => bookedSlots.includes(slot);
  const isSlotDisabled = (slot) => isSlotBooked(slot) || isFullyBooked;

  const openPayment = () => {
    setBookingError("");
    setShowPayment(true);
  };

  const closePayment = () => setShowPayment(false);

  function luhnCheck(num) {
    const digits = String(num).replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let d = Number(digits[i]);
      if (shouldDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function isValidCardNumber(num) {
    const digits = String(num).replace(/\D/g, "");
    return digits.length === 16 && luhnCheck(digits);
  }

  function validateCard() {
    const errors = {};
    const number = card.number;
    if (number.length !== 16) {
      errors.number = "Card number must be 16 digits.";
    } else if (!luhnCheck(number)) {
      errors.number = "Card number is invalid.";
    }
    if (!card.name.trim()) {
      errors.name = "Cardholder name is required.";
    }
    const expMatch = card.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) {
      errors.expiry = "Expiry must be MM/YY.";
    } else {
      const mm = Number(expMatch[1]);
      const yy = Number(expMatch[2]);
      if (mm < 1 || mm > 12) {
        errors.expiry = "Invalid expiry month.";
      } else {
        const now = new Date();
        const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
        if (expDate < now) {
          errors.expiry = "Card has expired.";
        }
      }
    }
    if (!/^\d{3}$/.test(card.cvc)) {
      errors.cvc = "CVC must be 3 digits.";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const canPay =
    !confirming &&
    card.name.trim() &&
    isValidCardNumber(card.number) &&
    card.expiry &&
    card.cvc;

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  const handleConfirmBooking = async () => {
  setBookingError("");
  setConfirming(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setBookingError("Please log in to book an appointment.");
      setConfirming(false);
      navigate("/login");
      return;
    }
    const serviceId = Number(details.serviceId);
    const service = services.find((s) => Number(s.id) === serviceId);
    const rawDuration = Number(service?.duration);
    const duration = Number.isFinite(rawDuration) && rawDuration > 0
      ? rawDuration
      : DEFAULT_DURATION_MINUTES;
    if (!selectedTime) {
      setBookingError("Please select a valid time.");
      setConfirming(false);
      return;
    }
    const endTime = addMinutesToTime(selectedTime, duration);
    if (!endTime) {
      setBookingError("Please select a valid time.");
      setConfirming(false);
      return;
    }
    if (!validateCard()) {
      setConfirming(false);
      return;
    }

    const startTimeISO = `${selectedDate}T${selectedTime}:00`;
    const endTimeISO = `${selectedDate}T${endTime}:00`;
    const deposit = selectedService?.price ? Math.round(selectedService.price * 0.5) : 50;

    const init = await paymentsService.initPayfast({
      amount: deposit,
      item_name: `${selectedService?.name || "Service"} deposit`,
      item_description: `Deposit for ${selectedService?.name || "service"} booking`,
      name_first: details.name?.split(" ")[0] || "",
      name_last: details.name?.split(" ").slice(1).join(" ") || "",
      email: details.email,
      booking: {
        serviceId,
        date: selectedDate,
        startTime: startTimeISO,
        endTime: endTimeISO,
      },
    });

    setBookingResult(init?.booking);
    setConfirmed(true);
    setShowPayment(false);

    if (init?.processUrl && init?.fields) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = init.processUrl;
      Object.entries(init.fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      form.remove();
    }

  } catch (err) {
    console.log(err.response?.data); // helps debug errors
    const status = err?.response?.status;
    const msg =
      status === 401
        ? "Your session has expired. Please log in again."
        : err?.response?.data?.message || "Booking failed. Please try again.";
    setBookingError(msg);
  } finally {
    setConfirming(false);
  }
  };

  const selectedService = services.find(s => Number(s.id) === Number(details.serviceId));

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
                    value={details.serviceId}
                    onChange={e => setDetails(p => ({ ...p, serviceId: e.target.value }))}
                  >
                    <option value="">— Select a service —</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R{s.price}</option>
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
                    <strong>{selectedService?.name || "N/A"}</strong>
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
                    onClick={openPayment}
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
                    <strong>{selectedService?.name || "N/A"}</strong>
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
                      setDetails({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", serviceId: "" });
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

      {showPayment && (
        <div className="pay-modal-backdrop" onClick={closePayment}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Pay Deposit</h3>
            <p>
              A 50% deposit is required to secure your booking.
            </p>
            <div className="pay-modal-amount">
              Deposit: <strong>R{selectedService?.price ? Math.round(selectedService.price * 0.5) : 50}</strong>
            </div>
            <div className="pay-modal-form">
              <label className="pay-field">
                <span>Cardholder Name</span>
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name on card"
                />
                {cardErrors.name && <small className="pay-error">{cardErrors.name}</small>}
              </label>
              <label className="pay-field">
                <span>Card Number</span>
                <input
                  type="text"
                  value={formatCardNumber(card.number)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCard((prev) => ({ ...prev, number: digits }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  maxLength={19}
                />
                {cardErrors.number && <small className="pay-error">{cardErrors.number}</small>}
              </label>
              <div className="pay-field-row">
                <label className="pay-field">
                  <span>Expiry</span>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={(e) => setCard((prev) => ({ ...prev, expiry: e.target.value }))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                  />
                  {cardErrors.expiry && <small className="pay-error">{cardErrors.expiry}</small>}
                </label>
                <label className="pay-field">
                  <span>CVC</span>
                  <input
                    type="text"
                    value={card.cvc}
                    onChange={(e) => setCard((prev) => ({ ...prev, cvc: e.target.value }))}
                    placeholder="123"
                    inputMode="numeric"
                  />
                  {cardErrors.cvc && <small className="pay-error">{cardErrors.cvc}</small>}
                </label>
              </div>
            </div>
            <div className="pay-modal-actions">
              <button className="book-btn book-btn--ghost" onClick={closePayment} disabled={confirming}>
                Cancel
              </button>
              <button className="book-btn book-btn--primary" onClick={handleConfirmBooking} disabled={!canPay}>
                {confirming ? "Processing..." : "Pay & Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


