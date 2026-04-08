import API from './apiBaseUrl'

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
        const adminRes = await fetch(`${API}/admin/bookings`, {
            headers: getAuthHeaders(),
        })
        if (adminRes.ok) return parseJson(adminRes, 'Failed to fetch bookings')
        if (adminRes.status !== 404) return parseJson(adminRes, 'Failed to fetch bookings')

        const res = await fetch(`${API}/bookings`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch bookings')
    },
    fetchBookings: async () => {
        const adminRes = await fetch(`${API}/admin/bookings`, {
            headers: getAuthHeaders(),
        })
        if (adminRes.ok) return parseJson(adminRes, 'Failed to fetch bookings')
        if (adminRes.status !== 404) return parseJson(adminRes, 'Failed to fetch bookings')

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
