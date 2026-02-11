import React, { useState, useEffect } from 'react';
import { getAdminCustomers, getCustomerMeasurements } from '../../api';
import { Users, Search, ChevronDown, ChevronUp, Ruler } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [measurements, setMeasurements] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!measurements[id]) {
      try {
        const res = await getCustomerMeasurements(id);
        setMeasurements((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        setMeasurements((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customer Management</h1>
        <p>View all customers and their saved measurements</p>
      </div>

      <div className="filter-row">
        <div className="search-bar-sm">
          <Search size={14} />
          <input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-muted">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No customers found</h3>
          <p>No customers match your search criteria</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className={`table-row ${expandedId === c.id ? 'expanded' : ''}`} onClick={() => toggleExpand(c.id)}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: '#4361ee' }}>
                          {(c.first_name?.[0] || '') + (c.last_name?.[0] || '')}
                        </div>
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{new Date(c.date_joined).toLocaleDateString()}</td>
                    <td>
                      {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="expanded-row">
                      <td colSpan={5}>
                        <div className="expanded-content">
                          <h4><Ruler size={16} /> Saved Measurements</h4>
                          {!measurements[c.id] ? (
                            <div className="spinner spinner-sm" />
                          ) : measurements[c.id].length === 0 ? (
                            <p className="text-muted">No measurements saved yet</p>
                          ) : (
                            <div className="measurement-chips">
                              {measurements[c.id].map((m) => (
                                <div key={m.id} className="measurement-chip">
                                  <strong>{m.label}</strong>
                                  <span>{m.clothing_type_name}</span>
                                  <div className="chip-badge">{m.size_type === 'standard' ? m.standard_size : 'Custom'}</div>
                                  {m.size_type === 'custom' && m.measurements && (
                                    <div className="chip-details">
                                      {Object.entries(m.measurements).map(([k, v]) =>
                                        v ? <span key={k}>{k}: {v}"</span> : null
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
