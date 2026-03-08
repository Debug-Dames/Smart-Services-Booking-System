import { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'
import bookingApi from '../api/bookingApi'

const specialtyOptions = [
  'Hair',
  'Nails',
  'Makeup',
  'Braiding',
  'Barbering',
  'Skincare',
]

const availabilityOptions = ['Available', 'Busy', 'Offline']
const statusOptions = ['Available', 'Busy', 'Offline']

const workingHoursOptions = [
  '08:00 - 16:00',
  '09:00 - 17:00',
  '10:00 - 18:00',
  '11:00 - 19:00',
]

const serviceOptions = [
  'Haircut',
  'Braiding',
  'Hair Coloring',
  'Beard Trim',
  'Nail Treatment',
  'Makeup',
  'Skincare',
]

const toServiceArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  return [String(value)]
}

const normalize = (value) => String(value || '').trim().toLowerCase()

const bookingBelongsToStylist = (booking, stylist) => {
  const bookingStylistId = booking.stylistId ?? booking.stylist?.id ?? booking.stylist?._id
  const stylistId = stylist.id ?? stylist._id
  if (bookingStylistId !== undefined && stylistId !== undefined && String(bookingStylistId) === String(stylistId)) return true

  const bookingStylistEmail = normalize(booking.stylistEmail ?? booking.assignedStylistEmail ?? booking.stylist?.email)
  const stylistEmail = normalize(stylist.email)
  if (bookingStylistEmail && stylistEmail && bookingStylistEmail === stylistEmail) return true

  const bookingStylistName = normalize(booking.stylistName ?? booking.assignedStylist)
  const stylistName = normalize(stylist.name)
  return Boolean(bookingStylistName && stylistName && bookingStylistName === stylistName)
}

