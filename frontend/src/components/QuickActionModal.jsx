import React, { useState } from 'react';
import { XIcon, CheckIcon, DownloadIcon } from './Icons';

export const QuickActionModal = ({ type, onClose, onSubmit, data = {} }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    amount: '',
    purpose: 'Monthly Contribution',
    date: new Date().toISOString().substring(0, 10),
    paymentMode: 'UPI',
    itemName: '',
    category: 'Events',
    spentBy: '',
    description: '',
    eventTitle: '',
    venue: '',
    contributionAmount: '500',
    reportFormat: 'PDF',
    reportType: 'All Finances'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        if (onSubmit) onSubmit(formData);
        onClose();
      }, 1000);
    }, 1200);
  };

  const renderFormContent = () => {
    switch (type) {
      case 'add-income':
        return (
          <>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add Income Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input required type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input" placeholder="e.g. Priyanshu Sharma" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input required type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} className="form-input" placeholder="e.g. 22BCS015" />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Rs.)</label>
                  <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-input" placeholder="Amount" min="1" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <select name="purpose" value={formData.purpose} onChange={handleChange} className="form-input">
                    <option value="Monthly Contribution">Monthly Contribution</option>
                    <option value="Event Ticket">Event Ticket</option>
                    <option value="Farewell Fund">Farewell Fund</option>
                    <option value="Batch Trip">Batch Trip</option>
                    <option value="Lab Coat/Supplies">Lab Coat/Supplies</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="form-input">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Income'}
                </button>
              </div>
            </form>
          </>
        );

      case 'add-expense':
        return (
          <>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add Expense Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item / Service Name</label>
                <input required type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="form-input" placeholder="e.g. Lab Journal Printing" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Amount Spent (Rs.)</label>
                  <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-input" placeholder="e.g. 4500" min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Spent Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="form-input">
                    <option value="Events">Events & Cultural</option>
                    <option value="Trips">Batch Trip</option>
                    <option value="Supplies">Academic Supplies</option>
                    <option value="Charity">Charity & Socials</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Authorized By</label>
                  <input required type="text" name="spentBy" value={formData.spentBy} onChange={handleChange} className="form-input" placeholder="e.g. Prof. Sharma" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" style={{ height: '70px', resize: 'none' }} placeholder="Provide purpose details..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </>
        );

      case 'create-event':
        return (
          <>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Create New Event</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input required type="text" name="eventTitle" value={formData.eventTitle} onChange={handleChange} className="form-input" placeholder="e.g. Batch Reunion 2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Individual Contribution (Rs.)</label>
                  <input required type="number" name="contributionAmount" value={formData.contributionAmount} onChange={handleChange} className="form-input" placeholder="Contribution per head" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue / Platform</label>
                <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className="form-input" placeholder="e.g. Seminar Hall 3" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" style={{ height: '70px', resize: 'none' }} placeholder="Outline agenda, rules, timing details..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </>
        );

      case 'generate-report':
        return (
          <>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Generate Finance Report</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Report Category</label>
                <select name="reportType" value={formData.reportType} onChange={handleChange} className="form-input">
                  <option value="All Finances">All Batch Finances (General Ledger)</option>
                  <option value="Income">Income Records Only</option>
                  <option value="Expenses">Expense Records Only</option>
                  <option value="Student Dues">Student Contribution Deficits</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" name="date" className="form-input" defaultValue="2026-01-01" />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="endDate" className="form-input" defaultValue="2026-06-30" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Output Format</label>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="radio" name="reportFormat" value="PDF" checked={formData.reportFormat === 'PDF'} onChange={handleChange} />
                    PDF Document (.pdf)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="radio" name="reportFormat" value="CSV" checked={formData.reportFormat === 'CSV'} onChange={handleChange} />
                    Excel Spreadsheet (.csv)
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Compiling Report...' : 'Download Report'}
                </button>
              </div>
            </form>
          </>
        );

      case 'receipt':
        const receiptData = {
          txId: data.txId || 'TXN8274920491',
          student: data.student || 'Rahul Verma',
          rollNo: data.rollNo || '22BCS108',
          amount: data.amount || 1500,
          purpose: data.purpose || 'Batch Farewell contribution',
          date: data.date || '2026-06-15',
          paymentMode: data.paymentMode || 'UPI / PhonePe',
          status: 'PAID'
        };

        return (
          <div style={{ padding: '0.5rem' }}>
            {/* Elegant Digital Receipt Design */}
            <div style={{
              background: 'var(--bg-app)',
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative',
              textAlign: 'center',
              color: 'var(--text-main)'
            }}>
              {/* Receipt Header */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h4 style={{ color: 'var(--primary-blue)', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>UNIVERSITI BATCH FUNDS</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official E-Receipt of Payment</span>
              </div>
              
              {/* Receipt Stamp */}
              <div style={{
                position: 'absolute',
                top: '55px',
                right: '25px',
                transform: 'rotate(-12deg)',
                border: '3px solid var(--success)',
                color: 'var(--success)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontWeight: '700',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                opacity: 0.85
              }}>
                {receiptData.status}
              </div>

              {/* Receipt Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                  <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>{receiptData.txId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                  <span style={{ fontWeight: '600' }}>{receiptData.student} ({receiptData.rollNo})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contribution:</span>
                  <span style={{ fontWeight: '600' }}>{receiptData.purpose}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                  <span style={{ fontWeight: '600' }}>{receiptData.paymentMode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date Paid:</span>
                  <span style={{ fontWeight: '600' }}>{receiptData.date}</span>
                </div>
                
                {/* Big Total */}
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Amount Received:</span>
                  <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--primary-purple)' }}>Rs. {receiptData.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button onClick={onClose} className="btn btn-secondary">Close</button>
              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    alert("Receipt downloaded successfully!");
                  }, 800);
                }} 
                className="btn btn-primary"
                disabled={loading}
              >
                <DownloadIcon size={16} />
                {loading ? 'Downloading...' : 'Save PDF'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="glass-card animate-scale"
        style={{
          width: '100%',
          maxWidth: type === 'receipt' ? '400px' : '480px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.75rem',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            border: 'none',
            background: 'rgba(100, 116, 139, 0.08)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <XIcon size={16} />
        </button>

        {/* Success overlay */}
        {success ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}>
              <CheckIcon size={28} strokeWidth={3} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Action Completed!</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Database registry updated successfully.</span>
          </div>
        ) : (
          renderFormContent()
        )}
      </div>
    </div>
  );
};
