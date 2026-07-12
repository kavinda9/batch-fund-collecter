import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { sendPasswordResetEmail, signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import "./LoginPage.css";

const LoginPage = ({ onClose, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        onClose();
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/landing");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        if (err.response.data.code === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true);
        } else {
          setError(err.response.data.message || "Login failed.");
        }
      } else {
        setError("Failed to connect to backend server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendSuccess(false);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendSuccess(true);
    } catch (err) {
      console.error("Resend verification error:", err);
      setError("Could not resend verification email. Please check your email and password.");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess(true);
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

        {emailNotVerified && (
          <div style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            color: "#f59e0b",
            padding: "0.85rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center",
            lineHeight: "1.5"
          }}>
            <div style={{ marginBottom: "0.5rem" }}>
              📧 Please verify your email before logging in.
            </div>
            <span
              onClick={handleResendVerification}
              style={{
                color: "#5ced73",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.8rem"
              }}
            >
              Resend verification email
            </span>
          </div>
        )}

        {resendSuccess && (
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
            ✅ Verification email resent! Check your inbox.
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

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
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

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
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



