import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import '../../Styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getAuthErrorMessage(err) {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.code === 'ERR_NETWORK') {
      return 'Cannot reach API. Start backend on http://localhost:5000 and try again.';
    }
    return 'Registration failed. Please try again.';
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      await authService.register({ name, email, password });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

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
            required
          />

          <label htmlFor="lastName" className="auth-visually-hidden">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            required
          />

          <label htmlFor="email" className="auth-visually-hidden">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            required
          />

          <label htmlFor="password" className="auth-visually-hidden">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            minLength={6}
            required
          />

          <label htmlFor="confirmPassword" className="auth-visually-hidden">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
          />

          <label className="auth-terms">
            <input type="checkbox" required />
            <span>Accept Terms &amp; Conditions</span>
          </label>

          {error ? <p className="auth-error">{error}</p> : null}
          {success ? <p className="auth-success">{success}</p> : null}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Join us'}
          </button>

          <p className="auth-helper-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
