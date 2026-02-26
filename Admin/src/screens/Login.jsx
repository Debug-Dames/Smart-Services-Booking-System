import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Login failed");
      if (!payload?.token) throw new Error("Login response did not include a token.");

      localStorage.setItem("token", payload.token);
      localStorage.setItem("adminUser", JSON.stringify(payload.user || { email: trimmedEmail }));
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Admin Login</h2>
        <p style={styles.subtitle}>Sign in to manage bookings, users, and services.</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          autoComplete="email"
          disabled={loading}
          required
        />
        <div style={styles.passwordRow}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
            disabled={loading}
            required
          />
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit" style={styles.loginBtn} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(120deg, #eef2ff 0%, #f8fafc 100%)",
    padding: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.10), 0 2px 10px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: 0,
    color: "#0f172a",
  },
  subtitle: {
    margin: "0 0 8px 0",
    color: "#475569",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
  },
  passwordRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px",
  },
  toggleBtn: {
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "0 12px",
    cursor: "pointer",
  },
  loginBtn: {
    border: "none",
    background: "#0f172a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    margin: 0,
    color: "#b91c1c",
    fontSize: "14px",
  },
};
