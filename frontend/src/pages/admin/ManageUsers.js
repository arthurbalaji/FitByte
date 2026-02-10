import React, { useState, useEffect } from 'react';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../api';
import { Users, Search, Trash2, Edit3, X, Check, ShieldCheck, Scissors, User } from 'lucide-react';

const ROLES = ['customer', 'tailor', 'admin'];
const ROLE_COLORS = { customer: '#4361ee', tailor: '#16a34a', admin: '#dc2626' };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers(roleFilter)
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditData({ first_name: u.first_name, last_name: u.last_name, role: u.role, phone: u.phone || '' });
  };

  const saveEdit = async () => {
    try {
      const res = await updateAdminUser(editingId, editData);
      setUsers(users.map((u) => (u.id === editingId ? res.data : u)));
      setEditingId(null);
    } catch {
      alert('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await deleteAdminUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheck size={12} />;
      case 'tailor': return <Scissors size={12} />;
      default: return <User size={12} />;
    }
  };

  const filtered = users.filter(
    (u) => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="filter-tabs">
          <button className={`filter-tab ${roleFilter === '' ? 'active' : ''}`} onClick={() => setRoleFilter('')}>
            All ({users.length})
          </button>
          {ROLES.map((r) => (
            <button
              key={r}
              className={`filter-tab ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-bar-sm">
          <Search size={16} />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No users found</h3>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="table-row">
                  <td>
                    {editingId === u.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="form-input inline-edit"
                          value={editData.first_name}
                          onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                          placeholder="First"
                        />
                        <input
                          className="form-input inline-edit"
                          value={editData.last_name}
                          onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                          placeholder="Last"
                        />
                      </div>
                    ) : (
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: ROLE_COLORS[u.role] }}>
                          {(u.first_name?.[0] || '').toUpperCase()}
                        </div>
                        {u.first_name} {u.last_name}
                      </div>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {editingId === u.id ? (
                      <input
                        className="form-input inline-edit"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="Phone"
                      />
                    ) : (
                      u.phone || '—'
                    )}
                  </td>
                  <td>
                    {editingId === u.id ? (
                      <select
                        className="form-select inline-edit"
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="role-badge" style={{ background: ROLE_COLORS[u.role] }}>
                        {getRoleIcon(u.role)} {u.role}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === u.id ? (
                      <div className="action-btns">
                        <button className="btn-icon-sm success" onClick={saveEdit} title="Save">
                          <Check size={14} />
                        </button>
                        <button className="btn-icon-sm" onClick={() => setEditingId(null)} title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="action-btns">
                        <button className="btn-icon-sm" onClick={() => startEdit(u)} title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button className="btn-icon-sm danger" onClick={() => handleDelete(u.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
