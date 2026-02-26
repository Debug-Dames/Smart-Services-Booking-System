import React from 'react';
import { Link } from 'react-router-dom';

const container = {
  minHeight: '100vh',
  backgroundColor: '#f5f0ea',
  color: '#2d1b14',
  fontFamily: "'Segoe UI', sans-serif",
};

const hero = {
  background: 'linear-gradient(135deg, #b85c38, #8d3f2a)',
  color: '#fff',
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
};

const primaryButton = {
  backgroundColor: '#ffd8b1',
  color: '#4a2c1f',
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
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const card = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
};

const ctaSection = {
  textAlign: 'center',
  backgroundColor: '#ffeedf',
  padding: '2.5rem 1rem',
};

const secondaryButton = {
  marginTop: '0.8rem',
  backgroundColor: '#8d3f2a',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.3rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const footer = {
  textAlign: 'center',
  backgroundColor: '#2d1b14',
  color: '#fff',
  padding: '1.25rem 1rem',
  fontSize: '0.95rem',
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
            <h3>Haircuts</h3>
            <p>Trendy cuts, trims, fades and styling for all hair types.</p>
          </div>
          <div style={card}>
            <h3>Nails</h3>
            <p>Manicures, pedicures, gel polish and creative nail art.</p>
          </div>
          <div style={card}>
            <h3>Braids</h3>
            <p>Protective styles, box braids, cornrows and custom designs.</p>
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <h2>Ready to Transform Your Look? Trust us to take care of your beauty needs!</h2>
        <Link to="/services">
          <button style={secondaryButton}>View All Services</button>
        </Link>
      </section>

      <footer style={footer}>
        <p>dames hair salon@gmail.com | Call us at 0711111111 | ©2026 Dames Beauty Salon</p>
      </footer>
    </div>
  );
}
