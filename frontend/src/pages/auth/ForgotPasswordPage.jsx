import React, { useState } from "react";
<<<<<<< HEAD
=======
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
>>>>>>> 14cdde4 (updated files)
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD

  const handleSubmit = (e) => {
=======
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
>>>>>>> 14cdde4 (updated files)
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
<<<<<<< HEAD
    // Firebase reset password logic will go here later
    console.log("Reset password for:", email);
    setSubmitted(true);
=======
    setError("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
>>>>>>> 14cdde4 (updated files)
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

<<<<<<< HEAD
              <button type="submit" className="forgot-btn">
                Send Reset Link
=======
              <button type="submit" className="forgot-btn" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
>>>>>>> 14cdde4 (updated files)
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
