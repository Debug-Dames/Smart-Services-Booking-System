const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }
import { getDemoCollection, isDemoModeEnabled, updateDemoItem } from '../utils/demoData'

const withApiFallback = async (request, fallback) => {
    if (isDemoModeEnabled()) return fallback()
    try {
        return await request()
    } catch {
        return fallback()
    }
}

export default {
    fetchAllBookings: async () => {
        const res = await fetch(`${API}/bookings`)
        return res.ok ? res.json() : []
    },
    fetchBookings: async () => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/bookings`)
                if (!res.ok) throw new Error('bookings fetch failed')
                return res.json()
            },
            () => getDemoCollection('bookings'),
        )
    },
    updateBooking: async (id, data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/bookings/${id}`, {
                    method: 'PUT',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('booking update failed')
                return res.json()
            },
            () => updateDemoItem('bookings', id, data),
        )
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
