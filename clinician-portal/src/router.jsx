import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useAuth } from '../src/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ClinicianLayout from './components/layout/ClinicianLayout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

const Alerts = lazy(() => import('./pages/Alerts'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const AddPatient = lazy(() => import('./pages/AddPatient'));
const PatientDetail = lazy(() => import('./pages/PatientDetail'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const Notes = lazy(() => import('./pages/Notes'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Patients = lazy(() => import('./pages/Patients'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const Profile = lazy(() => import('./pages/Profile'));
const Spirometry = lazy(() => import('./pages/Spirometry'));
const PDFViewer = lazy(() => import('./components/PDFViewer'));

function ProtectedRoute() {
  const { user, loading, unauthorized } = useAuth();

  if (loading) return null;
  if (unauthorized) return <Navigate to="/unauthorized" replace />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

function RequireRole({ role }) {
  console.log(role);

  const { user, loading } = useAuth();

  if (loading) return <Outlet />;
  if (user?.ut_id_fk !== role) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/unauthorized', Component: Unauthorized },
  { path: '/reset-password', Component: ResetPassword },

  {
    Component: ProtectedRoute,
    children: [
      {
        element: (
          <ErrorBoundary>
            <ClinicianLayout />
          </ErrorBoundary>
        ),
        children: [
          { index: true, Component: Dashboard },
          { path: 'patients', Component: Patients },
          { path: 'patients-details', Component: PatientDetail },
          { path: 'patients/add', Component: AddPatient },
          { path: 'notes', Component: Notes },
          { path: 'spirometry', Component: Spirometry },
          { path: 'prescriptions', Component: Prescriptions },
          { path: 'alerts', Component: Alerts },
          { path: 'profile', Component: Profile },
          { path: 'resources/:filename', Component: PDFViewer },
          { path: 'forbidden', Component: Forbidden },
          {
            path: 'users',
            element: <RequireRole role={6} />,
            children: [{ index: true, Component: Users }],
          },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
]);
