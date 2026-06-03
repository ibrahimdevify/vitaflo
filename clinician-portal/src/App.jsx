import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ClinicianLayout from './components/layout/ClinicianLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Spirometry from './pages/Spirometry';
import Prescriptions from './pages/Prescriptions';
import Notes from './pages/Notes';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import { Toaster } from 'sonner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><ClinicianLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/spirometry" element={<Spirometry />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/trends" element={<Spirometry />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
