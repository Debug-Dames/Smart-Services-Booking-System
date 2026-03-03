const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }

export default {
    fetchUsers: async () => {
        const res = await fetch(`${API}/admin/users`)
        return res.ok ? res.json() : []
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
