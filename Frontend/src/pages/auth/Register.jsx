import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import '../../Styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
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
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const payload = {
        name: fullName,
        fullName,
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
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-art-panel">
          <div className="auth-art-overlay" />
          <div className="auth-art-content">
            <p className="auth-kicker">Create Your Account</p>
            <h2>Start your beauty journey</h2>
            <p>Join now to book services, track appointments, and save time.</p>
          </div>
        </aside>

        <form className="auth-form-panel auth-form-panel--register" onSubmit={handleSubmit}>
          <h1>Sign Up</h1>

          <label htmlFor="firstName" className="auth-visually-hidden">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
          />

          <label htmlFor="lastName" className="auth-visually-hidden">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
          />

          <label htmlFor="email" className="auth-visually-hidden">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
          />

          <label htmlFor="password" className="auth-visually-hidden">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />

          <label htmlFor="confirmPassword" className="auth-visually-hidden">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />

          <label className="auth-terms">
            <input type="checkbox" />
            <span>Accept Terms &amp; Conditions</span>
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Join us'}
          </button>

          <div className="auth-separator">
            <span>or</span>
          </div>

          <button type="button" className="auth-secondary-btn">
            Sign up with Google
          </button>
          <button type="button" className="auth-secondary-btn auth-secondary-btn--dark">
            Sign up with Apple
          </button>

          <p className="auth-helper-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
