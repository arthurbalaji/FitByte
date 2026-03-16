import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewOrder from './pages/NewOrder';
import TrialView from './pages/TrialView';
import Cart from './pages/customer/Cart';
import Addresses from './pages/customer/Addresses';
import OrderHistory from './pages/customer/OrderHistory';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AdminClothing from './pages/admin/AdminClothing';
import AdminFabrics from './pages/admin/AdminFabrics';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminOrders from './pages/admin/AdminOrders';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* Authenticated */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />

            {/* Universal dashboard - redirects based on role */}
            <Route path="dashboard" element={<RoleDashboard />} />

            {/* Customer routes */}
            <Route path="new-order" element={<RoleRoute roles={['customer']}><NewOrder /></RoleRoute>} />
            <Route path="trial-view" element={<RoleRoute roles={['customer']}><TrialView /></RoleRoute>} />
            <Route path="cart" element={<RoleRoute roles={['customer']}><Cart /></RoleRoute>} />
            <Route path="addresses" element={<RoleRoute roles={['customer']}><Addresses /></RoleRoute>} />
            <Route path="orders" element={<RoleRoute roles={['customer']}><OrderHistory /></RoleRoute>} />

            {/* Admin routes */}
            <Route path="admin/users" element={<RoleRoute roles={['admin']}><ManageUsers /></RoleRoute>} />
            <Route path="admin/clothing" element={<RoleRoute roles={['admin']}><AdminClothing /></RoleRoute>} />
            <Route path="admin/fabrics" element={<RoleRoute roles={['admin']}><AdminFabrics /></RoleRoute>} />
            <Route path="admin/customers" element={<RoleRoute roles={['admin']}><AdminCustomers /></RoleRoute>} />
            <Route path="admin/orders" element={<RoleRoute roles={['admin']}><AdminOrders /></RoleRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const RoleDashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    default: return <CustomerDashboard />;
  }
};

export default App;
