import React, { useEffect, useState } from 'react'
import adminApi from '../api/adminApi'

const ManageUsers = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        adminApi.fetchUsers().then((data) => setUsers(data || [])).catch(console.error)
    }, [])

    return (
        <div style={{ padding: 16 }}>
            <h1>Manage Users</h1>
            <ul>
                {users.map((u) => (
                    <li key={u.id}>{u.name} ({u.email})</li>
                ))}
            </ul>
        </div>
    )
}

export default ManageUsers
