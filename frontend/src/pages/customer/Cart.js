import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCartItems,
  updateCartItem,
  deleteCartItem,
  getAddresses,
  createAddress,
  checkoutCart,
} from '../../api';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CheckCircle } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry',
];

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'India',
  });
  const [checkoutNotes, setCheckoutNotes] = useState('');

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getCartItems();
      setCartItems(res.data);
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data);
      const defaultAddr = res.data.find((a) => a.is_default);
      setSelectedAddress(defaultAddr || res.data[0] || null);
    } catch (_) {
      // no-op
    }
  };

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0),
    [cartItems]
  );

  const updateItemQuantity = async (item, nextQty) => {
    if (nextQty < 1) return;
    try {
      setUpdatingId(item.id);
      const res = await updateCartItem(item.id, { quantity: nextQty });
      setCartItems((prev) => prev.map((x) => (x.id === item.id ? res.data : x)));
    } catch (_) {
      setError('Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id) => {
    try {
      setUpdatingId(id);
      await deleteCartItem(id);
      setCartItems((prev) => prev.filter((x) => x.id !== id));
    } catch (_) {
      setError('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      setError('Please fill all required address fields');
      return;
    }
    try {
      const res = await createAddress(newAddress);
      const saved = res.data;
      setAddresses((prev) => [saved, ...prev]);
      setSelectedAddress(saved);
      setShowAddressForm(false);
      setNewAddress({
        label: '', full_name: '', phone: '', address_line1: '', address_line2: '',
        city: '', state: '', postal_code: '', country: 'India',
      });
    } catch (_) {
      setError('Failed to save address');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    try {
      const payload = {
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
        },
        customer_notes: checkoutNotes,
      };
      const res = await checkoutCart(payload);
      setCheckoutResult(res.data);
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to checkout cart');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (checkoutResult) {
    return (
      <div>
        <div className="page-header">
          <h1>Checkout Complete</h1>
          <p>Your cart has been converted into orders.</p>
        </div>
        <div className="card success-card">
          <CheckCircle size={32} />
          <h3>{checkoutResult.message}</h3>
          <p>Order Numbers: {checkoutResult.order_numbers?.join(', ')}</p>
          <div className="actions-row">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="btn btn-secondary" onClick={() => navigate('/new-order')}>Create Another Order</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Cart</h1>
        <p>Add multiple custom products and checkout together.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Loading cart...</p></div>
      ) : cartItems.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <h3>Your cart is empty</h3>
          <p>Add products from Trial View to checkout multiple items together.</p>
          <button className="btn btn-primary" onClick={() => navigate('/new-order')}>Create New Product</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="item-main">
                  <div className="color-dot" style={{ backgroundColor: item.fabric_color_hex || '#ddd' }} />
                  <div className="item-info">
                    <h4>{item.gender} - {item.clothing_type_name}</h4>
                    <p>{item.fabric_name} • {item.fabric_color_name} • {item.pattern_name}</p>
                    <small>Size: {item.size_type}{item.standard_size ? ` (${item.standard_size})` : ''}</small>
                  </div>
                </div>
                <div className="item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateItemQuantity(item, item.quantity - 1)} disabled={updatingId === item.id}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItemQuantity(item, item.quantity + 1)} disabled={updatingId === item.id}><Plus size={14} /></button>
                  </div>
                  <div className="item-price">₹{item.total_price}</div>
                  <button className="btn-icon danger" onClick={() => removeItem(item.id)} disabled={updatingId === item.id}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-panel">
            <h3><MapPin size={16} /> Delivery Address</h3>
            {addresses.length > 0 && !showAddressForm && (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div>
                      <strong>{addr.label || 'Address'}</strong> - {addr.full_name}
                      <div>{addr.address_line1}, {addr.city}</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-sm btn-outline" onClick={() => setShowAddressForm(true)}>Add New Address</button>
              </div>
            )}

            {(addresses.length === 0 || showAddressForm) && (
              <div className="address-form">
                <input placeholder="Label" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                <input placeholder="Full Name *" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                <input placeholder="Phone *" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                <input placeholder="Address Line 1 *" value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                <input placeholder="Address Line 2" value={newAddress.address_line2} onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })} />
                <div className="grid-2">
                  <input placeholder="City *" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  <input placeholder="PIN *" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
                </div>
                <select value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="actions-row">
                  {addresses.length > 0 && <button className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>}
                  <button className="btn btn-primary" onClick={handleSaveAddress}>Save Address</button>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: 18 }}>Checkout Notes</h3>
            <textarea
              rows={3}
              placeholder="Any note for this full checkout"
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
            />

            <div className="summary">
              <div className="summary-row"><span>Items</span><span>{cartItems.length}</span></div>
              <div className="summary-row"><span>Total</span><strong>₹{subtotal}</strong></div>
            </div>

            <button className="btn btn-primary btn-block" disabled={checkoutLoading} onClick={handleCheckout}>
              {checkoutLoading ? 'Processing...' : 'Checkout All Items'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
        .cart-items { display: flex; flex-direction: column; gap: 12px; }
        .cart-item-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; gap: 12px; }
        .item-main { display: flex; gap: 12px; align-items: center; }
        .color-dot { width: 22px; height: 22px; border-radius: 6px; border: 1px solid #ddd; }
        .item-info h4 { margin: 0; text-transform: capitalize; }
        .item-info p { margin: 4px 0; color: #6b7280; font-size: 13px; }
        .item-info small { color: #6b7280; }
        .item-actions { display: flex; align-items: center; gap: 10px; }
        .qty-control { display: flex; align-items: center; gap: 8px; }
        .qty-control button { width: 28px; height: 28px; border: 1px solid #d1d5db; background: white; border-radius: 6px; }
        .item-price { font-weight: 700; color: #111827; min-width: 80px; text-align: right; }
        .checkout-panel { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; height: fit-content; position: sticky; top: 80px; }
        .address-list { display: flex; flex-direction: column; gap: 8px; }
        .address-option { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; cursor: pointer; }
        .address-option.selected { border-color: #4361ee; background: #eff6ff; }
        .address-form { display: flex; flex-direction: column; gap: 8px; }
        .address-form input, .address-form select, textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; box-sizing: border-box; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .summary { background: #f9fafb; border-radius: 8px; padding: 10px; margin: 12px 0; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .summary-row:last-child { margin-bottom: 0; }
        .btn-block { width: 100%; }
        .btn-icon.danger { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; width: 32px; height: 32px; border-radius: 8px; display:flex; align-items:center; justify-content:center; }
        .card.success-card { background: white; border-radius: 12px; border: 1px solid #d1fae5; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        @media (max-width: 960px) {
          .cart-layout { grid-template-columns: 1fr; }
          .checkout-panel { position: static; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
