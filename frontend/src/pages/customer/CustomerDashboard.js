import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { getSavedMeasurements } from '../../api';
import { PlusCircle, Ruler, Scissors, TrendingUp } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [measurementCount, setMeasurementCount] = useState(0);

  useEffect(() => {
    getSavedMeasurements()
      .then((res) => setMeasurementCount(res.data.length))
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
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#4361ee' }}>
            <Ruler size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{measurementCount}</span>
            <span className="stat-label">Saved Measurements</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-number">0</span>
            <span className="stat-label">Active Orders</span>
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

        <div className="dashboard-card" onClick={() => navigate('/measurements')}>
          <div className="card-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Ruler size={28} />
          </div>
          <h3>My Measurements</h3>
          <p>View and manage your saved measurements for quick ordering in the future.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/new-order')}>
          <div className="card-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Scissors size={28} />
          </div>
          <h3>Explore Fabrics</h3>
          <p>Browse through our collection of fabrics, colors, and patterns for your next outfit.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
