const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }

export default {
    fetchUsers: async () => {
        const res = await fetch(`${API}/admin/users`)
        return res.ok ? res.json() : []
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
