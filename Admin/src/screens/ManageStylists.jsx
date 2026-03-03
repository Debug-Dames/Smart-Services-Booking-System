import { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'
import bookingApi from '../api/bookingApi'

const emptyStylistForm = {
  name: '',
  email: '',
  phone: '',
  specialty: '',
  services: '',
  workingHours: '',
}
const SPECIALTY_OPTIONS = [
  'Hair Stylist',
  'Color Specialist',
  'Nail Technician',
  'Braiding Specialist',
  'Barber',
  'Makeup Artist',
]

const SERVICE_OPTIONS = [
  'Haircut',
  'Hair Coloring',
  'Braiding',
  'Blow Dry',
  'Manicure',
  'Pedicure',
  'Makeup',
]

const WORKING_HOUR_OPTIONS = [
  '08:00 - 16:00',
  '09:00 - 17:00',
  '10:00 - 18:00',
  '12:00 - 20:00',
]

const getRowId = (row) => row.id ?? row._id ?? row.email

const toServiceList = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const normalizeStylist = (stylist) => ({
  id: getRowId(stylist),
  name: stylist.name || '',
  email: stylist.email || '',
  phone: stylist.phone || '',
  specialty: stylist.specialty || stylist.role || '',
  services: toServiceList(stylist.services ?? stylist.assignedServices),
  workingHours: stylist.workingHours || stylist.availability || '',
  isActive: stylist.isActive !== false && stylist.status !== 'inactive',
})

const sortStylists = (items, sortBy) => {
  const list = [...items]
  list.sort((a, b) => {
    if (sortBy === 'status') return Number(b.isActive) - Number(a.isActive)
    const left = String(a[sortBy] || '').toLowerCase()
    const right = String(b[sortBy] || '').toLowerCase()
    return left.localeCompare(right)
  })
  return list
}

export default function ManageStylists() {
  const [stylists, setStylists] = useState([])
  const [bookings, setBookings] = useState([])
  const [sortBy, setSortBy] = useState('name')
  const [newStylist, setNewStylist] = useState(emptyStylistForm)
  const [editingStylistId, setEditingStylistId] = useState(null)
  const [editDraft, setEditDraft] = useState(emptyStylistForm)
  const [openScheduleStylistId, setOpenScheduleStylistId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [stylistsData, bookingsData] = await Promise.all([
        adminApi.fetchStylists(),
        bookingApi.fetchBookings(),
      ])
      setStylists((Array.isArray(stylistsData) ? stylistsData : []).map(normalizeStylist))
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
    } catch (loadErr) {
      console.error('Failed to load stylists', loadErr)
      setStylists([])
      setBookings([])
      setError('Failed to load stylists. Confirm backend endpoints for /admin/stylists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const sortedStylists = useMemo(() => sortStylists(stylists, sortBy), [stylists, sortBy])
  const activeStylistsCount = useMemo(
    () => stylists.filter((stylist) => stylist.isActive).length,
    [stylists],
  )
  const inactiveStylistsCount = useMemo(
    () => stylists.filter((stylist) => !stylist.isActive).length,
    [stylists],
  )
  const assignedServicesCount = useMemo(
    () => stylists.reduce((sum, stylist) => sum + stylist.services.length, 0),
    [stylists],
  )

  const visibleSchedule = useMemo(() => {
    if (openScheduleStylistId == null) return []
    const stylist = stylists.find((row) => String(row.id) === String(openScheduleStylistId))
    if (!stylist) return []

    return bookings.filter((booking) => {
      const bookingStylistId = booking.stylistId ?? booking.stylist?.id ?? booking.stylist?._id
      const bookingStylistName = (booking.stylistName ?? booking.stylist?.name ?? '').toLowerCase()

      if (bookingStylistId != null && String(bookingStylistId) === String(stylist.id)) return true
      if (bookingStylistName && bookingStylistName === String(stylist.name).toLowerCase()) return true
      return false
    })
  }, [bookings, openScheduleStylistId, stylists])

  const handleCreateStylist = async (event) => {
    event.preventDefault()
    const payload = {
      name: newStylist.name.trim(),
      email: newStylist.email.trim(),
      phone: newStylist.phone.trim(),
      specialty: newStylist.specialty.trim(),
      services: toServiceList(newStylist.services),
      workingHours: newStylist.workingHours.trim(),
      isActive: true,
    }

    if (!payload.name || !payload.email) {
      setError('Name and email are required.')
      return
    }

    setError('')
    try {
      const created = await adminApi.createStylist(payload)
      if (created && (created.id || created._id || created.email)) {
        setStylists((prev) => [...prev, normalizeStylist(created)])
      } else {
        setStylists((prev) => [...prev, normalizeStylist(payload)])
      }
      setNewStylist(emptyStylistForm)
    } catch (createErr) {
      console.error('Failed to create stylist', createErr)
      setStylists((prev) => [...prev, normalizeStylist(payload)])
      setNewStylist(emptyStylistForm)
      setError('Stylist added locally. Backend create endpoint may be unavailable.')
    }
  }

  const startEdit = (stylist) => {
    setEditingStylistId(stylist.id)
    setEditDraft({
      name: stylist.name,
      email: stylist.email,
      phone: stylist.phone,
      specialty: stylist.specialty,
      services: stylist.services[0] || '',
      workingHours: stylist.workingHours,
    })
  }

  const cancelEdit = () => {
    setEditingStylistId(null)
    setEditDraft(emptyStylistForm)
  }

  const saveEdit = async (stylistId) => {
    const payload = {
      name: editDraft.name.trim(),
      email: editDraft.email.trim(),
      phone: editDraft.phone.trim(),
      specialty: editDraft.specialty.trim(),
      services: toServiceList(editDraft.services),
      workingHours: editDraft.workingHours.trim(),
    }

    if (!payload.name || !payload.email) {
      setError('Name and email are required for edits.')
      return
    }

    setError('')
    try {
      const updated = await adminApi.updateStylist(stylistId, payload)
      setStylists((prev) =>
        prev.map((stylist) =>
          String(stylist.id) === String(stylistId)
            ? normalizeStylist(updated || { ...stylist, ...payload })
            : stylist,
        ),
      )
      cancelEdit()
    } catch (updateErr) {
      console.error('Failed to update stylist', updateErr)
      setStylists((prev) =>
        prev.map((stylist) =>
          String(stylist.id) === String(stylistId)
            ? normalizeStylist({ ...stylist, ...payload })
            : stylist,
        ),
      )
      cancelEdit()
      setError('Stylist updated locally. Backend update endpoint may be unavailable.')
    }
  }

  const toggleActive = async (stylist) => {
    const nextActive = !stylist.isActive
    setError('')
    try {
      const updated = await adminApi.updateStylist(stylist.id, { isActive: nextActive })
      setStylists((prev) =>
        prev.map((row) =>
          String(row.id) === String(stylist.id)
            ? normalizeStylist(updated || { ...row, isActive: nextActive })
            : row,
        ),
      )
    } catch (statusErr) {
      console.error('Failed to update stylist status', statusErr)
      setStylists((prev) =>
        prev.map((row) =>
          String(row.id) === String(stylist.id) ? { ...row, isActive: nextActive } : row,
        ),
      )
      setError('Stylist status changed locally. Backend status endpoint may be unavailable.')
    }
  }

  const removeStylist = async (stylistId) => {
    setError('')
    try {
      await adminApi.deleteStylist(stylistId)
      setStylists((prev) => prev.filter((stylist) => String(stylist.id) !== String(stylistId)))
      if (String(openScheduleStylistId) === String(stylistId)) setOpenScheduleStylistId(null)
    } catch (deleteErr) {
      console.error('Failed to delete stylist', deleteErr)
      setError('Unable to delete stylist from backend.')
    }
  }

  return (
    <section className="admin-page admin-page-enhanced stylists-page">
      <div className="admin-page-header">
        <span className="page-kicker">Stylist Lab</span>
        <h1>Manage Stylists</h1>
        <p>View, add, edit, activate/deactivate, delete stylists, and inspect schedules.</p>
      </div>

      <div className="admin-mini-stats">
        <article className="admin-mini-card">
          <span>Total Stylists</span>
          <strong>{stylists.length}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Active Stylists</span>
          <strong>{activeStylistsCount}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Inactive Stylists</span>
          <strong>{inactiveStylistsCount}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Assigned Services</span>
          <strong>{assignedServicesCount}</strong>
        </article>
      </div>

      {error ? (
        <div className="admin-card">
          <p className="admin-error">{error}</p>
        </div>
      ) : null}

      <article className="admin-card admin-section-card">
        <h3>Add Stylist</h3>
        <form className="admin-form admin-grid-form" onSubmit={handleCreateStylist}>
          <input
            placeholder="Name"
            value={newStylist.name}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            type="email"
            placeholder="Email"
            value={newStylist.email}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            placeholder="Phone"
            value={newStylist.phone}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <select
            value={newStylist.specialty}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, specialty: event.target.value }))}
          >
            <option value="">Select role/specialty</option>
            {SPECIALTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={newStylist.services}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, services: event.target.value }))}
          >
            <option value="">Select assigned service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={newStylist.workingHours}
            onChange={(event) => setNewStylist((prev) => ({ ...prev, workingHours: event.target.value }))}
          >
            <option value="">Select working hours</option>
            {WORKING_HOUR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="submit" className="admin-btn">Add Stylist</button>
        </form>
      </article>

      <article className="admin-card admin-section-card">
        <div className="admin-toolbar">
          <h3>Stylist Directory</h3>
          <div className="admin-sort">
            <label htmlFor="stylist-sort">Sort By</label>
            <select id="stylist-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading stylists...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialty</th>
                  <th>Services</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStylists.map((stylist) => {
                  const isEditing = String(editingStylistId) === String(stylist.id)
                  return (
                    <tr key={stylist.id}>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.name}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        ) : (
                          stylist.name
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.email}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, email: event.target.value }))}
                          />
                        ) : (
                          stylist.email
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.phone}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, phone: event.target.value }))}
                          />
                        ) : (
                          stylist.phone || '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editDraft.specialty}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, specialty: event.target.value }))}
                          >
                            <option value="">Select role/specialty</option>
                            {SPECIALTY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          stylist.specialty || '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editDraft.services}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, services: event.target.value }))}
                          >
                            <option value="">Select assigned service</option>
                            {SERVICE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : stylist.services.length ? (
                          stylist.services.join(', ')
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editDraft.workingHours}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, workingHours: event.target.value }))}
                          >
                            <option value="">Select working hours</option>
                            {WORKING_HOUR_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          stylist.workingHours || '-'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${stylist.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                          {stylist.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {isEditing ? (
                            <>
                              <button className="admin-btn" type="button" onClick={() => saveEdit(stylist.id)}>Save</button>
                              <button className="admin-btn admin-btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="admin-btn" type="button" onClick={() => startEdit(stylist)}>Edit</button>
                              <button className="admin-btn admin-btn-secondary" type="button" onClick={() => toggleActive(stylist)}>
                                {stylist.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="admin-btn admin-btn-danger" type="button" onClick={() => removeStylist(stylist.id)}>Delete</button>
                              <button
                                className="admin-btn admin-btn-secondary"
                                type="button"
                                onClick={() => setOpenScheduleStylistId((prev) => (String(prev) === String(stylist.id) ? null : stylist.id))}
                              >
                                Schedule
                              </button>
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
      </article>

      {openScheduleStylistId != null ? (
        <article className="admin-card">
          <h3>Stylist Booking Schedule</h3>
          {visibleSchedule.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSchedule.map((booking) => (
                    <tr key={booking.id ?? booking._id}>
                      <td>{booking.id ?? booking._id}</td>
                      <td>{booking.customerName ?? booking.user?.name ?? '-'}</td>
                      <td>{booking.serviceName ?? booking.service ?? '-'}</td>
                      <td>{booking.date ?? booking.bookingDate ?? booking.createdAt ?? '-'}</td>
                      <td>{booking.status ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No schedule entries found for this stylist.</p>
          )}
        </article>
      ) : null}
    </section>
  )
}
