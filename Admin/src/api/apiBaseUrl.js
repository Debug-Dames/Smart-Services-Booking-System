const DEFAULT_API_URL = 'https://smart-services-booking-system-backend-uzip.onrender.com/api'

const sanitizeBaseUrl = (value) => {
    if (!value || typeof value !== 'string') return DEFAULT_API_URL
    return value.endsWith('/') ? value.slice(0, -1) : value
}

const API = sanitizeBaseUrl(import.meta.env.VITE_API_URL)

export default API
