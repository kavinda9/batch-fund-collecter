import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage'; // Keeps your home page
import Portal from './pages/Portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import Landing from './pages/contribution/LandingPage';
import PayFund from './pages/contribution/PayFund';

function App() {
  return (
    <Router>
      <Routes>
        {/* Your original home page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Your friend's new routes */}
        <Route path="/portal" element={<Portal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/pay-fund" element={<PayFund />} />
        
        {/* Wildcard redirects back to your HomePage (or change to /portal if preferred) */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
