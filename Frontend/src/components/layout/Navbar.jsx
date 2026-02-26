import { Link } from 'react-router-dom';

export default function Navbar() {
  const logo = '/logo.png';

  return (
    <nav style={navStyle}>
      <div style={logoContainer}>
        <img src={logo} alt="Dames Salon Logo" style={logoStyle} />
        <h2 style={brandName}>Dames Beauty Salon</h2>
      </div>

      <div style={linksContainer}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/services" style={linkStyle}>
          Services
        </Link>
        <Link to="/login" style={linkStyle}>
          Login
        </Link>
        <Link to="/register" style={linkStyle}>
          Register
        </Link>
      </div>
    </nav>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 28px',
  backgroundColor: '#22274C',
  color: '#FFFFFF',
  borderBottom: '2px solid #1952A6',
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
};

const logoStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '1px solid #D4CACE',
  backgroundColor: '#FFFFFF',
};

const brandName = {
  marginLeft: '10px',
  color: '#FFFFFF',
  fontSize: '1.1rem',
  fontFamily: "'Playfair Display', 'Times New Roman', serif",
  fontWeight: '700',
  letterSpacing: '0.02em',
};

const linksContainer = {
  display: 'flex',
  gap: '20px',
};

const linkStyle = {
  color: '#BDC2DB',
  textDecoration: 'none',
  fontWeight: '600',
};
