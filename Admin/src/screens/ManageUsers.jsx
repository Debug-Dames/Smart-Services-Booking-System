import { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  })

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.fetchUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

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
      await adminApi.createUser({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      })
      setForm({ name: '', email: '', password: '', role: 'customer' })
      await loadUsers()
    } catch {
      setError('Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await adminApi.deleteUser(id)
      await loadUsers()
    } catch {
      setError('Failed to delete user.')
    }
  }

  const getPhone = (user) => user.phone || user.phoneNumber || 'N/A'
  const getBookingHistory = (user) => {
    if (Array.isArray(user.bookings)) return user.bookings.length
    if (typeof user.bookingHistoryCount === 'number') return user.bookingHistoryCount
    if (typeof user.totalBookings === 'number') return user.totalBookings
    return 0
  }
  const getStatus = (user) => {
    if (typeof user.status === 'string') return user.status
    if (user.isBlocked === true) return 'Blocked'
    return 'Active'
  }

  return (
    <section className="admin-page">
      <h1>Manage Users</h1>

      <div className="admin-card">
        <h3>Add User</h3>
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
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="stylist">Stylist</option>
            </select>
          </div>

          <button className="admin-btn" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3>User List</h3>
        {error ? <p>{error}</p> : null}
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table border="1" width="100%">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Booking History</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              ) : null}
              {users.map((user) => {
                const id = user.id ?? user._id
                return (
                  <tr key={id}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{getPhone(user)}</td>
                    <td>{getBookingHistory(user)}</td>
                    <td>{getStatus(user)}</td>
                    <td>
                      <button className="admin-btn" type="button" onClick={() => handleDelete(id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
