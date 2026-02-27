import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      const response = await authService.register(payload);
      const responseData = response?.data || {};
      const userData = responseData.user || responseData.data || null;

      if (userData) {
        login(userData);
        navigate('/dashboard');
        return;
      }

      navigate('/login');
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={pageStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>Create Account</h1>

        <label htmlFor="fullName" style={labelStyle}>
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          style={inputStyle}
        />

        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          style={inputStyle}
        />

        <label htmlFor="password" style={labelStyle}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          style={inputStyle}
        />

        <label htmlFor="confirmPassword" style={labelStyle}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          style={inputStyle}
        />

        {error ? <p style={errorStyle}>{error}</p> : null}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p style={helperTextStyle}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

const pageStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '70vh',
  padding: '1rem',
};

const formStyle = {
  width: '100%',
  maxWidth: '420px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  padding: '1.5rem',
  borderRadius: '12px',
  backgroundColor: '#F7F8FD',
  boxShadow: '0 6px 18px rgba(34, 39, 76, 0.12)',
};

const titleStyle = {
  margin: '0 0 0.2rem',
  color: '#22274C',
};

const labelStyle = {
  fontWeight: '600',
  color: '#22274C',
};

const inputStyle = {
  padding: '0.7rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid #D4CACE',
  outline: 'none',
};

const buttonStyle = {
  marginTop: '0.5rem',
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#22274C',
  color: '#FFFFFF',
  fontWeight: '700',
  cursor: 'pointer',
};

const errorStyle = {
  margin: '0.2rem 0',
  color: '#B42318',
  fontSize: '0.9rem',
};

const helperTextStyle = {
  margin: '0.5rem 0 0',
  color: '#4A4A4A',
  fontSize: '0.95rem',
};
