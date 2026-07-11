<<<<<<< HEAD
import React, { useState } from "react";
import backgroundSvg from "../../assets/background.svg";
import image1 from "../../assets/image1.png";
=======
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import backgroundSvg from "../../assets/background.svg";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
>>>>>>> 14cdde4 (updated files)
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import "./HomePage.css";

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
<<<<<<< HEAD

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundSvg})` }}
    >
      {/* Top Navigation */}
      <nav className="home-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">About</button>
=======
  const [progress, setProgress] = useState(0); // 0 -> 1 across the first viewport of scroll
  const aboutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToAbout) {
      setTimeout(() => {
        aboutRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      // Clear navigation state to avoid re-scrolling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const vh = window.innerHeight;
      const p = Math.min(Math.max(window.scrollY / vh, 0), 1);
      setProgress(p);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Derived animation values from scroll progress
  const heroFade = 1 - progress;          // 1 -> 0
  const heroSlide = progress * -120;      // 0vw -> -120vw
  const image2Slide = (1 - progress) * 120; // 120vw -> 0vw
  const aboutSlide = (1 - progress) * 100;  // 100vh -> 0vh

  return (
    <div className="home-container">
      {/* Fixed background - never moves, never re-renders on scroll */}
      <div
        className="bg-fixed"
        style={{ backgroundImage: `url(${backgroundSvg})` }}
      />

      {/* Top Navigation - always fixed on top of everything */}
      <nav className="home-nav">
        <button className="nav-btn" onClick={scrollToTop}>Home</button>
        <button className="nav-btn" onClick={scrollToAbout}>About</button>
>>>>>>> 14cdde4 (updated files)
        <button className="nav-btn" onClick={() => setShowLogin(true)}>
          Login
        </button>
      </nav>

<<<<<<< HEAD
      {/* Headings */}
      <div className="heading-batch-fund">Batch Fund</div>
      <div className="heading-collector">Collector</div>

      {/* Bottom Left Image */}
      <div className="home-image-wrapper">
        <img src={image1} alt="illustration" className="home-image" />
      </div>
=======
      {/* Scroll spacer - gives the pinned hero animation room to play out */}
      <div className="hero-spacer" />

      {/* Parallax layer - fixed to viewport, animated purely via transform/opacity */}
      <div className="parallax-layer">
        <div
          className="heading-batch-fund"
          style={{ transform: `translateX(${heroSlide}vw)`, opacity: heroFade }}
        >
          Batch Fund
        </div>

        <div
          className="heading-collector"
          style={{ transform: `translateX(${heroSlide}vw)`, opacity: heroFade }}
        >
          Collector
        </div>

        <div
          className="home-image-wrapper"
          style={{ transform: `translateX(${heroSlide}vw)`, opacity: heroFade }}
        >
          <img src={image1} alt="illustration" className="home-image" />
        </div>

        <div
          className="image2-wrapper"
          style={{ transform: `translateX(${image2Slide}vw)` }}
        >
          <img src={image2} alt="about illustration" className="image2" />
        </div>

        <div
          className="heading-about"
          style={{ transform: `translate(-50%, ${aboutSlide}vh)`, opacity: progress }}
        >
          About Us
        </div>
      </div>
      {/* About section - normal document flow, scrolls in beneath the pinned elements */}
      <section className="about-section" ref={aboutRef}>
        <div className="about-content">
          <h3 className="about-mission-title">Our Mission</h3>
          <p className="about-mission-desc">
            Our mission is to provide a transparent, secure and organized platform for collecting batch funds. The system reduces manual work, improves record management and ensures every contribution is properly tracked and verified.
          </p>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="contact-svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="contact-text">batchfund@gmail.com</span>
            </div>

            <div className="contact-item">
              <span className="contact-icon-circle">
                <svg viewBox="0 0 24 24" fill="currentColor" className="contact-svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.729-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.962 1.452 5.51 0 9.991-4.49 9.994-10.004.002-2.673-1.04-5.184-2.936-7.082-1.895-1.9-4.404-2.946-7.08-2.948-5.52 0-10.003 4.49-10.006 10.007-.001 2.01.536 3.968 1.553 5.698l-.988 3.606 3.693-.969zm11.332-6.52c-.287-.144-1.7-.84-1.962-.935-.262-.096-.453-.144-.642.144-.19.288-.733.935-.898 1.127-.165.19-.33.213-.618.069-.288-.144-1.215-.448-2.313-1.43-.854-.76-1.43-1.7-1.597-1.987-.167-.287-.018-.441.126-.583.13-.127.287-.336.43-.504.143-.168.19-.288.287-.48.096-.19.048-.36-.024-.504-.072-.144-.642-1.547-.88-2.122-.23-.556-.464-.48-.642-.49-.166-.01-.357-.012-.55-.012-.193 0-.507.072-.77.36-.264.288-1.008.986-1.008 2.405 0 1.42 1.034 2.79 1.178 2.984.145.19 2.037 3.113 4.933 4.364.688.297 1.226.475 1.646.608.692.22 1.32.19 1.82.115.553-.083 1.7-.696 1.94-1.37.24-.674.24-1.25.167-1.37-.072-.12-.263-.19-.55-.336z" />
                </svg>
              </span>
              <span className="contact-text">0112702700</span>
            </div>
          </div>
        </div>
      </section>

>>>>>>> 14cdde4 (updated files)

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

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> 14cdde4 (updated files)
