import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/book', label: 'Book Now' },
    { path: '/my-bookings', label: 'My Bookings' },
  ]

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-dame">Dame's</span>
          <span className="logo-salon">Salon</span>
        </Link>

        <nav className={`navbar-nav ${menuOpen ? 'navbar-nav--open' : ''}`}>
          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'navbar-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="navbar-auth-mobile">
            <Link to="/login" className="navbar-btn navbar-btn--ghost" onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
            <Link to="/register" className="navbar-btn navbar-btn--primary" onClick={() => setMenuOpen(false)}>
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-btn navbar-btn--ghost">
            Log In
          </Link>
          <Link to="/register" className="navbar-btn navbar-btn--primary">
            Sign Up
          </Link>
        </div>

        <button
          className={`navbar-hamburger ${menuOpen ? 'navbar-hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
