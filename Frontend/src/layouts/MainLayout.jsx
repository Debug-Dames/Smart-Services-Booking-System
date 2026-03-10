import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Chatbot from '../components/common/Chatbot'

function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content" style={{ paddingTop: '72px' }}>
        <Outlet />
      </main>
      <Chatbot />
      <Footer />
    </div>
  )
}

export default MainLayout
