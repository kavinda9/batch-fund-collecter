import React, { useState } from "react";
import "./RegisterPage.css";

const RegisterPage = ({ onClose, onSwitchToLogin }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Firebase register logic will go here later
    console.log("Register:", formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="register-title">Sign Up</h2>

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
              className={formData.batch === "" ? "select-placeholder" : ""}
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
            />
            {errors.reenterPassword && (
              <span className="error">{errors.reenterPassword}</span>
            )}
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <span className="login-link" onClick={onSwitchToLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
