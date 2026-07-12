import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon, DashboardIcon, FundIcon, IncomeIcon, EventIcon,
  SettingsIcon, LogoutIcon, DownloadIcon, BellIcon,
  InfoIcon, CheckIcon, SpeakerIcon, CalendarIcon, UsersIcon
} from '../../components/Icons';
import { Navbar } from '../../components/Navbar';
import { QuickActionModal } from '../../components/QuickActionModal';
import API_BASE from '../../services/api';


const MemberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'receipt'
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  // Student stats/profile info
  const [profile, setProfile] = useState({
    name: "Loading...",
    regNumber: "Loading..."
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    regNumber: "",
    degreeProgram: "",
    batch: "",
    contactNumber: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [personalPayments, setPersonalPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [memberEvents, setMemberEvents] = useState([]);
  const [monthlyPaid, setMonthlyPaid] = useState(Array(12).fill(0));
  const [generalStats, setGeneralStats] = useState({
    totalCollected: 0,
    targetSemester: 240000,
    totalPaid: 0,
    totalPending: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  const loadAllData = async () => {
    try {
      const headers = getAuthHeaders();

      // Load profile info
      const profileRes = await fetch(`${API_BASE}/api/auth/profile`, { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.user);
        setProfileForm({
          name: profileData.user.name || "",
          regNumber: profileData.user.regNumber || "",
          degreeProgram: profileData.user.degreeProgram || "",
          batch: profileData.user.batch || "",
          contactNumber: profileData.user.contactNumber || ""
        });
      }

      // Load personal slips/payments
      const slipsRes = await fetch(`${API_BASE}/api/slips/my`, { headers });
      if (slipsRes.ok) {
        const slipsData = await slipsRes.json();
        const paymentsList = slipsData.payments || [];

        // Calculate monthly paid amount for 12 months of 2026
        const monthsData = Array(12).fill(0);
        paymentsList.forEach(p => {
          if (p.status === 'approved' && Array.isArray(p.monthsCovered)) {
            p.monthsCovered.forEach(m => {
              if (m.year === 2026 && m.month >= 1 && m.month <= 12) {
                // Distribute payment amount evenly over covered months
                monthsData[m.month - 1] += (p.amount / p.monthsCovered.length);
              }
            });
          }
        });
        setMonthlyPaid(monthsData);

        // Map slips to the required visual structure safely
        const paymentsMapped = paymentsList.map((p) => {
          let monthsStr = "";
          if (Array.isArray(p.monthsCovered)) {
            monthsStr = p.monthsCovered.map(m => m ? `${m.month}/${m.year}` : "").filter(Boolean).join(', ');
          }

          let dateStr = "-";
          if (p.createdAt) {
            try {
              const d = new Date(p.createdAt);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString("en-GB");
              }
            } catch (err) {
              console.error(err);
            }
          }

          return {
            id: p.id,
            txId: p.slipFilename?.substring(0, 16) || p.id?.substring(0, 8),
            amount: p.amount || 0,
            date: dateStr,
            mode: "Bank Transfer / Slip",
            purpose: `Monthly Contribution${monthsStr ? ` (${monthsStr})` : ""}`,
            status: p.status === 'approved' ? 'Verified' : p.status === 'pending' ? 'Pending' : 'Rejected'
          };
        });
        setPersonalPayments(paymentsMapped);
      }

      // Load announcements
      const announcementsRes = await fetch(`${API_BASE}/api/user/announcements`, { headers });
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.announcements || []);
      }

      // Load events
      const eventsRes = await fetch(`${API_BASE}/api/user/events`, { headers });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setMemberEvents(eventsData.events || []);
      }

      // Load general stats
      const statsRes = await fetch(`${API_BASE}/api/user/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGeneralStats({
          totalCollected: statsData.totalCollected || 0,
          targetSemester: statsData.targetSemester || 240000,
          totalPaid: statsData.totalPaid || 0,
          totalPending: statsData.totalPending || 0
        });
      }

    } catch (error) {
      console.error("Error loading member dashboard:", error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const toggleRSVP = async (eventId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Attending' ? 'Declined' : 'Attending';
      const res = await fetch(`${API_BASE}/api/user/events/${eventId}/rsvp`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update RSVP");
      }
    } catch (error) {
      console.error("RSVP error:", error);
    }
  };

  const openReceiptModal = (pay) => {
    setSelectedReceiptData({
      student: profile.name,
      rollNo: profile.regNumber,
      amount: pay.amount,
      date: pay.date,
      purpose: pay.purpose,
      txId: pay.txId,
      paymentMode: pay.mode
    });
    setModalType('receipt');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveMessage(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage({ type: 'success', text: "Profile details updated successfully!" });
        loadAllData();
      } else {
        setSaveMessage({ type: 'error', text: data.message || "Failed to update profile." });
      }
    } catch (err) {
      console.error(err);
      setSaveMessage({ type: 'error', text: "Network error. Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  const triggerMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Calculations — driven by backend stats so they update in real time
  const amountContributed = generalStats.totalPaid;   // only approved payments
  const pendingAmount = generalStats.totalPending;     // submitted but not yet reviewed
  // Dues = 0 once approved payments cover the target; pending shows as partial credit
  const TARGET_DUES = 3000;
  const remainingDues = Math.max(0, TARGET_DUES - amountContributed);
  const batchFundTotal = generalStats.totalCollected;
  const upcomingEventCount = memberEvents.length;

  const sidebarItems = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'My Contributions', icon: <IncomeIcon /> },
    { name: 'Payment History', icon: <FundIcon /> },
    { name: 'Events', icon: <EventIcon /> },
    { name: 'Announcements', icon: <SpeakerIcon /> },
    { name: 'Settings', icon: <SettingsIcon /> },
  ];

  const filteredHistory = personalPayments.filter(p =>
    p.purpose.toLowerCase().includes(searchQuery) ||
    p.txId.toLowerCase().includes(searchQuery) ||
    p.mode.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="app-container">

      {/* Sidebar Navigation */}
      <aside style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 95,
        transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="sidebar-aside">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.1rem'
          }}>
            🎓
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', lineHeight: 1.2 }}>StudentPortal</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Roll No: {profile.regNumber}</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1 }}>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === 'Home') {
                    navigate('/landing');
                  } else {
                    setActiveTab(item.name);
                  }
                  setMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius-md)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 10px rgba(124,58,237,0.15)' : 'none'
                }}
                className={!isActive ? 'sidebar-btn-hover' : ''}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {React.cloneElement(item.icon, { color: isActive ? '#fff' : 'var(--text-muted)' })}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--border-radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            textAlign: 'left',
            marginTop: 'auto'
          }}
        >
          <LogoutIcon color="var(--danger)" />
          Logout
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">

        {/* Top Navbar */}
        <Navbar
          title={`Student / ${activeTab}`}
          userRole="Member"
          onSearch={handleSearch}
          toggleMobileSidebar={triggerMobileToggle}
          onSettings={() => setActiveTab('Settings')}
        />

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade">

            {/* Header greeting */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Hello, {profile.name}!</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have no pending dues. Keep it up!</span>
            </div>

            {/* Widget Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>

              {/* Amount Contributed */}
              <div className="glass-card active-border">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>MY CONTRIBUTIONS</span>
                  <span style={{ color: 'var(--success)' }}>💸</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Rs. {amountContributed.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>✓ {personalPayments.filter(p => p.status === 'Verified').length} Payments Verified {pendingAmount > 0 && `(+ Rs. ${pendingAmount} Pending)`}</span>
                </div>
              </div>

              {/* Remaining Dues */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>REMAINING DUES</span>
                  <span>💳</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: remainingDues > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  Rs. {remainingDues.toLocaleString()}
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {remainingDues > 0 ? "Outstanding payments due" : "No outstanding payments"}
                </div>
              </div>

              {/* Total Batch Fund Balance */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL BATCH FUND</span>
                  <span style={{ color: 'var(--primary-blue)' }}><FundIcon size={16} /></span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rs. {batchFundTotal.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shared batch transparent ledger</div>
              </div>

              {/* Payment Status Card */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PAYMENT STATUS</span>
                  <span>🛡️</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
                  {remainingDues > 0 ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', backgroundColor: '#f59e0b', color: '#fff' }}>Pending Dues</span>
                  ) : (
                    <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>Verified Member</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {remainingDues > 0 ? "Please complete remaining payments" : "All payment checks approved"}
                </div>
              </div>

            </div>

            {/* Custom Interactive SVG charts for Student */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>

              {/* Chart 1: Personal Contribution History Chart */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>My Contribution History</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#7c3aed' }}></span>
                    <span style={{ color: 'var(--text-muted)' }}>Paid Amount (Rs.)</span>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <svg viewBox="0 0 360 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                    {/* Y scale grid lines */}
                    {[0, 250, 500].map((val, idx) => {
                      const y = 10 + 100 * (1 - val / 500);
                      return (
                        <g key={idx}>
                          <line x1="30" y1={y} x2="350" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="24" y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">Rs. {val}</text>
                        </g>
                      );
                    })}

                    {/* Bars for Jan-Jun based on real monthly data */}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, idx) => {
                      const x = 50 + idx * 50;
                      const val = monthlyPaid[idx] || 0;
                      // Maximum val is 500, baseline starts at y=110
                      const h = Math.min(100, (val / 500) * 100);
                      const y = 110 - h;
                      return (
                        <g key={idx} style={{ cursor: 'pointer' }}>
                          <title>{`${m}: Rs. ${val}`}</title>
                          <rect x={x} y={y} width="18" height={h} fill="url(#purple-grad)" rx="4" />
                          <text x={x + 9} y="128" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontWeight="600">{m}</text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Chart 2: Batch Fund overall progress Dial */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Batch Fund Collection Dial</h3>

                {(() => {
                  const percent = Math.min(100, Math.round((generalStats.totalCollected / (generalStats.targetSemester || 240000)) * 100)) || 0;
                  const circ = 301.6;
                  const offset = circ * (1 - percent / 100);
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexGrow: 1, flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        {/* Circle dial */}
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="48" fill="transparent" stroke="var(--border-color)" strokeWidth="10" />
                          <circle cx="60" cy="60" r="48" fill="transparent" stroke="#2563eb" strokeWidth="10" strokeDasharray="301.6" strokeDashoffset={offset} transform="rotate(-90 60 60)" style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 0.5s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{percent}%</span>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Collection Rate</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', maxWidth: '160px' }}>
                          Rs. {generalStats.totalCollected.toLocaleString()} has been collected out of target Rs. {(generalStats.targetSemester || 240000).toLocaleString()} for the semester.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Announcements & Upcoming Events preview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '1.5rem'
            }} className="dashboard-grid-bottom">

              {/* Latest Announcements */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Batch Announcements</h3>
                  <button onClick={() => setActiveTab('Announcements')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'rgba(124, 58, 237, 0.03)',
                      border: '1px solid var(--border-color)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ann.title}</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSVP Events list */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upcoming Events & RSVP</h3>
                  <button onClick={() => setActiveTab('Events')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {memberEvents.map((ev) => (
                    <div key={ev.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-app)'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{ev.title}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date: {ev.date}</span>
                      </div>
                      <button
                        onClick={() => toggleRSVP(ev.id, ev.rsvp)}
                        className={`btn ${ev.rsvp === 'Attending' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {ev.rsvp === 'Attending' ? '✓ Attending' : 'RSVP Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MY CONTRIBUTIONS */}
        {activeTab === 'My Contributions' && (
          <div className="glass-card animate-fade">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: '700' }}>My Contribution Status</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your batch payments are audited by coordinators. Below is your detailed balance ledger for the current semester.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL PAID</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>Rs. {amountContributed.toLocaleString()}</h3>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>REMAINING BALANCE</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Rs. 0</h3>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>NEXT DUE DATE</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-purple)' }}>July 10, 2026</h3>
              </div>
            </div>

            <div style={{ background: 'rgba(37,99,235,0.05)', padding: '1rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <strong>Payment Reminder:</strong> Standard monthly contributions (Rs. 500) are collected by the 10th of every month. Payments can be directly transferred via UPI to the batch coordinator.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY */}
        {activeTab === 'Payment History' && (
          <div className="glass-card animate-fade">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: '700' }}>My Payment Ledger</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official log of all verified payments. Click "Download Receipt" to save your records.</span>

            <div className="table-container" style={{ marginTop: '1.5rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Transaction Reference</th>
                    <th>Payment Date</th>
                    <th>Payment Category</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{p.txId}</td>
                      <td>{p.date}</td>
                      <td>{p.purpose}</td>
                      <td>{p.mode}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {p.amount}</td>
                      <td>
                        <span className="badge badge-success">{p.status}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => openReceiptModal(p)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <DownloadIcon size={12} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EVENTS */}
        {activeTab === 'Events' && (
          <div className="animate-fade">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Upcoming Student Activities</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review and RSVP for scheduled batch gatherings and project assessments.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {memberEvents.map((ev) => (
                <div key={ev.id} className="glass-card active-border">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ background: 'rgba(124, 58, 237, 0.08)', color: 'var(--primary-purple)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {ev.date}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                      {ev.fee > 0 ? `Entry Cost: Rs. ${ev.fee}` : 'Free Entry'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', height: '40px', overflow: 'hidden' }}>{ev.desc}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Venue:</span> <strong style={{ color: 'var(--text-main)' }}>{ev.venue}</strong>
                    </div>

                    <button
                      onClick={() => toggleRSVP(ev.id, ev.rsvp)}
                      className={`btn ${ev.rsvp === 'Attending' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        background: ev.rsvp === 'Attending' ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'var(--border-color)',
                        boxShadow: ev.rsvp === 'Attending' ? '0 4px 10px rgba(124,58,237,0.2)' : 'none'
                      }}
                    >
                      {ev.rsvp === 'Attending' ? '✓ I am Attending' : 'RSVP: Unconfirmed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'Announcements' && (
          <div className="glass-card animate-fade">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: '700' }}>Batch Circulars & Notices</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official notifications broadcast by batch coordinators and core committees.</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.75rem' }}>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{ann.title}</h3>
                      <span className={`badge ${ann.priority === 'High' ? 'badge-danger' : ann.priority === 'Normal' ? 'badge-info' : 'badge-success'
                        }`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                        {ann.priority} Priority
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Broadcast: {ann.date}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="glass-card animate-fade" style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: '700' }}>Account Settings</h2>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.regNumber}
                    onChange={e => setProfileForm({ ...profileForm, regNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Degree Program</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.degreeProgram}
                    onChange={e => setProfileForm({ ...profileForm, degreeProgram: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.batch}
                    onChange={e => setProfileForm({ ...profileForm, batch: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.contactNumber}
                  onChange={e => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                  required
                />
              </div>

              {saveMessage && (
                <div style={{
                  color: saveMessage.type === 'success' ? '#4caf50' : '#f44336',
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  background: saveMessage.type === 'success' ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)',
                  borderRadius: '6px'
                }}>
                  {saveMessage.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ padding: '0.6rem 1.2rem', minWidth: '120px' }}>
                  {savingProfile ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Digital Receipt Modal */}
      {modalType === 'receipt' && (
        <QuickActionModal
          type="receipt"
          onClose={() => setModalType(null)}
          data={selectedReceiptData}
        />
      )}

      {/* Hover States Styling CSS */}
      <style>{`
        .sidebar-btn-hover:hover {
          background: rgba(124, 58, 237, 0.05) !important;
          color: var(--text-main) !important;
        }
        @media (min-width: 1025px) {
          .sidebar-aside {
            transform: translateX(0) !important;
          }
        }
        @media (max-width: 1024px) {
          .sidebar-aside {
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid-bottom {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default MemberDashboard;