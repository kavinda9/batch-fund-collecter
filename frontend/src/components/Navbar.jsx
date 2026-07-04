import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, SunIcon, MoonIcon, MenuIcon } from './Icons';

export const Navbar = ({ title, userRole = 'Admin', onSearch, toggleMobileSidebar }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) onSearch(val);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const notifications = [
    { id: 1, text: "Amit Kumar paid Rs. 1,500 for farewell contribution", time: "5 mins ago", unread: true },
    { id: 2, text: "Expense of Rs. 8,500 approved for Lab Journal printing", time: "1 hour ago", unread: true },
    { id: 3, text: "New event 'Farewell 2026' created by Core Committee", time: "4 hours ago", unread: false },
    { id: 4, text: "Reminders sent to 12 students with pending dues", time: "1 day ago", unread: false }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      height: 'var(--navbar-height)',
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 90,
      transition: 'background-color 0.3s'
    }}>
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={toggleMobileSidebar}
          className="btn-secondary" 
          style={{ 
            display: 'none', 
            padding: '0.5rem', 
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          id="mobile-sidebar-toggle"
        >
          <MenuIcon size={22} color="var(--text-main)" />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="search-bar-container">
          <input
            type="text"
            placeholder="Search records, students..."
            value={searchVal}
            onChange={handleSearch}
            className="form-input"
            style={{
              paddingLeft: '2.25rem',
              borderRadius: '9999px',
              width: '240px',
              fontSize: '0.8rem',
              height: '38px',
              background: 'rgba(100,116,139,0.06)'
            }}
          />
          <SearchIcon 
            size={16} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} 
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(100,116,139,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            transition: 'background 0.2s'
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{
              background: 'rgba(100,116,139,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              position: 'relative'
            }}
          >
            <BellIcon size={18} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--danger)',
              border: '2px solid var(--bg-sidebar)'
            }}></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="glass-card animate-scale"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                padding: '1rem',
                zIndex: 100,
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
                background: 'var(--bg-sidebar)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: n.unread ? 'rgba(37,99,235,0.05)' : 'transparent',
                    fontSize: '0.75rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{ color: 'var(--text-main)', marginBottom: '0.15rem' }}>{n.text}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info & Avatar */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              {userRole === 'Admin' ? 'AD' : 'BM'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="nav-profile-name">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {userRole === 'Admin' ? 'Prof. Sharma' : 'Rahul Verma'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {userRole === 'Admin' ? 'Batch Coordinator' : 'Reg No: 22BCS108'}
              </span>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div 
              className="glass-card animate-scale"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '180px',
                padding: '0.5rem 0',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-sidebar)',
                zIndex: 100
              }}
            >
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                Signed in as <br/>
                <strong>{userRole === 'Admin' ? 'coordinator@univ.edu' : 'rahul.verma@student.edu'}</strong>
              </div>
              <button 
                onClick={() => { navigate('/'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'block'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(124, 58, 237, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                Change Role
              </button>
              <button 
                onClick={() => { navigate('/'); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  display: 'block',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Include CSS for hiding elements on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          #mobile-sidebar-toggle {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .search-bar-container {
            display: none !important;
          }
          .nav-profile-name {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
