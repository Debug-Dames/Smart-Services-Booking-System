import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, authHeaders } from '../utils/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch(`${API_URL}/api/bookings/mine`, {
          headers: authHeaders(),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message || 'Failed to fetch bookings.');
          return;
        }

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError('Network error. Please ensure the server is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const statusColor = (status) => {
    if (!status) return '#6B6F8E';
    if (status.toLowerCase() === 'confirmed') return '#166534';
    if (status.toLowerCase() === 'cancelled') return '#B42318';
    return '#92400E';
  };

  const statusBg = (status) => {
    if (!status) return '#F3F4F6';
    if (status.toLowerCase() === 'confirmed') return '#F0FDF4';
    if (status.toLowerCase() === 'cancelled') return '#FEF2F2';
    return '#FFFBEB';
  };

  return (
    <section style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>My Bookings</h1>
          <Link to="/book" style={bookBtnStyle}>+ Book New Appointment</Link>
        </div>

        {loading && <p style={infoStyle}>Loading your bookings...</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <div style={emptyStyle}>
            <p style={{ margin: '0 0 1rem', color: '#6B6F8E', fontSize: '1rem' }}>
              You don't have any bookings yet.
            </p>
            <Link to="/book" style={bookBtnStyle}>Book Your First Appointment</Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div style={gridStyle}>
            {bookings.map((booking) => (
              <div key={booking.id} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={serviceStyle}>{booking.service}</h3>
                  <span style={{
                    ...statusBadgeStyle,
                    color: statusColor(booking.status),
                    backgroundColor: statusBg(booking.status),
                  }}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
                <div style={cardBodyStyle}>
                  <div style={detailRowStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span>{booking.appointment_date}</span>
                  </div>
                  <div style={detailRowStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{booking.appointment_time}</span>
                  </div>
                  {booking.notes && (
                    <div style={notesStyle}>
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const pageStyle = {
  padding: '6rem 1rem 3rem',
  minHeight: '80vh',
};

const containerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const titleStyle = {
  margin: 0,
  color: '#22274C',
  fontFamily: 'var(--font-heading)',
  fontSize: '2rem',
};

const bookBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.7rem 1.25rem',
  backgroundColor: '#1952A6',
  color: '#FFFFFF',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '0.9rem',
  textDecoration: 'none',
  transition: 'background 0.2s',
};

const infoStyle = {
  color: '#6B6F8E',
  fontSize: '1rem',
};

const errorStyle = {
  color: '#B42318',
  backgroundColor: '#FEF2F2',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
};

const emptyStyle = {
  textAlign: 'center',
  padding: '3rem',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(34, 39, 76, 0.08)',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1.25rem',
};

const cardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(34, 39, 76, 0.08)',
  overflow: 'hidden',
  border: '1px solid #EEF0F8',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #EEF0F8',
};

const serviceStyle = {
  margin: 0,
  color: '#22274C',
  fontFamily: 'var(--font-heading)',
  fontSize: '1.1rem',
};

const statusBadgeStyle = {
  fontSize: '0.78rem',
  fontWeight: '600',
  padding: '0.25rem 0.6rem',
  borderRadius: '20px',
  textTransform: 'capitalize',
};

const cardBodyStyle = {
  padding: '1rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#6B6F8E',
  fontSize: '0.9rem',
};

const notesStyle = {
  marginTop: '0.5rem',
  fontSize: '0.875rem',
  color: '#6B6F8E',
  backgroundColor: '#F5F6FA',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
};