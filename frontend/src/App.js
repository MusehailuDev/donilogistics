import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import TestVerificationPage from './pages/TestVerificationPage';
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import OrgAdminUsersPage from './pages/OrgAdminUsersPage';
import AdminVehiclesPage from './pages/AdminVehiclesPage';
import AdminDriversPage from './pages/AdminDriversPage';
import AdminShipmentsPage from './pages/AdminShipmentsPage';
import AdminWarehousesPage from './pages/AdminWarehousesPage';
import AdminContainersPage from './pages/AdminContainersPage';
import ShipmentTrackingPage from './pages/ShipmentTrackingPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminConsolidationsPage from './pages/AdminConsolidationsPage';
import RoutePlanDetails from './pages/RoutePlanDetails';
import DriverDashboard from './pages/DriverDashboard';
import AIDashboard from './pages/AIDashboard';
import { useParams } from 'react-router-dom';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<EmailVerificationPage />} />
          <Route path="/test-verify" element={<TestVerificationPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orgs" element={<AdminOrganizationsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/vehicles" element={<AdminVehiclesPage />} />
          <Route path="/admin/drivers" element={<AdminDriversPage />} />
          <Route path="/admin/shipments" element={<AdminShipmentsPage />} />
          <Route path="/admin/warehouses" element={<AdminWarehousesPage />} />
          <Route path="/admin/containers" element={<AdminContainersPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/consolidations" element={<AdminConsolidationsPage />} />
          <Route path="/admin/route-plan/:id" element={<RoutePlanDetailsWrapper />} />
          <Route path="/org/users" element={<OrgAdminUsersPage />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/ai-dashboard" element={<AIDashboard />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/track/:trackingNumber" element={<ShipmentTrackingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

function RoutePlanDetailsWrapper() {
  const { id } = useParams();
  return <RoutePlanDetails routePlanId={id} />;
}
