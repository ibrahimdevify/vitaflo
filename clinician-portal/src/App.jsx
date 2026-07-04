import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import ClinicianLayout from './components/layout/ClinicianLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

const Alerts = lazy(() => import('./pages/Alerts'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const Notes = lazy(() => import('./pages/Notes'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Patients = lazy(() => import('./pages/Patients'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const Profile = lazy(() => import('./pages/Profile'));
const Spirometry = lazy(() => import('./pages/Spirometry'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

function ProtectedRoute({ children }) {
  const { user, loading, unauthorized } = useAuth();

  if (loading) return children;

  if (unauthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PageFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ClinicianLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/spirometry" element={<Spirometry />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forbidden" element={<Forbidden />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
