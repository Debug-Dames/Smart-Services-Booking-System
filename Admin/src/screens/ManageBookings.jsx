import React, { useEffect, useMemo, useState } from 'react'
import bookingApi from '../api/bookingApi'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rejected']

const normalizeDateForInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

const normalizeTimeForInput = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
  return ''
}

const toTitle = (value) => {
  const text = String(value || 'Pending').toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const normalizeBooking = (booking) => ({
  id: booking.id,
  customer: booking.userName || booking.user?.name || booking.user || booking.customer || booking.email || 'Unknown',
  service: booking.serviceName || booking.service?.name || booking.service || 'N/A',
  date: normalizeDateForInput(booking.date || booking.appointment_date || booking.bookingDate || booking.startTime || booking.createdAt),
  time: normalizeTimeForInput(booking.time || booking.appointment_time || booking.startTime),
  status: toTitle(booking.status),
  notes: booking.notes || '',
})

const statusClass = (status) => {
  const value = String(status || '').toLowerCase()
  if (value === 'confirmed') return 'status-confirmed'
  if (value === 'completed') return 'status-completed'
  if (value === 'cancelled' || value === 'rejected') return 'status-cancelled'
  return 'status-pending'
}

const STATUS_CHIPS = [
  { key: '', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
  { key: 'Rejected', label: 'Rejected' },
]

const ManageBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ date: '', service: '', status: '', search: '' })
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('Pending')
  const [busyId, setBusyId] = useState(null)

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await bookingApi.fetchAllBookings()
      const safeData = Array.isArray(data) ? data : []
      const normalized = safeData.map(normalizeBooking)
      normalized.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
      setBookings(normalized)
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

  const serviceOptions = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.service).filter(Boolean))).sort(),
    [bookings],
  )

  const scopedBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesDate = !filters.date || booking.date === filters.date
        const matchesService = !filters.service || booking.service === filters.service
        const term = filters.search.trim().toLowerCase()
        const matchesSearch =
          !term ||
          String(booking.customer).toLowerCase().includes(term) ||
          String(booking.service).toLowerCase().includes(term)
        return matchesDate && matchesService && matchesSearch
      }),
    [bookings, filters.date, filters.service, filters.search],
  )

  const filteredBookings = useMemo(
    () =>
      scopedBookings.filter((booking) => {
        const matchesStatus = !filters.status || String(booking.status).toLowerCase() === filters.status.toLowerCase()
        return matchesStatus
      }),
    [scopedBookings, filters.status],
  )

  const scopedStatusCounts = useMemo(() => {
    const counts = {
      all: scopedBookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    }
    scopedBookings.forEach((booking) => {
      const key = String(booking.status || '').toLowerCase()
      if (key in counts) counts[key] += 1
    })
    return counts
  }, [scopedBookings])

  const metrics = useMemo(() => {
    const total = bookings.length
    const pending = bookings.filter((b) => b.status.toLowerCase() === 'pending').length
    const confirmed = bookings.filter((b) => b.status.toLowerCase() === 'confirmed').length
    const completed = bookings.filter((b) => b.status.toLowerCase() === 'completed').length
    const cancelled = bookings.filter((b) => ['cancelled', 'rejected'].includes(b.status.toLowerCase())).length
    return { total, pending, confirmed, completed, cancelled }
  }, [bookings])

  const startEdit = (booking) => {
    setEditingId(booking.id)
    setEditStatus(booking.status)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditStatus('Pending')
  }

  const applyStatus = async (bookingId, status) => {
    try {
      setBusyId(bookingId)
      setError('')
      await bookingApi.updateBookingStatus(bookingId, status)
      await loadBookings()
      cancelEdit()
    } catch (err) {
      setError(err.message || 'Failed to update booking status')
    } finally {
      setBusyId(null)
    }
  }

  const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  return (
    <section className="admin-page admin-creative-page admin-bookings-theme">
      <div className="admin-page-hero admin-page-hero-bookings">
        <div>
          <p className="admin-page-kicker">Booking Desk</p>
          <h1>Manage Bookings</h1>
          <p className="admin-page-subtitle">Track appointments, approve or reject requests, and keep the salon schedule under control.</p>
        </div>
        <div className="admin-hero-metrics">
          <article className="admin-metric-chip"><span>Total</span><strong>{metrics.total}</strong></article>
          <article className="admin-metric-chip"><span>Pending</span><strong>{metrics.pending}</strong></article>
          <article className="admin-metric-chip"><span>Confirmed</span><strong>{metrics.confirmed}</strong></article>
          <article className="admin-metric-chip"><span>Completed</span><strong>{metrics.completed}</strong></article>
          <article className="admin-metric-chip"><span>Cancelled/Rejected</span><strong>{metrics.cancelled}</strong></article>
        </div>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated bookings-card-accent">
        <div className="bookings-toolbar">
          <div className="booking-filters">
            <div className="admin-form-row">
              <label htmlFor="booking-search">Search</label>
              <input
                id="booking-search"
                className="admin-search-input"
                placeholder="Customer or service"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
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
          <button className="admin-btn admin-btn-soft" type="button" onClick={loadBookings}>
            Refresh
          </button>
        </div>

        <div className="status-chip-row">
          {STATUS_CHIPS.map((chip) => {
            const selected = (filters.status || '') === chip.key
            const countKey = chip.key ? chip.key.toLowerCase() : 'all'
            const count = scopedStatusCounts[countKey] || 0
            return (
              <button
                key={chip.key || 'all'}
                type="button"
                className={`status-filter-chip ${selected ? 'is-selected' : ''}`}
                onClick={() => handleFilterChange('status', chip.key)}
              >
                <span>{chip.label}</span>
                <strong>{count}</strong>
              </button>
            )
          })}
        </div>

        {error ? <p className="admin-inline-error">{error}</p> : null}
        {loading ? (
          <p className="admin-muted">Loading bookings...</p>
        ) : (
          <div className="admin-table-wrap booking-table-wrap">
            <table className="admin-table booking-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const isEditing = editingId === booking.id
                  const isBusy = busyId === booking.id
                  return (
                    <tr key={booking.id}>
                      <td>{booking.customer}</td>
                      <td>{booking.service}</td>
                      <td>{booking.date || '-'}</td>
                      <td>{booking.time || '-'}</td>
                      <td>
                        {isEditing ? (
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-badge ${statusClass(booking.status)}`}>{booking.status}</span>
                        )}
                      </td>
                      <td>
                        <div className="booking-actions">
                          {isEditing ? (
                            <>
                              <button className="admin-btn" type="button" disabled={isBusy} onClick={() => applyStatus(booking.id, editStatus)}>
                                Save
                              </button>
                              <button className="admin-btn admin-btn-soft" type="button" disabled={isBusy} onClick={cancelEdit}>
                                Close
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="admin-btn" type="button" disabled={isBusy} onClick={() => applyStatus(booking.id, 'Confirmed')}>
                                Approve
                              </button>
                              <button className="admin-btn admin-btn-warning" type="button" disabled={isBusy} onClick={() => applyStatus(booking.id, 'Rejected')}>
                                Reject
                              </button>
                              <button className="admin-btn admin-btn-secondary" type="button" disabled={isBusy} onClick={() => startEdit(booking)}>
                                Edit
                              </button>
                              <button className="admin-btn admin-btn-danger" type="button" disabled={isBusy} onClick={() => applyStatus(booking.id, 'Cancelled')}>
                                Cancel
                              </button>
                              <button className="admin-btn admin-btn-success" type="button" disabled={isBusy} onClick={() => applyStatus(booking.id, 'Completed')}>
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
                    <td colSpan="6" className="booking-empty">
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
