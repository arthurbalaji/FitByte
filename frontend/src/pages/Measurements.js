import React, { useState, useEffect } from 'react';
import { getSavedMeasurements, deleteMeasurement } from '../api';
import { Trash2, Ruler, Calendar } from 'lucide-react';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMeasurements = () => {
    setLoading(true);
    getSavedMeasurements()
      .then((res) => setMeasurements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) return;
    try {
      await deleteMeasurement(id);
      setMeasurements(measurements.filter((m) => m.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Measurements</h1>
        <p>Your saved measurements for quick ordering</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : measurements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Ruler size={48} style={{ color: '#ccc', marginBottom: 16 }} />
          <h3 style={{ color: '#555', marginBottom: 8 }}>No saved measurements</h3>
          <p style={{ color: '#888', fontSize: 14 }}>
            Create a new order to save your measurements for future use.
          </p>
        </div>
      ) : (
        <div className="saved-list">
          {measurements.map((m) => (
            <div key={m.id} className="saved-item">
              <div className="saved-item-info">
                <h4>{m.label}</h4>
                <p>
                  {m.clothing_type_name} &middot;{' '}
                  {m.size_type === 'standard' ? `Size ${m.standard_size}` : 'Custom measurements'}{' '}
                  &middot;{' '}
                  <Calendar size={12} style={{ verticalAlign: 'middle' }} />{' '}
                  {formatDate(m.created_at)}
                </p>
                {m.size_type === 'custom' && m.measurements && Object.keys(m.measurements).length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(m.measurements).map(([key, val]) =>
                      val ? (
                        <span
                          key={key}
                          style={{
                            fontSize: 12, padding: '3px 10px',
                            background: '#f0f0f0', borderRadius: 50,
                            color: '#555', fontWeight: 500,
                          }}
                        >
                          {key.replace(/_/g, ' ')}: {val}"
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
              <div className="saved-item-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleDelete(m.id)}
                  title="Delete"
                  style={{ color: '#e74c3c' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Measurements;
