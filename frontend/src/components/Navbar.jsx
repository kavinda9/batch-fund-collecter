import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, BellIcon, SunIcon, MoonIcon, MenuIcon } from './Icons';
import API_BASE from '../services/api';

export const Navbar = ({ title, userRole = 'Admin', onSearch, toggleMobileSidebar, onSettings }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: '', regNumber: '', uid: '' });

  // Real notifications: announcements + personal reminders
  const [notifications, setNotifications] = useState([]);
  // IDs stored in localStorage as "read"
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')); }
    catch { return new Set(); }
  });

  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUserProfile({ name: data.user.name || '', regNumber: data.user.regNumber || '', uid: data.user.uid || '' });
        }
      })
      .catch(() => { });
  }, []);

  // Fetch announcements + personal notifications and merge them
  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const results = [];

      // 1. Public announcements (both admin & member see these)
      const annRes = await fetch(`${API_BASE}/api/user/announcements`, { headers });
      if (annRes.ok) {
        const annData = await annRes.json();
        (annData.announcements || []).slice(0, 5).forEach(a => {
          results.push({
            id: `ann-${a.id}`,
            text: a.title + (a.content ? ` — ${a.content}` : ''),
            time: a.createdAt ? timeAgo(a.createdAt) : '',
            type: 'announcement'
          });
        });
      }

      // 2. Personal reminders (only for members)
      if (userRole === 'Member') {
        const notifRes = await fetch(`${API_BASE}/api/user/notifications`, { headers });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          (notifData.notifications || []).slice(0, 5).forEach(n => {
            results.push({
              id: `notif-${n.id}`,
              text: n.content,
              time: n.createdAt ? timeAgo(n.createdAt) : '',
              type: 'reminder'
            });
          });
        }
      }

      // Sort by most recent (we use the original ordering from API, just combine)
      setNotifications(results);
    } catch { /* silent */ }
  }, [userRole]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  // "Mark all read" — saves all current IDs to localStorage + calls backend for personal reminders
  const markAllRead = async () => {
    const newReadIds = new Set([...readIds, ...notifications.map(n => n.id)]);
    setReadIds(newReadIds);
    localStorage.setItem('readNotifIds', JSON.stringify([...newReadIds]));

    // Also persist to backend for member personal notifications
    if (userRole === 'Member') {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/api/user/notifications/read-all`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => { });
      }
    }
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

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
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: 'var(--danger)',
                border: '2px solid var(--bg-sidebar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.45rem',
                color: '#fff',
                fontWeight: '700'
              }}></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="glass-card animate-scale"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '340px',
                padding: '1rem',
                zIndex: 100,
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
                background: 'var(--bg-sidebar)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                  Notifications {unreadCount > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '9999px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', marginLeft: '0.25rem' }}>{unreadCount}</span>}
                </span>
                <span
                  onClick={markAllRead}
                  style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '500' }}
                >
                  Mark all read
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🔕</span>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !readIds.has(n.id);
                    return (
                      <div key={n.id} style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        background: isUnread
                          ? (n.type === 'reminder' ? 'rgba(239,68,68,0.06)' : 'rgba(37,99,235,0.06)')
                          : 'transparent',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start'
                      }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>
                          {n.type === 'reminder' ? '🔔' : '📢'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--text-main)', marginBottom: '0.15rem', lineHeight: '1.4', fontWeight: isUnread ? '600' : '400' }}>{n.text}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{n.time}</div>
                        </div>
                        {isUnread && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: n.type === 'reminder' ? 'var(--danger)' : 'var(--primary-blue)', flexShrink: 0, marginTop: '0.3rem' }}></span>}
                      </div>
                    );
                  })
                )}
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
                {userProfile.name || (userRole === 'Admin' ? 'Admin' : 'Member')}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {userRole === 'Admin' ? 'Batch Coordinator' : (userProfile.regNumber ? `Roll No: ${userProfile.regNumber}` : 'Member')}
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
              {onSettings && (
                <button
                  onClick={() => {
                    onSettings();
                    setShowProfileMenu(false);
                  }}
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
                  Settings
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate('/');
                }}
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

// Helper: human-readable relative time
function timeAgo(isoString) {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  } catch { return ''; }
}
