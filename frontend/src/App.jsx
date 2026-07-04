import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portal from './pages/Portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/MemberDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />
        {/* Wildcard redirects back to Portal */}
        <Route path="*" element={<Portal />} />
      </Routes>
    </Router>
  );
}

export default App;
