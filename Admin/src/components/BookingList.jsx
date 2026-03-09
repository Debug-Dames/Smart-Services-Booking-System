import React from 'react'
import StatusBadge from './StatusBadge'

const BookingList = ({ bookings = [], onPay = () => { } }) => (
    <div className="admin-card">
        <h3>Bookings</h3>
        <ul className="admin-list">
            {bookings.map((b) => (
                <li key={b.id} className="admin-list-item">
                    <div>
                        <strong>{b.userName || b.user || 'Unknown'}</strong> - {b.serviceName || b.service} - {b.date}
                    </div>
                    <div className="list-item-actions">
                        <StatusBadge status={b.status || 'Pending'} />
                        <button className="admin-btn" onClick={() => onPay(b)}>Pay</button>
                    </div>
                </li>
            ))}
        </ul>
    </div>
)

export default BookingList
