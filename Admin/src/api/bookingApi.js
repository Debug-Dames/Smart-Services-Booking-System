const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }
const BOOKINGS_STORAGE_KEY = 'admin_local_bookings'

const safeJson = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

const getLocalBookings = () => {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const setLocalBookings = (bookings) => {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))
}

const upsertLocalBooking = (booking) => {
  const local = getLocalBookings()
  const filtered = local.filter((item) => String(item.id) !== String(booking.id))
  const updated = [booking, ...filtered]
  setLocalBookings(updated)
  return booking
}

export default {
  fetchBookings: async () => {
    const local = getLocalBookings()

    try {
      const res = await fetch(`${API}/bookings`)
      if (res.ok) {
        const remote = await safeJson(res)
        if (Array.isArray(remote) && remote.length > 0) {
          setLocalBookings(remote)
          return remote
        }
      }
    } catch {
      // Fallback to local
    }

    return local
  },

  updateBooking: async (id, data) => {
    const local = getLocalBookings()
    const current = local.find((booking) => String(booking.id) === String(id)) || {}
    const payload = { ...current, ...data, id }

    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = (await safeJson(res)) || payload
        return upsertLocalBooking(updated)
      }
    } catch {
      // Fallback to local
    }

    return upsertLocalBooking(payload)
  },

  deleteBooking: async (id) => {
    let deleted = false

    try {
      const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' })
      deleted = res.ok
    } catch {
      deleted = false
    }

    const local = getLocalBookings()
    const filtered = local.filter((booking) => String(booking.id) !== String(id))
    setLocalBookings(filtered)

    return deleted || filtered.length !== local.length
  },
}
