// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { apiRequest } from "../../utils/api.js";
import "./RegisterPage.css";

const RegisterPage = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth(); // Destructure the Firebase auth registration engine
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    regNumber: "",
    degreeProgram: "",
    batch: "",
    contactNumber: "",
    password: "",
    reenterPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false); // Manages loading state during the network handshake

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.regNumber.trim())
      newErrors.regNumber = "Registration number is required.";
    if (!formData.degreeProgram.trim())
      newErrors.degreeProgram = "Degree program is required.";
    if (!formData.batch) newErrors.batch = "Please select your batch year.";

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.reenterPassword) {
      newErrors.reenterPassword = "Please re-enter your password.";
    } else if (formData.password !== formData.reenterPassword) {
      newErrors.reenterPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Initialize account creation with Firebase Authentication
      await register(formData.email, formData.password);

      // Step 2: Fire the onboarding handshake metadata package to the Express server backend
      const response = await apiRequest("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          regNumber: formData.regNumber,
          degreeProgram: formData.degreeProgram,
          batch: formData.batch,
          contactNumber: formData.contactNumber,
        }),
      });

      /* CRITICAL FIX HERE:
         Parse from response.user?.role instead of response.role
      */
      const assignedRole = response.user?.role;
      if (assignedRole) {
        localStorage.setItem("batchFundUserRole", assignedRole);
      }

      // Clear layout triggers on total registration lifecycle success
      if (onClose) onClose();

      // Redirect user to portal to run smart redirection routing
      navigate("/portal");

    } catch (err) {
      console.error("Registration structural workflow catch error:", err);
      setErrors({
        submit: err.message || "Registration gateway could not authenticate connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="register-title">Sign Up</h2>

        {errors.submit && (
          <div
            className="auth-error"
            style={{
              color: "#d93838",
              backgroundColor: "#fff0f0",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "14px"
            }}
          >
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Name */}
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.name ? "#5ced73" : undefined,
                color: formData.name ? "#1a1a2e" : undefined
              }}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.email ? "#5ced73" : undefined,
                color: formData.email ? "#1a1a2e" : undefined
              }}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* University Registration Number */}
          <div className="input-group">
            <label>University Registration Number</label>
            <input
              type="text"
              name="regNumber"
              placeholder="Enter your registration number"
              value={formData.regNumber}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.regNumber ? "#5ced73" : undefined,
                color: formData.regNumber ? "#1a1a2e" : undefined
              }}
            />
            {errors.regNumber && (
              <span className="error">{errors.regNumber}</span>
            )}
          </div>

          {/* Degree Program */}
          <div className="input-group">
            <label>Degree Program</label>
            <input
              type="text"
              name="degreeProgram"
              placeholder="e.g. BSc Computer Science"
              value={formData.degreeProgram}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.degreeProgram ? "#5ced73" : undefined,
                color: formData.degreeProgram ? "#1a1a2e" : undefined
              }}
            />
            {errors.degreeProgram && (
              <span className="error">{errors.degreeProgram}</span>
            )}
          </div>

          {/* Batch */}
          <div className="input-group">
            <label>Batch</label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              disabled={submitting}
              className={formData.batch === "" ? "select-placeholder" : ""}
              style={{
                backgroundColor: formData.batch ? "#5ced73" : undefined,
                color: formData.batch ? "#1a1a2e" : undefined
              }}
            >
              <option value="" disabled>
                Select your year
              </option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            {errors.batch && <span className="error">{errors.batch}</span>}
          </div>

          {/* Contact Number */}
          <div className="input-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              placeholder="Enter your contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={10}
              disabled={submitting}
              style={{
                backgroundColor: formData.contactNumber ? "#5ced73" : undefined,
                color: formData.contactNumber ? "#1a1a2e" : undefined
              }}
            />
            {errors.contactNumber && (
              <span className="error">{errors.contactNumber}</span>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.password ? "#5ced73" : undefined,
                color: formData.password ? "#1a1a2e" : undefined
              }}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          {/* Re-enter Password */}
          <div className="input-group">
            <label>Re-enter Password</label>
            <input
              type="password"
              name="reenterPassword"
              placeholder="Repeat your password"
              value={formData.reenterPassword}
              onChange={handleChange}
              disabled={submitting}
              style={{
                backgroundColor: formData.reenterPassword ? "#5ced73" : undefined,
                color: formData.reenterPassword ? "#1a1a2e" : undefined
              }}
            />
            {errors.reenterPassword && (
              <span className="error">{errors.reenterPassword}</span>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={submitting}>
            {submitting ? "Processing..." : "Create Account"}
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <span
            className="login-link"
            onClick={!submitting ? onSwitchToLogin : undefined}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;