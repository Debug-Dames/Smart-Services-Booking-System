import React from 'react'

const statusClassMap = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
}

const StatusBadge = ({ status = 'Pending' }) => {
    const normalized = String(status).toLowerCase()
    const badgeClass = statusClassMap[normalized] || 'status-pending'

    return <span className={`status-badge ${badgeClass}`}>{status}</span>
}

export default StatusBadge
