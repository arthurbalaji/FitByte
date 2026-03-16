import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { getOrders } from '../../api';
import { PlusCircle, TrendingUp, Package, MapPin, ShoppingCart } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState({ active: 0, total: 0 });

  useEffect(() => {
    getOrders()
      .then((res) => {
        const orders = res.data;
        const activeStatuses = ['pending', 'confirmed', 'in_progress', 'ready', 'shipped'];
        const active = orders.filter(o => activeStatuses.includes(o.status)).length;
        setOrderStats({ active, total: orders.length });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.first_name}!</h1>
        <p>Your personalized tailoring dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        <div className="stat-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Package size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{orderStats.active}</span>
            <span className="stat-label">Active Orders</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{orderStats.total}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/new-order')}>
          <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <PlusCircle size={28} />
          </div>
          <h3>Create Order</h3>
          <p>Start a new custom tailoring order. Choose gender, clothing type, fabric, and measurements.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/orders')}>
          <div className="card-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Package size={28} />
          </div>
          <h3>My Orders</h3>
          <p>Track your orders and view order history, status updates, and delivery information.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/addresses')}>
          <div className="card-icon-wrap" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <MapPin size={28} />
          </div>
          <h3>My Addresses</h3>
          <p>Manage your delivery addresses for faster checkout on future orders.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/cart')}>
          <div className="card-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <ShoppingCart size={28} />
          </div>
          <h3>My Cart</h3>
          <p>Review multiple products, adjust quantities, and checkout all cart items together.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
