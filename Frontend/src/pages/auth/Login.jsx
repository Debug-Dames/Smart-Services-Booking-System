import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData);
      const responseData = response?.data || {};
      const userData = responseData.user || responseData.data || responseData;

      if (!userData) {
        throw new Error('Invalid login response.');
      }

      login(userData);
      navigate('/dashboard');
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || 'Login failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={pageStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>Login</h1>

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
          placeholder="Enter your password"
          style={inputStyle}
        />

        {error ? <p style={errorStyle}>{error}</p> : null}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={helperTextStyle}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
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
