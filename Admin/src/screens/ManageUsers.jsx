import { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'
import bookingApi from '../api/bookingApi'

const USER_STATUSES = ['Active', 'Suspended', 'Blocked']

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalize = (value) => String(value || '').trim().toLowerCase()

const bookingBelongsToUser = (booking, user) => {
  const bookingUserId = booking.userId ?? booking.user?.id ?? booking.user?._id
  const userId = user.id ?? user._id
  if (bookingUserId !== undefined && userId !== undefined && String(bookingUserId) === String(userId)) return true

  const bookingEmail = normalize(booking.userEmail ?? booking.email ?? booking.user?.email)
  const userEmail = normalize(user.email)
  if (bookingEmail && userEmail && bookingEmail === userEmail) return true

  const bookingName = normalize(
    booking.userName ?? booking.customerName ?? (typeof booking.user === 'string' ? booking.user : booking.user?.name),
  )
  const userName = normalize(user.name)
  return Boolean(bookingName && userName && bookingName === userName)
}

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', status: 'Active' })
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    const [usersResult, bookingsResult] = await Promise.allSettled([
      adminApi.fetchUsers(),
      bookingApi.fetchBookings(),
    ])

    if (usersResult.status === 'fulfilled') {
      setUsers(Array.isArray(usersResult.value) ? usersResult.value : [])
    } else {
      setError('Failed to load users.')
    }

    if (bookingsResult.status === 'fulfilled') {
      setBookings(Array.isArray(bookingsResult.value) ? bookingsResult.value : [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const userAccounts = useMemo(() => {
    return users.filter((user) => String(user.role || '').trim().toLowerCase() !== 'admin')
  }, [users])

  const bookingCountMap = useMemo(() => {
    const map = new Map()
    userAccounts.forEach((user) => {
      const id = user.id ?? user._id
      const count = bookings.filter((booking) => bookingBelongsToUser(booking, user)).length
      map.set(String(id), count)
    })
    return map
  }, [userAccounts, bookings])

  const normalizedQuery = useMemo(() => search.trim().toLowerCase(), [search])

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return userAccounts
    return userAccounts.filter((user) => {
      const name = normalize(user.name)
      const email = normalize(user.email)
      return name.includes(normalizedQuery) || email.includes(normalizedQuery)
    })
  }, [userAccounts, normalizedQuery])

  const metrics = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(now.getDate() - 14)

    const newUsersAdded = userAccounts.filter((user) => {
      const createdAt = toDate(user.createdAt)
      return createdAt && createdAt >= sevenDaysAgo
    }).length

    const previousPeriodUsers = userAccounts.filter((user) => {
      const createdAt = toDate(user.createdAt)
      return createdAt && createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo
    }).length

    const activeUsers = userAccounts.filter((user) => {
      const id = user.id ?? user._id
      return Number(bookingCountMap.get(String(id)) || 0) > 0
    }).length

    const suspendedUsers = userAccounts.filter((user) =>
      ['suspended', 'blocked'].includes(String(user.status || 'Active').toLowerCase()),
    ).length

    const growthText = previousPeriodUsers === 0
      ? `${newUsersAdded > 0 ? '+' : ''}${newUsersAdded}`
      : `${(((newUsersAdded - previousPeriodUsers) / previousPeriodUsers) * 100).toFixed(1)}%`

    return {
      totalUsers: userAccounts.length,
      newUsersAdded,
      activeUsers,
      suspendedUsers,
      growthText,
    }
  }, [userAccounts, bookingCountMap])

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
      const created = await adminApi.createUser({
        ...form,
        role: 'user',
        status: 'Active',
        name: form.name.trim(),
        email: form.email.trim(),
      })
      setForm({ name: '', email: '', password: '', role: 'user' })
      await loadUsers()

    } catch (err) {
      setError(err.message || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (user) => {
    setEditingId(user.id ?? user._id)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      status: user.status || 'Active',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', email: '', status: 'Active' })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await adminApi.updateUser(id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        status: editForm.status,
      })
      cancelEdit()
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to update user.')
    }
  }

  const changeStatus = async (id, status) => {
    setError('')
    try {
      await adminApi.updateUser(id, { status })
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to update user status.')
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await adminApi.deleteUser(id)
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to delete user.')
    }
  }

  return (
    <section className="admin-page admin-creative-page admin-users-theme">
      <div className="admin-page-hero admin-page-hero-users">
        <div>
          <p className="admin-page-kicker">Workspace</p>
          <h1>Manage Users</h1>
          <p className="admin-page-subtitle">Create, search by email, update, disable, and manage all user accounts in one place.</p>
        </div>
        <div className="admin-hero-metrics">
          <article className="admin-metric-chip metric-users-total"><span>Total Users</span><strong>{metrics.totalUsers}</strong></article>
          <article className="admin-metric-chip metric-users-new"><span>New Users Added</span><strong>{metrics.newUsersAdded}</strong></article>
          <article className="admin-metric-chip metric-users-active"><span>Active Users</span><strong>{metrics.activeUsers}</strong></article>
          <article className="admin-metric-chip metric-users-deleted"><span>Suspended Users</span><strong>{metrics.suspendedUsers}</strong></article>
          <article className="admin-metric-chip metric-users-growth"><span>User Growth</span><strong>{metrics.growthText}</strong></article>
        </div>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated users-card-accent">
        <h3>Add New User</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} placeholder="Name" onChange={handleChange} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} placeholder="Email" onChange={handleChange} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} placeholder="Password" onChange={handleChange} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="role">Role</label>
            <input id="role" value="User" disabled readOnly />
          </div>
          <button className="admin-btn" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated users-card-accent">
        <h3>All Users</h3>
        <div className="admin-inline-toolbar">
          <input
            className="admin-search-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email"
          />
        </div>
        {error ? <p className="admin-inline-error">{error}</p> : null}
        {loading ? (
          <p className="admin-muted">Loading users...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th>Bookings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-muted-cell">
                      {normalizedQuery ? 'No users match this email/name search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : null}
                {filteredUsers.map((user) => {
                  const id = user.id ?? user._id
                  const isEditing = String(editingId) === String(id)
                  const created = toDate(user.createdAt)
                  const bookingCount = Number(bookingCountMap.get(String(id)) || 0)
                  return (
                    <tr key={id}>
                      <td>
                        {isEditing ? (
                          <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        ) : (
                          user.name || 'N/A'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                        ) : (
                          user.email || 'N/A'
                        )}
                      </td>
                      <td>{String(user.role || '').trim().toLowerCase() === 'admin' ? 'Admin' : 'User'}</td>
                      <td>{created ? created.toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {isEditing ? (
                          <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            {USER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        ) : (
                          <span className={`admin-status-pill ${String(user.status || 'Active').toLowerCase() === 'active' ? 'is-active' : 'is-blocked'}`}>
                            {user.status || 'Active'}
                          </span>
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
                              <button className="admin-btn" type="button" onClick={() => startEdit(user)}>Edit</button>
                              <button className="admin-btn admin-btn-soft" type="button" onClick={() => changeStatus(id, String(user.status || 'Active').toLowerCase() === 'active' ? 'Suspended' : 'Active')}>
                                {String(user.status || 'Active').toLowerCase() === 'active' ? 'Disable' : 'Enable'}
                              </button>
                              <button className="admin-btn admin-btn-danger" type="button" onClick={() => handleDelete(id)}>Delete</button>
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

export default ManageUsers
