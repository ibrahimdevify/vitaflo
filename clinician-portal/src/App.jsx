import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ClinicianLayout from './components/layout/ClinicianLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import { Toaster } from 'sonner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

const Placeholder = ({ title }) => (
  <div className="p-4"><h1 className="text-2xl font-bold">{title}</h1><p className="text-slate-500 mt-2">Coming soon...</p></div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><ClinicianLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/spirometry" element={<Placeholder title="Spirometry" />} />
            <Route path="/prescriptions" element={<Placeholder title="Prescriptions" />} />
            <Route path="/trends" element={<Placeholder title="Trends" />} />
            <Route path="/notes" element={<Placeholder title="Notes" />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/profile" element={<Placeholder title="Profile" />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
