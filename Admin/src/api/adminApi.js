const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }
const USERS_STORAGE_KEY = 'admin_local_users'

const safeJson = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const setLocalUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const normalizeUser = (data) => ({
  id: data.id ?? data._id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: data.name?.trim() || 'Unnamed',
  email: data.email?.trim() || '',
  password: data.password || '',
  role: (data.role || 'user').toLowerCase(),
  status: data.status || 'Active',
  specialty: data.specialty?.trim() || '',
  availability: data.availability || 'Available',
  workingHours: data.workingHours || '09:00 - 17:00',
  services: Array.isArray(data.services)
    ? data.services
    : typeof data.services === 'string'
      ? data.services.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
  rating: typeof data.rating === 'number' ? data.rating : 0,
  bookingCount:
    typeof data.bookingCount === 'number'
      ? data.bookingCount
      : typeof data.totalBookings === 'number'
        ? data.totalBookings
        : 0,
  createdAt: data.createdAt || new Date().toISOString(),
})

const fetchUsersRemote = async () => {
  const res = await fetch(`${API}/admin/users`)
  if (!res.ok) return null
  const data = await safeJson(res)
  return Array.isArray(data) ? data : []
}

const upsertLocalUser = (user) => {
  const local = getLocalUsers()
  const filtered = local.filter((item) => String(item.id) !== String(user.id))
  const updated = [user, ...filtered]
  setLocalUsers(updated)
  return user
}

const adminApi = {
  fetchUsers: async () => {
    const localUsers = getLocalUsers()

    try {
      const remoteUsers = await fetchUsersRemote()
      if (remoteUsers && remoteUsers.length > 0) {
        setLocalUsers(remoteUsers)
        return remoteUsers
      }
      return localUsers
    } catch {
      return localUsers
    }
  },

  createUser: async (data) => {
    const payload = normalizeUser(data)
    try {
      const res = await fetch(`${API}/admin/users`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const created = (await safeJson(res)) || payload
        return upsertLocalUser(created)
      }
    } catch {
      // Fallback to local.
    }

    return upsertLocalUser(payload)
  },

  updateUser: async (id, data) => {
    const local = getLocalUsers()
    const current = local.find((user) => String(user.id) === String(id)) || {}
    const payload = normalizeUser({ ...current, ...data, id })

    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = (await safeJson(res)) || payload
        return upsertLocalUser(updated)
      }
    } catch {
      // Fallback to local.
    }

    return upsertLocalUser(payload)
  },

  deleteUser: async (id) => {
    let deleted = false

    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: 'DELETE',
      })
      deleted = res.ok
    } catch {
      deleted = false
    }

    const local = getLocalUsers()
    const filtered = local.filter((user) => String(user.id) !== String(id))
    setLocalUsers(filtered)

    return deleted || filtered.length !== local.length
  },

  fetchStylists: async () => {
    const users = await adminApi.fetchUsers()
    return users.filter((user) => String(user.role || '').toLowerCase() === 'stylist')
  },

  createStylist: async (data) =>
    adminApi.createUser({
      ...data,
      role: 'stylist',
      availability: data.availability || 'Available',
      status: data.status || 'Available',
    }),

  updateStylist: async (id, data) =>
    adminApi.updateUser(id, {
      ...data,
      role: 'stylist',
    }),

  deleteStylist: async (id) => adminApi.deleteUser(id),

  fetchServices: async () => {
    const res = await fetch(`${API}/admin/services`)
    return res.ok ? res.json() : []
  },

  createService: async (data) => {
    const res = await fetch(`${API}/admin/services`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    return res.json()
  },
}

export default adminApi
