import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

const ManageStylists = () => {
    const [stylists, setStylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true
        const loadStylists = async () => {
            try {
                const data = await adminApi.fetchStylists()
                if (!mounted) return
                setStylists(Array.isArray(data) ? data : [])
            } catch (err) {
                if (!mounted) return
                setError(err.message || 'Failed to load stylists')
                setStylists([])
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadStylists()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <section className="admin-page">
            <h1>Manage Stylists</h1>
            <div className="admin-card">
                <h3>Stylists</h3>
                {error ? <p className="admin-error">{error}</p> : null}
                {loading ? (
                    <p>Loading stylists...</p>
                ) : (
                    <div className="booking-table-wrap">
                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Specialty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stylists.map((stylist) => (
                                    <tr key={stylist.id}>
                                        <td>{stylist.name || '-'}</td>
                                        <td>{stylist.email || '-'}</td>
                                        <td>{stylist.phone || '-'}</td>
                                        <td>{stylist.specialty || '-'}</td>
                                    </tr>
                                ))}
                                {!stylists.length ? (
                                    <tr>
                                        <td colSpan="4" className="booking-empty">No stylists found.</td>
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

export default ManageStylists
