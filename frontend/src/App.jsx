import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage'; // Keeps your home page
import Portal from './pages/Portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import Landing from './pages/contribution/LandingPage';
import PayFund from './pages/contribution/PayFund';
<<<<<<< HEAD
=======
import AboutPage from './pages/about/AboutPage';
>>>>>>> 14cdde4 (updated files)

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
<<<<<<< HEAD
=======
        <Route path="/about" element={<AboutPage />} />
>>>>>>> 14cdde4 (updated files)
        
        {/* Wildcard redirects back to your HomePage (or change to /portal if preferred) */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
