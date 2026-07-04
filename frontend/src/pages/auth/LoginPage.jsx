import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onClose, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Mock Login Logic
    if (email === "admin@batchfund.com" && password === "admin123") {
      navigate("/admin");
      onClose();
    } else if (email.endsWith("@gmail.com") && password.trim().length >= 8) {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (gmailRegex.test(email)) {
        navigate("/landing");
        onClose();
      } else {
        setError("Please enter a valid Gmail address.");
      }
    } else if (email.endsWith("@gmail.com")) {
      setError("Password must be at least 8 characters.");
    } else {
      setError("Access Denied. Use admin@batchfund.com / admin123, or a valid Gmail address (ending in @gmail.com) and a password of at least 6 characters.");
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (email.endsWith("@gmail.com") || email === "admin@batchfund.com") {
      setResetSuccess(true);
    } else {
      setError("Please enter a valid registered email address.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Send Reset Link
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <span
                className="signup-link"
                onClick={() => {
                  setForgotMode(false);
                  setResetSuccess(false);
                  setError("");
                }}
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
                required
              />
            </div>

            <div className="forgot-password">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotMode(true);
                  setError("");
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        )}

        {!forgotMode && (
          <p className="signup-text">
            Don't have an account?{" "}
            <span className="signup-link" onClick={onSwitchToSignup}>
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;


