import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import AdminSidebar from './components/AdminSidebar'
import AdminDashboard from './screens/AdminDashboard'
import Login from './screens/Login'
import ManageBookings from './screens/ManageBookings'
import ManageServices from './screens/ManageServices'
import ManageUsers from './screens/ManageUsers'
import './styles/admin.css'

const isAdminAuthenticated = () => {
  return localStorage.getItem('adminAuth') === 'true'
}

const RequireAdmin = ({ children }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/login" replace />
}

const RequireGuest = ({ children }) => {
  return isAdminAuthenticated() ? <Navigate to="/admin" replace /> : children
}

const AdminLayout = () => (
  <div className="admin-layout">
    <AdminSidebar />
    <div className="admin-main-area">
      <header className="admin-topbar">
        <h2>Admin Dashboard</h2>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  </div>
)

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  {
    path: '/login',
    element: (
      <RequireGuest>
        <Login />
      </RequireGuest>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'bookings', element: <ManageBookings /> },
      { path: 'users', element: <ManageUsers /> },
      { path: 'services', element: <ManageServices /> },
      { path: 'service', element: <Navigate to="/admin/services" replace /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
])

export default router
