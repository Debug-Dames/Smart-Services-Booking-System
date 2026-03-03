import { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'
import bookingApi from '../api/bookingApi'

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
}

const getRowId = (row) => row.id ?? row._id ?? row.email

const normalizeUser = (user, bookingCount = 0) => ({
  id: getRowId(user),
  name: user.name || '',
  email: user.email || '',
  phone: user.phone || '',
  role: user.role || 'customer',
  bookingCount,
  isBlocked: Boolean(user.isBlocked || user.blocked || user.status === 'blocked'),
})

const buildUserBookingMap = (bookings) => {
  const map = new Map()

  bookings.forEach((booking) => {
    const userId = booking.userId ?? booking.user?.id ?? booking.user?._id
    const userEmail = booking.email ?? booking.user?.email

    if (userId != null) {
      const key = String(userId)
      map.set(key, (map.get(key) || 0) + 1)
    }

    if (userEmail) {
      const key = String(userEmail).toLowerCase()
      map.set(key, (map.get(key) || 0) + 1)
    }
  })

  return map
}

const sortUsers = (items, sortBy) => {
  const users = [...items]
  users.sort((a, b) => {
    if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0)
    const left = String(a[sortBy] || '').toLowerCase()
    const right = String(b[sortBy] || '').toLowerCase()
    return left.localeCompare(right)
  })
  return users
}

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [sortBy, setSortBy] = useState('name')
  const [newUser, setNewUser] = useState(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editDraft, setEditDraft] = useState({ name: '', email: '', phone: '' })
  const [openHistoryUserId, setOpenHistoryUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersData, bookingsData] = await Promise.all([
        adminApi.fetchUsers(),
        bookingApi.fetchBookings(),
      ])
      const safeUsers = Array.isArray(usersData) ? usersData : []
      const safeBookings = Array.isArray(bookingsData) ? bookingsData : []
      const bookingMap = buildUserBookingMap(safeBookings)

      setBookings(safeBookings)
      setUsers(
        safeUsers.map((user) => {
          const idKey = getRowId(user)
          const idCount = idKey != null ? bookingMap.get(String(idKey)) || 0 : 0
          const emailCount = user.email ? bookingMap.get(String(user.email).toLowerCase()) || 0 : 0
          return normalizeUser(user, Math.max(idCount, emailCount))
        }),
      )
    } catch (loadErr) {
      console.error('Failed to load users', loadErr)
      setError('Failed to load users. Check backend endpoints and try again.')
      setUsers([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const sortedUsers = useMemo(() => sortUsers(users, sortBy), [users, sortBy])
  const activeUsersCount = useMemo(() => users.filter((user) => !user.isBlocked).length, [users])
  const blockedUsersCount = useMemo(() => users.filter((user) => user.isBlocked).length, [users])
  const totalBookingsCount = useMemo(
    () => users.reduce((sum, user) => sum + (user.bookingCount || 0), 0),
    [users],
  )

  const visibleBookingHistory = useMemo(() => {
    if (openHistoryUserId == null) return []

    const currentUser = users.find((user) => String(user.id) === String(openHistoryUserId))
    if (!currentUser) return []

    return bookings.filter((booking) => {
      const bookingUserId = booking.userId ?? booking.user?.id ?? booking.user?._id
      const bookingEmail = (booking.email ?? booking.user?.email ?? '').toLowerCase()

      if (bookingUserId != null && String(bookingUserId) === String(currentUser.id)) return true
      if (bookingEmail && bookingEmail === String(currentUser.email).toLowerCase()) return true
      return false
    })
  }, [bookings, openHistoryUserId, users])

  const handleCreateUser = async (event) => {
    event.preventDefault()
    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      role: 'customer',
      phone: newUser.phone.trim(),
    }

    if (!payload.name || !payload.email || !payload.password) {
      setError('Name, email, and password are required.')
      return
    }

    setError('')
    try {
      const created = await adminApi.createUser(payload)
      if (created && (created.id || created._id || created.email)) {
        setUsers((prev) => [...prev, normalizeUser(created, 0)])
      } else {
        await loadData()
      }
      setNewUser(emptyUserForm)
    } catch (createErr) {
      console.error('Failed to create user', createErr)
      setError('Unable to create user. Please verify backend configuration.')
    }
  }

  const startEdit = (user) => {
    setEditingUserId(user.id)
    setEditDraft({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    })
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditDraft({ name: '', email: '', phone: '' })
  }

  const saveEdit = async (userId) => {
    const payload = {
      name: editDraft.name.trim(),
      email: editDraft.email.trim(),
      phone: editDraft.phone.trim(),
    }

    if (!payload.name || !payload.email) {
      setError('Name and email are required for edits.')
      return
    }

    setError('')
    try {
      const updated = await adminApi.updateUser(userId, payload)
      setUsers((prev) =>
        prev.map((user) => {
          if (String(user.id) !== String(userId)) return user
          return normalizeUser(updated || { ...user, ...payload }, user.bookingCount)
        }),
      )
      cancelEdit()
    } catch (updateErr) {
      console.error('Failed to update user', updateErr)
      setUsers((prev) =>
        prev.map((user) =>
          String(user.id) === String(userId)
            ? { ...user, name: payload.name, email: payload.email, phone: payload.phone }
            : user,
        ),
      )
      cancelEdit()
      setError('User updated locally. Backend update endpoint may be unavailable.')
    }
  }

  const toggleBlocked = async (user) => {
    const nextBlocked = !user.isBlocked

    setError('')
    try {
      const updated = await adminApi.updateUser(user.id, { isBlocked: nextBlocked })
      setUsers((prev) =>
        prev.map((row) => {
          if (String(row.id) !== String(user.id)) return row
          return normalizeUser(updated || { ...row, isBlocked: nextBlocked }, row.bookingCount)
        }),
      )
    } catch (blockErr) {
      console.error('Failed to toggle user status', blockErr)
      setUsers((prev) =>
        prev.map((row) =>
          String(row.id) === String(user.id) ? { ...row, isBlocked: nextBlocked } : row,
        ),
      )
      setError('Status changed locally. Backend status endpoint may be unavailable.')
    }
  }

  const removeUser = async (userId) => {
    setError('')
    try {
      await adminApi.deleteUser(userId)
      setUsers((prev) => prev.filter((user) => String(user.id) !== String(userId)))
      if (String(openHistoryUserId) === String(userId)) setOpenHistoryUserId(null)
    } catch (deleteErr) {
      console.error('Failed to delete user', deleteErr)
      setError('Unable to delete user from backend.')
    }
  }

  return (
    <section className="admin-page admin-page-enhanced users-page">
      <div className="admin-page-header">
        <span className="page-kicker">Customer Studio</span>
        <h1>Manage Users</h1>
        <p>View, add, edit, block/unblock, delete users, and inspect booking history.</p>
      </div>

      <div className="admin-mini-stats">
        <article className="admin-mini-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Active Users</span>
          <strong>{activeUsersCount}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Blocked Users</span>
          <strong>{blockedUsersCount}</strong>
        </article>
        <article className="admin-mini-card">
          <span>Total Bookings</span>
          <strong>{totalBookingsCount}</strong>
        </article>
      </div>

      {error ? (
        <div className="admin-card">
          <p className="admin-error">{error}</p>
        </div>
      ) : null}

      <article className="admin-card admin-section-card">
        <h3>Add User</h3>
        <form className="admin-form admin-grid-form" onSubmit={handleCreateUser}>
          <input
            name="name"
            placeholder="Name"
            value={newUser.name}
            onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={newUser.phone}
            onChange={(event) => setNewUser((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
          />
          <button type="submit" className="admin-btn">Add User</button>
        </form>
      </article>

      <article className="admin-card admin-section-card">
        <div className="admin-toolbar">
          <h3>User Directory</h3>
          <div className="admin-sort">
            <label htmlFor="user-sort">Sort By</label>
            <select id="user-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="bookings">Booking Count</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Bookings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const isEditing = String(editingUserId) === String(user.id)
                  return (
                    <tr key={user.id}>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.name}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.email}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, email: event.target.value }))}
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editDraft.phone}
                            onChange={(event) => setEditDraft((prev) => ({ ...prev, phone: event.target.value }))}
                          />
                        ) : (
                          user.phone || '-'
                        )}
                      </td>
                      <td>{user.bookingCount}</td>
                      <td>
                        <span className={`status-badge ${user.isBlocked ? 'status-cancelled' : 'status-confirmed'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {isEditing ? (
                            <>
                              <button className="admin-btn" type="button" onClick={() => saveEdit(user.id)}>Save</button>
                              <button className="admin-btn admin-btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="admin-btn" type="button" onClick={() => startEdit(user)}>Edit</button>
                              <button className="admin-btn admin-btn-secondary" type="button" onClick={() => toggleBlocked(user)}>
                                {user.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                              <button className="admin-btn admin-btn-danger" type="button" onClick={() => removeUser(user.id)}>Delete</button>
                              <button
                                className="admin-btn admin-btn-secondary"
                                type="button"
                                onClick={() => setOpenHistoryUserId((prev) => (String(prev) === String(user.id) ? null : user.id))}
                              >
                                History
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

      {openHistoryUserId != null ? (
        <article className="admin-card">
          <h3>User Booking History</h3>
          {visibleBookingHistory.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookingHistory.map((booking) => (
                    <tr key={booking.id ?? booking._id}>
                      <td>{booking.id ?? booking._id}</td>
                      <td>{booking.serviceName ?? booking.service ?? '-'}</td>
                      <td>{booking.date ?? booking.bookingDate ?? booking.createdAt ?? '-'}</td>
                      <td>{booking.status ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No bookings found for this user.</p>
          )}
        </article>
      ) : null}
    </section>
  )
}
