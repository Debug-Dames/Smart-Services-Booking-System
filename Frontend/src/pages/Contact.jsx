import React from 'react';
import '../Styles/contact.css';

export default function Contact() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <p className="contact-kicker">Dame's Beauty Salon</p>
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
            <form className="contact-form">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" placeholder="Your name" />

              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="example@email.com" />

              <label htmlFor="subject">Subject</label>
              <input id="subject" type="text" placeholder="How can we help?" />

              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="5"
                placeholder="Type your message here..."
              />

              <button type="button">Send Now</button>
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
