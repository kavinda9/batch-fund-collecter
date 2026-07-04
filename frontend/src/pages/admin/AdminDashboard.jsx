import React, { useState } from 'react';
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [modalType, setModalType] = useState(null); // 'add-income', 'add-expense', 'create-event', 'generate-report', 'receipt'
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  // Mock data states
  const [students, setStudents] = useState([
    { id: 1, name: 'Rahul Verma', roll: '22BCS108', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-15', monthsPaid: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    { id: 2, name: 'Amit Kumar', roll: '22BCS012', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-20', monthsPaid: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    { id: 3, name: 'Priyanshu Sharma', roll: '22BCS015', amountPaid: 1500, dues: 1500, status: 'Partially Paid', date: '2026-05-10', monthsPaid: ['Jan', 'Feb', 'Mar'] },
    { id: 4, name: 'Sneha Patel', roll: '22BCS144', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-28', monthsPaid: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    { id: 5, name: 'Divya Teja', roll: '22BCS041', amountPaid: 0, dues: 3000, status: 'Unpaid', date: '-', monthsPaid: [] },
    { id: 6, name: 'Rohan Das', roll: '22BCS092', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-14', monthsPaid: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    { id: 7, name: 'Anjali Gupta', roll: '22BCS021', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-19', monthsPaid: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    { id: 8, name: 'Tarun Sen', roll: '22BCS120', amountPaid: 1500, dues: 1500, status: 'Partially Paid', date: '2026-05-25', monthsPaid: ['Jan', 'Feb', 'Mar'] }
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, item: 'Farewell DJ Booking', amount: 12000, date: '2026-06-25', category: 'Events', spentBy: 'Farewell Committee', desc: 'Downpayment for Sound system & DJ setup.' },
    { id: 2, item: 'Lab Journal Printing', amount: 4500, date: '2026-06-18', category: 'Supplies', spentBy: 'Rohan Das', desc: 'Coordinated printing for 60 lab copies.' },
    { id: 3, item: 'Charity Food Drive', amount: 8000, date: '2026-06-05', category: 'Charity', spentBy: 'Sneha Patel', desc: 'Bought grains & meals for local orphanage.' },
    { id: 4, item: 'Dean Meeting Caterers', amount: 2500, date: '2026-05-28', category: 'Others', spentBy: 'Prof. Sharma', desc: 'Refreshments for syllabus review meeting.' }
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: 'Farewell Gala 2026', date: '2026-07-15', dues: 500, venue: 'Main Auditorium', rsvp: 58, desc: 'Farewell celebration for outgoing seniors.' },
    { id: 2, title: 'Batch Project Exhibition', date: '2026-07-28', dues: 0, venue: 'CSE Lab 2 & 3', rsvp: 45, desc: 'Showcase of mini projects to faculty panels.' }
  ]);

  const [activities, setActivities] = useState([
    { id: 1, type: 'payment', text: 'Sneha Patel paid Rs. 1,500 for Monthly Contribution', time: 'June 28, 2026' },
    { id: 2, type: 'expense', text: 'Recorded expense: Rs. 12,000 for Farewell DJ Booking', time: 'June 25, 2026' },
    { id: 3, type: 'payment', text: 'Amit Kumar paid Rs. 1,500 for Monthly Contribution', time: 'June 20, 2026' },
    { id: 4, type: 'expense', text: 'Recorded expense: Rs. 4,500 for Lab Journal Printing', time: 'June 18, 2026' },
    { id: 5, type: 'payment', text: 'Rahul Verma paid Rs. 1,500 for Monthly Contribution', time: 'June 15, 2026' }
  ]);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleModalSubmit = (formData) => {
    if (modalType === 'add-income') {
      const newStudentPay = {
        id: students.length + 1,
        name: formData.studentName,
        roll: formData.rollNo,
        amountPaid: Number(formData.amount),
        dues: Math.max(0, 3000 - Number(formData.amount)),
        status: Number(formData.amount) >= 3000 ? 'Paid' : 'Partially Paid',
        date: formData.date,
        monthsPaid: formData.purpose === 'Monthly Contribution' ? [formData.paymentMonth] : []
      };
      setStudents([newStudentPay, ...students]);
      setActivities([
        { id: Date.now(), type: 'payment', text: `${formData.studentName} paid Rs. ${formData.amount} for ${formData.purpose}${formData.purpose === 'Monthly Contribution' ? ' (' + formData.paymentMonth + ')' : ''}`, time: formData.date },
        ...activities
      ]);
    } else if (modalType === 'add-expense') {
      const newExpense = {
        id: expenses.length + 1,
        item: formData.itemName,
        amount: Number(formData.amount),
        date: formData.date,
        category: formData.category,
        spentBy: formData.spentBy,
        desc: formData.description
      };
      setExpenses([newExpense, ...expenses]);
      setActivities([
        { id: Date.now(), type: 'expense', text: `Recorded expense: Rs. ${formData.amount} for ${formData.itemName}`, time: formData.date },
        ...activities
      ]);
    } else if (modalType === 'create-event') {
      const newEvent = {
        id: events.length + 1,
        title: formData.eventTitle,
        date: formData.date,
        dues: Number(formData.contributionAmount),
        venue: formData.venue,
        rsvp: 0,
        desc: formData.description
      };
      setEvents([newEvent, ...events]);
      setActivities([
        { id: Date.now(), type: 'event', text: `New event scheduled: "${formData.eventTitle}"`, time: formData.date },
        ...activities
      ]);
    }
  };

  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to remove this expense record?")) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const openReceipt = (student) => {
    setSelectedReceiptData({
      student: student.name,
      rollNo: student.roll,
      amount: student.amountPaid,
      date: student.date || '2026-06-15',
      purpose: 'Regular Batch Contributions',
      txId: `TXN${1000000000 + Math.floor(Math.random() * 900000000)}`
    });
    setModalType('receipt');
  };

  const triggerMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery) || 
    s.roll.toLowerCase().includes(searchQuery) ||
    s.status.toLowerCase().includes(searchQuery)
  );

  const filteredExpenses = expenses.filter(e => 
    e.item.toLowerCase().includes(searchQuery) || 
    e.category.toLowerCase().includes(searchQuery) || 
    e.spentBy.toLowerCase().includes(searchQuery)
  );

  // Stats calculation
  const totalBalance = 154000;
  const totalIncome = 212000;
  const totalExpenses = 58000;
  const pendingContributions = students.filter(s => s.status !== 'Paid').length;
  const numStudents = students.length;
  const upcomingEventsCount = events.length;

  const sidebarItems = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Students', icon: <StudentsIcon /> },
    { name: 'Fund Management', icon: <FundIcon /> },
    { name: 'Income Records', icon: <IncomeIcon /> },
    { name: 'Expense Records', icon: <ExpenseIcon /> },
    { name: 'Event Management', icon: <EventIcon /> },
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
                <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16}/> Add Income</button>
                <button onClick={() => setModalType('add-expense')} className="btn btn-secondary"><PlusIcon size={16}/> Add Expense</button>
                <button onClick={() => setModalType('create-event')} className="btn btn-outline"><EventIcon size={16}/> Create Event</button>
                <button onClick={() => setModalType('generate-report')} className="btn btn-secondary"><DownloadIcon size={16}/> Generate Report</button>
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
              <IncomeExpenseBarChart />
              <FundDistributionPieChart />
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
                        <th>Reg No</th>
                        <th>Contributed</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 4).map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '500' }}>{s.name}</td>
                          <td>{s.roll}</td>
                          <td style={{ fontWeight: '600' }}>Rs. {s.amountPaid.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${
                              s.status === 'Paid' ? 'badge-success' : s.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
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
              <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16}/> Record Student Payment</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Reg No</th>
                    <th>Months Paid</th>
                    <th>Contributed</th>
                    <th>Dues Outstanding</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.roll}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                            <span key={m} style={{ 
                              fontSize: '0.65rem', 
                              padding: '0.15rem 0.3rem', 
                              borderRadius: '4px', 
                              background: s.monthsPaid?.includes(m) ? 'var(--success)' : 'var(--border-color)', 
                              color: s.monthsPaid?.includes(m) ? '#fff' : 'var(--text-muted)' 
                            }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {s.amountPaid.toLocaleString()}</td>
                      <td style={{ fontWeight: '700', color: s.dues > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Rs. {s.dues.toLocaleString()}</td>
                      <td>{s.date}</td>
                      <td>
                        <span className={`badge ${
                          s.status === 'Paid' ? 'badge-success' : s.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                        }`}>{s.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => openReceipt(s)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>Receipt</button>
                          {s.dues > 0 && (
                            <button 
                              onClick={() => alert(`Reminder notification sent successfully to ${s.name} (${s.roll})!`)}
                              className="btn btn-outline" 
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary-purple)', borderColor: 'var(--primary-purple)' }}
                            >
                              Remind
                            </button>
                          )}
                          <button onClick={() => deleteStudent(s.id)} className="btn" style={{ padding: '0.35rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
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
              <button onClick={() => setModalType('add-income')} className="btn btn-primary"><PlusIcon size={16}/> Log Income</button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Contributor</th>
                    <th>Reg No</th>
                    <th>Type/Purpose</th>
                    <th>Mode</th>
                    <th>Received Date</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace' }}>INC{s.id * 102}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.roll}</td>
                      <td>Monthly Contribution</td>
                      <td>UPI</td>
                      <td>{s.date}</td>
                      <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. {s.amountPaid.toLocaleString()}</td>
                      <td>
                        <button onClick={() => openReceipt(s)} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>
                          <DownloadIcon size={12}/> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ fontFamily: 'monospace' }}>INC-EXT-1</td>
                    <td style={{ fontWeight: '600' }}>CSE Department Office</td>
                    <td>-</td>
                    <td>Exhibition Sponsorship</td>
                    <td>Bank Transfer</td>
                    <td>2026-06-10</td>
                    <td style={{ fontWeight: '700', color: 'var(--success)' }}>Rs. 15,000</td>
                    <td>-</td>
                  </tr>
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
              <button onClick={() => setModalType('add-expense')} className="btn btn-primary"><PlusIcon size={16}/> Record Expense</button>
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
                        <span className={`badge ${
                          exp.category === 'Events' ? 'badge-info' : exp.category === 'Supplies' ? 'badge-warning' : exp.category === 'Charity' ? 'badge-success' : 'badge-danger'
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
              <button onClick={() => setModalType('create-event')} className="btn btn-primary"><PlusIcon size={16}/> Setup New Event</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {events.map((event) => (
                <div key={event.id} className="glass-card active-border">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary-blue)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {event.date}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-purple)' }}>
                      {event.dues > 0 ? `Cost: Rs. ${event.dues}/head` : 'Free Event'}
                    </span>
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
