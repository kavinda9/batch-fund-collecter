import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

const AboutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Protect this page — if not logged in, redirect to public home
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="about-page-container">
      {/* Top Navigation */}
      <nav className="home-nav">
        <button className="nav-btn" onClick={() => navigate("/landing")}>Home</button>
        <button className="nav-btn active-btn" onClick={() => navigate("/about")}>About</button>
        <button className="nav-btn" onClick={() => navigate("/member")}>
          Dashboard
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="about-page-main">
        <h2 className="about-page-title">About Us</h2>
        
        <div className="about-page-card">
          <h3 className="about-mission-title">Our Mission</h3>
          <p className="about-mission-desc">
            Our mission is to provide a transparent, secure and organized platform for collecting batch funds. The system reduces manual work, improves record management and ensures every contribution is properly tracked and verified.
          </p>
          
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="contact-svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span className="contact-text">batchfund@gmail.com</span>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon-circle">
                <svg viewBox="0 0 24 24" fill="currentColor" className="contact-svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.729-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.962 1.452 5.51 0 9.991-4.49 9.994-10.004.002-2.673-1.04-5.184-2.936-7.082-1.895-1.9-4.404-2.946-7.08-2.948-5.52 0-10.003 4.49-10.006 10.007-.001 2.01.536 3.968 1.553 5.698l-.988 3.606 3.693-.969zm11.332-6.52c-.287-.144-1.7-.84-1.962-.935-.262-.096-.453-.144-.642.144-.19.288-.733.935-.898 1.127-.165.19-.33.213-.618.069-.288-.144-1.215-.448-2.313-1.43-.854-.76-1.43-1.7-1.597-1.987-.167-.287-.018-.441.126-.583.13-.127.287-.336.43-.504.143-.168.19-.288.287-.48.096-.19.048-.36-.024-.504-.072-.144-.642-1.547-.88-2.122-.23-.556-.464-.48-.642-.49-.166-.01-.357-.012-.55-.012-.193 0-.507.072-.77.36-.264.288-1.008.986-1.008 2.405 0 1.42 1.034 2.79 1.178 2.984.145.19 2.037 3.113 4.933 4.364.688.297 1.226.475 1.646.608.692.22 1.32.19 1.82.115.553-.083 1.7-.696 1.94-1.37.24-.674.24-1.25.167-1.37-.072-.12-.263-.19-.55-.336z"/>
                </svg>
              </span>
              <span className="contact-text">0112702700</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
