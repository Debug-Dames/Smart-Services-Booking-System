import React from 'react'

const AdminDashboard = () => (
    <section className="admin-page">
        <div className="admin-page-header">
            <h1>Dashboard Overview</h1>
            <p>Performance snapshot for bookings, services, and revenue.</p>
        </div>

        <div className="stats-grid">
            <article className="admin-card stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">148</p>
            </article>
            <article className="admin-card stat-card">
                <h3>Monthly Revenue</h3>
                <p className="stat-number">R 42,900</p>
            </article>
            <article className="admin-card stat-card">
                <h3>Active Services</h3>
                <p className="stat-number">23</p>
            </article>
        </div>
    </section>
)

export default AdminDashboard
