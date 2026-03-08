import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import '../../Styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { firstName, lastName, email, phone, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
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

    if (!agreed) {
      setError('Please accept the Terms & Conditions.');
      return;
    }

    try {
      setLoading(true);
      const fullName = `${firstName} ${lastName}`.trim();

      const response = await api.post('/auth/register', {
        name: fullName,
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      });

      // After registration, log them in automatically if token returned
      const { token, user } = response.data;
      if (token && user) {
        login(user, token);
        navigate('/dashboard');
      } else {
        // Backend registered but didn't return token – redirect to login
        navigate('/login');
      }
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
            autoComplete="given-name"
          />

          <label htmlFor="lastName" className="auth-visually-hidden">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            autoComplete="family-name"
          />

          <label htmlFor="email" className="auth-visually-hidden">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            autoComplete="email"
          />

          <label htmlFor="phone" className="auth-visually-hidden">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone number (e.g. 0821234567)"
            autoComplete="tel"
          />

          <label htmlFor="password" className="auth-visually-hidden">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password (min 6 characters)"
            autoComplete="new-password"
          />

          <label htmlFor="confirmPassword" className="auth-visually-hidden">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            autoComplete="new-password"
          />

          <label className="auth-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>Accept Terms &amp; Conditions</span>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Join us'}
          </button>

          <div className="auth-separator"><span>or</span></div>

          <button type="button" className="auth-secondary-btn">Sign up with Google</button>
          <button type="button" className="auth-secondary-btn auth-secondary-btn--dark">Sign up with Apple</button>

          <p className="auth-helper-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}