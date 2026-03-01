import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const contactDetails = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: 'Phone',
    value: '+27 00 000 0000',
    href: 'tel:+270000000000',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: 'Email',
    value: 'dameshair@example.com',
    href: 'mailto:dameshair@example.com',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Address',
    value: 'Johannesburg, South Africa',
    href: 'https://maps.google.com/?q=Johannesburg,South+Africa',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: 'Hours',
    value: 'Mon–Fri: 9am–6pm',
    subValue: 'Sat–Sun: 8am–8pm',
    href: null,
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        .contact-page {
          min-height: 100vh;
          background: var(--background);
          padding: 3rem 1.5rem 5rem;
        }

        /* ── Hero banner ── */
        .contact-hero {
          max-width: 900px;
          margin: 0 auto 4rem;
          text-align: center;
          position: relative;
        }
        .contact-hero::after {
          content: '';
          display: block;
          width: 60px;
          height: 2px;
          background: var(--primary);
          margin: 1.5rem auto 0;
        }
        .contact-eyebrow {
          display: inline-block;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: 1rem;
        }
        .contact-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          font-weight: 600;
          color: var(--navy-dark);
          line-height: 1.15;
          margin: 0;
        }
        .contact-title em {
          font-style: italic;
          color: var(--primary);
        }
        .contact-subtitle {
          margin: 1.25rem auto 0;
          max-width: 480px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: var(--muted-text);
          line-height: 1.7;
          font-weight: 300;
        }

        /* ── Two-column layout ── */
        .contact-grid {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 2rem;
          align-items: start;
        }

        /* ── Info panel ── */
        .contact-info-panel {
          background: var(--navy-dark);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .contact-info-panel::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(25, 82, 166, 0.25);
          pointer-events: none;
        }
        .contact-info-panel::after {
          content: '';
          position: absolute;
          bottom: -40px;
          left: -40px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .panel-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.5rem;
        }
        .panel-sub {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.55);
          margin: 0 0 2rem;
          font-weight: 300;
        }
        .detail-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }
        .detail-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .detail-icon {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.85);
          transition: background 0.2s;
        }
        .detail-item a:hover .detail-icon,
        .detail-item:hover .detail-icon {
          background: rgba(25, 82, 166, 0.45);
        }
        .detail-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .detail-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .detail-value {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.9);
          font-weight: 400;
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.4;
        }
        a.detail-value:hover {
          color: #ffffff;
        }
        .detail-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
        }

        /* Divider inside panel */
        .panel-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 2rem 0;
        }
        .panel-book-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: color 0.2s;
        }
        .panel-book-link:hover { color: #fff; }
        .panel-book-link svg { transition: transform 0.2s; }
        .panel-book-link:hover svg { transform: translateX(4px); }

        /* ── Form panel ── */
        .contact-form-panel {
          background: #fff;
          border-radius: 16px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 24px rgba(34, 39, 76, 0.07);
        }
        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          color: var(--navy-dark);
          margin: 0 0 0.4rem;
        }
        .form-sub {
          font-size: 0.875rem;
          color: var(--muted-text);
          margin: 0 0 1.75rem;
          font-weight: 300;
        }
        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--navy-dark);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .field-input, .field-textarea {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1.5px solid #E8E9F0;
          outline: none;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          color: var(--navy-dark);
          background: #FAFBFE;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .field-input:focus, .field-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(25, 82, 166, 0.08);
          background: #fff;
        }
        .field-textarea {
          resize: vertical;
          min-height: 110px;
        }
        .form-submit {
          margin-top: 0.5rem;
          padding: 0.85rem 1.5rem;
          background: var(--navy-dark);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }
        .form-submit:hover {
          background: var(--primary);
          transform: translateY(-1px);
        }
        .form-submit:active { transform: translateY(0); }

        /* Success toast */
        .success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #166534;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .contact-info-panel { order: 2; }
          .contact-form-panel { order: 1; }
        }
      `}</style>

      <div className="contact-page">
        {/* Hero */}
        <div className="contact-hero">
          <span className="contact-eyebrow">Get In Touch</span>
          <h1 className="contact-title">We'd Love to <em>Hear From You</em></h1>
          <p className="contact-subtitle">
            Whether you have a question, a special request, or just want to say hello — our team is always happy to help.
          </p>
        </div>

        {/* Main grid */}
        <div className="contact-grid">

          {/* Left — info panel */}
          <div className="contact-info-panel">
            <p className="panel-heading">Dame's Beauty Salon</p>
            <p className="panel-sub">Johannesburg's premier beauty destination</p>

            <div className="detail-list">
              {contactDetails.map((item) => (
                <div className="detail-item" key={item.label}>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <div className="detail-icon">{item.icon}</div>
                    </a>
                  ) : (
                    <div className="detail-icon">{item.icon}</div>
                  )}
                  <div className="detail-text">
                    <span className="detail-label">{item.label}</span>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="detail-value">
                        {item.value}
                      </a>
                    ) : (
                      <span className="detail-value">{item.value}</span>
                    )}
                    {item.subValue && <span className="detail-sub">{item.subValue}</span>}
                  </div>
                </div>
              ))}
            </div>

            <hr className="panel-divider" />

            <Link to="/book" className="panel-book-link">
              Ready to book your appointment?
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Right — contact form */}
          <div className="contact-form-panel">
            <p className="form-heading">Send Us a Message</p>
            <p className="form-sub">We'll get back to you within 24 hours.</p>

            {submitted && (
              <div className="success-banner" style={{ marginBottom: '1.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Message sent! We'll be in touch soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      className="field-input"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="field-input"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="field-textarea"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="form-submit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                  </svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}