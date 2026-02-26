import React from 'react';

export default function Contact() {
  return (
    <section style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Contact Us</h1>
        <p style={textStyle}>Dames Beauty Salon</p>
        <p style={textStyle}>Phone: +27 00 000 0000</p>
        <p style={textStyle}>Email: dameshair@example.com</p>
        <p style={textStyle}>Address: Johannesburg, South Africa</p>
        <p style={textStyle}>Mon-Fri: 9am-6pm | Sat-Sun: 8am-8pm</p>
      </div>
    </section>
  );
}

const pageStyle = {
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
};

const cardStyle = {
  width: '100%',
  maxWidth: '560px',
  backgroundColor: '#F7F8FD',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 6px 18px rgba(34, 39, 76, 0.12)',
};

const titleStyle = {
  marginTop: 0,
  color: '#22274C',
};

const textStyle = {
  margin: '0.5rem 0',
  color: '#22274C',
};
