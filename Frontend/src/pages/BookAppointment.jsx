import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authHeaders } from '../utils/api';
import '../Styles/bookAppointment.css';

const SERVICE_PRICES = {
  Haircut: 150,
  Nails: 220,
  Braids: 350,
};

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  service: 'Haircut',
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

  const amount = useMemo(() => SERVICE_PRICES[formData.service] || 0, [formData.service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setShowPaymentPopup(true);
  };

  const handleNextFromStepOne = () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.service) {
      setErrorMessage('Please complete Full Name, Phone Number, and Service.');
      return;
    }
    setErrorMessage('');
    setActiveStep(2);
  };

  const handleNextFromStepTwo = () => {
    if (!formData.date || !formData.time) {
      setErrorMessage('Please select both date and time.');
      return;
    }
    setErrorMessage('');
    setActiveStep(3);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const payload = {
        service: formData.service,
        date: formData.date,
        time: formData.time,
        notes: `${formData.notes || ''}\nCustomer: ${formData.fullName}\nPhone: ${formData.phone}\nPayment: ${formData.paymentMethod}\nAmount: R${amount}`.trim(),
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.message || 'Unable to complete booking. Please try again.');
        return;
      }

      setShowPaymentPopup(false);
      setSuccessMessage('Booking confirmed. Payment received.');
      setFormData(INITIAL_FORM);
      setActiveStep(1);
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="book-page">
      <div className="book-shell">
        <div className="book-main-grid">
          <aside className="book-phone-panel">
            <div className="book-phone-frame">
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80"
                alt="Nail art inspiration"
              />
            </div>
            <p className="book-social">@DAMESBEAUTY</p>
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
                    <option value="Haircut">Haircut</option>
                    <option value="Nails">Nails</option>
                    <option value="Braids">Braids</option>
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
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="time">Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
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