export default function ManageStylists() {
  const [stylists, setStylists] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    specialty: '',
    availability: 'Available',
    workingHours: '09:00 - 17:00',
    status: 'Available',
    services: 'Haircut',
  })
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    availability: 'Available',
    workingHours: '09:00 - 17:00',
    services: 'Haircut',
  })

  const loadStylists = async () => {
    setLoading(true)
    setError('')
    try {
      const [stylistsData, bookingsData] = await Promise.all([
        adminApi.fetchStylists(),
        bookingApi.fetchBookings(),
      ])
      setStylists(Array.isArray(stylistsData) ? stylistsData : [])
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
    } catch {
      setError('Failed to load stylists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStylists()
  }, [])

  const bookingCountMap = useMemo(() => {
    const map = new Map()
    stylists.forEach((stylist) => {
      const id = stylist.id ?? stylist._id
      const count = bookings.filter((booking) => bookingBelongsToStylist(booking, stylist)).length
      map.set(String(id), count)
    })
    return map
  }, [stylists, bookings])

  const metrics = useMemo(() => {
    const totalStylists = stylists.length

    const availableStylists = stylists.filter((stylist) => {
      const state = String(stylist.availability || stylist.status || 'available').toLowerCase()
      return state === 'available' || state === 'active'
    }).length

    const busyStylists = stylists.filter((stylist) => {
      const state = String(stylist.availability || stylist.status || '').toLowerCase()
      return state === 'busy'
    }).length

    const totalServicesOffered = stylists.reduce((sum, stylist) => {
      if (Array.isArray(stylist.services)) return sum + stylist.services.length
      if (typeof stylist.services === 'string' && stylist.services.trim()) return sum + 1
      if (typeof stylist.specialty === 'string' && stylist.specialty.trim()) return sum + 1
      return sum
    }, 0)

    const totalBookings = [...bookingCountMap.values()].reduce((sum, count) => sum + Number(count || 0), 0)
    const bookingsPerStylist = totalStylists > 0 ? (totalBookings / totalStylists).toFixed(1) : '0.0'

    return {
      totalStylists,
      availableStylists,
      busyStylists,
      totalServicesOffered,
      bookingsPerStylist,
    }
  }, [stylists, bookingCountMap])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email, and password are required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await adminApi.createStylist({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        specialty: form.specialty.trim(),
        availability: form.availability,
        status: form.availability,
        workingHours: form.workingHours,
        services: toServiceArray(form.services),
      })
      setForm({
        name: '',
        email: '',
        password: '',
        specialty: '',
        availability: 'Available',
        workingHours: '09:00 - 17:00',
        services: 'Haircut',
      })
      await loadStylists()
    } catch {
      setError('Failed to create stylist.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await adminApi.deleteStylist(id)
      await loadStylists()
    } catch {
      setError('Failed to delete stylist.')
    }
  }

  const startEdit = (stylist) => {
    setEditingId(stylist.id ?? stylist._id)
    setEditForm({
      specialty: stylist.specialty || '',
      availability: stylist.availability || stylist.status || 'Available',
      workingHours: stylist.workingHours || '09:00 - 17:00',
      status: stylist.status || stylist.availability || 'Available',
      services: Array.isArray(stylist.services) ? (stylist.services[0] || 'Haircut') : (stylist.services || 'Haircut'),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ specialty: '', availability: 'Available', workingHours: '09:00 - 17:00', status: 'Available', services: 'Haircut' })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await adminApi.updateStylist(id, {
        specialty: editForm.specialty,
        availability: editForm.availability,
        workingHours: editForm.workingHours,
        status: editForm.status,
        services: toServiceArray(editForm.services),
      })
      cancelEdit()
      await loadStylists()
    } catch {
      setError('Failed to update stylist.')
    }
  }

  return (
    <section className="admin-page admin-creative-page admin-stylists-theme">
      <div className="admin-page-hero admin-page-hero-stylists">
        <div>
          <p className="admin-page-kicker">Talent Board</p>
          <h1>Manage Stylists</h1>
          <p className="admin-page-subtitle">Assign availability, working hours, and services with cleaner operational control.</p>
        </div>
        <div className="admin-hero-metrics">
          <article className="admin-metric-chip"><span>Total Stylists</span><strong>{metrics.totalStylists}</strong></article>
          <article className="admin-metric-chip"><span>Available Stylists</span><strong>{metrics.availableStylists}</strong></article>
          <article className="admin-metric-chip"><span>Busy Stylists</span><strong>{metrics.busyStylists}</strong></article>
          <article className="admin-metric-chip"><span>Total Services Offered</span><strong>{metrics.totalServicesOffered}</strong></article>
          <article className="admin-metric-chip"><span>Bookings Per Stylist</span><strong>{metrics.bookingsPerStylist}</strong></article>
        </div>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated stylists-card-accent">
        <h3>Add New Stylist</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row"><label htmlFor="name">Stylist Name</label><input id="name" name="name" value={form.name} onChange={handleChange} /></div>
          <div className="admin-form-row"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} /></div>
          <div className="admin-form-row"><label htmlFor="password">Password</label><input id="password" name="password" type="password" value={form.password} onChange={handleChange} /></div>
          <div className="admin-form-row">
            <label htmlFor="specialty">Specialty</label>
            <select id="specialty" name="specialty" value={form.specialty} onChange={handleChange}>
              <option value="">Select specialty</option>
              {specialtyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="availability">Availability</label>
            <select id="availability" name="availability" value={form.availability} onChange={handleChange}>
              {availabilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="workingHours">Working Hours</label>
            <select id="workingHours" name="workingHours" value={form.workingHours} onChange={handleChange}>
              {workingHoursOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="services">Assigned Service</label>
            <select id="services" name="services" value={form.services} onChange={handleChange}>
              {serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <button className="admin-btn" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Stylist'}</button>
        </form>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated stylists-card-accent">
        <h3>All Stylists</h3>
        {error ? <p className="admin-inline-error">{error}</p> : null}
        {loading ? (
          <p className="admin-muted">Loading stylists...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Availability</th>
                  <th>Working Hours</th>
                  <th>Assigned Service</th>
                  <th>Status</th>
                  <th>Bookings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stylists.length === 0 ? (
                  <tr><td colSpan="9" className="admin-muted-cell">No stylists found.</td></tr>
                ) : null}
                {stylists.map((stylist) => {
                  const id = stylist.id ?? stylist._id
                  const isEditing = String(editingId) === String(id)
                  const bookingCount = Number(bookingCountMap.get(String(id)) || 0)
                  return (
                    <tr key={id}>
                      <td>{stylist.name || 'N/A'}</td>
                      <td>{stylist.email || 'N/A'}</td>
                      <td>
                        {isEditing ? (
                          <input value={editForm.specialty} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })} />
                        ) : (
                          stylist.specialty || 'General'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={editForm.availability} onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}>
                            {availabilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          stylist.availability || 'Available'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={editForm.workingHours} onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}>
                            {workingHoursOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          stylist.workingHours || '09:00 - 17:00'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={editForm.services} onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}>
                            {serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          Array.isArray(stylist.services) ? (stylist.services[0] || 'N/A') : (stylist.services || 'N/A')
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          stylist.status || stylist.availability || 'Available'
                        )}
                      </td>
                      <td>{bookingCount}</td>
                      <td>
                        <div className="list-item-actions">
                          {isEditing ? (
                            <>
                              <button className="admin-btn" type="button" onClick={() => saveEdit(id)}>Save</button>
                              <button className="admin-btn admin-btn-soft" type="button" onClick={cancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="admin-btn" type="button" onClick={() => startEdit(stylist)}>Edit</button>
                              <button className="admin-btn admin-btn-danger" type="button" onClick={() => handleDelete(id)}>Remove</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
