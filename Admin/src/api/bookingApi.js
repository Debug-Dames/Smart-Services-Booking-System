const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }

export default {
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
}
