// frontend/src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { apiRequest } from "../../utils/api.js";
import "./LoginPage.css";

const LoginPage = ({ onClose, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth(); // Connect Firebase context actions
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Step 1: Run client authentication check against Firebase Auth Core
      await login(email, password);

      // Step 2: Query backend token verification endpoint to obtain verified system custom claims
      const userProfile = await apiRequest("/api/auth/verify", {
        method: "POST"
      });

      // Harmonize older dashboard requirements by setting both storage parameters uniformly
      const assignedRole = userProfile.user?.role;
      localStorage.setItem("batchFundUserRole", assignedRole);

      // Close modal popup interface elements
      if (onClose) onClose();

      // Step 3: Smart Routing gate redirection execution
      if (assignedRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/landing");
      }
    } catch (err) {
      console.error("Login verification lifecycle failure:", err);
      setError(err.message || "Invalid credentials or authentication server unreachable.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetSuccess(false);
    setSubmitting(true);

    try {
      // Wire password reset handler down to live custom context hook method
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err) {
      console.error("Password recovery failure:", err);
      setError(err.message || "Failed to transmit recovery reset routing instructions.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={!submitting ? onClose : undefined}>
      <div className="login-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="login-title">{forgotMode ? "Reset Password" : "Login"}</h2>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {resetSuccess && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10b981",
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            A password reset link has been sent to {email}!
          </div>
        )}

        {forgotMode ? (
          <form onSubmit={handleForgotPasswordSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Transmitting..." : "Send Reset Link"}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <span
                className="signup-link"
                style={{ cursor: submitting ? "not-allowed" : "pointer" }}
                onClick={!submitting ? () => {
                  setForgotMode(false);
                  setResetSuccess(false);
                  setError("");
                } : undefined}
              >
                Back to Login
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="forgot-password">
              <a
                href="#forgot"
                style={{ pointerEvents: submitting ? "none" : "auto", opacity: submitting ? 0.5 : 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  setForgotMode(true);
                  setError("");
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Authenticating..." : "Login"}
            </button>
          </form>
        )}

        {!forgotMode && (
          <p className="signup-text">
            Don't have an account?{" "}
            <span 
              className="signup-link" 
              style={{ cursor: submitting ? "not-allowed" : "pointer" }}
              onClick={!submitting ? onSwitchToSignup : undefined}
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;