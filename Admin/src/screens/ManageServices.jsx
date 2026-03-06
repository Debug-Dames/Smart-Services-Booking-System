import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

const USE_MOCK_SERVICES = (import.meta.env.VITE_USE_MOCK_SERVICES ?? 'true').toLowerCase() === 'true'
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
const MOCK_SERVICES = [
    { id: 1, name: 'Haircut', category: 'Hair', price: 150, duration: 45, availability: 'Available', isActive: true },
    { id: 2, name: 'Beard Trim', category: 'Grooming', price: 90, duration: 30, availability: 'Available', isActive: true },
    { id: 3, name: 'Gel Nails', category: 'Nails', price: 280, duration: 60, availability: 'Limited', isActive: true },
    { id: 4, name: 'Deep Tissue Massage', category: 'Spa', price: 450, duration: 90, availability: 'Unavailable', isActive: false },
]

const normalizeService = (service) => ({
    id: service.id,
    name: service.name || '',
    category: service.category || 'Hair',
    price: Number(service.price) || 0,
    duration: toMinutes(service.duration),
    availability: service.availability || 'Available',
    isActive: service.isActive !== false,
})

const ManageServices = () => {
    const [services, setServices] = useState([])
    const [form, setForm] = useState(EMPTY_FORM)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadServices = async () => {
        setLoading(true)
        setError('')
        try {
            if (USE_MOCK_SERVICES) {
                setServices(MOCK_SERVICES.map(normalizeService))
                return
            }
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

    const updateFormField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

    const resetForm = () => {
        setForm(EMPTY_FORM)
        setEditingId(null)
    }

    const handleAddService = async (e) => {
        e.preventDefault()

        const payload = {
            name: form.name.trim(),
            category: form.category,
            price: Number(form.price),
            duration: toMinutes(form.duration),
            availability: form.availability,
            isActive: Boolean(form.isActive),
        }

        if (!payload.name || payload.price < 0 || payload.duration <= 0) {
            setError('Please enter a valid service name, price, and duration.')
            return
        }

        setError('')

        if (USE_MOCK_SERVICES) {
            setServices((prev) => [...prev, { ...payload, id: Date.now() }])
            resetForm()
            return
        }

        await adminApi.createService(payload)
        await loadServices()
        resetForm()
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
        const payload = {
            name: form.name.trim(),
            category: form.category,
            price: Number(form.price),
            duration: toMinutes(form.duration),
            availability: form.availability,
            isActive: Boolean(form.isActive),
        }

        if (!payload.name || payload.price < 0 || payload.duration <= 0) {
            setError('Please enter a valid service name, price, and duration.')
            return
        }

        setError('')

        if (USE_MOCK_SERVICES) {
            setServices((prev) => prev.map((service) => (service.id === editingId ? { ...service, ...payload } : service)))
            resetForm()
            return
        }

        await adminApi.updateService(editingId, payload)
        await loadServices()
        resetForm()
    }

    const handleDeleteService = async (id) => {
        setError('')
        if (USE_MOCK_SERVICES) {
            setServices((prev) => prev.filter((service) => service.id !== id))
            if (editingId === id) resetForm()
            return
        }

        await adminApi.deleteService(id)
        await loadServices()
    }

    const handleToggleActive = async (service) => {
        const updated = { ...service, isActive: !service.isActive }
        setError('')

        if (USE_MOCK_SERVICES) {
            setServices((prev) => prev.map((item) => (item.id === service.id ? updated : item)))
            if (editingId === service.id) {
                setForm((prev) => ({ ...prev, isActive: updated.isActive }))
            }
            return
        }

        await adminApi.updateService(service.id, updated)
        await loadServices()
    }

    return (
        <section className="admin-page">
            <h1>Manage Services</h1>
            <div className="admin-card">
                <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
                <form className="admin-form service-form" onSubmit={editingId ? (e) => e.preventDefault() : handleAddService}>
                    <div className="admin-form-row">
                        <label htmlFor="service-name">Name</label>
                        <input
                            id="service-name"
                            value={form.name}
                            onChange={(e) => updateFormField('name', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="service-category">Category</label>
                        <select
                            id="service-category"
                            value={form.category}
                            onChange={(e) => updateFormField('category', e.target.value)}
                        >
                            {CATEGORY_OPTIONS.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="service-price">Price (R)</label>
                        <input
                            id="service-price"
                            type="number"
                            min="0"
                            step="1"
                            value={form.price}
                            onChange={(e) => updateFormField('price', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="service-duration">Duration (HH:MM)</label>
                        <input
                            id="service-duration"
                            type="time"
                            step="60"
                            value={form.duration}
                            onChange={(e) => updateFormField('duration', e.target.value)}
                        />
                    </div>
                    <div className="admin-form-row">
                        <label htmlFor="service-availability">Availability</label>
                        <select
                            id="service-availability"
                            value={form.availability}
                            onChange={(e) => updateFormField('availability', e.target.value)}
                        >
                            {AVAILABILITY_OPTIONS.map((availability) => (
                                <option key={availability} value={availability}>
                                    {availability}
                                </option>
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
                    <div className="service-form-actions">
                        {!editingId ? (
                            <button type="submit" className="admin-btn">Add Service</button>
                        ) : (
                            <>
                                <button type="button" className="admin-btn" onClick={handleSaveEdit}>Save Changes</button>
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            </>
                        )}
                    </div>
                </form>
                {error ? <p className="admin-error">{error}</p> : null}
            </div>
            <div className="admin-card">
                <h3>Service List</h3>
                {loading ? (
                    <p>Loading services...</p>
                ) : (
                    <div className="booking-table-wrap">
                        <table className="booking-table">
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
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td>{service.name}</td>
                                        <td>{service.category}</td>
                                        <td>R {Number(service.price).toFixed(0)}</td>
                                        <td>{formatDurationLabel(service.duration)}</td>
                                        <td>{service.availability}</td>
                                        <td>{service.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <div className="booking-actions">
                                                <button className="admin-btn admin-btn-secondary" onClick={() => startEdit(service)}>
                                                    Edit
                                                </button>
                                                <button className="admin-btn admin-btn-danger" onClick={() => handleDeleteService(service.id)}>
                                                    Delete
                                                </button>
                                                <button className="admin-btn admin-btn-success" onClick={() => handleToggleActive(service)}>
                                                    {service.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!services.length ? (
                                    <tr>
                                        <td colSpan="7" className="booking-empty">No services available.</td>
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
