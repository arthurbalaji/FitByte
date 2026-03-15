import React, { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../api';
import { MapPin, Plus, Edit2, Trash2, Check, X, Star, Home, Briefcase, MoreHorizontal } from 'lucide-react';

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

const emptyAddress = {
  label: '',
  address_type: 'home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAddresses();
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData(emptyAddress);
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData(emptyAddress);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await createAddress(formData);
      }
      await loadAddresses();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await loadAddresses();
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const getTypeIcon = (type) => {
    const addressType = ADDRESS_TYPES.find(t => t.value === type);
    const Icon = addressType?.icon || MapPin;
    return <Icon size={18} />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Addresses</h1>
          <p>Manage your delivery addresses</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h3>No addresses saved</h3>
          <p>Add your first delivery address to get started</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Address
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map((address) => (
            <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
              {address.is_default && (
                <div className="default-badge">
                  <Star size={12} /> Default
                </div>
              )}
              <div className="address-header">
                <div className="address-type-icon">
                  {getTypeIcon(address.address_type)}
                </div>
                <div className="address-label">
                  <h3>{address.label}</h3>
                  <span className="address-type-tag">{address.address_type}</span>
                </div>
              </div>
              <div className="address-details">
                <p className="full-name">{address.full_name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} - {address.postal_code}</p>
                <p>{address.country}</p>
                <p className="phone">📞 {address.phone}</p>
              </div>
              <div className="address-actions">
                {!address.is_default && (
                  <button 
                    className="btn-outline btn-sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check size={14} /> Set Default
                  </button>
                )}
                <button 
                  className="btn-icon"
                  onClick={() => handleOpenModal(address)}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Address Label *</label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleChange}
                      placeholder="e.g., Home, Office"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address Type</label>
                    <select
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleChange}
                    >
                      {ADDRESS_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Recipient's full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    placeholder="House/Flat No., Building Name, Street"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2 || ''}
                    onChange={handleChange}
                    placeholder="Landmark, Area (Optional)"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      required
                      maxLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleChange}
                    />
                    <span>Set as default address</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .address-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .address-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .address-card.default {
          border-color: #4361ee;
          background: linear-gradient(135deg, #f8faff 0%, #fff 100%);
        }
        .default-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #4361ee;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        .address-type-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }
        .address-label h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .address-type-tag {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }
        .address-details {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.6;
        }
        .address-details .full-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .address-details .phone {
          margin-top: 8px;
          color: #6b7280;
        }
        .address-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }
        .btn-sm {
          padding: 6px 12px !important;
          font-size: 12px !important;
        }
        .btn-icon {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: #e5e7eb;
          color: #1f2937;
        }
        .btn-icon.btn-danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          margin-top: 20px;
        }
        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
        }
        .empty-state h3 {
          margin: 0 0 8px;
          color: #374151;
        }
        .empty-state p {
          color: #6b7280;
          margin-bottom: 20px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .checkbox-group {
          margin-top: 8px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Addresses;
