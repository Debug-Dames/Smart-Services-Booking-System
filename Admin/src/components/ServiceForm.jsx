import React, { useState, useEffect } from 'react'

const ServiceForm = ({ initial = {}, onSubmit = () => { } }) => {
    const [form, setForm] = useState({ name: '', price: '', ...initial })

    useEffect(() => {
        setForm((f) => ({ ...f, ...initial }))
    }, [initial])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-row">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="admin-form-row">
                <label>Price</label>
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <button type="submit" className="admin-btn">Save</button>
        </form>
    )
}

export default ServiceForm
