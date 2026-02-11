import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { getAdminStats } from '../../api';
import { Users, Scissors, Palette, Ruler, ShieldCheck, ArrowUpRight, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.first_name}. Here's an overview of FitByte.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.total_users || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.customers || 0}</span>
            <span className="stat-label">Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3', color: '#dc2626' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.admins || 0}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="stats-row" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Scissors size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.total_clothing_types || 0}</span>
            <span className="stat-label">Clothing Types</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Palette size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.total_fabrics || 0}</span>
            <span className="stat-label">Fabrics</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Ruler size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats?.total_measurements || 0}</span>
            <span className="stat-label">Saved Measurements</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Administration</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/admin/users')}>
          <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Users size={28} />
          </div>
          <h3>Manage Users</h3>
          <p>View, edit, and manage all users — customers and admins.</p>
          <span className="card-action">Manage <ArrowUpRight size={14} /></span>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/customers')}>
          <div className="card-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <UserCheck size={28} />
          </div>
          <h3>Customer Measurements</h3>
          <p>View customers and their saved measurements for orders.</p>
          <span className="card-action">View <ArrowUpRight size={14} /></span>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/clothing')}>
          <div className="card-icon-wrap" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Scissors size={28} />
          </div>
          <h3>Clothing Types</h3>
          <p>Add, edit, or remove clothing types across all genders.</p>
          <span className="card-action">Manage <ArrowUpRight size={14} /></span>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/admin/fabrics')}>
          <div className="card-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Palette size={28} />
          </div>
          <h3>Fabrics</h3>
          <p>Manage the fabric catalog available for orders.</p>
          <span className="card-action">Manage <ArrowUpRight size={14} /></span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
