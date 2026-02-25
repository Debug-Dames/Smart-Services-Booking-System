const API = import.meta.env.VITE_API_URL || ''
const jsonHeaders = { 'Content-Type': 'application/json' }

export default {
    createPayment: async (payment) => {
        const res = await fetch(`${API}/payments`, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(payment),
        })
        return res.json()
    },
}
