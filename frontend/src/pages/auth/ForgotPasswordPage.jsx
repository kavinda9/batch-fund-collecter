import React, { useState } from "react";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    // Firebase reset password logic will go here later
    console.log("Reset password for:", email);
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="forgot-box" onClick={(e) => e.stopPropagation()}>
        {!submitted ? (
          <>
            <h2 className="forgot-title">Forgot Password</h2>
            <p className="forgot-subtitle">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
                {error && <span className="error">{error}</span>}
              </div>

              <button type="submit" className="forgot-btn">
                Send Reset Link
              </button>
            </form>

            <p className="back-to-login">
              Remember your password?{" "}
              <span className="login-link" onClick={onSwitchToLogin}>
                Login
              </span>
            </p>
          </>
        ) : (
          <div className="success-state">
            <div className="email-icon">✉️</div>
            <h2 className="forgot-title">Check Your Email</h2>
            <p className="forgot-subtitle">
              We sent a password reset link to <strong>{email}</strong>. Check
              your inbox and follow the instructions.
            </p>
            <button className="forgot-btn" onClick={onSwitchToLogin}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
