import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import AdminSidebar from './components/AdminSidebar'
import Login from './screens/Login'
import AdminDashboard from './screens/AdminDashboard'
import ManageBookings from './screens/ManageBookings'
import ManageServices from './screens/ManageServices'
import ManageStylists from './screens/ManageStylists'
import ManageUsers from './screens/ManageUsers'
import './styles/admin.css'

const isAdminAuthenticated = () => {
  const isAuthed = localStorage.getItem('adminAuth') === 'true'
  const token = localStorage.getItem('adminToken')
  return isAuthed && Boolean(token)
}

const RequireAdmin = ({ children }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/login" replace />
}

const RequireGuest = ({ children }) => {
  return isAdminAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : children
}

const AdminLayout = () => (
  <div className="admin-layout">
    <AdminSidebar />
    <div className="admin-main-area">
      <header className="admin-topbar" />
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
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'bookings', element: <ManageBookings /> },
      { path: 'users', element: <ManageUsers /> },
      { path: 'stylists', element: <ManageStylists /> },
      { path: 'services', element: <ManageServices /> },
      { path: 'service', element: <Navigate to="/admin/services" replace /> },
      { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
    ],
  },
])

export default router
