import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('adminAuth')
        localStorage.removeItem('adminUser')
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
    }

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-title">Smart Services</div>
            <nav>
                <ul>
                    <li>
                        <NavLink to="." end className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="bookings" className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}>
                            Bookings
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="users" className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}>
                            Users
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="services" className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}>
                            Services
                        </NavLink>
                    </li>
                    <li>
                        <button type="button" className="admin-nav-link" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default AdminSidebar
