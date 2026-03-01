import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Network error. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={pageStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>Join Dame's Salon today</p>

        <label htmlFor="name" style={labelStyle}>Full Name</label>
        <input
          id="name"
          placeholder="Enter your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <label htmlFor="email" style={labelStyle}>Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label htmlFor="password" style={labelStyle}>Password</label>
        <input
          id="password"
          type="password"
          placeholder="Create a password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={errorStyle}>{error}</p>}
        {msg && <p style={successStyle}>{msg}</p>}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={helperTextStyle}>
          Already have an account? <Link to="/login" style={linkStyle}>Login here</Link>
        </p>
      </form>
    </section>
  );
}

const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
  padding: "2rem 1rem",
};

const formStyle = {
  width: "100%",
  maxWidth: "420px",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "2rem",
  borderRadius: "12px",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 6px 24px rgba(34, 39, 76, 0.12)",
};

const titleStyle = {
  margin: "0 0 0.1rem",
  color: "#22274C",
  fontFamily: "var(--font-heading)",
  fontSize: "1.8rem",
};

const subtitleStyle = {
  margin: "0 0 0.5rem",
  color: "#6B6F8E",
  fontSize: "0.9rem",
};

const labelStyle = {
  fontWeight: "600",
  color: "#22274C",
  fontSize: "0.875rem",
};

const inputStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "1px solid #D4CACE",
  outline: "none",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

const buttonStyle = {
  marginTop: "0.5rem",
  padding: "0.85rem 1rem",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#1952A6",
  color: "#FFFFFF",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
};

const errorStyle = {
  margin: "0",
  color: "#B42318",
  fontSize: "0.875rem",
  backgroundColor: "#FEF2F2",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
};

const successStyle = {
  margin: "0",
  color: "#166534",
  fontSize: "0.875rem",
  backgroundColor: "#F0FDF4",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
};

const helperTextStyle = {
  margin: "0.25rem 0 0",
  color: "#6B6F8E",
  fontSize: "0.9rem",
  textAlign: "center",
};

const linkStyle = {
  color: "#1952A6",
  fontWeight: "600",
};