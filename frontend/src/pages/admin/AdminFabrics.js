import React, { useState, useEffect } from 'react';
import { getFabrics, addFabric, deleteFabricItem } from '../../api';
import { Plus, Trash2, Palette, Search } from 'lucide-react';

const AdminFabrics = () => {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadFabrics = () => {
    setLoading(true);
    getFabrics()
      .then((res) => setFabrics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFabrics(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) { setError('Name is required'); return; }
    setAdding(true);
    setError('');
    try {
      await addFabric({ name: newName.trim() });
      setNewName('');
      setShowAdd(false);
      loadFabrics();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to add fabric');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fabric?')) return;
    try {
      await deleteFabricItem(id);
      setFabrics(fabrics.filter((f) => f.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const filtered = fabrics.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const FABRIC_EMOJI = {
    'Cotton': '🌿', 'Silk': '✨', 'Linen': '🌾', 'Wool': '🐑', 'Polyester': '🔷',
    'Chiffon': '🌸', 'Georgette': '🦋', 'Velvet': '🟣', 'Denim': '👖', 'Satin': '💎',
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Fabrics</h1>
          <p>Manage all available fabric types</p>
        </div>
        <button className="btn btn-primary btn-action" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} /> Add Fabric
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add Fabric</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="inline-form">
            <input
              type="text"
              className="form-input"
              placeholder="Fabric name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search fabrics..."
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
          <Palette size={48} />
          <h3>No fabrics found</h3>
        </div>
      ) : (
        <div className="item-grid">
          {filtered.map((f) => (
            <div key={f.id} className="item-card fabric-card">
              <div className="fabric-card-info">
                <span className="fabric-emoji">{FABRIC_EMOJI[f.name] || '🧵'}</span>
                <span className="item-name">{f.name}</span>
              </div>
              <button className="btn-icon-sm danger" onClick={() => handleDelete(f.id)} title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFabrics;
