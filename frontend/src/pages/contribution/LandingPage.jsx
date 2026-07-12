import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { apiRequest } from "../../utils/api.js";
import "./LandingPage.css";

// Landing.jsx
// Shown to a logged-in REGULAR user right after login (admins skip this
// and go straight to /admin — that redirect decision belongs in your
// PostLoginRedirect / ProtectedRoute logic, not in this file).
//
// Job of this page: welcome the user, give them one clear next step —
// go to their dashboard to view and pay their batch fund contribution.

export default function Landing() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [activeCampaigns, setActiveCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadLandingData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setError('');
                const [verifiedProfile, campaignResponse] = await Promise.all([
                    apiRequest('/api/auth/verify', { method: 'POST' }),
                    apiRequest('/api/campaigns', { method: 'GET' })
                ]);

                setProfile(verifiedProfile?.user || null);
                setActiveCampaigns(Array.isArray(campaignResponse?.campaigns) ? campaignResponse.campaigns : []);
            } catch (requestError) {
                console.error('Landing page data load failed:', requestError);
                setError(requestError.message || 'Failed to load your landing page data.');
            } finally {
                setLoading(false);
            }
        };

        loadLandingData();
    }, [user]);

    const displayName = useMemo(() => {
        const fallbackName = user?.displayName || user?.email?.split('@')[0] || 'Member';
        return profile?.name || fallbackName;
    }, [profile, user]);

    const activeCampaign = activeCampaigns[0] || null;
    const targetGoal = Number(activeCampaign?.targetGoal || 0);
    const collectedAmount = Number(activeCampaign?.currentCollected || 0);
    const collectionProgress = targetGoal > 0 ? Math.min(100, Math.round((collectedAmount / targetGoal) * 100)) : 0;
    const paymentDueDate = activeCampaign?.endDate
        ? new Date(activeCampaign.endDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'No active deadline';
    const activeBatchLabel = activeCampaign?.title || 'Batch fund campaign';

    const handleGoToDashboard = () => {
        navigate("/member");
    };

    const handleLogout = async () => {
        if (logout) {
            await logout();
        }
        navigate("/");
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-brand">
                    <span className="landing-brand-mark">●</span>
                    <span className="landing-brand-name">Batch Fund</span>
                </div>
                <button className="landing-logout" onClick={handleLogout}>
                    Log out
                </button>
            </header>

            <main className="landing-main">
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
                    <h1 className="landing-title">
                        {loading ? 'Loading your account...' : `Hi ${displayName},`}
                    </h1>
                    <p className="landing-subtitle">
                        {error
                            ? error
                            : 'Your batch fund group is moving forward. Head to your dashboard to check your contribution status or make a payment.'}
                    </p>

                    <div className="landing-cta-group" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                        <button className="landing-cta" onClick={handleGoToDashboard}>
                            Go to my dashboard
                            <span className="landing-cta-arrow">→</span>
                        </button>
                        <button className="landing-cta landing-cta-secondary" onClick={() => navigate("/pay-fund")}>
                            Pay Fund
                            <span className="landing-cta-arrow">→</span>
                        </button>
                    </div>
                </section>

                <section className="landing-glance" aria-label="Quick glance">
                    <div className="landing-chip">
                        <span className="landing-chip-label">Active batch</span>
                        <span className="landing-chip-value">{activeBatchLabel}</span>
                    </div>
                    <div className="landing-chip">
                        <span className="landing-chip-label">Next payment due</span>
                        <span className="landing-chip-value">{paymentDueDate}</span>
                    </div>
                    <div className="landing-chip">
                        <span className="landing-chip-label">Contributed so far</span>
                        <span className="landing-chip-value">
                            Rs. {collectedAmount.toLocaleString()}
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--landing-text-muted)' }}>
                                {collectionProgress}% of Rs. {targetGoal.toLocaleString() || '0'}
                            </span>
                        </span>
                    </div>
                </section>

                <p className="landing-footnote">
                    Figures are sourced from your verified session and the active campaign ledger.
                </p>
            </main>
        </div>
    );
}