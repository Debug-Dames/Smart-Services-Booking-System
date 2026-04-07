import { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'

const CATEGORY_OPTIONS = ['Hair', 'Nails', 'Spa', 'Makeup', 'Grooming']
const AVAILABILITY_OPTIONS = ['Available', 'Limited', 'Unavailable']

const toMinutes = (durationValue) => {
  if (typeof durationValue === 'number' && Number.isFinite(durationValue)) return durationValue
  if (typeof durationValue !== 'string') return 0

  const value = durationValue.trim()
  if (!value) return 0
  if (/^\d+$/.test(value)) return Number(value)

  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59) return 0
  return hours * 60 + minutes
}

const minutesToDuration = (totalMinutes) => {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0)
  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const formatDurationLabel = (totalMinutes) => {
  const minutes = Math.max(0, Number(totalMinutes) || 0)
  const hoursPart = Math.floor(minutes / 60)
  const minutesPart = minutes % 60
  return `${hoursPart}h ${String(minutesPart).padStart(2, '0')}m`
}

const EMPTY_FORM = {
  name: '',
  category: 'Hair',
  price: '',
  duration: '01:00',
  availability: 'Available',
  isActive: true,
}

const normalizeService = (service) => ({
  id: service.id,
  name: service.name || '',
  category: service.category || 'Hair',
  price: Number(service.price) || 0,
  duration: toMinutes(service.duration),
  availability: service.availability || 'Available',
  isActive: service.isActive !== false,
})

