const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const clearAdminSession = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
}

const handleUnauthorized = (res) => {
    if (res.status !== 401) return
    clearAdminSession()
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
    }
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

const parseJson = async (res, fallbackMessage) => {
    const data = await res.json().catch(() => null)
    handleUnauthorized(res)
    if (!res.ok) {
        throw new Error(data?.message || fallbackMessage)
    }
    return data
}

export default {
    fetchAllBookings: async () => {
        const res = await fetch(`${API}/bookings`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch bookings')
    },
    fetchBookings: async () => {
        const res = await fetch(`${API}/bookings`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch bookings')
    },
    updateBooking: async (id, data) => {
        const res = await fetch(`${API}/bookings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to update booking')
    },
    updateBookingStatus: async (id, status) => {
        const res = await fetch(`${API}/bookings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        })
        return parseJson(res, 'Failed to update booking status')
    },
    cancelBooking: async (id) => {
        const res = await fetch(`${API}/bookings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: 'Cancelled' }),
        })
        return parseJson(res, 'Failed to cancel booking')
    },
}
