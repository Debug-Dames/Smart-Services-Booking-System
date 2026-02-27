<<<<<<< HEAD
import { useState } from "react";

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    interest: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
=======
import React, { useMemo, useState } from 'react';

const SERVICE_PRICES = {
  Haircut: 150,
  Nails: 220,
  Braids: 350,
};

export default function BookAppointment() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    service: 'Haircut',
    date: '',
    time: '',
    paymentMethod: 'Card',
  });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const amount = useMemo(() => SERVICE_PRICES[formData.service] || 0, [formData.service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
>>>>>>> 4e3ce41cc3feff7a0265f204779a9b6f123ece80
  };

  const handleSubmit = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    console.log(formData);
    alert("Appointment request submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">First</p>
              </div>

              <div>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">Last</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Preferred Date of Appointment{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Please note that this is not confirmed.
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Preferred Time of Appointment{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Please note that this is not confirmed.
            </p>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Let us know what you're interested in{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="interest"
              rows="4"
              required
              value={formData.interest}
              onChange={handleChange}
              className="w-full border p-3 rounded-md"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-md"
          >
            Submit Appointment Request
          </button>

        </form>
      </div>
    </div>
  );
}
=======
    setSuccessMessage('');
    setShowPaymentPopup(true);
  };

  const handleConfirmPayment = () => {
    setShowPaymentPopup(false);
    setSuccessMessage('Booking confirmed. Payment received.');
    setFormData({
      fullName: '',
      phone: '',
      service: 'Haircut',
      date: '',
      time: '',
      paymentMethod: 'Card',
    });
  };

  return (
    <section style={pageStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>Book Appointment</h1>

        <label style={labelStyle} htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          style={inputStyle}
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          style={inputStyle}
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="service">
          Service
        </label>
        <select id="service" name="service" style={inputStyle} value={formData.service} onChange={handleChange}>
          <option value="Haircut">Haircut</option>
          <option value="Nails">Nails</option>
          <option value="Braids">Braids</option>
        </select>

        <label style={labelStyle} htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          style={inputStyle}
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="time">
          Time
        </label>
        <input
          id="time"
          name="time"
          type="time"
          style={inputStyle}
          value={formData.time}
          onChange={handleChange}
          required
        />

        <label style={labelStyle} htmlFor="paymentMethod">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          style={inputStyle}
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="EFT">EFT</option>
        </select>

        {successMessage ? <p style={successStyle}>{successMessage}</p> : null}

        <button type="submit" style={buttonStyle}>
          Continue To Payment
        </button>
      </form>

      {showPaymentPopup ? (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h2 style={{ marginTop: 0 }}>Confirm Payment</h2>
            <p>Service: {formData.service}</p>
            <p>
              Date/Time: {formData.date} at {formData.time}
            </p>
            <p>Method: {formData.paymentMethod}</p>
            <p style={{ fontWeight: '700' }}>Amount: R{amount}</p>
            <div style={actionsStyle}>
              <button type="button" style={cancelButtonStyle} onClick={() => setShowPaymentPopup(false)}>
                Cancel
              </button>
              <button type="button" style={buttonStyle} onClick={handleConfirmPayment}>
                Pay & Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const pageStyle = {
  minHeight: '70vh',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const formStyle = {
  width: '100%',
  maxWidth: '520px',
  backgroundColor: '#F7F8FD',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 6px 18px rgba(34, 39, 76, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const titleStyle = {
  margin: 0,
  color: '#22274C',
};

const labelStyle = {
  fontWeight: '600',
  color: '#22274C',
};

const inputStyle = {
  border: '1px solid #D4CACE',
  borderRadius: '8px',
  padding: '0.7rem 0.8rem',
};

const buttonStyle = {
  marginTop: '0.7rem',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  backgroundColor: '#22274C',
  color: '#FFFFFF',
  fontWeight: '700',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  border: '1px solid #22274C',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  backgroundColor: '#FFFFFF',
  color: '#22274C',
  fontWeight: '600',
  cursor: 'pointer',
};

const successStyle = {
  color: '#067647',
  margin: '0.2rem 0 0',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
  zIndex: 20,
};

const popupStyle = {
  width: '100%',
  maxWidth: '440px',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '1.2rem',
  boxShadow: '0 8px 24px rgba(34, 39, 76, 0.2)',
};

const actionsStyle = {
  marginTop: '1rem',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.7rem',
};
>>>>>>> 4e3ce41cc3feff7a0265f204779a9b6f123ece80