function ManageServices() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', category: '', availability: '', status: '' })

  const loadServices = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.fetchServices()
      const safeData = Array.isArray(data) ? data : []
      setServices(safeData.map(normalizeService))
    } catch (err) {
      setError(err.message || 'Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const metrics = useMemo(() => {
    const total = services.length
    const active = services.filter((service) => service.isActive).length
    const inactive = total - active
    const avgPrice = total ? Math.round(services.reduce((sum, service) => sum + Number(service.price || 0), 0) / total) : 0
    const avgDuration = total ? Math.round(services.reduce((sum, service) => sum + Number(service.duration || 0), 0) / total) : 0
    return { total, active, inactive, avgPrice, avgDuration }
  }, [services])

  const filteredServices = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    return services.filter((service) => {
      const matchesSearch = !term || service.name.toLowerCase().includes(term) || service.category.toLowerCase().includes(term)
      const matchesCategory = !filters.category || service.category === filters.category
      const matchesAvailability = !filters.availability || service.availability === filters.availability
      const matchesStatus =
        !filters.status ||
        (filters.status === 'Active' ? service.isActive : !service.isActive)
      return matchesSearch && matchesCategory && matchesAvailability && matchesStatus
    })
  }, [services, filters])

  const updateFormField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const updateFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    category: form.category,
    price: Number(form.price),
    duration: toMinutes(form.duration),
    availability: form.availability,
    isActive: Boolean(form.isActive),
  })

  const validatePayload = (payload) => {
    if (!payload.name || payload.price < 0 || payload.duration <= 0) {
      setError('Please enter a valid service name, price, and duration.')
      return false
    }
    return true
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    const payload = buildPayload()
    if (!validatePayload(payload)) return

    setSubmitting(true)
    setError('')
    try {
      await adminApi.createService(payload)
      await loadServices()
      resetForm()
    } catch (err) {
      setError(err.message || 'Failed to create service')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (service) => {
    setEditingId(service.id)
    setForm({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: minutesToDuration(service.duration),
      availability: service.availability,
      isActive: service.isActive,
    })
  }

  const handleSaveEdit = async () => {
    const payload = buildPayload()
    if (!validatePayload(payload)) return

    setSubmitting(true)
    setError('')
    try {
      await adminApi.updateService(editingId, payload)
      await loadServices()
      resetForm()
    } catch (err) {
      setError(err.message || 'Failed to update service')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteService = async (id) => {
    setBusyId(id)
    setError('')
    try {
      await adminApi.deleteService(id)
      await loadServices()
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err.message || 'Failed to delete service')
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleActive = async (service) => {
    setBusyId(service.id)
    setError('')
    try {
      await adminApi.updateService(service.id, { isActive: !service.isActive })
      await loadServices()
      if (editingId === service.id) {
        setForm((prev) => ({ ...prev, isActive: !service.isActive }))
      }
    } catch (err) {
      setError(err.message || 'Failed to update service status')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="admin-page admin-creative-page admin-services-theme">
      <div className="admin-page-hero admin-page-hero-services">
        <div>
          <p className="admin-page-kicker">Service Catalog</p>
          <h1>Manage Services</h1>
          <p className="admin-page-subtitle">Create, update, and control service availability with a cleaner operational dashboard.</p>
        </div>
        <div className="admin-hero-metrics">
          <article className="admin-metric-chip"><span>Total Services</span><strong>{metrics.total}</strong></article>
          <article className="admin-metric-chip"><span>Active</span><strong>{metrics.active}</strong></article>
          <article className="admin-metric-chip"><span>Inactive</span><strong>{metrics.inactive}</strong></article>
          <article className="admin-metric-chip"><span>Avg Price</span><strong>R{metrics.avgPrice}</strong></article>
          <article className="admin-metric-chip"><span>Avg Duration</span><strong>{metrics.avgDuration} min</strong></article>
        </div>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated services-card-accent">
        <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
        <form className="admin-form" onSubmit={editingId ? (e) => e.preventDefault() : handleAddService}>
          <div className="admin-form-row">
            <label htmlFor="service-name">Name</label>
            <input id="service-name" value={form.name} onChange={(e) => updateFormField('name', e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="service-category">Category</label>
            <select id="service-category" value={form.category} onChange={(e) => updateFormField('category', e.target.value)}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="service-price">Price (R)</label>
            <input id="service-price" type="number" min="0" step="1" value={form.price} onChange={(e) => updateFormField('price', e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="service-duration">Duration (HH:MM)</label>
            <input id="service-duration" type="time" step="60" value={form.duration} onChange={(e) => updateFormField('duration', e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label htmlFor="service-availability">Availability</label>
            <select id="service-availability" value={form.availability} onChange={(e) => updateFormField('availability', e.target.value)}>
              {AVAILABILITY_OPTIONS.map((availability) => (
                <option key={availability} value={availability}>{availability}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-row">
            <label htmlFor="service-active">Status</label>
            <select
              id="service-active"
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(e) => updateFormField('isActive', e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="list-item-actions">
            {!editingId ? (
              <button type="submit" className="admin-btn" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Service'}
              </button>
            ) : (
              <>
                <button type="button" className="admin-btn" disabled={submitting} onClick={handleSaveEdit}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="admin-btn admin-btn-soft" disabled={submitting} onClick={resetForm}>
                  Cancel Edit
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card admin-card-glass admin-ui-elevated services-card-accent">
        <div className="bookings-toolbar">
          <div className="booking-filters">
            <div className="admin-form-row">
              <label htmlFor="service-search">Search</label>
              <input
                id="service-search"
                className="admin-search-input"
                type="search"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by service or category"
              />
            </div>
            <div className="admin-form-row">
              <label htmlFor="service-category-filter">Category</label>
              <select id="service-category-filter" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-row">
              <label htmlFor="service-availability-filter">Availability</label>
              <select id="service-availability-filter" value={filters.availability} onChange={(e) => updateFilter('availability', e.target.value)}>
                <option value="">All</option>
                {AVAILABILITY_OPTIONS.map((availability) => (
                  <option key={availability} value={availability}>{availability}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-row">
              <label htmlFor="service-status-filter">Status</label>
              <select id="service-status-filter" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button className="admin-btn admin-btn-soft" type="button" onClick={loadServices}>
            Refresh
          </button>
        </div>

        {error ? <p className="admin-inline-error">{error}</p> : null}
        {loading ? (
          <p className="admin-muted">Loading services...</p>
        ) : (
          <div className="admin-table-wrap booking-table-wrap">
            <table className="admin-table booking-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const isBusy = busyId === service.id
                  return (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.category}</td>
                      <td>R {Number(service.price).toFixed(0)}</td>
                      <td>{formatDurationLabel(service.duration)}</td>
                      <td>{service.availability}</td>
                      <td>
                        <span className={`status-badge ${service.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="booking-actions">
                          <button className="admin-btn admin-btn-secondary" type="button" disabled={isBusy} onClick={() => startEdit(service)}>
                            Edit
                          </button>
                          <button className="admin-btn admin-btn-danger" type="button" disabled={isBusy} onClick={() => handleDeleteService(service.id)}>
                            Delete
                          </button>
                          <button className="admin-btn admin-btn-success" type="button" disabled={isBusy} onClick={() => handleToggleActive(service)}>
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!filteredServices.length ? (
                  <tr>
                    <td colSpan="7" className="booking-empty">No services available for current filters.</td>
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

export default ManageServices
