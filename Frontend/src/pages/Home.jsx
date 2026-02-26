import React from 'react';
import { Link } from 'react-router-dom';

const container = {
  minHeight: '100vh',
  backgroundColor: '#F5F6FA',
  color: '#22274C',
  fontFamily: "'Segoe UI', sans-serif",
};

const hero = {
  background: 'linear-gradient(135deg, #22274C, #1952A6)',
  color: '#FFFFFF',
  textAlign: 'center',
  padding: '4rem 1.5rem',
};

const heroTitle = {
  fontSize: '3rem',
  marginBottom: '0.75rem',
};

const heroText = {
  fontSize: '1.2rem',
  marginBottom: '1.25rem',
  color: '#BDC2DB',
};

const primaryButton = {
  backgroundColor: '#1952A6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.3rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const section = {
  padding: '2.5rem 1rem',
  maxWidth: '1100px',
  margin: '0 auto',
};

const sectionTitle = {
  textAlign: 'center',
  fontSize: '2rem',
  marginBottom: '1.25rem',
  color: '#22274C',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D4CACE',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 8px 20px rgba(34, 39, 76, 0.08)',
};

const cardTitle = {
  color: '#22274C',
};

const cardText = {
  color: '#6B6F8E',
};

const ctaSection = {
  textAlign: 'center',
  backgroundColor: '#D4CACE',
  padding: '2.5rem 1rem',
};

const secondaryButton = {
  marginTop: '0.8rem',
  backgroundColor: '#BDC2DB',
  color: '#22274C',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.3rem',
  fontWeight: '600',
  cursor: 'pointer',
};

export default function Home() {
  return (
    <div style={container}>
      <section style={hero}>
        <h1 style={heroTitle}>Dames Beauty Salon</h1>
        <p style={heroText}>Professional Haircuts, Stunning Nails & Beautiful Braids</p>
        <Link to="/services">
          <button style={primaryButton}>Book Appointment</button>
        </Link>
      </section>

      <section style={section}>
        <h2 style={sectionTitle}>Our Services</h2>
        <div style={grid}>
          <div style={card}>
            <h3 style={cardTitle}>Haircuts</h3>
            <p style={cardText}>Trendy cuts, trims, fades and styling for all hair types.</p>
          </div>
          <div style={card}>
            <h3 style={cardTitle}>Nails</h3>
            <p style={cardText}>Manicures, pedicures, gel polish and creative nail art.</p>
          </div>
          <div style={card}>
            <h3 style={cardTitle}>Braids</h3>
            <p style={cardText}>Protective styles, box braids, cornrows and custom designs.</p>
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <h2>Ready to Transform Your Look? Trust us to take care of your beauty needs!</h2>
        <Link to="/services">
          <button style={secondaryButton}>View All Services</button>
        </Link>
      </section>
    </div>
  );
}
