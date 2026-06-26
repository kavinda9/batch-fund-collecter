import React from "react";
import backgroundSvg from "../../assets/background.svg";
import image1 from "../../assets/image1.png";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundSvg})` }}
    >
      {/* Top Navigation */}
      <nav className="home-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">About</button>
        <button className="nav-btn">Login</button>
      </nav>

      {/* Headings */}
      <div className="heading-batch-fund">Batch Fund</div>
      <div className="heading-collector">Collector</div>

      {/* Bottom Left Image */}
      <div className="home-image-wrapper">
        <img src={image1} alt="illustration" className="home-image" />
      </div>
    </div>
  );
};

export default HomePage;
