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
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: 'PUT',
            headers: jsonHeaders,
            body: JSON.stringify(data),
        })
        return res.json()
    },
    deleteService: async (id) => {
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: 'DELETE',
        })
        return res.ok
    },
}
