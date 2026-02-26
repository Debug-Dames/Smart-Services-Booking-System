import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'
import ServiceForm from '../components/ServiceForm'

const ManageServices = () => {
    const [services, setServices] = useState([])

    useEffect(() => {
        adminApi.fetchServices().then((data) => setServices(data || [])).catch(console.error)
    }, [])

    const addService = async (svc) => {
        await adminApi.createService(svc)
        const updated = await adminApi.fetchServices()
        setServices(updated || [])
    }

    return (
        <section className="admin-page">
            <h1>Manage Services</h1>
            <div className="admin-card">
                <ServiceForm onSubmit={addService} />
            </div>
            <div className="admin-card">
                <h3>Service List</h3>
                <ul className="admin-list">
                    {services.map((s) => (
                        <li key={s.id} className="admin-list-item">
                            <span>{s.name}</span>
                            <strong>R {s.price}</strong>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default ManageServices
