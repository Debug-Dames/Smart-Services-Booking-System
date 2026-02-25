import React from 'react'

const BookingList = ({ bookings = [], onPay = () => { } }) => (
    <div>
        <h3>Bookings</h3>
        <ul>
            {bookings.map((b) => (
                <li key={b.id} style={{ marginBottom: 8 }}>
                    <strong>{b.userName || b.user || 'Unknown'}</strong> — {b.serviceName || b.service} — {b.date}
                    <button style={{ marginLeft: 8 }} onClick={() => onPay(b)}>Pay</button>
                </li>
            ))}
        </ul>
    </div>
)

export default BookingList
