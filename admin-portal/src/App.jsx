import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Users from './pages/Users';
import Patients from './pages/Patients';
import Clinicians from './pages/Clinicians';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import Accounts from './pages/Accounts';
import Spirometry from './pages/Spirometry';
import Trends from './pages/Trends';
import Predicted from './pages/Predicted';
import Dashboard from './pages/Dashboard';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/clinicians" element={<Clinicians />} />
              <Route path="/spirometry" element={<Spirometry />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/predicted" element={<Predicted />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/notifications" element={<div className="p-4"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-slate-500 mt-2">Coming soon...</p></div>} />
              <Route path="/accounts" element={<Accounts />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
