import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, getAvailableSlots, getServices } from '../api/services';
import '../Styles/bookAppointment.css';

const SERVICE_PRICES = {
  Haircut: 150,
  Nails: 220,
  Braids: 350,
};

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  service: '',
  date: '',
  time: '',
  paymentMethod: 'Card',
  notes: '',
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeStep, setActiveStep] = useState(1);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const amount = useMemo(() => SERVICE_PRICES[formData.service] || 0, [formData.service]);

  useEffect(() => {
    getServices()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setServices(list);

        if (list.length > 0) {
          const first = list[0];
          const firstId = first._id || first.id || '';
          const firstName = first.name || '';
          setServiceId(firstId);
          setFormData((prev) => ({
            ...prev,
            service: firstName,
          }));
        }
      })
      .catch(() => {
        setServices([]);
        setServiceId('');
      });
  }, []);

  useEffect(() => {
    if (formData.date && serviceId) {
      getAvailableSlots(formData.date, serviceId)
        .then((data) => {
          const availableSlots = Array.isArray(data) ? data : [];
          setSlots(availableSlots);

          if (availableSlots.length === 0) {
            setMessage('This date is fully booked.');
          } else {
            setMessage('Slots available. Choose a time.');
          }
        })
        .catch(() => {
          setSlots([]);
          setMessage('Error fetching slots.');
        });
    }
  }, [formData.date, serviceId]);

  function getBookingErrorMessage(error) {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.code === 'ERR_NETWORK') {
      return 'Cannot reach API. Start backend on http://localhost:5000 and try again.';
    }
    return 'Unable to complete booking. Please try again.';
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'service') {
      const selectedService = services.find((svc) => (svc.name || '') === value);
      setServiceId(selectedService?._id || selectedService?.id || '');
      setSlots([]);
      setMessage('');
      setFormData((prev) => ({ ...prev, time: '' }));
    }

    if (name === 'date') {
      setFormData((prev) => ({ ...prev, time: '' }));
      setSlots([]);
      setMessage('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setShowPaymentPopup(true);
  }

  function handleNextFromStepOne() {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.service) {
      setErrorMessage('Please complete Full Name, Phone Number, and Service.');
      return;
    }
    setErrorMessage('');
    setActiveStep(2);
  }

  function handleNextFromStepTwo() {
    if (!formData.date || !formData.time) {
      setErrorMessage('Please select both date and time.');
      return;
    }
    setErrorMessage('');
    setActiveStep(3);
  }

  async function handleConfirmPayment() {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const payload = {
        ...(serviceId ? { serviceId: Number(serviceId) } : {}),
        service: formData.service,
        date: formData.date,
        time: formData.time,
        notes: `${formData.notes || ''}\nCustomer: ${formData.fullName}\nPhone: ${formData.phone}\nPayment: ${formData.paymentMethod}\nAmount: R${amount}`.trim(),
      };

      if (payload.date < today) {
        setErrorMessage('You cannot book a past date.');
        return;
      }

      await bookingService.bookAppointment(payload);

      setShowPaymentPopup(false);
      setSuccessMessage('Booking confirmed. Payment received.');
      setFormData(INITIAL_FORM);
      setServiceId('');
      setSlots([]);
      setMessage('');
      setActiveStep(1);
      navigate('/bookings');
    } catch (error) {
      setErrorMessage(getBookingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="book-page">
      <div className="book-shell">
        <div className="book-main-grid">
          <aside className="book-side-panel">
            <div className="book-pin-embed">
              <iframe
                src="https://assets.pinterest.com/ext/embed.html?id=2040762328200900"
                title="Pinterest inspiration"
                loading="lazy"
              />
            </div>
          </aside>

          <div className="book-right-panel">
            <form className="book-form" onSubmit={handleSubmit}>
              <div className="book-form-head">
                <h1>Book Appointment</h1>
                <p>Step {activeStep} of 3</p>
              </div>

              {activeStep === 1 ? (
                <>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="service">Service</label>
                  <select id="service" name="service" value={formData.service} onChange={handleChange}>
                    <option value="" disabled>Select a service</option>
                    {services.length > 0 ? services.map((svc) => {
                      const value = svc.name || '';
                      return (
                        <option key={svc._id || svc.id || value} value={value}>
                          {value}
                        </option>
                      );
                    }) : (
                      <>
                        <option value="Haircut">Haircut</option>
                        <option value="Nails">Nails</option>
                        <option value="Braids">Braids</option>
                      </>
                    )}
                  </select>
                </>
              ) : null}

              {activeStep === 2 ? (
                <>
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="time">Time</label>
                  {slots.length > 0 ? (
                    <select id="time" name="time" value={formData.time} onChange={handleChange} required>
                      <option value="">Select available slot</option>
                      {slots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  )}
                  {message ? <p className="book-error">{message}</p> : null}
                </>
              ) : null}

              {activeStep === 3 ? (
                <>
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="EFT">EFT</option>
                  </select>

                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any preferences or special requests"
                  />
                </>
              ) : null}

              <div className="book-total">Estimated Total: <strong>R{amount}</strong></div>

              {successMessage ? (
                <div className="book-feedback-row">
                  <p className="book-success">{successMessage}</p>
                  <button
                    type="button"
                    className="book-btn book-btn--ghost"
                    onClick={() => navigate(-1)}
                  >
                    Go Back
                  </button>
                </div>
              ) : null}
              {errorMessage ? <p className="book-error">{errorMessage}</p> : null}

              {activeStep === 1 ? (
                <button type="button" className="book-btn book-btn--primary" onClick={handleNextFromStepOne}>
                  Next
                </button>
              ) : null}

              {activeStep === 2 ? (
                <div className="book-step-actions">
                  <button type="button" className="book-btn book-btn--ghost" onClick={() => setActiveStep(1)}>
                    Back
                  </button>
                  <button type="button" className="book-btn book-btn--primary" onClick={handleNextFromStepTwo}>
                    Next
                  </button>
                </div>
              ) : null}

              {activeStep === 3 ? (
                <div className="book-step-actions">
                  <button type="button" className="book-btn book-btn--ghost" onClick={() => setActiveStep(2)} disabled={isSubmitting}>
                    Back
                  </button>
                  <button type="submit" className="book-btn book-btn--primary" disabled={isSubmitting}>
                    Continue To Payment
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      {showPaymentPopup ? (
        <div className="book-overlay">
          <div className="book-popup">
            <h2>Confirm Payment</h2>
            <p>Service: {formData.service}</p>
            <p>
              Date/Time: {formData.date} at {formData.time}
            </p>
            <p>Method: {formData.paymentMethod}</p>
            <p className="book-popup-amount">Amount: R{amount}</p>
            <div className="book-popup-actions">
              <button
                type="button"
                className="book-btn book-btn--ghost"
                onClick={() => setShowPaymentPopup(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="button" className="book-btn book-btn--primary" onClick={handleConfirmPayment} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Pay & Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
