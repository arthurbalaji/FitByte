import React, { useState, useEffect } from 'react';
import { getClothingTypes, addClothingType, deleteClothingType } from '../../api';
import { Plus, Trash2, Scissors, Search } from 'lucide-react';

const GENDERS = ['male', 'female', 'kids'];

const AdminClothing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('male');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadItems = () => {
    setLoading(true);
    const promises = filter
      ? [getClothingTypes(filter)]
      : GENDERS.map((g) => getClothingTypes(g));
    Promise.all(promises)
      .then((results) => setItems(results.flatMap((r) => r.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadItems(); }, [filter]);

  const handleAdd = async () => {
    if (!newName.trim()) { setError('Name is required'); return; }
    setAdding(true);
    setError('');
    try {
      await addClothingType({ name: newName.trim(), gender: newGender });
      setNewName('');
      setShowAdd(false);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this clothing type?')) return;
    try {
      await deleteClothingType(id);
      setItems(items.filter((i) => i.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = GENDERS.reduce((acc, g) => {
    acc[g] = filtered.filter((i) => i.gender === g);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Clothing Types</h1>
          <p>Manage clothing types across all genders</p>
        </div>
        <button className="btn btn-primary btn-action" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Add New
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add Clothing Type</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="inline-form">
            <input
              type="text"
              className="form-input"
              placeholder="Clothing type name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <select
              className="form-select"
              value={newGender}
              onChange={(e) => setNewGender(e.target.value)}
              style={{ maxWidth: 160 }}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="filter-row">
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
          {GENDERS.map((g) => (
            <button key={g} className={`filter-tab ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-bar-sm">
          <Search size={16} />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Scissors size={48} />
          <h3>No clothing types found</h3>
        </div>
      ) : (
        Object.entries(grouped).map(([gender, genderItems]) =>
          genderItems.length > 0 ? (
            <div key={gender} className="category-section">
              <h3 className="category-title">
                {gender === 'male' ? '👔' : gender === 'female' ? '👗' : '🧒'}{' '}
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                <span className="category-count">{genderItems.length}</span>
              </h3>
              <div className="item-grid">
                {genderItems.map((item) => (
                  <div key={item.id} className="item-card">
                    <span className="item-name">{item.name}</span>
                    <button className="btn-icon-sm danger" onClick={() => handleDelete(item.id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  );
};

export default AdminClothing;
