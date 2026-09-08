// import { lazy, Suspense } from 'react';
// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import AdminLayout from './components/layout/AdminLayout';
// import { Toaster } from './components/ui/sonner';
// import { TooltipProvider } from './components/ui/tooltip';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import Profile from './pages/Profile';

// // 🆕 Lazy loaded pages
// const Login = lazy(() => import('./pages/Login'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Users = lazy(() => import('./pages/Users'));
// const Patients = lazy(() => import('./pages/Patients'));
// const Clinicians = lazy(() => import('./pages/Clinicians'));
// const Spirometry = lazy(() => import('./pages/Spirometry'));
// const Trends = lazy(() => import('./pages/Trends'));
// const Alerts = lazy(() => import('./pages/Alerts'));
// const Predicted = lazy(() => import('./pages/Predicted'));
// const Devices = lazy(() => import('./pages/Devices'));
// const Accounts = lazy(() => import('./pages/Accounts'));
// const NotFound = lazy(() => import('./pages/NotFound'));
// const Roles = lazy(() => import('./pages/Roles'));
// const Forbidden = lazy(() => import('./pages/Forbidden'));
// const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// function PageLoader() {
//   return (
//     <div className="flex items-center justify-center min-h-[60vh]">
//       <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
//     </div>
//   );
// }

// function ProtectedRoute({ children }) {
//   const { user, loading, unauthorized } = useAuth();

//   if (loading) return children;

//   if (unauthorized) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   if (!user) return <Navigate to="/login" replace />;

//   return children;
// }

// function App() {
//   return (
//     <TooltipProvider>
//       <AuthProvider>
//         <BrowserRouter>
//           <Suspense fallback={<PageLoader />}>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/unauthorized" element={<Unauthorized />} />
//               <Route path="/forbidden" element={<Forbidden />} />

//               <Route
//                 element={
//                   <ProtectedRoute>
//                     <AdminLayout />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/users" element={<Users />} />
//                 <Route path="/patients" element={<Patients />} />
//                 <Route path="/clinicians" element={<Clinicians />} />
//                 <Route path="/spirometry" element={<Spirometry />} />
//                 <Route path="/trends" element={<Trends />} />
//                 <Route path="/alerts" element={<Alerts />} />
//                 <Route path="/predicted" element={<Predicted />} />
//                 <Route path="/devices" element={<Devices />} />
//                 <Route path="/accounts" element={<Accounts />} />
//                 <Route path="/roles" element={<Roles />} />
//                 <Route
//                   path="/profile"
//                   element={
//                     <Suspense fallback={<PageLoader />}>
//                       <Profile />
//                     </Suspense>
//                   }
//                 />

//                 {/* 404 — always last */}
//                 <Route path="*" element={<NotFound />} />
//               </Route>
//             </Routes>
//           </Suspense>
//         </BrowserRouter>
//       </AuthProvider>
//       <Toaster />
//     </TooltipProvider>
//   );
// }

// export default App;

import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import { hasViewAccess, ROUTE_MODULES } from './utils/permissions';

// 🆕 Lazy loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Patients = lazy(() => import('./pages/Patients'));
const Clinicians = lazy(() => import('./pages/Clinicians'));
const Spirometry = lazy(() => import('./pages/Spirometry'));
const Trends = lazy(() => import('./pages/Trends'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Predicted = lazy(() => import('./pages/Predicted'));
const Devices = lazy(() => import('./pages/Devices'));
const Accounts = lazy(() => import('./pages/Accounts'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Roles = lazy(() => import('./pages/Roles'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, unauthorized } = useAuth();

  if (loading) return children;

  if (unauthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// Wraps a single route's element. Expects `modules` (the array the updated
// /login response now returns — see authController.js) and `user` (which now
// includes `ut_id_fk`) to be exposed by useAuth(). Sits *inside*
// ProtectedRoute/AdminLayout, so `user` is already guaranteed to exist here.
function ModuleGuard({ moduleName, children }) {
  const { user, modules, loading } = useAuth();

  if (loading) return children;

  if (!hasViewAccess(user, modules, moduleName)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/forbidden" element={<Forbidden />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/users"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/users']}>
                      <Users />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/patients']}>
                      <Patients />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/clinicians"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/clinicians']}>
                      <Clinicians />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/spirometry"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/spirometry']}>
                      <Spirometry />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/trends"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/trends']}>
                      <Trends />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/alerts']}>
                      <Alerts />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/predicted"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/predicted']}>
                      <Predicted />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/devices"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/devices']}>
                      <Devices />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/accounts']}>
                      <Accounts />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ModuleGuard moduleName={ROUTE_MODULES['/roles']}>
                      <Roles />
                    </ModuleGuard>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Profile />
                    </Suspense>
                  }
                />

                {/* 404 — always last */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;