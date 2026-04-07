const API = import.meta.env.VITE_API_URL || 'https://smart-services-booking-system-backend-uzip.onrender.com/api'

const clearAdminSession = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
}

const handleUnauthorized = (res) => {
    if (res.status !== 401) return
    clearAdminSession()
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
    }
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

const parseJson = async (res, fallbackMessage) => {
    const data = await res.json().catch(() => null)
    handleUnauthorized(res)
    if (!res.ok) {
        throw new Error(data?.message || fallbackMessage)
    }
    return data
}

export default {
    fetchUsers: async () => {
        const res = await fetch(`${API}/admin/users`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch users')
    },
    createUser: async (data) => {
        const res = await fetch(`${API}/admin/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to create user')
    },
    updateUser: async (id, data) => {
        const res = await fetch(`${API}/admin/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to update user')
    },
    deleteUser: async (id) => {
        const res = await fetch(`${API}/admin/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.message || 'Failed to delete user')
        }
        return true
    },
    fetchStylists: async () => {
        const res = await fetch(`${API}/admin/stylists`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch stylists')
    },
    createStylist: async (data) => {
        const res = await fetch(`${API}/admin/stylists`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to create stylist')
    },
    updateStylist: async (id, data) => {
        const res = await fetch(`${API}/admin/stylists/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to update stylist')
    },
    deleteStylist: async (id) => {
        const res = await fetch(`${API}/admin/stylists/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.message || 'Failed to delete stylist')
        }
        return true
    },
    fetchServices: async () => {
        const res = await fetch(`${API}/admin/services`, {
            headers: getAuthHeaders(),
        })
        return parseJson(res, 'Failed to fetch services')
    },
    createService: async (data) => {
        const res = await fetch(`${API}/admin/services`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to create service')
    },
    updateService: async (id, data) => {
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })
        return parseJson(res, 'Failed to update service')
    },
    deleteService: async (id) => {
        const res = await fetch(`${API}/admin/services/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })
        if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.message || 'Failed to delete service')
        }
        return true
    },
}
