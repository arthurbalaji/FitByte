import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addCartItem } from '../api';
import { ArrowLeft, ShoppingCart, X, Check, RotateCcw, Eye } from 'lucide-react';
import GeminiDressPreview from '../components/GeminiDressPreview';

const TrialView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;

  // If no order data, redirect back
  useEffect(() => {
    if (!orderData) {
      navigate('/new-order');
    }
  }, [orderData, navigate]);

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setError('');
    try {
      const cartPayload = {
        clothing_type: orderData.selectedClothing.id,
        fabric: orderData.selectedFabric?.id,
        fabric_color: orderData.selectedColor?.id,
        pattern: orderData.selectedPattern?.id,
        size_type: orderData.sizeType,
        standard_size: orderData.sizeType === 'standard' ? orderData.standardSize : null,
        measurements: orderData.sizeType === 'custom' ? orderData.customMeasurements : {},
        gender: orderData.gender,
        fabric_source: 'tailor',
        quantity: quantity,
        customer_notes: customerNotes,
      };
      await addCartItem(cartPayload);
      setCartSuccess({
        clothingType: orderData.selectedClothing?.name,
        quantity,
      });
      setShowCheckout(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (!orderData) return null;

  // Order Success View
  if (cartSuccess) {
    return (
      <div className="trial-view-page">
        <div className="success-container">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2>Added To Cart!</h2>
          <p className="order-number">{cartSuccess.clothingType} × {cartSuccess.quantity}</p>
          <p className="success-message">
            Item added successfully. You can add more products and then checkout all of them together.
          </p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/new-order')}>
              Add Another Product
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
              Go To Cart & Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trial-view-page">
      {/* Header */}
      <div className="trial-header">
        <button className="btn-back" onClick={() => navigate('/new-order', { state: orderData })}>
          <ArrowLeft size={20} />
          Back to Edit
        </button>
        <div className="trial-title">
          <Eye size={24} />
          <h1>Trial View</h1>
        </div>
        <div className="trial-actions">
          {!showCheckout && (
            <button className="btn btn-primary btn-lg" onClick={() => setShowCheckout(true)}>
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`trial-content ${showCheckout ? 'with-checkout' : ''}`}>
        {/* Left: Order Summary */}
        <div className="order-summary-panel">
          <h2>Your Custom Order</h2>
          
          <div className="summary-section">
            <h3>Garment Details</h3>
            <div className="detail-row">
              <span className="label">Type</span>
              <span className="value">{orderData.gender} - {orderData.selectedClothing?.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Fabric</span>
              <span className="value">{orderData.selectedFabric?.name}</span>
            </div>
            {orderData.selectedColor && (
              <div className="detail-row">
                <span className="label">Color</span>
                <span className="value color-value">
                  <span className="color-dot" style={{ backgroundColor: orderData.selectedColor.hex_code }} />
                  {orderData.selectedColor.name}
                </span>
              </div>
            )}
            {orderData.selectedPattern && (
              <div className="detail-row">
                <span className="label">Pattern</span>
                <span className="value">{orderData.selectedPattern.name}</span>
              </div>
            )}
          </div>

          <div className="summary-section">
            <h3>Size & Measurements</h3>
            <div className="detail-row">
              <span className="label">Size Type</span>
              <span className="value">{orderData.sizeType === 'standard' ? `Standard - ${orderData.standardSize}` : 'Custom'}</span>
            </div>
            {orderData.sizeType === 'custom' && orderData.customMeasurements && (
              <div className="measurements-compact">
                {Object.entries(orderData.customMeasurements).filter(([_, v]) => v).map(([key, value]) => (
                  <div key={key} className="measurement-item">
                    <span className="m-label">{key.replace(/_/g, ' ')}</span>
                    <span className="m-value">{value}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-outline btn-edit" onClick={() => navigate('/new-order', { state: orderData })}>
            <RotateCcw size={16} />
            Edit Order Details
          </button>
        </div>

        {/* Center: 4-Angle Preview */}
        <div className="preview-panel">
          <GeminiDressPreview
            gender={orderData.gender || 'male'}
            clothingType={orderData.selectedClothing?.name || 'Shirt'}
            fabricColor={orderData.selectedColor?.hex_code || '#4a90d9'}
            patternName={orderData.selectedPattern?.name || 'solid'}
            fabricName={orderData.selectedFabric?.name || 'Cotton'}
          />
        </div>

        {/* Right: Checkout Panel (shown when Add to Cart clicked) */}
        {showCheckout && (
          <div className="checkout-panel">
            <div className="checkout-header">
              <h2><ShoppingCart size={20} /> Add To Cart</h2>
              <button className="btn-icon" onClick={() => setShowCheckout(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="checkout-body">
              {/* Quantity */}
              <div className="checkout-section">
                <h3>Quantity</h3>
                <div className="quantity-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Notes */}
              <div className="checkout-section">
                <h3>Special Instructions</h3>
                <textarea
                  placeholder="Any special requests for the tailor..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Place Order Button - Fixed at bottom */}
            <div className="checkout-footer">
              <button
                className="btn btn-primary btn-place-order"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                <ShoppingCart size={18} />
                {addingToCart ? 'Adding...' : 'Add Item To Cart'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .trial-view-page {
          min-height: calc(100vh - 64px);
          background: #f8fafc;
        }
        .trial-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          gap: 16px;
        }
        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-back:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        .trial-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1f2937;
        }
        .trial-title h1 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .trial-actions .btn-lg {
          padding: 12px 24px;
          font-size: 15px;
          gap: 10px;
        }
        .trial-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
        }
        .trial-content.with-checkout {
          grid-template-columns: 280px 1fr 400px;
        }
        .order-summary-panel {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          height: fit-content;
          position: sticky;
          top: 88px;
        }
        .order-summary-panel h2 {
          font-size: 18px;
          margin: 0 0 20px;
          color: #1f2937;
        }
        .summary-section {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        .summary-section h3 {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }
        .detail-row .label {
          color: #6b7280;
          font-size: 13px;
        }
        .detail-row .value {
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
          text-transform: capitalize;
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
        .measurements-compact {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin-top: 8px;
        }
        .measurement-item {
          background: #f9fafb;
          padding: 6px 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
        }
        .m-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: capitalize;
        }
        .m-value {
          font-size: 12px;
          font-weight: 600;
          color: #1f2937;
        }
        .btn-edit {
          width: 100%;
          margin-top: 8px;
        }
        .preview-panel {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          min-height: 500px;
        }
        .checkout-panel {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          position: sticky;
          top: 88px;
          max-height: calc(100vh - 112px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .checkout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #f3f4f6;
          flex-shrink: 0;
        }
        .checkout-header h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin: 0;
        }
        .checkout-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .checkout-footer {
          padding: 16px 20px 20px;
          border-top: 1px solid #f3f4f6;
          background: white;
          flex-shrink: 0;
        }
        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }
        .checkout-section {
          margin-bottom: 20px;
        }
        .checkout-section h3 {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px;
        }
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .address-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .address-option:hover {
          border-color: #4361ee;
        }
        .address-option.selected {
          border-color: #4361ee;
          background: #eff6ff;
        }
        .address-radio {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .address-option.selected .address-radio {
          border-color: #4361ee;
          background: #4361ee;
          box-shadow: inset 0 0 0 3px white;
        }
        .address-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .addr-label {
          font-weight: 600;
          font-size: 13px;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .default-tag {
          background: #4361ee;
          color: white;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
        .addr-name {
          font-size: 13px;
          color: #374151;
        }
        .addr-line {
          font-size: 12px;
          color: #6b7280;
        }
        .btn-add-address {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          background: none;
          color: #6b7280;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-add-address:hover {
          border-color: #4361ee;
          color: #4361ee;
        }
        .address-form-compact {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }
        .form-field label .required {
          color: #dc2626;
        }
        .address-form-compact input,
        .address-form-compact select {
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .address-form-compact input:focus,
        .address-form-compact select:focus {
          outline: none;
          border-color: #4361ee;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-actions-row {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .quantity-control {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .quantity-control button {
          width: 36px;
          height: 36px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .quantity-control button:hover {
          background: #f3f4f6;
          border-color: #4361ee;
        }
        .quantity-control span {
          font-weight: 600;
          font-size: 18px;
          min-width: 30px;
          text-align: center;
        }
        .checkout-section textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          resize: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .checkout-section textarea:focus {
          outline: none;
          border-color: #4361ee;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }
        .btn-place-order {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          gap: 10px;
        }
        .success-container {
          max-width: 480px;
          margin: 60px auto;
          text-align: center;
          background: white;
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #dcfce7;
          color: #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .success-container h2 {
          color: #22c55e;
          margin-bottom: 12px;
        }
        .order-number {
          font-size: 20px;
          font-weight: 700;
          color: #4361ee;
          margin-bottom: 8px;
        }
        .success-message {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .success-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
        }
        @media (max-width: 1200px) {
          .trial-content {
            grid-template-columns: 1fr;
          }
          .trial-content.with-checkout {
            grid-template-columns: 1fr;
          }
          .order-summary-panel,
          .checkout-panel {
            position: static;
            max-height: none;
          }
          .checkout-body {
            max-height: none;
          }
        }
        @media (max-width: 768px) {
          .trial-header {
            flex-wrap: wrap;
          }
          .trial-actions {
            width: 100%;
          }
          .trial-actions .btn-lg {
            width: 100%;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .checkout-body {
            padding: 16px;
          }
          .checkout-footer {
            padding: 12px 16px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default TrialView;
