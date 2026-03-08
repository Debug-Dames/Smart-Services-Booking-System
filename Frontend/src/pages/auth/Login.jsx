import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../Styles/auth.css';

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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   if (!formData.email || !formData.password) {
  //     setError('Please enter both email and password.');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const response = await authService.login(formData);
  //     const responseData = response?.data || {};
  //     const userData = responseData.user || responseData.data || responseData;

  //     if (!userData) {
  //       throw new Error('Invalid login response.');
  //     }

  //     login(userData);
  //     navigate('/dashboard');
  //   } catch (err) {
  //     const apiMessage = err?.response?.data?.message;
  //     setError(apiMessage || 'Login failed. Please check your details and try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      // Fake login success (skip API call for now)
      const userData = {
        id: 1,
        email: formData.email,
        name: "Test User"
      };

      login(userData);   // update AuthContext
      navigate('/book'); // redirect
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-art-panel">
          <div className="auth-art-overlay" />
          <div className="auth-art-content">
            <p className="auth-kicker">Welcome Back</p>
            <h2>Own your beauty routine</h2>
            <p>Sign in to book appointments and manage your salon schedule.</p>
          </div>
        </aside>

        <form className="auth-form-panel" onSubmit={handleSubmit}>
          <h1>Login</h1>

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign in'}
          </button>

          <div className="auth-separator">
            <span>or</span>
          </div>

          <button type="button" className="auth-secondary-btn">
            Continue with Google
          </button>
          <button type="button" className="auth-secondary-btn auth-secondary-btn--dark">
            Continue with Apple
          </button>

          <p className="auth-helper-text">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
