import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, getOrderStats } from '../../api';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, X, Filter, RefreshCw, Search, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bgColor: '#ede9fe', icon: RefreshCw },
  ready: { label: 'Ready', color: '#10b981', bgColor: '#d1fae5', icon: Package },
  shipped: { label: 'Shipped', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
  delivered: { label: 'Delivered', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready for Delivery' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', customer_id: '', date_from: '', date_to: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', payment_status: '', admin_notes: '', estimated_delivery: '', notes: '' });

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders(filters);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getOrderStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleOpenUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      payment_status: order.payment_status,
      admin_notes: order.admin_notes || '',
      estimated_delivery: order.estimated_delivery || '',
      notes: '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, updateData);
      await loadOrders();
      await loadStats();
      setShowUpdateModal(false);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <span 
        className="status-badge"
        style={{ background: config.bgColor, color: config.color }}
      >
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_email.toLowerCase().includes(query) ||
      order.clothing_type_name.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Order Management</h1>
          <p>View and manage all customer orders</p>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#4361ee' }}>
              <Package size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.total_orders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.pending_orders}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <RefreshCw size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.in_progress_orders}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.completed_orders}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <DollarSign size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">₹{stats.total_revenue?.toLocaleString()}</span>
              <span className="stat-label">Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button className="btn-outline btn-sm" onClick={() => { setFilters({ status: '', customer_id: '', date_from: '', date_to: '' }); setSearchQuery(''); }}>
          Clear Filters
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No orders found</h3>
          <p>No orders match your filters</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Checkout Batch</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number-cell">
                    <strong>{order.order_number}</strong>
                  </td>
                  <td>
                    <span className="batch-chip">{order.checkout_group ? order.checkout_group.slice(0, 8) : '-'}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="name">{order.customer_name}</span>
                      <span className="email">{order.customer_email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="product-cell">
                      <span 
                        className="color-dot"
                        style={{ backgroundColor: order.fabric_color_hex || '#ccc' }}
                      />
                      <div>
                        <span className="type">{order.clothing_type_name}</span>
                        <span className="details">{order.fabric_name} • {order.pattern_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="date-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="amount-cell">
                    <strong>₹{order.total_price}</strong>
                    <span className={`payment-badge ${order.payment_status}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-icon"
                      onClick={() => handleViewOrder(order)}
                      title="View Details"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button 
                      className="btn-icon btn-primary-icon"
                      onClick={() => handleOpenUpdateModal(order)}
                      title="Update Status"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Order #{selectedOrder.order_number}</h2>
                <p className="order-date">Placed on {formatDate(selectedOrder.created_at)}</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-detail-grid">
                {/* Customer Info */}
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="info-block">
                    <p><strong>{selectedOrder.customer_name}</strong></p>
                    <p>{selectedOrder.customer_email}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="detail-section">
                  <h3>Status</h3>
                  <div className="status-info">
                    {getStatusBadge(selectedOrder.status)}
                    <span className={`payment-badge ml-2 ${selectedOrder.payment_status}`}>
                      Payment: {selectedOrder.payment_status_display}
                    </span>
                  </div>
                  <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                    Checkout Batch: <strong>{selectedOrder.checkout_group || '-'}</strong>
                  </p>
                </div>

                {/* Product Details */}
                <div className="detail-section">
                  <h3>Product Details</h3>
                  <div className="product-info">
                    <div className="info-row">
                      <span className="label">Type</span>
                      <span className="value">{selectedOrder.gender} - {selectedOrder.clothing_type_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Fabric</span>
                      <span className="value">{selectedOrder.fabric_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Color</span>
                      <span className="value color-value">
                        <span className="color-dot" style={{ backgroundColor: selectedOrder.fabric_color_hex || '#ccc' }} />
                        {selectedOrder.fabric_color_name}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Pattern</span>
                      <span className="value">{selectedOrder.pattern_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Size</span>
                      <span className="value">{selectedOrder.size_type} {selectedOrder.standard_size && `(${selectedOrder.standard_size})`}</span>
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                {selectedOrder.measurements && Object.keys(selectedOrder.measurements).length > 0 && (
                  <div className="detail-section">
                    <h3>Measurements</h3>
                    <div className="measurements-grid">
                      {Object.entries(selectedOrder.measurements).map(([key, value]) => (
                        <div key={key} className="measurement-item">
                          <span className="label">{key.replace(/_/g, ' ')}</span>
                          <span className="value">{value} in</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.delivery_address && Object.keys(selectedOrder.delivery_address).length > 0 && (
                  <div className="detail-section">
                    <h3>Delivery Address</h3>
                    <div className="address-display">
                      <p><strong>{selectedOrder.delivery_address.full_name}</strong></p>
                      <p>{selectedOrder.delivery_address.address_line1}</p>
                      {selectedOrder.delivery_address.address_line2 && <p>{selectedOrder.delivery_address.address_line2}</p>}
                      <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.postal_code}</p>
                      <p>📞 {selectedOrder.delivery_address.phone}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="detail-section">
                  <h3>Price Summary</h3>
                  <div className="price-summary">
                    <div className="price-row">
                      <span>Quantity</span>
                      <span>{selectedOrder.quantity}</span>
                    </div>
                    <div className="price-row total">
                      <span>Total</span>
                      <span>₹{selectedOrder.total_price}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.customer_notes && (
                  <div className="detail-section">
                    <h3>Customer Notes</h3>
                    <p className="notes-text">{selectedOrder.customer_notes}</p>
                  </div>
                )}
                {selectedOrder.admin_notes && (
                  <div className="detail-section">
                    <h3>Admin Notes</h3>
                    <p className="notes-text">{selectedOrder.admin_notes}</p>
                  </div>
                )}

                {/* Status History */}
                {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                  <div className="detail-section">
                    <h3>Status History</h3>
                    <div className="status-timeline">
                      {selectedOrder.status_history.map((history, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-dot" />
                          <div className="timeline-content">
                            <span className="timeline-status">{STATUS_CONFIG[history.status]?.label || history.status}</span>
                            <span className="timeline-date">{formatDate(history.created_at)}</span>
                            <span className="timeline-by">by {history.changed_by_name}</span>
                            {history.notes && <p className="timeline-notes">{history.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => { setShowModal(false); handleOpenUpdateModal(selectedOrder); }}>
                <RefreshCw size={16} /> Update Status
              </button>
              <button className="btn-outline" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="update-order-info">Order: <strong>{selectedOrder.order_number}</strong></p>
              
              <div className="form-group">
                <label>Order Status *</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={updateData.payment_status}
                  onChange={(e) => setUpdateData({ ...updateData, payment_status: e.target.value })}
                >
                  {PAYMENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Delivery Date</label>
                <input
                  type="date"
                  value={updateData.estimated_delivery}
                  onChange={(e) => setUpdateData({ ...updateData, estimated_delivery: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status Change Notes</label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                  placeholder="Add a note about this status change"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Admin Notes (Internal)</label>
                <textarea
                  value={updateData.admin_notes}
                  onChange={(e) => setUpdateData({ ...updateData, admin_notes: e.target.value })}
                  placeholder="Internal notes (not visible to customer)"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdateOrder} disabled={updating}>
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filters-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          flex: 1;
          max-width: 300px;
        }
        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
        }
        .search-box svg {
          color: #9ca3af;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .filter-group select {
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
        }
        .filter-group svg {
          color: #9ca3af;
        }
        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        .data-table tr:hover {
          background: #f9fafb;
        }
        .order-number-cell strong {
          color: #4361ee;
        }
        .batch-chip {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .customer-cell .name {
          display: block;
          font-weight: 500;
          color: #1f2937;
        }
        .customer-cell .email {
          font-size: 12px;
          color: #6b7280;
        }
        .product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .product-cell .color-dot {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .product-cell .type {
          display: block;
          font-weight: 500;
        }
        .product-cell .details {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }
        .date-cell {
          color: #6b7280;
          font-size: 13px;
        }
        .amount-cell strong {
          display: block;
          color: #059669;
        }
        .payment-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
          margin-top: 4px;
        }
        .payment-badge.pending {
          background: #fef3c7;
          color: #d97706;
        }
        .payment-badge.paid {
          background: #dcfce7;
          color: #16a34a;
        }
        .payment-badge.refunded {
          background: #fee2e2;
          color: #dc2626;
        }
        .actions-cell {
          display: flex;
          gap: 8px;
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
        .btn-primary-icon {
          background: #eff6ff;
          color: #4361ee;
        }
        .btn-primary-icon:hover {
          background: #dbeafe;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
        }
        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
        .order-detail-grid {
          display: grid;
          gap: 20px;
        }
        .detail-section h3 {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }
        .info-block, .product-info, .address-display, .price-summary {
          background: #f9fafb;
          border-radius: 8px;
          padding: 14px;
        }
        .info-block p, .address-display p {
          margin: 0;
          line-height: 1.6;
        }
        .status-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ml-2 {
          margin-left: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .color-value {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .color-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid #ddd;
        }
        .measurements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          background: #f9fafb;
          border-radius: 8px;
          padding: 14px;
        }
        .measurement-item .label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          text-transform: capitalize;
        }
        .measurement-item .value {
          font-weight: 600;
          color: #1f2937;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }
        .price-row.total {
          font-weight: 600;
          font-size: 16px;
          border-top: 1px solid #ddd;
          margin-top: 8px;
          padding-top: 10px;
        }
        .notes-text {
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          margin: 0;
          font-size: 14px;
        }
        .status-timeline {
          padding-left: 12px;
          border-left: 2px solid #e5e7eb;
        }
        .timeline-item {
          position: relative;
          padding-left: 18px;
          padding-bottom: 14px;
        }
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          left: -7px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4361ee;
          border: 2px solid white;
        }
        .timeline-status {
          font-weight: 500;
        }
        .timeline-date, .timeline-by {
          font-size: 12px;
          color: #6b7280;
          margin-left: 8px;
        }
        .timeline-notes {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0;
        }
        .update-order-info {
          background: #f3f4f6;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        @media (max-width: 900px) {
          .data-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;
