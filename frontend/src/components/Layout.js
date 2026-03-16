import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard, PlusCircle, Users, Scissors, Palette, LogOut,
  Menu, X, ShieldCheck, ChevronRight, UserCheck, Package, MapPin, Eye, ShoppingCart
} from 'lucide-react';

const NAV_CONFIG = {
  customer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-order', icon: PlusCircle, label: 'Create Order' },
    { to: '/trial-view', icon: Eye, label: 'Trial View' },
    { to: '/cart', icon: ShoppingCart, label: 'My Cart' },
    { to: '/orders', icon: Package, label: 'My Orders' },
    { to: '/addresses', icon: MapPin, label: 'My Addresses' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/orders', icon: Package, label: 'Orders' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/customers', icon: UserCheck, label: 'Customers' },
    { to: '/admin/clothing', icon: Scissors, label: 'Clothing Types' },
    { to: '/admin/fabrics', icon: Palette, label: 'Fabrics' },
  ],
};

const ROLE_COLORS = {
  customer: '#4361ee',
  admin: '#dc2626',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
    : 'U';

  const navItems = NAV_CONFIG[user?.role] || NAV_CONFIG.customer;
  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.customer;

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <ShieldCheck size={12} />;
      default: return null;
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <NavLink to="/dashboard" className="navbar-brand">
            <div className="logo-icon">FB</div>
            FitByte
          </NavLink>
        </div>
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="user-avatar" style={{ background: roleColor }}>
              {initials.toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user?.first_name} {user?.last_name}</span>
              <span className="navbar-role" style={{ background: roleColor }}>
                {getRoleIcon()} {user?.role}
              </span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </nav>

      <div className="app-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={14} className="sidebar-arrow" />
              </NavLink>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-role-badge" style={{ borderColor: roleColor, color: roleColor }}>
              {getRoleIcon()}
              {user?.role === 'customer' ? 'Customer Portal' : 'Admin Panel'}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
