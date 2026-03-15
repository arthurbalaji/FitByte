import React, { useState, useEffect } from 'react';
import { getOrders, cancelOrder, getOrderDetail } from '../../api';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, X, AlertCircle, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bgColor: '#ede9fe', icon: RefreshCw },
  ready: { label: 'Ready', color: '#10b981', bgColor: '#d1fae5', icon: Package },
  shipped: { label: 'Shipped', color: '#06b6d4', bgColor: '#cffafe', icon: Truck },
  delivered: { label: 'Delivered', color: '#22c55e', bgColor: '#dcfce7', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(filter === 'all' ? '' : filter);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await getOrderDetail(orderId);
      setSelectedOrder(res.data);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setShowModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          In Progress
        </button>
        <button 
          className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No orders found</h3>
          <p>{filter === 'all' ? 'You haven\'t placed any orders yet' : `No ${filter} orders`}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card" onClick={() => handleViewOrder(order.id)}>
              <div className="order-header">
                <div className="order-number">
                  <span className="label">Order #</span>
                  <span className="value">{order.order_number}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="order-body">
                <div className="order-item-preview">
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: order.fabric_color_hex || '#ccc' }}
                  />
                  <div className="item-details">
                    <h4>{order.clothing_type_name}</h4>
                    <p>{order.fabric_name} • {order.fabric_color_name} • {order.pattern_name}</p>
                  </div>
                </div>
                
                <div className="order-meta">
                  <div className="meta-item">
                    <span className="label">Ordered</span>
                    <span className="value">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Quantity</span>
                    <span className="value">{order.quantity}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Total</span>
                    <span className="value price">₹{order.total_price}</span>
                  </div>
                </div>
              </div>

              <div className="order-footer">
                <span className="view-details">View Details <ChevronRight size={16} /></span>
              </div>
            </div>
          ))}
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
                {/* Status Section */}
                <div className="detail-section">
                  <h3>Order Status</h3>
                  <div className="status-display">
                    {getStatusBadge(selectedOrder.status)}
                    {selectedOrder.estimated_delivery && (
                      <p className="estimated-delivery">
                        Estimated delivery: {new Date(selectedOrder.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Timeline */}
                  {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                    <div className="status-timeline">
                      {selectedOrder.status_history.map((history, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-dot" />
                          <div className="timeline-content">
                            <span className="timeline-status">{STATUS_CONFIG[history.status]?.label || history.status}</span>
                            <span className="timeline-date">{formatDate(history.created_at)}</span>
                            {history.notes && <p className="timeline-notes">{history.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="detail-section">
                  <h3>Product Details</h3>
                  <div className="product-info">
                    <div className="info-row">
                      <span className="label">Clothing Type</span>
                      <span className="value">{selectedOrder.clothing_type_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gender</span>
                      <span className="value" style={{ textTransform: 'capitalize' }}>{selectedOrder.gender}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Fabric</span>
                      <span className="value">{selectedOrder.fabric_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Color</span>
                      <span className="value color-value">
                        <span 
                          className="color-dot" 
                          style={{ backgroundColor: selectedOrder.fabric_color_hex || '#ccc' }}
                        />
                        {selectedOrder.fabric_color_name}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Pattern</span>
                      <span className="value">{selectedOrder.pattern_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Size Type</span>
                      <span className="value" style={{ textTransform: 'capitalize' }}>
                        {selectedOrder.size_type}
                        {selectedOrder.standard_size && ` (${selectedOrder.standard_size})`}
                      </span>
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
                      <p className="name">{selectedOrder.delivery_address.full_name}</p>
                      <p>{selectedOrder.delivery_address.address_line1}</p>
                      {selectedOrder.delivery_address.address_line2 && (
                        <p>{selectedOrder.delivery_address.address_line2}</p>
                      )}
                      <p>
                        {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.postal_code}
                      </p>
                      <p>📞 {selectedOrder.delivery_address.phone}</p>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="detail-section">
                  <h3>Price Summary</h3>
                  <div className="price-summary">
                    <div className="price-row">
                      <span>Unit Price</span>
                      <span>₹{selectedOrder.unit_price}</span>
                    </div>
                    <div className="price-row">
                      <span>Quantity</span>
                      <span>× {selectedOrder.quantity}</span>
                    </div>
                    <div className="price-row total">
                      <span>Total</span>
                      <span>₹{selectedOrder.total_price}</span>
                    </div>
                    <div className="payment-status">
                      Payment: <span className={`payment-badge ${selectedOrder.payment_status}`}>
                        {selectedOrder.payment_status_display}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Notes */}
                {selectedOrder.customer_notes && (
                  <div className="detail-section">
                    <h3>Your Notes</h3>
                    <p className="notes-text">{selectedOrder.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {['pending', 'confirmed'].includes(selectedOrder.status) && (
                <button 
                  className="btn-danger"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  <XCircle size={16} /> Cancel Order
                </button>
              )}
              <button className="btn-outline" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          padding: 4px;
          background: #f3f4f6;
          border-radius: 10px;
          width: fit-content;
        }
        .filter-tab {
          padding: 10px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab:hover {
          color: #374151;
        }
        .filter-tab.active {
          background: white;
          color: #4361ee;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.2s;
        }
        .order-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .order-number .label {
          font-size: 12px;
          color: #6b7280;
        }
        .order-number .value {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
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
        .order-body {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }
        .order-item-preview {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .color-swatch {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
        }
        .item-details h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }
        .item-details p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }
        .order-meta {
          display: flex;
          gap: 24px;
        }
        .meta-item {
          text-align: right;
        }
        .meta-item .label {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .meta-item .value {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .meta-item .value.price {
          color: #059669;
          font-weight: 600;
        }
        .order-footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
          text-align: right;
        }
        .view-details {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #4361ee;
          font-size: 13px;
          font-weight: 500;
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
        .empty-state h3 {
          margin: 0 0 8px;
          color: #374151;
        }
        .empty-state p {
          color: #6b7280;
        }
        .order-date {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
        .order-detail-grid {
          display: grid;
          gap: 24px;
        }
        .detail-section h3 {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .product-info, .price-summary {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        .info-row, .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child, .price-row:last-child {
          border-bottom: none;
        }
        .info-row .label, .price-row span:first-child {
          color: #6b7280;
          font-size: 14px;
        }
        .info-row .value {
          font-weight: 500;
          color: #1f2937;
        }
        .color-value {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .color-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid #ddd;
        }
        .measurements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        .measurement-item {
          display: flex;
          flex-direction: column;
        }
        .measurement-item .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }
        .measurement-item .value {
          font-weight: 600;
          color: #1f2937;
        }
        .address-display {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          line-height: 1.6;
        }
        .address-display .name {
          font-weight: 600;
          color: #1f2937;
        }
        .price-row.total {
          font-weight: 600;
          font-size: 16px;
          color: #1f2937;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid #e5e7eb;
        }
        .payment-status {
          margin-top: 12px;
          font-size: 14px;
          color: #6b7280;
        }
        .payment-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .payment-badge.pending {
          background: #fef3c7;
          color: #d97706;
        }
        .payment-badge.paid {
          background: #dcfce7;
          color: #16a34a;
        }
        .status-timeline {
          margin-top: 16px;
          padding-left: 12px;
          border-left: 2px solid #e5e7eb;
        }
        .timeline-item {
          position: relative;
          padding-left: 20px;
          padding-bottom: 16px;
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
          color: #1f2937;
        }
        .timeline-date {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .timeline-notes {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
        .status-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .estimated-delivery {
          font-size: 14px;
          color: #059669;
          margin: 0;
        }
        .btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-danger:hover {
          background: #b91c1c;
        }
        .notes-text {
          background: #f9fafb;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          color: #4b5563;
          margin: 0;
        }
        @media (max-width: 640px) {
          .order-body {
            grid-template-columns: 1fr;
          }
          .order-meta {
            justify-content: space-between;
          }
          .meta-item {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
