import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

const ManageUsers = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        adminApi.fetchUsers().then((data) => setUsers(data || [])).catch(console.error)
    }, [])

    return (
        <section className="admin-page">
            <h1>Manage Users</h1>
            <div className="admin-card">
                <ul className="admin-list">
                    {users.map((u) => (
                        <li key={u.id} className="admin-list-item">
                            <span>{u.name}</span>
                            <span>{u.email}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default ManageUsers
