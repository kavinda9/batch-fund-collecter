import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo1 from "../../assets/logo1.png";
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/logo3.png";
import "./LandingPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function Landing() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("there");
    const [lastPaidMonth, setLastPaidMonth] = useState("Loading...");
    const [announcement, setAnnouncement] = useState("No announcements");
    const [statusValue, setStatusValue] = useState({ amount: 0, text: "Loading...", type: "zero" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1. Fetch Profile
        fetch(`${API_BASE}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.user?.name) setDisplayName(data.user.name);
            })
            .catch(() => { });

        // 2. Fetch Slip History & Calculate Status & Last Paid Month
        fetch(`${API_BASE}/api/slips/my`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.payments) {
                    const approvedMonths = [];
                    data.payments.forEach((p) => {
                        if (p.status === "approved") {
                            p.monthsCovered?.forEach((m) => {
                                approvedMonths.push(m);
                            });
                        }
                    });

                    // A. Calculate Last Paid Month
                    if (approvedMonths.length > 0) {
                        approvedMonths.sort((a, b) => {
                            if (a.year !== b.year) return b.year - a.year;
                            return b.month - a.month;
                        });
                        const latest = approvedMonths[0];
                        setLastPaidMonth(`${latest.year} ${MONTH_NAMES[latest.month - 1]}`);
                    } else {
                        setLastPaidMonth("None");
                    }

                    // B. Calculate Status Dues
                    const uniqueApproved = new Set(approvedMonths.map(m => `${m.year}-${m.month}`));
                    const paidCount = uniqueApproved.size;

                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const currentMonthIndex = now.getMonth() + 1; // 1-12

                    // Calculate due months count since Jan 2026
                    let dueMonthsCount = currentMonthIndex;
                    if (currentYear > 2026) {
                        dueMonthsCount = 12;
                    } else if (currentYear < 2026) {
                        dueMonthsCount = 0;
                    }

                    const diff = paidCount - dueMonthsCount;
                    if (diff === 0) {
                        setStatusValue({ amount: 0, text: "0 RS", type: "zero" });
                    } else if (diff > 0) {
                        setStatusValue({ amount: diff * 250, text: `+${diff * 250} RS`, type: "advance" });
                    } else {
                        setStatusValue({ amount: diff * 250, text: `-${Math.abs(diff) * 250} RS`, type: "arrears" });
                    }
                } else {
                    setLastPaidMonth("None");
                    setStatusValue({ amount: 0, text: "0 RS", type: "zero" });
                }
            })
            .catch(() => {
                setLastPaidMonth("None");
                setStatusValue({ amount: 0, text: "0 RS", type: "zero" });
            });

        // 3. Fetch Announcements
        fetch(`${API_BASE}/api/user/announcements`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.announcements && data.announcements.length > 0) {
                    setAnnouncement(data.announcements[0].title);
                } else {
                    setAnnouncement("No announcements at this time.");
                }
            })
            .catch(() => {
                setAnnouncement("No announcements at this time.");
            });

    }, []);

    return (
        <div className="landing-page">
            {/* Top Navigation */}
            <nav className="home-nav">
                <button className="nav-btn active-btn" onClick={() => navigate("/landing")}>Home</button>
                <button className="nav-btn" onClick={() => navigate("/about")}>About</button>
                <button className="nav-btn" onClick={() => navigate("/member")}>
                    Dashboard
                </button>
            </nav>

            <main className="landing-main">
                <div className="landing-two-col">
                    {/* ── Left: hero card ── */}
                    <section className="landing-hero">
                        <div className="landing-hero-glow" aria-hidden="true"></div>
                        <svg
                            className="landing-hero-line"
                            viewBox="0 0 400 120"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M0,100 C60,90 90,60 140,55 C190,50 210,80 260,65 C310,50 330,20 400,10"
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <p className="landing-eyebrow">Welcome back</p>
                        <h1 className="landing-title">Hi {displayName},</h1>
                        <p className="landing-subtitle">
                            Your batch fund group is moving forward. Head to your dashboard
                            to check your contribution status or make a payment.
                        </p>

                        <div className="landing-cta-group">
                            <button className="landing-cta" onClick={() => navigate("/member")}>
                                Go to my dashboard
                                <span className="landing-cta-arrow">→</span>
                            </button>
                            <button className="landing-cta landing-cta-secondary" onClick={() => navigate("/pay-fund")}>
                                Pay Fund
                                <span className="landing-cta-arrow">→</span>
                            </button>
                        </div>
                    </section>

                    {/* ── Right: stacked cards with content ── */}
                    <div className="landing-logo-stack">
                        {/* Card 1: Last Paid Month */}
                        <div className="landing-logo-card">
                            <div className="landing-logo-circle">
                                <img src={logo1} alt="Last Payed Month" className="landing-logo-img" />
                            </div>
                            <div className="landing-logo-content">
                                <h4 className="landing-card-header">Last Payed Month</h4>
                                <p className="landing-card-value">{lastPaidMonth}</p>
                            </div>
                        </div>

                        {/* Card 2: Announcements */}
                        <div className="landing-logo-card">
                            <div className="landing-logo-circle">
                                <img src={logo2} alt="Announcements" className="landing-logo-img" />
                            </div>
                            <div className="landing-logo-content">
                                <h4 className="landing-card-header">Announcements</h4>
                                <p className="landing-card-value announcement-text">{announcement}</p>
                            </div>
                        </div>

                        {/* Card 3: Status */}
                        <div className="landing-logo-card">
                            <div className="landing-logo-circle">
                                <img src={logo3} alt="Status" className="landing-logo-img" />
                            </div>
                            <div className="landing-logo-content">
                                <h4 className="landing-card-header">Status</h4>
                                <p className={`landing-card-value status-value ${statusValue.type}`}>
                                    {statusValue.text}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}