import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../api/services';
import '../Styles/myBookings.css';

const STATUS = {
  pending:   { label: 'Pending',   cls: 'status--pending' },
  confirmed: { label: 'Confirmed', cls: 'status--confirmed' },
  cancelled: { label: 'Cancelled', cls: 'status--cancelled' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(res  => setBookings(res.data || []))
      .catch(err => setError(err?.response?.data?.message || 'Could not load bookings. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mybookings-page">
      <div className="mybookings-shell">
        <div className="mybookings-header">
          <div>
            <h1>My Bookings</h1>
            <p>All your upcoming and past appointments</p>
          </div>
          <Link to="/book" className="mybookings-new-btn">+ New Booking</Link>
        </div>

        {loading && (
          <div className="mybookings-state">
            <div className="mybookings-spinner" />
            <span>Loading your bookings…</span>
          </div>
        )}

        {error && (
          <div className="mybookings-state mybookings-state--error">⚠️ {error}</div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="mybookings-empty">
            <div className="mybookings-empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>You haven't booked any appointments. Ready to treat yourself?</p>
            <Link to="/book" className="mybookings-new-btn" style={{ marginTop: 8 }}>
              Book an Appointment
            </Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="mybookings-grid">
            {bookings.map(b => {
              const info   = STATUS[b.status?.toLowerCase()] || STATUS.pending;
              const isPast = b.date < today;
              return (
                <div key={b.id} className={`mybooking-card ${isPast ? 'mybooking-card--past' : ''}`}>
                  <div className="mybooking-card-top">
                    <div className="mybooking-service">
                      <span className="mybooking-service-icon">✂</span>
                      {b.service}
                    </div>
                    <span className={`mybooking-status ${info.cls}`}>{info.label}</span>
                  </div>

                  <div className="mybooking-details">
                    <div className="mybooking-detail"><span>📅</span><span>{fmtDate(b.date)}</span></div>
                    <div className="mybooking-detail"><span>🕐</span><span>{b.time}</span></div>
                    {b.price > 0 && (
                      <div className="mybooking-detail"><span>💰</span><span>R{b.price}</span></div>
                    )}
                    <div className="mybooking-detail mybooking-ref"><span>#</span><span>Ref {b.id}</span></div>
                  </div>

                  {isPast && <div className="mybooking-past-badge">Past appointment</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}