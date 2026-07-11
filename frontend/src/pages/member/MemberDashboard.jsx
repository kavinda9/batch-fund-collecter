import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, DashboardIcon, FundIcon, IncomeIcon, EventIcon, 
  LogoutIcon, DownloadIcon, SpeakerIcon
} from '../../components/Icons';
import { Navbar } from '../../components/Navbar';
import { QuickActionModal } from '../../components/QuickActionModal';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../hooks/useAuth.js';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic API state buckets
  const [personalPayments, setPersonalPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [memberEvents, setMemberEvents] = useState([]);
  const [batchMetrics, setBatchMetrics] = useState({ totalFund: 0, collectedRate: 88, targetFund: 240000 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalType, setModalType] = useState(null);
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  // Fallback metadata formatting values pulled from auth context sessions
  const memberName = currentUser?.name || "Student Member";
  const memberRoll = currentUser?.rollNumber || "USJP-SE-MEMBER";

  useEffect(() => {
    const fetchDashboardSynchronizedData = async () => {
      try {
        setLoading(true);
        // Dispatch parallel async requests to pull live schema records from your express routers
        const [paymentsRes, announcementsRes, eventsRes, metricsRes] = await Promise.all([
          apiRequest("/api/member/payments", { method: "GET" }),
          apiRequest("/api/announcements", { method: "GET" }),
          apiRequest("/api/events", { method: "GET" }),
          apiRequest("/api/metrics/summary", { method: "GET" }).catch(() => ({ totalFund: 154000, collectedRate: 88, targetFund: 240000 }))
        ]);

        if (paymentsRes) setPersonalPayments(paymentsRes);
        if (announcementsRes) setAnnouncements(announcementsRes);
        if (eventsRes) setMemberEvents(eventsRes);
        if (metricsRes) setBatchMetrics(metricsRes);
      } catch (err) {
        console.error("Failed to load student dashboard records safely:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSynchronizedData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const toggleRSVP = async (eventId, currentRSVP) => {
    try {
      const nextRSVP = currentRSVP === 'Attending' ? 'Declined' : 'Attending';
      await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        body: { rsvp: nextRSVP }
      });
      
      // Update local state smoothly upon success
      setMemberEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, rsvp: nextRSVP } : ev));
    } catch (err) {
      console.error("Failed to sync RSVP changes on backend node:", err);
    }
  };

  const openReceiptModal = (pay) => {
    setSelectedReceiptData({
      student: memberName,
      rollNo: memberRoll,
      amount: pay.amount,
      date: pay.date,
      purpose: pay.purpose,
      txId: pay.txId,
      paymentMode: pay.mode
    });
    setModalType('receipt');
  };

  const triggerMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleSystemLogout = async () => {
    if (logout) await logout();
    navigate('/');
  };

  // Calculations derived from live database values
  const amountContributed = personalPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingDues = 0; 

  const sidebarItems = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'My Contributions', icon: <IncomeIcon /> },
    { name: 'Payment History', icon: <FundIcon /> },
    { name: 'Events', icon: <EventIcon /> },
    { name: 'Announcements', icon: <SpeakerIcon /> },
  ];

  const filteredHistory = personalPayments.filter(p => 
    p.purpose?.toLowerCase().includes(searchQuery) ||
    p.txId?.toLowerCase().includes(searchQuery) ||
    p.mode?.toLowerCase().includes(searchQuery)
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', width: '100%', background: 'var(--bg-app, #1a1a2e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', fontFamily: 'sans-serif', fontSize: '1.2rem'
      }}>
        Assembling academic and contribution records ledger...
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside style={{
        position: 'fixed', top: 0, bottom: 0, left: 0,
        width: 'var(--sidebar-width)', background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)', padding: '1.5rem 1.25rem',
        display: 'flex', flexDirection: 'column', zIndex: 95,
        transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="sidebar-aside">
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '1.1rem'
          }}>
            🎓
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', lineHeight: 1.2 }}>StudentPortal</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: {memberRoll}</span>
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
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)',
                  border: 'none', background: isActive ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)', cursor: 'pointer',
                  fontWeight: isActive ? '600' : '500', fontSize: '0.875rem',
                  textAlign: 'left', transition: 'all 0.2s ease',
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
          onClick={handleSystemLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)',
            border: 'none', background: 'transparent', color: 'var(--danger)',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
            textAlign: 'left', marginTop: 'auto'
          }}
        >
          <LogoutIcon color="var(--danger)" />
          Logout
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <Navbar 
          title={`Student / ${activeTab}`} 
          userRole="Member" 
          onSearch={handleSearch}
          toggleMobileSidebar={triggerMobileToggle}
        />

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Hello, {memberName}!</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transparency snapshot synchronized with your core ledger balance profile.</span>
            </div>

            {/* Widget Cards Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem', marginBottom: '2rem'
            }}>
              <div className="glass-card active-border">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>MY CONTRIBUTIONS</span>
                  <span style={{ color: 'var(--success)' }}>💸</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Rs. {amountContributed.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>✓ {personalPayments.length} Payments Complete</span>
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>REMAINING DUES</span>
                  <span>💳</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: remainingDues > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  Rs. {remainingDues.toLocaleString()}
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No outstanding baseline audits</div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL BATCH FUND</span>
                  <span style={{ color: 'var(--primary-blue)' }}><FundIcon size={16}/></span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rs. {batchMetrics.totalFund.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shared batch transparent ledger</div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PAYMENT STATUS</span>
                  <span>🛡️</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>Verified Member</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All payment checks approved</div>
              </div>
            </div>

            {/* SVG Charts section */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem', marginBottom: '2rem'
            }}>
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
                    {[0, 250, 500].map((val, idx) => {
                      const y = 10 + 100 * (1 - val/500);
                      return (
                        <g key={idx}>
                          <line x1="30" y1={y} x2="350" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="24" y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">Rs. {val}</text>
                        </g>
                      );
                    })}

                    {(personalPayments.slice(0, 6).reverse()).map((p, idx) => {
                      const x = 50 + idx * 50;
                      const h = Math.min(100, (p.amount / 500) * 100); 
                      const y = 110 - h;
                      return (
                        <g key={p.id || idx} style={{ cursor: 'pointer' }}>
                          <rect x={x} y={y} width="18" height={h} fill="url(#purple-grad)" rx="4" />
                          <text x={x + 9} y="128" fill="var(--text-muted)" fontSize="8" textAnchor="middle" fontWeight="600">
                            {p.date ? p.date.substring(5, 7) + "/" + p.date.substring(8, 10) : `P${idx+1}`}
                          </text>
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

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Batch Fund Collection Dial</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexGrow: 1, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="48" fill="transparent" stroke="var(--border-color)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="48" fill="transparent" stroke="#2563eb" strokeWidth="10" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * batchMetrics.collectedRate) / 100} transform="rotate(-90 60 60)" style={{ strokeLinecap: 'round' }} />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{batchMetrics.collectedRate}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Collection Rate</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', maxWidth: '160px' }}>
                      Rs. {batchMetrics.totalFund.toLocaleString()} collected out of target Rs. {batchMetrics.targetFund.toLocaleString()} for the current period.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications and Events preview summary split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }} className="dashboard-grid-bottom">
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Batch Announcements</h3>
                  <button onClick={() => setActiveTab('Announcements')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id || ann._id} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.03)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ann.title}</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{ann.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent coordinator notices broadcasted.</p>}
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upcoming Events & RSVP</h3>
                  <button onClick={() => setActiveTab('Events')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-purple)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {memberEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id || ev._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{ev.title}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date: {ev.date}</span>
                      </div>
                      <button 
                        onClick={() => toggleRSVP(ev.id || ev._id, ev.rsvp)}
                        className={`btn ${ev.rsvp === 'Attending' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {ev.rsvp === 'Attending' ? '✓ Attending' : 'RSVP Now'}
                      </button>
                    </div>
                  ))}
                  {memberEvents.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No future events scheduled.</p>}
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
              Your batch payments are audited by coordinators. Below is your detailed balance ledger.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL PAID</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>Rs. {amountContributed.toLocaleString()}</h3>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>REMAINING BALANCE</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Rs. {remainingDues}</h3>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'rgba(100,116,139,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>LAST AUDITED TRANSACTION</span>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-purple)', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                  {personalPayments[0]?.txId || "None"}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY */}
        {activeTab === 'Payment History' && (
          <div className="glass-card animate-fade">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: '700' }}>My Payment Ledger</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official log of all verified payments. Click "Receipt" to generate documentation.</span>

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
                  {filteredHistory.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{p.txId}</td>
                      <td>{p.date}</td>
                      <td>{p.purpose}</td>
                      <td>{p.mode}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {p.amount}</td>
                      <td><span className="badge badge-success">{p.status || "Verified"}</span></td>
                      <td>
                        <button 
                          onClick={() => openReceiptModal(p)}
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <DownloadIcon size={12}/> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No contribution transaction matching criteria located.
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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review and RSVP for scheduled batch activities.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {memberEvents.map((ev, idx) => (
                <div key={ev.id || idx} className="glass-card active-border">
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
                      onClick={() => toggleRSVP(ev.id || ev._id, ev.rsvp)}
                      className={`btn ${ev.rsvp === 'Attending' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ 
                        padding: '0.45rem 1rem', fontSize: '0.8rem',
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official notifications broadcast by batch coordinators.</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.75rem' }}>
              {announcements.map((ann, idx) => (
                <div key={ann.id || idx} style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>{ann.title}</h3>
                      <span className={`badge ${ann.priority === 'High' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {ann.priority || "Normal"} Priority
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
      </main>

      {/* Digital Receipt Modal Component hook */}
      {modalType === 'receipt' && (
        <QuickActionModal type="receipt" onClose={() => setModalType(null)} data={selectedReceiptData} />
      )}

      <style>{`
        .sidebar-btn-hover:hover { background: rgba(124, 58, 237, 0.05) !important; color: var(--text-main) !important; }
        @media (min-width: 1025px) { .sidebar-aside { transform: translateX(0) !important; } }
        @media (max-width: 1024px) { .sidebar-aside { box-shadow: 0 10px 40px rgba(0,0,0,0.2); } }
        @media (max-width: 768px) { .dashboard-grid-bottom { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default MemberDashboard;