import React, { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext(null)

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null)

    useEffect(() => {
        try {
            const saved = localStorage.getItem('admin')
            if (saved) setAdmin(JSON.parse(saved))
        } catch (e) {
            // ignore
        }
    }, [])

    useEffect(() => {
        try {
            if (admin) localStorage.setItem('admin', JSON.stringify(admin))
            else localStorage.removeItem('admin')
        } catch (e) { }
    }, [admin])

    const login = (payload) => setAdmin(payload)
    const logout = () => setAdmin(null)

    return (
        <AdminContext.Provider value={{ admin, login, logout }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdmin = () => useContext(AdminContext)
export default AdminContext
