import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobDetails from './pages/JobDetails';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Navbar from './components/Navbar';
import { Toast } from './components/Toast';
import { getProfile } from './services/authService';

const normalizeUser = (user) => user ? { ...user, _id: user._id || user.id } : null;

function App() {
  const [user, setUser] = useState(() => normalizeUser(JSON.parse(localStorage.getItem('user') || 'null')));
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((response) => {
        const normalizedUser = normalizeUser(response.data);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar user={user} onLogout={handleLogout} />
      <Toast {...toast} />
      <main className="px-4 py-6 md:px-10 lg:px-16">
        <Routes>
          <Route path="/" element={<Home showToast={showToast} />} />
          <Route path="/jobs" element={<Jobs user={user} showToast={showToast} />} />
          <Route path="/login" element={<Login setUser={setUser} showToast={showToast} />} />
          <Route path="/signup" element={<Signup setUser={setUser} showToast={showToast} />} />
          <Route
            path="/jobs/:id"
            element={<JobDetails showToast={showToast} user={user} />}
          />
          <Route path="/student" element={<ProtectedRoute user={user}><StudentDashboard showToast={showToast} user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute user={user}><RoleRoute user={user} allowedRoles={[ 'company' ]}><CompanyDashboard showToast={showToast} user={user} /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute user={user}><RoleRoute user={user} allowedRoles={[ 'admin' ]}><AdminDashboard showToast={showToast} /></RoleRoute></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute user={user}><Chat user={user} showToast={showToast} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute user={user}><Notifications user={user} showToast={showToast} /></ProtectedRoute>} />
          <Route path="*" element={<div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-soft">Page not found.</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
