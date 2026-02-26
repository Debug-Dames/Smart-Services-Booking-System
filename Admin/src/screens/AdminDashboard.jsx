import React from 'react'
import AdminSidebar from '../components/AdminSidebar'

const AdminDashboard = () => (
    <div className="admin-layout">
        <AdminSidebar />
        <main style={{ padding: 16 }}>
            <h1>Admin Dashboard</h1>
            <p>Overview and stats will be shown here.</p>
        </main>
    </div>
)

export default AdminDashboard
