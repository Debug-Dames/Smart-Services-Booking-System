import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import '../../Styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function getAuthErrorMessage(err) {
    const reason = err?.response?.data?.reason;
    if (reason === 'email_not_found') return 'No account found for this email. Please register first.';
    if (reason === 'password_mismatch') return 'Incorrect password. Please try again.';
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message) return err.message;
    if (err?.code === 'ERR_NETWORK') {
      return 'Cannot reach API. Start backend on http://localhost:5000 and try again.';
    }
    return 'Login failed. Please try again.';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const data = await authService.login({ email: normalizedEmail, password: normalizedPassword });
      login(data.user || { email }, data.token);
      navigate('/book');
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
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
