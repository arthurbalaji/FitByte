import React, { useState, useEffect } from 'react';
import { getTailorCustomers, getCustomerMeasurements } from '../../api';
import { Users, ChevronDown, ChevronUp, Ruler, Calendar, Search, User } from 'lucide-react';

const TailorCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [measurements, setMeasurements] = useState({});
  const [search, setSearch] = useState('');
  const [loadingMeasurements, setLoadingMeasurements] = useState(null);

  useEffect(() => {
    getTailorCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCustomer = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!measurements[id]) {
      setLoadingMeasurements(id);
      try {
        const res = await getCustomerMeasurements(id);
        setMeasurements((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        setMeasurements((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setLoadingMeasurements(null);
      }
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = customers.filter(
    (c) =>
      `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <p>View all customers and their saved measurements</p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No customers found</h3>
          <p>{search ? 'Try a different search term.' : 'No customers have registered yet.'}</p>
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
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className={`table-row ${expandedId === c.id ? 'expanded' : ''}`} onClick={() => toggleCustomer(c.id)}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">
                          <User size={14} />
                        </div>
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{formatDate(c.date_joined || new Date())}</td>
                    <td>
                      {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="expanded-row">
                      <td colSpan={5}>
                        <div className="expanded-content">
                          <h4><Ruler size={16} /> Saved Measurements</h4>
                          {loadingMeasurements === c.id ? (
                            <div className="spinner spinner-sm" />
                          ) : measurements[c.id]?.length > 0 ? (
                            <div className="measurement-chips">
                              {measurements[c.id].map((m) => (
                                <div key={m.id} className="measurement-chip">
                                  <strong>{m.label}</strong>
                                  <span>{m.clothing_type_name}</span>
                                  <span className="chip-badge">
                                    {m.size_type === 'standard' ? m.standard_size : 'Custom'}
                                  </span>
                                  {m.size_type === 'custom' && m.measurements && (
                                    <div className="chip-details">
                                      {Object.entries(m.measurements).map(([k, v]) =>
                                        v ? <span key={k}>{k.replace(/_/g, ' ')}: {v}"</span> : null
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No measurements saved yet.</p>
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

export default TailorCustomers;
