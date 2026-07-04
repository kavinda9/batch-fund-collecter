import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Firebase login logic will go here later
    console.log("Login:", email, password);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="login-title">Login</h2>

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
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <span className="signup-link" onClick={onSwitchToSignup}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
