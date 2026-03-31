const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }
import {
    addDemoItem,
    deleteDemoItem,
    getDemoCollection,
    isDemoModeEnabled,
    updateDemoItem,
} from '../utils/demoData'

const withApiFallback = async (request, fallback) => {
    if (isDemoModeEnabled()) return fallback()
    try {
        return await request()
    } catch {
        return fallback()
    }
}

const adminApi = {
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

export default {
    fetchUsers: async () => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/users`)
                if (!res.ok) throw new Error('users fetch failed')
                return res.json()
            },
            () => getDemoCollection('users'),
        )
    },
    createUser: async (data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/users`, {
                    method: 'POST',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('user create failed')
                return res.json()
            },
            () => addDemoItem('users', { ...data, role: data.role || 'customer', isBlocked: false }),
        )
    },
    deleteUser: async (id) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/users/${id}`, {
                    method: 'DELETE',
                })
                if (!res.ok) throw new Error('user delete failed')
                return true
            },
            () => deleteDemoItem('users', id),
        )
    },
    updateUser: async (id, data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/users/${id}`, {
                    method: 'PUT',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('user update failed')
                return res.json()
            },
            () => updateDemoItem('users', id, data),
        )
    },
    fetchStylists: async () => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/stylists`)
                if (!res.ok) throw new Error('stylists fetch failed')
                return res.json()
            },
            () => getDemoCollection('stylists'),
        )
    },
    createStylist: async (data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/stylists`, {
                    method: 'POST',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('stylist create failed')
                return res.json()
            },
            () => addDemoItem('stylists', { ...data, isActive: true }),
        )
    },
    updateStylist: async (id, data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/stylists/${id}`, {
                    method: 'PUT',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('stylist update failed')
                return res.json()
            },
            () => updateDemoItem('stylists', id, data),
        )
    },
    deleteStylist: async (id) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/stylists/${id}`, {
                    method: 'DELETE',
                })
                if (!res.ok) throw new Error('stylist delete failed')
                return true
            },
            () => deleteDemoItem('stylists', id),
        )
    },
    createUser: async (data) => {
        const res = await fetch(`${API}/admin/users`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(data),
        })
        return res.json()
    },
    deleteUser: async (id) => {
        const res = await fetch(`${API}/admin/users/${id}`, {
            method: 'DELETE',
        })
        return res.ok
    },
    fetchStylists: async () => {
        const users = await fetch(`${API}/admin/users`)
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => [])
        return (users || []).filter((user) => user.role === 'stylist')
    },
    createStylist: async (data) => {
        const payload = { ...data, role: 'stylist' }
        const res = await fetch(`${API}/admin/users`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        })
        return res.json()
    },
    deleteStylist: async (id) => {
        const res = await fetch(`${API}/admin/users/${id}`, {
            method: 'DELETE',
        })
        return res.ok
    },
    fetchServices: async () => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/services`)
                if (!res.ok) throw new Error('services fetch failed')
                return res.json()
            },
            () => getDemoCollection('services'),
        )
    },
    createService: async (data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/services`, {
                    method: 'POST',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('service create failed')
                return res.json()
            },
            () => addDemoItem('services', data),
        )
    },
    updateService: async (id, data) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/services/${id}`, {
                    method: 'PUT',
                    headers: jsonHeaders,
                    body: JSON.stringify(data),
                })
                if (!res.ok) throw new Error('service update failed')
                return res.json()
            },
            () => updateDemoItem('services', id, data),
        )
    },
    deleteService: async (id) => {
        return withApiFallback(
            async () => {
                const res = await fetch(`${API}/admin/services/${id}`, {
                    method: 'DELETE',
                })
                if (!res.ok) throw new Error('service delete failed')
                return true
            },
            () => deleteDemoItem('services', id),
        )
    },
}
