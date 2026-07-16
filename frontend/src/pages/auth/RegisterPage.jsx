import React, { useState } from "react";
import axios from "axios";
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import API_BASE from "../../services/api";
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
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

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
    setSubmitError("");
    setSubmitSuccess("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create account in Firebase Auth + save profile in Firestore
      const response = await axios.post(`${API_BASE}/api/auth/register`, formData);

      if (response.data.success) {
        // 2. Sign in briefly with Firebase Client SDK to get a user object
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // 3. Send verification email via Firebase
        await sendEmailVerification(userCredential.user);

        // 4. Sign out immediately — user cannot use the app until verified
        await signOut(auth);

        // 5. Show success screen
        setSubmitSuccess("verification_sent");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const backendErrors = {};
          err.response.data.errors.forEach((e) => {
            backendErrors[e.path || e.param] = e.msg;
          });
          setErrors(backendErrors);
          setSubmitError("Please correct the highlighted errors.");
        } else {
          setSubmitError(err.response.data.message || "Registration failed.");
        }
      } else {
        setSubmitError("Failed to connect to backend server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show email verification sent screen
  if (submitSuccess === "verification_sent") {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="register-box" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
            <h2 className="register-title">Verify Your Email</h2>
            <p style={{ color: "#a0aec0", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              We sent a verification link to <strong style={{ color: "#5ced73" }}>{formData.email}</strong>.
              <br />
              Please check your inbox and click the link to activate your account.
            </p>
            <p style={{ color: "#718096", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
              Didn't receive it? Check your spam folder.
            </p>
            <button className="register-btn" onClick={onSwitchToLogin}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="register-title">Sign Up</h2>

        {submitSuccess && (
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
            {submitSuccess}
          </div>
        )}

        {submitError && (
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
            {submitError}
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
          <select
            name="degreeProgram"
            value={formData.degreeProgram}
            onChange={handleChange}
            className={formData.degreeProgram === "" ? "select-placeholder" : ""}
            style={{
              backgroundColor: formData.degreeProgram ? "#5ced73" : undefined,
              color: formData.degreeProgram ? "#1a1a2e" : undefined
            }}
          >
            <option value="" disabled>
              Select your degree program
            </option>

            <option value="Software Engineering">
              Software Engineering
            </option>

            <option value="Computer Science">
              Computer Science
            </option>

            <option value="Information Systems">
              Information Systems
            </option>
          </select>

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
              style={{
                backgroundColor: formData.reenterPassword ? "#5ced73" : undefined,
                color: formData.reenterPassword ? "#1a1a2e" : undefined
              }}
            />
            {errors.reenterPassword && (
              <span className="error">{errors.reenterPassword}</span>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
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
