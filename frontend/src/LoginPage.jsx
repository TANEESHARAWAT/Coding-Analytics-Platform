import { useState } from "react";
import axios from "axios";
import BorderGlow from "./BorderGlow";

const API = "https://coding-analytics-platform-backend.onrender.com";

function LoginPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/signup";
      const res = await axios.post(`${API}${endpoint}`, { email, password });
      onAuthSuccess(res.data.token, res.data.email);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Please check your input.");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Couldn't reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BorderGlow
        className="auth-card-glow"
        glowColor="14 100 59"
        colors={["#ff4d2e", "#ff8a3d", "#baff29"]}
        borderRadius={12}
        glowRadius={28}
      >
        <div className="auth-card">
          <h1 className="auth-title">Coding Analytics Platform</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "Log in to continue" : "Create your account"}
          </p>

          <div className="auth-toggle">
            <button
              type="button"
              className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-toggle-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="auth-input"
            />
            {mode === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
            )}

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? "please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
        </div>
      </BorderGlow>
    </div>
  );
}

export default LoginPage;
