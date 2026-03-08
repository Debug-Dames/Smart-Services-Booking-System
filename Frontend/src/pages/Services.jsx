import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/services.css';

const SERVICES = [
  {
    id: 'haircut-style',
    category: 'Hair',
    name: 'Precision Haircut & Styling',
    price: 'R200',
    duration: '60 min',
    image:
      'https://www.menshairstylestoday.com/wp-content/uploads/2018/03/Black-Men-Haircuts.jpg',
    description:
      'Face-shape focused consultation, precision cut, and signature blow-dry finish for everyday elegance.',
  },
  {
    id: 'color-refresh',
    category: 'Hair',
    name: 'Color Refresh & Gloss',
    price: 'R350',
    duration: '90 min',
    image:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
    description:
      'Tone balancing and shine gloss to revive faded color while keeping hair healthy and vibrant.',
  },
  {
    id: 'braids',
    category: 'Protective',
    name: 'Protective Braids',
    price: 'R450',
    duration: '120 min',
    image:
      'https://i.ytimg.com/vi/NfvtatVQX4g/maxresdefault.jpg',
    description:
      'Neat, long-lasting braids with scalp-friendly sectioning and clean parting.',
  },
  {
    id: 'manicure',
    category: 'Nails',
    name: 'Signature Manicure',
    price: 'R180',
    duration: '45 min',
    image:
      'https://media.istockphoto.com/id/1454729477/photo/african-american-nail-salon.jpg?s=612x612&w=0&k=20&c=JpSfW6kXHXc3lAf7HYrh2cpi2e3sRHTxoS4Im884qIM=',
    description:
      'Cuticle care, shaping, nourishing treatment, and polish application for a clean premium finish.',
  },
  {
    id: 'pedicure',
    category: 'Nails',
    name: 'Spa Pedicure',
    price: 'R240',
    duration: '60 min',
    image:
      'https://static.wixstatic.com/media/20b63a_6d9c2db71a874d11bda78b1fa5bce1e5~mv2.jpg/v1/fill/w_1000,h_667,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/20b63a_6d9c2db71a874d11bda78b1fa5bce1e5~mv2.jpg',
    description:
      'Soak, exfoliation, callus smoothing, massage, and polish designed for comfort and durability.',
  },
  {
    id: 'bridal',
    category: 'Makeup',
    name: 'Event Makeup Session',
    price: 'R500',
    duration: '75 min',
    image:
      'https://i.pinimg.com/originals/cc/45/d1/cc45d13714d914204c4a61406bc27ff9.jpg',
    description:
      'Camera-ready makeup with skin prep and look matching for weddings, graduations, and events.',
  },
];

const ADD_ONS = [
  { name: 'Deep Conditioning Treatment', price: 'R120' },
  { name: 'French Tip Upgrade', price: 'R60' },
  { name: 'Scalp Detox', price: 'R90' },
  { name: 'Brow Shape & Tint', price: 'R140' },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(SERVICES.map((service) => service.category)))],
    []
  );

  const visibleServices = useMemo(() => {
    if (activeCategory === 'All') return SERVICES;
    return SERVICES.filter((service) => service.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="services-page">
      <section className="services-list" id="services-list">
        <div className="services-list__header">
          <h2>Our Service Catalog</h2>
          <p>Transparent prices, practical durations, and specialist care from our team.</p>
        </div>

        <div className="services-filters" role="tablist" aria-label="Service categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`services-filter ${activeCategory === category ? 'services-filter--active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="services-grid">
          {visibleServices.map((service) => (
            <article key={service.id} className="service-card">
              <div className="service-card__image-wrap">
                <img src={service.image} alt={service.name} className="service-card__image" />
                <span className="service-card__category">{service.category}</span>
              </div>

              <div className="service-card__body">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-card__meta">
                  <span>{service.duration}</span>
                  <span>{service.price}</span>
                </div>
                <Link to="/book" className="service-card__cta">
                  Select Service
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-extra">
        <div className="services-extra__card">
          <h3>Add-On Treatments</h3>
          <ul>
            {ADD_ONS.map((addon) => (
              <li key={addon.name}>
                <span>{addon.name}</span>
                <strong>{addon.price}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="services-extra__card">
          <h3>Booking Notes</h3>
          <ul>
            <li>Please arrive 10 minutes before your scheduled slot.</li>
            <li>Late arrivals may reduce treatment time during peak periods.</li>
            <li>Rescheduling is available up to 24 hours before your booking.</li>
            <li>Walk-ins are welcome when slots are available.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
