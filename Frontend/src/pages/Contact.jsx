import React, { useState } from 'react';
import '../Styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <p className="contact-kicker">Dame&apos;s Beauty Salon</p>
          <h1>Contact Us</h1>
          <p className="contact-hero-copy">
            We would love to hear from you. Reach out for appointments, pricing,
            and personalized beauty consultations.
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-grid">
          <article className="contact-form-card">
            <p className="contact-small-label">Get In Touch</p>
            <h2>Send A Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
              />

              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Type your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />

              <button type="submit">Send Now</button>
              {submitted ? <p style={{ color: '#79e8b2', marginTop: '8px' }}>Message sent successfully.</p> : null}
            </form>
          </article>

          <aside className="contact-info-panel">
            <p className="contact-panel-copy">
              Contact us directly or visit our salon. We are available throughout
              the week and always happy to help you plan your next look.
            </p>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <h3>Phone Number</h3>
                <p>+27 00 000 0000</p>
              </div>
              <div className="contact-info-item">
                <h3>Email Address</h3>
                <p>dameshair@example.com</p>
              </div>
              <div className="contact-info-item">
                <h3>Whatsapp</h3>
                <p>+27 82 345 7253</p>
              </div>
              <div className="contact-info-item">
                <h3>Our Office</h3>
                <p>Johannesburg, South Africa</p>
              </div>
            </div>

            <div className="contact-hours">
              <strong>Business Hours</strong>
              <p>Mon-Fri: 9am-6pm | Sat-Sun: 8am-8pm</p>
            </div>

            <div className="contact-map">
              <iframe
                title="Dame's Beauty Salon location map"
                src="https://maps.google.com/maps?q=Johannesburg%2C%20South%20Africa&t=&z=12&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
