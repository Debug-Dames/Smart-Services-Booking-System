import { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

export default function ManageStylists() {
  const [stylists, setStylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
  })

  const loadStylists = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.fetchStylists()
      setStylists(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load stylists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStylists()
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
      await adminApi.createStylist({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        specialty: form.specialty.trim(),
      })
      setForm({ name: '', email: '', password: '', specialty: '' })
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

  return (
    <section className="admin-page">
      <h1>Manage Stylists</h1>

      <div className="admin-card">
        <h3>Add Stylist</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
          </div>

          <div className="admin-form-row">
            <label htmlFor="specialty">Specialty</label>
            <input id="specialty" name="specialty" placeholder="Specialty" value={form.specialty} onChange={handleChange} />
          </div>

          <button className="admin-btn" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Stylist'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Stylist List</h3>
        {error ? <p>{error}</p> : null}
        {loading ? (
          <p>Loading stylists...</p>
        ) : (
          <ul className="admin-list">
            {stylists.length === 0 ? <li className="admin-list-item">No stylists found.</li> : null}
            {stylists.map((stylist) => {
              const id = stylist.id ?? stylist._id
              return (
                <li key={id} className="admin-list-item">
                  <span>
                    <strong>{stylist.name}</strong> ({stylist.email})
                    {stylist.specialty ? ` - ${stylist.specialty}` : ''}
                  </span>
                  <button className="admin-btn" type="button" onClick={() => handleDelete(id)}>
                    Delete
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
