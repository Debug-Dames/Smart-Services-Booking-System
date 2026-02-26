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
        <div style={{ padding: 16 }}>
            <h1>Manage Services</h1>
            <ServiceForm onSubmit={addService} />
            <ul>
                {services.map((s) => (
                    <li key={s.id}>{s.name} — {s.price}</li>
                ))}
            </ul>
        </div>
    )
}

export default ManageServices
