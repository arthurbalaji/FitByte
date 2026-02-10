import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { getTailorCustomers, getClothingTypes, getFabrics } from '../../api';
import { Users, Scissors, Palette, ArrowUpRight } from 'lucide-react';

const TailorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ customers: 0, clothing: 0, fabrics: 0 });

  useEffect(() => {
    Promise.all([
      getTailorCustomers(),
      getClothingTypes(''),
      getFabrics(),
    ]).then(([cust, cloth, fab]) => {
      setStats({
        customers: cust.data.length,
        clothing: cloth.data.length,
        fabrics: fab.data.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.first_name}!</h1>
        <p>Tailor management panel</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.customers}</span>
            <span className="stat-label">Customers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Scissors size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.clothing}</span>
            <span className="stat-label">Clothing Types</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Palette size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.fabrics}</span>
            <span className="stat-label">Fabrics</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Manage</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/tailor/customers')}>
          <div className="card-icon-wrap" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Users size={28} />
          </div>
          <h3>Customers</h3>
          <p>View your customer list and their saved measurements.</p>
          <span className="card-action">View all <ArrowUpRight size={14} /></span>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/tailor/clothing')}>
          <div className="card-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Scissors size={28} />
          </div>
          <h3>Clothing Types</h3>
          <p>Manage clothing types for different genders and categories.</p>
          <span className="card-action">Manage <ArrowUpRight size={14} /></span>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/tailor/fabrics')}>
          <div className="card-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Palette size={28} />
          </div>
          <h3>Fabrics</h3>
          <p>Add and manage the fabrics you offer to customers.</p>
          <span className="card-action">Manage <ArrowUpRight size={14} /></span>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard;
