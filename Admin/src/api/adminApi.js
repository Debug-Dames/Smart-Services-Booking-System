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
  name: String(data.name || '').trim() || 'Unnamed',
  email: String(data.email || '').trim(),
  password: data.password || '',
  role: String(data.role || 'user').toLowerCase(),
  status: data.status || 'Active',
  specialty: String(data.specialty || '').trim(),
  availability: data.availability || 'Available',
  workingHours: data.workingHours || '09:00 - 17:00',
  services: Array.isArray(data.services)
    ? data.services
    : typeof data.services === 'string'
      ? data.services.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
  createdAt: data.createdAt || new Date().toISOString(),
})

const upsertLocalUser = (user) => {
  const local = getLocalUsers()
  const filtered = local.filter((item) => String(item.id) !== String(user.id))
  const updated = [user, ...filtered]
  setLocalUsers(updated)
  return user
}

const removeLocalUser = (id) => {
  const local = getLocalUsers()
  const filtered = local.filter((item) => String(item.id) !== String(id))
  setLocalUsers(filtered)
  return filtered.length !== local.length
}

const fetchRemoteUsers = async () => {
  const res = await fetch(`${API}/admin/users`)
  if (!res.ok) return null
  const data = await safeJson(res)
  return Array.isArray(data) ? data : []
}

const mergeUsers = (remoteUsers, localUsers) => {
  const byId = new Map()

  ;(remoteUsers || []).forEach((user) => {
    const normalized = normalizeUser(user)
    byId.set(String(normalized.id), normalized)
  })

  ;(localUsers || []).forEach((user) => {
    const normalized = normalizeUser(user)
    byId.set(String(normalized.id), normalized)
  })

  // Secondary de-dupe by email while preserving latest entry order.
  const seenEmails = new Set()
  const merged = []
  byId.forEach((user) => {
    const emailKey = String(user.email || '').toLowerCase()
    if (emailKey && seenEmails.has(emailKey)) return
    if (emailKey) seenEmails.add(emailKey)
    merged.push(user)
  })

  return merged
}

const adminApi = {
  fetchUsers: async () => {
    const local = getLocalUsers()
    try {
      const remote = await fetchRemoteUsers()
      if (remote) {
        const merged = mergeUsers(remote, local)
        setLocalUsers(merged)
        return merged
      }
      return local
    } catch {
      return local
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
        return upsertLocalUser(normalizeUser(created))
      }
    } catch {
      // fallback to local write below
    }
    return upsertLocalUser(payload)
  },

  updateUser: async (id, data) => {
    const local = getLocalUsers()
    const current = local.find((item) => String(item.id) === String(id)) || {}
    const payload = normalizeUser({ ...current, ...data, id })
    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = (await safeJson(res)) || payload
        return upsertLocalUser(normalizeUser(updated))
      }
    } catch {
      // fallback to local write below
    }
    return upsertLocalUser(payload)
  },

  deleteUser: async (id) => {
    let remoteDeleted = false
    try {
      const res = await fetch(`${API}/admin/users/${id}`, { method: 'DELETE' })
      remoteDeleted = res.ok
    } catch {
      remoteDeleted = false
    }
    const localDeleted = removeLocalUser(id)
    return remoteDeleted || localDeleted
  },

  fetchStylists: async () => {
    const users = await adminApi.fetchUsers()
    return users.filter((user) => String(user.role || '').toLowerCase() === 'stylist')
  },

  createStylist: async (data) =>
    adminApi.createUser({
      ...data,
      role: 'stylist',
      status: data.status || data.availability || 'Available',
      availability: data.availability || 'Available',
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
