// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage'; 
import Portal from './pages/Portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import Landing from './pages/contribution/LandingPage';
import PayFund from './pages/contribution/PayFund';

// Import your system's secure route guard middleware component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Interface */}
        <Route path="/" element={<HomePage />} />
        
        {/* Secure Portals and Dashboards Wrapped with Route Guards */}
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute>
              <Portal />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/member" 
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/landing" 
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pay-fund" 
          element={
            <ProtectedRoute>
              <PayFund />
            </ProtectedRoute>
          } 
        />
        
        {/* Wildcard Fallback Redirect Router */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;