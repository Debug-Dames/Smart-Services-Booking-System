import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

const ManageUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true
        const loadUsers = async () => {
            try {
                const data = await adminApi.fetchUsers()
                if (!mounted) return
                setUsers(Array.isArray(data) ? data : [])
            } catch (err) {
                if (!mounted) return
                setError(err.message || 'Failed to load users')
                setUsers([])
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadUsers()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <section className="admin-page">
            <h1>Manage Users</h1>
            <div className="admin-card">
                <h3>Users</h3>
                {error ? <p className="admin-error">{error}</p> : null}
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="booking-table-wrap">
                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name || '-'}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>{user.role || 'customer'}</td>
                                    </tr>
                                ))}
                                {!users.length ? (
                                    <tr>
                                        <td colSpan="4" className="booking-empty">No users found.</td>
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

export default ManageUsers
