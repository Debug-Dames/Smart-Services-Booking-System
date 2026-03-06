import React, { useEffect, useState } from 'react'
import bookingApi from '../api/bookingApi'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected']
const USE_MOCK_BOOKINGS = (import.meta.env.VITE_USE_MOCK_BOOKINGS ?? 'true').toLowerCase() === 'true'
const MOCK_BOOKINGS = [
    { id: 1, customer: 'Lerato Mokoena', service: 'Haircut', date: '2026-03-03', time: '10:00', status: 'Pending', notes: 'First visit' },
    { id: 2, customer: 'Thabo Nkosi', service: 'Beard Trim', date: '2026-03-03', time: '11:00', status: 'Confirmed', notes: '' },
    { id: 3, customer: 'Ayesha Khan', service: 'Braids', date: '2026-03-04', time: '14:00', status: 'Completed', notes: 'Paid cash' },
    { id: 4, customer: 'Sipho Dlamini', service: 'Hair Coloring', date: '2026-03-05', time: '09:30', status: 'Cancelled', notes: 'Client cancelled' },
    { id: 5, customer: 'Naledi Molefe', service: 'Wash & Blow Dry', date: '2026-03-05', time: '13:00', status: 'Pending', notes: '' },
]

const normalizeDateForInput = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
    return String(value).slice(0, 10)
}

const normalizeBooking = (booking) => ({
    id: booking.id,
    customer: booking.userName || booking.user || booking.customer || 'Unknown',
    service: booking.serviceName || booking.service || 'N/A',
    date: normalizeDateForInput(booking.date || booking.appointment_date || booking.bookingDate || booking.createdAt),
    time: booking.time || booking.appointment_time || '',
    status: booking.status || 'Pending',
    notes: booking.notes || '',
})

const isActiveBookingStatus = (status) => {
    const value = String(status || '').toLowerCase()
    return value !== 'cancelled' && value !== 'rejected'
}

const ManageBookings = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({ date: '', service: '', status: '' })
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ service: '', date: '', time: '', status: 'Pending', notes: '' })

    const loadBookings = async () => {
        setLoading(true)
        setError('')
        try {
            if (USE_MOCK_BOOKINGS) {
                setBookings(MOCK_BOOKINGS.map(normalizeBooking))
                return
            }

            const data = await bookingApi.fetchAllBookings()
            const safeData = Array.isArray(data) ? data : []
            setBookings(safeData.map(normalizeBooking))
        } catch (err) {
            setError(err.message || 'Failed to load bookings')
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadBookings()
    }, [])

    const serviceOptions = Array.from(new Set(bookings.map((booking) => booking.service).filter(Boolean))).sort()

    const filteredBookings = bookings.filter((booking) => {
        const matchesDate = !filters.date || booking.date === filters.date
        const matchesService = !filters.service || booking.service === filters.service
        const matchesStatus =
            !filters.status || String(booking.status).toLowerCase() === filters.status.toLowerCase()
        return matchesDate && matchesService && matchesStatus
    })

    const startEdit = (booking) => {
        setEditingId(booking.id)
        setEditForm({
            service: booking.service,
            date: booking.date,
            time: booking.time,
            status: booking.status,
            notes: booking.notes,
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ service: '', date: '', time: '', status: 'Pending', notes: '' })
    }

    const handleSaveEdit = async (bookingId) => {
        try {
            if (USE_MOCK_BOOKINGS) {
                const hasConflict = bookings.some((booking) =>
                    booking.id !== bookingId &&
                    isActiveBookingStatus(booking.status) &&
                    isActiveBookingStatus(editForm.status) &&
                    booking.date === editForm.date &&
                    booking.time === editForm.time
                )

                if (hasConflict) {
                    setError('Cannot save: that date/time slot is already booked.')
                    return
                }

                setBookings((prev) =>
                    prev.map((booking) => (booking.id === bookingId ? { ...booking, ...editForm } : booking))
                )
                cancelEdit()
                return
            }

            const result = await bookingApi.updateBooking(bookingId, editForm)
            if (result?.message?.toLowerCase().includes('already booked')) {
                setError('Cannot save: that date/time slot is already booked.')
                return
            }
            await loadBookings()
            cancelEdit()
        } catch (err) {
            setError(err.message || 'Failed to update booking')
        }
    }

    const handleStatusAction = async (bookingId, status) => {
        try {
            if (USE_MOCK_BOOKINGS) {
                setBookings((prev) =>
                    prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
                )
                return
            }

            if (status === 'Cancelled') {
                await bookingApi.cancelBooking(bookingId)
            } else {
                await bookingApi.updateBookingStatus(bookingId, status)
            }
            await loadBookings()
        } catch (err) {
            setError(err.message || 'Failed to update booking status')
        }
    }

    const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

    return (
        <section className="admin-page">
            <h1>Manage Bookings</h1>
            <div className="admin-card">
                <h3>Booking Management</h3>
                <p className="admin-muted">View, filter, approve/reject, edit, and cancel bookings.</p>
                <div className="booking-filters">
                    <div className="admin-form-row">
                        <label htmlFor="filter-date">Date</label>
                        <input
                            id="filter-date"
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="filter-service">Service</label>
                        <select
                            id="filter-service"
                            value={filters.service}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                        >
                            <option value="">All Services</option>
                            {serviceOptions.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="filter-status">Status</label>
                        <select
                            id="filter-status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {error ? <p className="admin-error">{error}</p> : null}
                {loading ? (
                    <p>Loading bookings...</p>
                ) : (
                    <div className="booking-table-wrap">
                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => {
                                    const isEditing = editingId === booking.id
                                    return (
                                        <tr key={booking.id}>
                                            <td>{booking.customer}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        value={editForm.service}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, service: e.target.value }))}
                                                    />
                                                ) : (
                                                    booking.service
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                                                    />
                                                ) : (
                                                    booking.date
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="time"
                                                        value={editForm.time}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
                                                    />
                                                ) : (
                                                    booking.time
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    booking.status
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        value={editForm.notes}
                                                        onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                    />
                                                ) : (
                                                    booking.notes || '-'
                                                )}
                                            </td>
                                            <td>
                                                <div className="booking-actions">
                                                    {isEditing ? (
                                                        <>
                                                            <button className="admin-btn" onClick={() => handleSaveEdit(booking.id)}>
                                                                Save
                                                            </button>
                                                            <button
                                                                className="admin-btn admin-btn-secondary"
                                                                onClick={cancelEdit}
                                                            >
                                                                Cancel Edit
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="admin-btn"
                                                                onClick={() => handleStatusAction(booking.id, 'Confirmed')}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="admin-btn admin-btn-warning"
                                                                onClick={() => handleStatusAction(booking.id, 'Rejected')}
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                className="admin-btn admin-btn-secondary"
                                                                onClick={() => startEdit(booking)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="admin-btn admin-btn-danger"
                                                                onClick={() => handleStatusAction(booking.id, 'Cancelled')}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="admin-btn admin-btn-success"
                                                                onClick={() => handleStatusAction(booking.id, 'Completed')}
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {!filteredBookings.length ? (
                                    <tr>
                                        <td colSpan="7" className="booking-empty">
                                            No bookings found for the selected filters.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ManageBookings
