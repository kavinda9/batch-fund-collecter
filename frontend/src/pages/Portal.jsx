import React from 'react';
import { useNavigate } from 'react-router-dom';

const Portal = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Blur Blobs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '350px',
        height: '350px',
        background: 'rgba(37, 99, 235, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '400px',
        height: '400px',
        background: 'rgba(124, 58, 237, 0.15)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      {/* Main Container */}
      <div className="animate-fade" style={{
        zIndex: 1,
        maxWidth: '850px',
        width: '100%',
        textAlign: 'center'
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <span style={{
            background: 'var(--primary-gradient)',
            color: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 10px rgba(37,99,235,0.15)'
          }}>
            Finances Re-Imagined
          </span>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginTop: '1.25rem',
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Batch Fund Tracking System
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            A clean, modern SaaS platform designed for university students to track batch income, monitor expenses, manage events, and maintain clear transparency.
          </p>
        </div>

        {/* Dashboards Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          margin: '0 auto 3rem auto',
          maxWidth: '720px'
        }}>
          
          {/* Card 1: Admin Portal */}
          <div 
            onClick={() => navigate('/admin')}
            className="glass-card active-border"
            style={{
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)',
              color: 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }}>
              ⚙️
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>Admin Dashboard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>
              Access full batch controls. Log payments, approve and record batch expenses, organize upcoming events, and view detailed financial ledger analytics.
            </p>
            <button 
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Enter Admin Portal
            </button>
          </div>

          {/* Card 2: Student Portal */}
          <div 
            onClick={() => navigate('/member')}
            className="glass-card active-border"
            style={{
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.2) 100%)',
              color: 'var(--primary-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              border: '1px solid rgba(124, 58, 237, 0.2)'
            }}>
              🎓
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>Batch Member Dashboard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>
              Check your personal contribution balance, download official payment receipts, view upcoming events, RSVP, and see general announcements.
            </p>
            <button 
              className="btn btn-primary"
              style={{ 
                marginTop: '1.5rem', 
                width: '100%', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)';
              }}
            >
              Enter Member Portal
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Batch Fund Collection & Tracking System • 2026. Made with ❤️ for transparency.
        </div>
      </div>
    </div>
  );
};

export default Portal;
