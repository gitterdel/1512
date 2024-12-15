import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Navbar } from './components/Navbar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { PrivateRoute } from './components/PrivateRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const TenantDashboard = React.lazy(() => import('./pages/TenantDashboard').then(module => ({ default: module.TenantDashboard })));
const LandlordDashboard = React.lazy(() => import('./pages/LandlordDashboard').then(module => ({ default: module.LandlordDashboard })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const UserProfile = React.lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const PropertyDetailPage = React.lazy(() => import('./pages/PropertyDetailPage').then(module => ({ default: module.PropertyDetailPage })));
const PropertySearch = React.lazy(() => import('./pages/PropertySearch').then(module => ({ default: module.PropertySearch })));
const Messages = React.lazy(() => import('./pages/Messages').then(module => ({ default: module.Messages })));
const SavedPropertiesPage = React.lazy(() => import('./pages/SavedPropertiesPage').then(module => ({ default: module.SavedPropertiesPage })));
const AddProperty = React.lazy(() => import('./pages/AddProperty').then(module => ({ default: module.AddProperty })));
const EditProperty = React.lazy(() => import('./pages/EditProperty').then(module => ({ default: module.EditProperty })));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage').then(module => ({ default: module.EditProfilePage })));

const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              } />
              <Route path="/search" element={<PropertySearch />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />

              {/* Protected Routes */}
              <Route path="/messages" element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } />

              {/* Profile Routes */}
              <Route path="/profile/:id?" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />
              <Route path="/profile/edit" element={
                <PrivateRoute>
                  <EditProfilePage />
                </PrivateRoute>
              } />

              {/* Tenant Routes */}
              <Route path="/tenant/*" element={
                <PrivateRoute role="tenant">
                  <Routes>
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<TenantDashboard />} />
                    <Route path="saved" element={<SavedPropertiesPage />} />
                  </Routes>
                </PrivateRoute>
              } />

              {/* Landlord Routes */}
              <Route path="/landlord/*" element={
                <PrivateRoute role="landlord">
                  <Routes>
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<LandlordDashboard />} />
                    <Route path="properties/add" element={<AddProperty />} />
                    <Route path="properties/edit/:id" element={<EditProperty />} />
                  </Routes>
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <PrivateRoute role="admin">
                  <Routes>
                    <Route path="/" element={<AdminPanel />} />
                  </Routes>
                </PrivateRoute>
              } />

              {/* Dashboard Redirect */}
              <Route path="/dashboard" element={
                isAuthenticated ? (
                  <Navigate 
                    to={
                      user?.role === 'admin' ? '/admin' :
                      user?.role === 'landlord' ? '/landlord/dashboard' :
                      '/tenant/dashboard'
                    } 
                    replace 
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;