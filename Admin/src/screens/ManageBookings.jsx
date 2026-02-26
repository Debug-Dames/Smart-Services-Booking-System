import React, { useEffect, useState } from 'react'
import BookingList from '../components/BookingList'
import bookingApi from '../api/bookingApi'

const ManageBookings = () => {
    const [bookings, setBookings] = useState([])

    useEffect(() => {
        bookingApi.fetchBookings().then((data) => setBookings(data || [])).catch(console.error)
    }, [])

    const handlePay = (booking) => {
        // placeholder: open modal or call payment flow
        console.log('Initiate payment for', booking)
    }

    return (
        <section className="admin-page">
            <h1>Manage Bookings</h1>
            <BookingList bookings={bookings} onPay={handlePay} />
        </section>
    )
}

export default ManageBookings
