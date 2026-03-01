import React from "react";
import { Link } from "react-router-dom";
import "../Styles/home.css";

const services = [
  {
    id: 1,
    title: 'Haircut & Styling',
    description: 'Expert cuts and styling tailored to enhance your natural beauty and personal flair.',
    image: '/images/service-haircut.jpg',
    price: 'From R200',
  },
  {
    id: 2,
    title: 'Hair Coloring',
    description: 'From subtle highlights to bold transformations, our colorists create stunning results.',
    image: '/images/service-coloring.jpg',
    price: 'From R250',
  },
  {
    id: 3,
    title: 'Nail Care',
    description: 'Luxurious manicures and pedicures with premium products for pristine nails.',
    image: '/images/service-nails.jpg',
    price: 'From R300',
  },
  {
    id: 4,
    title: 'Facial Treatments',
    description: 'Rejuvenating facials that cleanse, nourish, and restore your natural radiance.',
    image: '/images/service-facial.jpg',
    price: 'From R1000',
  },
]


const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Premium Quality',
    description: 'We use only the finest, salon-grade products from world-renowned brands to ensure exceptional results.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Easy Booking',
    description: 'Book your appointment online in seconds. Choose your stylist, service, and preferred time slot.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Expert Team',
    description: 'Our certified stylists bring years of experience and continuous training in the latest techniques.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Personalized Care',
    description: 'Every service is tailored to your unique style, preferences, and individual beauty goals.',
  },
]

export default function Home() {
  return (
    < div className="home-page">
      {/* <Navbar /> */}
       <section className="hero">
        <div className="hero-bg">
          <img
            src="https://i.pinimg.com/736x/4c/42/cd/4c42cdf3bf3611cfe6b81f65d192aff8.jpg"
            alt="Luxury salon interior with elegant styling chairs and warm lighting"
            className="hero-bg-image"
          />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <span className="hero-badge">Premium Beauty Experience</span>
          <h1 className="hero-title">
            Elegance Redefined,{' '}
            <span className="hero-title-accent">Style Perfected</span>
          </h1>
          <p className="hero-subtitle">
            {"Discover Dame's Salon — where artistry meets luxury. Book your transformation today and experience beauty services crafted for the discerning individual."}
          </p>
          <div className="hero-actions">
            <Link to="/book" className="hero-btn hero-btn--primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Book Appointment
            </Link>
            <Link to="/services" className="hero-btn hero-btn--secondary">
              Explore Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Happy Clients</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">6+</span>
              <span className="hero-stat-label">Expert Stylists</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">2</span>
              <span className="hero-stat-label">Years of Excellence</span>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-banner">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready for Your Transformation?</h2>
            <p className="cta-description">
              {"Book your appointment today and let our expert team bring your vision to life. Your perfect look is just a click away."}
            </p>
            <div className="cta-actions">
              <Link to="/book" className="cta-btn cta-btn--primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Book Now
              </Link>
              <Link to="/services" className="cta-btn cta-btn--outline">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services-preview" id="services">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">Curated Beauty Experiences</h2>
            <p className="section-description">
              Each service is designed to deliver an exceptional experience, combining premium products with expert technique.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-image">
                  <img src={service.image} alt={service.title} />
                  <div className="service-card-price">{service.price}</div>
                </div>
                <div className="service-card-body">
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-description">{service.description}</p>
                  <Link to="/book-appointment" className="service-card-link">
                    Book Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="services-cta">
            <Link to="/services" className="view-all-btn">
              View All Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="why-choose-us">
        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">The Dame's Difference</h2>
            <p className="section-description">
              We believe in delivering more than just a service — we craft an experience that leaves you feeling confident and beautiful.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="features container">
        <div className="card">
          <h3>Premium Stylists</h3>
          <p>Highly trained professionals delivering top-tier results.</p>
        </div>

        <div className="card">
          <h3>Easy Booking</h3>
          <p>Schedule appointments in just a few clicks.</p>
        </div>

        <div className="card">
          <h3>Luxury Products</h3>
          <p>Only the finest products for your beauty needs.</p>
        </div>
      </section> */}


    </div>
  );
};

// export default Home;