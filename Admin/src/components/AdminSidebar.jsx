import React from 'react'
import { Link } from 'react-router-dom'

const AdminSidebar = () => (
    <aside className="admin-sidebar">
        <nav>
            <ul>
                <li><Link to="/admin">Dashboard</Link></li>
                <li><Link to="/admin/bookings">Bookings</Link></li>
                <li><Link to="/admin/users">Users</Link></li>
                <li><Link to="/admin/services">Services</Link></li>
            </ul>
        </nav>
    </aside>
)

export default AdminSidebar
