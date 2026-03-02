const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }

export default {
    fetchAllBookings: async () => {
        const res = await fetch(`${API}/bookings`)
        return res.ok ? res.json() : []
    },
    fetchBookings: async () => {
        const res = await fetch(`${API}/bookings`)
        return res.ok ? res.json() : []
    },
    updateBooking: async (id, data) => {
        const res = await fetch(`${API}/bookings/${id}`, {
            method: 'PUT',
            headers: jsonHeaders,
            body: JSON.stringify(data),
        })
        return res.json()
    },
    updateBookingStatus: async (id, status) => {
        const res = await fetch(`${API}/bookings/${id}/status`, {
            method: 'PATCH',
            headers: jsonHeaders,
            body: JSON.stringify({ status }),
        })
        return res.json()
    },
    cancelBooking: async (id) => {
        const res = await fetch(`${API}/bookings/${id}/cancel`, {
            method: 'PATCH',
            headers: jsonHeaders,
        })
        return res.json()
    },
}
