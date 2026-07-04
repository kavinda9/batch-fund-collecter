import React, { useState } from "react";
import backgroundSvg from "../../assets/background.svg";
import image1 from "../../assets/image1.png";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import "./HomePage.css";

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundSvg})` }}
    >
      {/* Top Navigation */}
      <nav className="home-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">About</button>
        <button className="nav-btn" onClick={() => setShowLogin(true)}>
          Login
        </button>
      </nav>

      {/* Headings */}
      <div className="heading-batch-fund">Batch Fund</div>
      <div className="heading-collector">Collector</div>

      {/* Bottom Left Image */}
      <div className="home-image-wrapper">
        <img src={image1} alt="illustration" className="home-image" />
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => { setShowLogin(false); setShowRegister(true); }}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterPage
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
    </div>
  );
};

export default HomePage;
