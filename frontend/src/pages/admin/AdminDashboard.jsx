import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardIcon, StudentsIcon, FundIcon, IncomeIcon, ExpenseIcon,
  EventIcon, AnalyticsIcon, SettingsIcon, LogoutIcon, PlusIcon,
  DownloadIcon, BellIcon, InfoIcon, CheckIcon, TrashIcon, EditIcon
} from '../../components/Icons';
import { Navbar } from '../../components/Navbar';
import { QuickActionModal } from '../../components/QuickActionModal';
import {
  IncomeExpenseBarChart,
  FundDistributionPieChart
} from '../../components/Charts';
import API_BASE from '../../services/api';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'add-income', 'add-expense', 'create-event', 'generate-report', 'receipt'
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  // Stats aggregate values
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingCount: 0,
    memberCount: 0,
    recentActivity: []
  });

  // Database lists
  const [students, setStudents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [slips, setSlips] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', priority: 'Normal' });
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState(null);

  // Fetch token helper
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

      // Load dashboard stats
      const statsRes = await fetch(`${API_BASE}/api/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Load members
      const membersRes = await fetch(`${API_BASE}/api/admin/members`, { headers });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setStudents(membersData.members);
      }

      // Load expenses
      const expensesRes = await fetch(`${API_BASE}/api/admin/expenses`, { headers });
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData.expenses);
      }

      // Load events
      const eventsRes = await fetch(`${API_BASE}/api/admin/events`, { headers });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events);
      }

      // Load slips
      const slipsRes = await fetch(`${API_BASE}/api/admin/slips`, { headers });
      if (slipsRes.ok) {
        const slipsData = await slipsRes.json();
        setSlips(slipsData.payments);
      }

      // Load announcements
      const annRes = await fetch(`${API_BASE}/api/admin/announcements`, { headers });
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }

    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    }
  };

  // Run on load
  useEffect(() => {
    loadAllData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleModalSubmit = async (formData) => {
    const headers = getAuthHeaders();
    try {
      if (modalType === 'add-expense') {
        const res = await fetch(`${API_BASE}/api/admin/expenses`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            item: formData.itemName,
            amount: Number(formData.amount),
            date: formData.date,
            category: formData.category,
            spentBy: formData.spentBy,
            desc: formData.description
          })
        });
        if (res.ok) {
          loadAllData();
        } else {
          const err = await res.json();
          alert(err.message || "Failed to add expense");
        }
      } else if (modalType === 'create-event') {
        const res = await fetch(`${API_BASE}/api/admin/events`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            eventTitle: formData.eventTitle,
            date: formData.date,
            venue: formData.venue,
            contributionAmount: Number(formData.contributionAmount),
            description: formData.description
          })
        });
        if (res.ok) {
          loadAllData();
        } else {
          const err = await res.json();
          alert(err.message || "Failed to create event");
        }
      }
    } catch (error) {
      console.error("Modal submit failed:", error);
    }
  };

  const deleteStudent = async (uid) => {
    if (window.confirm("Are you sure you want to delete this student record from authentication and database?")) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/members/${uid}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        if (res.ok) {
          loadAllData();
        } else {
          const err = await res.json();
          alert(err.message || "Failed to delete student");
        }
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
  };

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to remove this expense record?")) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/expenses/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        if (res.ok) {
          loadAllData();
        } else {
          const err = await res.json();
          alert(err.message || "Failed to delete expense");
        }
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to remove this event record?")) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/events/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        if (res.ok) {
          loadAllData();
        } else {
          const err = await res.json();
          alert(err.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const handleSendReminder = async (uid, name, regNumber) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/members/${uid}/remind`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: `Hi ${name}, this is a reminder from the batch coordinator. Please settle your outstanding batch fund contributions as soon as possible.`
        })
      });
      if (res.ok) {
        alert(`Reminder notification sent successfully to ${name} (${regNumber || ''})!`);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to send reminder.");
      }
    } catch (error) {
      console.error("Failed to send reminder:", error);
      alert("Failed to send reminder due to a network error.");
    }
  };

  const approveSlip = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/slips/${id}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to approve slip");
      }
    } catch (error) {
      console.error("Approve slip failed:", error);
    }
  };

  const rejectSlip = async (id) => {
    const reason = prompt("Enter the reason for rejection:");
    if (reason === null) return; // cancelled
    try {
      const res = await fetch(`${API_BASE}/api/admin/slips/${id}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNote: reason })
      });
      if (res.ok) {
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to reject slip");
      }
    } catch (error) {
      console.error("Reject slip failed:", error);
    }
  };

  const openReceipt = (student) => {
    setSelectedReceiptData({
      student: student.name,
      rollNo: student.regNumber || student.roll,
      amount: student.amountPaid,
      date: student.lastPaymentDate || student.date || '2026-06-15',
      purpose: 'Regular Batch Contributions',
      txId: `TXN${1000000000 + Math.floor(Math.random() * 900000000)}`
    });
    setModalType('receipt');
  };

  const createAnnouncement = async () => {
    const { title, content, priority } = announcementForm;
    if (!title.trim() || !content.trim()) {
      setAnnouncementMsg({ type: 'error', text: 'Title and content are required.' });
      return;
    }
    setAnnouncementLoading(true);
    setAnnouncementMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: title.trim(), content: content.trim(), priority })
      });
      if (res.ok) {
        setAnnouncementForm({ title: '', content: '', priority: 'Normal' });
        setAnnouncementMsg({ type: 'success', text: 'Announcement posted successfully!' });
        loadAllData();
      } else {
        const err = await res.json();
        setAnnouncementMsg({ type: 'error', text: err.message || 'Failed to post announcement.' });
      }
    } catch (error) {
      setAnnouncementMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement? It will no longer be visible to members.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete announcement.');
      }
    } catch (error) {
      console.error('Delete announcement failed:', error);
    }
  };

  const triggerMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery) ||
    s.regNumber?.toLowerCase().includes(searchQuery) ||
    s.status?.toLowerCase().includes(searchQuery)
  );

  const filteredExpenses = expenses.filter(e =>
    e.item?.toLowerCase().includes(searchQuery) ||
    e.category?.toLowerCase().includes(searchQuery) ||
    e.spentBy?.toLowerCase().includes(searchQuery)
  );

  // Stats calculation mapped to state
  const totalBalance = stats.totalBalance;
  const totalIncome = stats.totalIncome;
  const totalExpenses = stats.totalExpenses;
  const pendingContributions = stats.pendingCount;
  const numStudents = stats.memberCount;
  const upcomingEventsCount = events.length;
  const activities = stats.recentActivity;

  const sidebarItems = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Students', icon: <StudentsIcon /> },
    { name: 'Slip Reviews', icon: <BellIcon /> },
    { name: 'Fund Management', icon: <FundIcon /> },
    { name: 'Income Records', icon: <IncomeIcon /> },
    { name: 'Expense Records', icon: <ExpenseIcon /> },
    { name: 'Event Management', icon: <EventIcon /> },
    { name: 'Announcements', icon: <BellIcon /> },
    { name: 'Reports & Analytics', icon: <AnalyticsIcon /> },
    { name: 'Settings', icon: <SettingsIcon /> },
  ];

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
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.1rem'
          }}>
            🔀
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', lineHeight: 1.2 }}>FundTracker</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>University Core</span>
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
                  setActiveTab(item.name);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--primary-gradient)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
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
          title={`Admin / ${activeTab}`}
          userRole="Admin"
          onSearch={handleSearch}
          toggleMobileSidebar={triggerMobileToggle}
          onSettings={() => setActiveTab('Settings')}
        />

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade">

            {/* Quick Actions Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome, Coordinator</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Here is your batch financial health summary.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16} /> Add Income</button>
                <button onClick={() => setModalType('add-expense')} className="btn btn-secondary"><PlusIcon size={16} /> Add Expense</button>
                <button onClick={() => setModalType('create-event')} className="btn btn-outline"><EventIcon size={16} /> Create Event</button>
                <button onClick={() => setModalType('generate-report')} className="btn btn-secondary"><DownloadIcon size={16} /> Generate Report</button>
              </div>
            </div>

            {/* Grid of Widget Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>

              {/* Balance Widget */}
              <div className="glass-card active-border">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL BATCH BALANCE</span>
                  <span style={{ color: 'var(--primary-blue)', background: 'rgba(37,99,235,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>Active</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Rs. {totalBalance.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>↗ 12% increase</span>
                  <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
                </div>
              </div>

              {/* Total Income Widget */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL INCOME</span>
                  <span style={{ color: 'var(--success)' }}><IncomeIcon size={16} /></span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rs. {totalIncome.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated this academic year</div>
              </div>

              {/* Total Expenses Widget */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL EXPENSES</span>
                  <span style={{ color: 'var(--danger)' }}><ExpenseIcon size={16} /></span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Rs. {totalExpenses.toLocaleString()}</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across events, supplies & trips</div>
              </div>

              {/* Pending Contributions Widget */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PENDING DUES</span>
                  <span style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>Action Required</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--danger)' }}>{pendingContributions} Students</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated deficit: Rs. 27,000</div>
              </div>

              {/* Students Count Widget */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>REGISTERED STUDENTS</span>
                  <span>👥</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>{numStudents} Members</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>100% profile completions</div>
              </div>

              {/* Upcoming Events Widget */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>UPCOMING EVENTS</span>
                  <span>📅</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>{upcomingEventsCount} Scheduled</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-purple)' }}>Next: Farewell Gala on July 15</div>
              </div>

            </div>

            {/* Charts & Analytics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <IncomeExpenseBarChart slips={slips} expenses={expenses} />
              <FundDistributionPieChart expenses={expenses} />
            </div>

            {/* Bottom Section: Recent Activities & Fast Tables */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr',
              gap: '1.5rem'
            }} className="dashboard-grid-bottom">

              {/* Payment Status Preview Table */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Student Payment Summary</h3>
                  <button onClick={() => setActiveTab('Students')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View All</button>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Contributed</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 4).map((s) => (
                        <tr key={s.uid || s.id}>
                          <td style={{ fontWeight: '500' }}>{s.name}</td>
                          <td>{s.regNumber || s.roll}</td>
                          <td style={{ fontWeight: '600' }}>Rs. {s.amountPaid.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${s.status === 'Paid' ? 'badge-success' : s.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                              }`}>{s.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openReceipt(s)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>Receipt</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Operations Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{
                        padding: '0.4rem',
                        borderRadius: '8px',
                        background: act.type === 'payment' ? 'rgba(16,185,129,0.08)' : act.type === 'expense' ? 'rgba(239,68,68,0.08)' : 'rgba(124,58,237,0.08)',
                        color: act.type === 'payment' ? 'var(--success)' : act.type === 'expense' ? 'var(--danger)' : 'var(--primary-purple)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '0.15rem'
                      }}>
                        {act.type === 'payment' ? '📥' : act.type === 'expense' ? '📤' : '📣'}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: '500' }}>{act.text}</p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: STUDENTS TAB */}
        {activeTab === 'Students' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Monthly Fund Collection</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log contributions and view balances for all {students.length} students.</span>
              </div>
              <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16} /> Record Student Payment</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Contributed</th>
                    <th>Dues Outstanding</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.uid || s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.regNumber || s.roll}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {s.amountPaid.toLocaleString()}</td>
                      <td style={{ fontWeight: '700', color: (3000 - s.amountPaid) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Rs. {Math.max(0, 3000 - s.amountPaid).toLocaleString()}</td>
                      <td>{s.lastPaymentDate || s.date || '-'}</td>
                      <td>
                        <span className={`badge ${s.status === 'Paid' ? 'badge-success' : s.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                          }`}>{s.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openReceipt(s)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>Receipt</button>
                          {s.amountPaid < 3000 && (
                            <button
                              onClick={() => handleSendReminder(s.uid, s.name, s.regNumber)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary-purple)', borderColor: 'var(--primary-purple)' }}
                            >
                              Remind
                            </button>
                          )}
                          <button onClick={() => deleteStudent(s.uid || s.id)} className="btn" style={{ padding: '0.35rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SLIP REVIEWS TAB */}
        {activeTab === 'Slip Reviews' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Review Payment Slips</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verify receipts uploaded by students and approve/reject contributions.</span>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Slip File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.map((slip) => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: '600' }}>{slip.name}</td>
                      <td>{slip.email}</td>
                      <td style={{ fontFamily: 'monospace' }}>{slip.regNumber || '-'}</td>
                      <td style={{ fontWeight: '700' }}>Rs. {slip.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${slip.status === 'approved' ? 'badge-success' : slip.status === 'pending' ? 'badge-warning' : 'badge-danger'
                          }`}>{slip.status}</span>
                      </td>
                      <td>
                        {slip.slipUrl ? (
                          <a
                            href={slip.slipUrl.startsWith('http') ? slip.slipUrl : `${API_BASE}${slip.slipUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary-blue)', textDecoration: 'underline', fontSize: '0.85rem' }}
                          >
                            View Receipt File
                          </a>
                        ) : '-'}
                      </td>
                      <td>
                        {slip.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => approveSlip(slip.id)}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.60rem', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectSlip(slip.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.60rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {slip.status === 'rejected' && slip.adminNote ? `Rejected: ${slip.adminNote}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {slips.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No slip uploads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FUND MANAGEMENT TAB */}
        {activeTab === 'Fund Management' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: '700' }}>Overall Fund Administration</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track general budget targets, approvals, and allocation pools.</span>

              {/* Financial Progress Indicator */}
              <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '600' }}>Academic Year Collection Target</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-blue)' }}>88% Achieved (Rs. 2,12,000 / Rs. 2,40,000)</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'var(--primary-gradient)', borderRadius: '9999px' }}></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Funding Pools</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Farewell Pool</span>
                      <span style={{ fontWeight: '600' }}>Rs. 45,000 of Rs. 60,000</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: '#2563eb' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Batch Trip Pool</span>
                      <span style={{ fontWeight: '600' }}>Rs. 32,000 of Rs. 50,000</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '64%', height: '100%', background: '#7c3aed' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Supplies & Printing Pool</span>
                      <span style={{ fontWeight: '600' }}>Rs. 15,000 of Rs. 15,000</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: '#06b6d4' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Governance Rules</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span>
                    <span>All expenses &gt; Rs. 5,000 require coordinator sign-off.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span>
                    <span>Automatic payment reminders every 1st of the month.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span>
                    <span>Digital receipts auto-generated and emailed upon verification.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span>
                    <span>Open-book policy: any student can view overall statements.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INCOME RECORDS TAB */}
        {activeTab === 'Income Records' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Income Ledger</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lists of all receipts, student contributions, and sponsorship inputs.</span>
              </div>
              <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16} /> Log Income</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Contributor</th>
                    <th>Roll No</th>
                    <th>Type/Purpose</th>
                    <th>Mode</th>
                    <th>Received Date</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.filter(slip => slip.status === 'approved').map((slip, idx) => (
                    <tr key={slip.id}>
                      <td style={{ fontFamily: 'monospace' }}>INC{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>{slip.name}</td>
                      <td>{slip.regNumber || '-'}</td>
                      <td>Monthly Contribution</td>
                      <td>UPI / Bank Transfer</td>
                      <td>{slip.createdAt ? new Date(slip.createdAt).toLocaleDateString("en-GB") : '-'}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {slip.amount?.toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => openReceipt({
                            name: slip.name,
                            roll: slip.regNumber,
                            amountPaid: slip.amount,
                            date: slip.createdAt ? new Date(slip.createdAt).toLocaleDateString("en-GB") : '-'
                          })}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          <DownloadIcon size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {slips.filter(slip => slip.status === 'approved').length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No approved income records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EXPENSE RECORDS TAB */}
        {activeTab === 'Expense Records' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Expense Ledger</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tracking of all funds disbursed for student activities, events, and supplies.</span>
              </div>
              <button onClick={() => setModalType('add-expense')} className="btn btn-primary"><PlusIcon size={16} /> Record Expense</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Expense Item</th>
                    <th>Category</th>
                    <th>Spent By</th>
                    <th>Brief Details</th>
                    <th>Date Disbursed</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: '600' }}>{exp.item}</td>
                      <td>
                        <span className={`badge ${exp.category === 'Events' ? 'badge-info' : exp.category === 'Supplies' ? 'badge-warning' : exp.category === 'Charity' ? 'badge-success' : 'badge-danger'
                          }`}>{exp.category}</span>
                      </td>
                      <td>{exp.spentBy}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.desc}</td>
                      <td>{exp.date}</td>
                      <td style={{ fontWeight: '700', color: 'var(--danger)' }}>Rs. {exp.amount.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button onClick={() => deleteExpense(exp.id)} className="btn" style={{ padding: '0.35rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No expense records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: EVENT MANAGEMENT TAB */}
        {activeTab === 'Event Management' && (
          <div className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Event & Activity Planning</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage student events, RSVPs, and related ticket pricing contributions.</span>
              </div>
              <button onClick={() => setModalType('create-event')} className="btn btn-primary"><PlusIcon size={16} /> Setup New Event</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {events.map((event) => (
                <div key={event.id} className="glass-card active-border">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary-blue)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {event.date}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-purple)' }}>
                        {event.dues > 0 ? `Cost: Rs. ${event.dues}/head` : 'Free Event'}
                      </span>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="btn"
                        style={{ padding: '0.2rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Delete Event"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', height: '40px', overflow: 'hidden' }}>{event.desc}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Venue:</span> <strong style={{ color: 'var(--text-main)' }}>{event.venue}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>RSVPs:</span> <strong style={{ color: 'var(--success)' }}>{event.rsvp} Students</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ANNOUNCEMENTS TAB */}
        {activeTab === 'Announcements' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Create Announcement Form */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📢</span>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Post New Announcement</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>The latest announcement will appear on the member home screen.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Announcement Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Monthly contribution deadline extended"
                      value={announcementForm.title}
                      onChange={e => setAnnouncementForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={announcementForm.priority}
                      onChange={e => setAnnouncementForm(f => ({ ...f, priority: e.target.value }))}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Message / Content *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Write the full announcement message here..."
                    value={announcementForm.content}
                    onChange={e => setAnnouncementForm(f => ({ ...f, content: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>

                {announcementMsg && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--border-radius-md)',
                    background: announcementMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: announcementMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {announcementMsg.type === 'success' ? '✓ ' : '✕ '}{announcementMsg.text}
                  </div>
                )}

                <div>
                  <button
                    onClick={createAnnouncement}
                    disabled={announcementLoading}
                    className="btn btn-primary"
                    style={{ opacity: announcementLoading ? 0.7 : 1 }}
                  >
                    {announcementLoading ? 'Posting...' : <><span>📣</span> Post Announcement</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Announcements List */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>All Announcements</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{announcements.length} total • newest first</span>
              </div>

              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                  <p style={{ fontWeight: '500' }}>No announcements posted yet.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Use the form above to post your first announcement.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.map((ann, idx) => (
                    <div
                      key={ann.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--border-radius-md)',
                        border: `1px solid ${
                          idx === 0 ? 'var(--primary-blue)' : 'var(--border-color)'
                        }`,
                        background: idx === 0
                          ? 'rgba(37,99,235,0.04)'
                          : 'rgba(255,255,255,0.02)',
                        position: 'relative'
                      }}
                    >
                      {idx === 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '3rem',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          color: 'var(--primary-blue)',
                          background: 'rgba(37,99,235,0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Latest • Shown on Member Home</span>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, paddingRight: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{ann.title}</h4>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: ann.priority === 'Urgent' ? 'rgba(239,68,68,0.1)'
                                : ann.priority === 'Important' ? 'rgba(245,158,11,0.1)'
                                : 'rgba(16,185,129,0.1)',
                              color: ann.priority === 'Urgent' ? 'var(--danger)'
                                : ann.priority === 'Important' ? 'var(--warning)'
                                : 'var(--success)'
                            }}>{ann.priority}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.4rem 0', lineHeight: '1.5' }}>{ann.content}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {ann.createdAt ? new Date(ann.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown date'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="btn"
                          title="Delete announcement"
                          style={{ padding: '0.35rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', flexShrink: 0 }}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="glass-card animate-fade" style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', fontWeight: '700' }}>System Configurations</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Active Academic Year</label>
                  <select className="form-input" defaultValue="2025-2026">
                    <option value="2025-2026">2025 - 2026</option>
                    <option value="2026-2027">2026 - 2027</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Batch Size Limit</label>
                  <input type="number" className="form-input" defaultValue="68" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Standard Monthly Contribution (Rs.)</label>
                  <input type="number" className="form-input" defaultValue="500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Due Date</label>
                  <input type="number" className="form-input" defaultValue="10" min="1" max="28" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  Enable automatic WhatsApp/Email dues reminders
                </label>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  Allow students to upload receipts directly for approval
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => alert("Settings saved successfully!")} className="btn btn-primary">Save Settings</button>
                <button className="btn btn-secondary">Restore Defaults</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Modals */}
      {modalType && (
        <QuickActionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleModalSubmit}
          data={selectedReceiptData}
        />
      )}

      {/* Responsive adjustments CSS */}
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

export default AdminDashboard;
