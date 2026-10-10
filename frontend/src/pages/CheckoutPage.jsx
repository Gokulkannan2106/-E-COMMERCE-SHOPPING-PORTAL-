import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CheckoutPage = () => {
  const { cartItems, coupon, subtotal, discountAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    address: '',
    postal_code: '',
    city: '',
    payment_method: 'COD',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Your bag is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Add items to your bag before checking out.</p>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      coupon_id: coupon ? coupon.id : null,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await api.post('/orders/create/', payload);
      try {
        const local = JSON.parse(localStorage.getItem('local_orders') || '[]');
        local.unshift(res.data);
        localStorage.setItem('local_orders', JSON.stringify(local.slice(0, 25)));
      } catch (storageErr) {
        console.warn('Could not save order locally:', storageErr);
      }
      clearCart();
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Back Link */}
      <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', width: 'fit-content' }}>
        <ArrowLeft size={16} /> Return to Store
      </Link>

      <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Express Checkout</h1>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
        
        {/* Shipping & Payment Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Contact Details */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>1. Contact Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>2. Shipping Address</h3>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Street Address</label>
              <input
                type="text"
                name="address"
                required
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>City</label>
                <input
                  type="text"
                  name="city"
                  required
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Postal / ZIP Code</label>
                <input
                  type="text"
                  name="postal_code"
                  required
                  className="form-input"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>3. Payment Method</h3>
            
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: formData.payment_method === 'COD' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: formData.payment_method === 'COD' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="payment_method"
                value="COD"
                checked={formData.payment_method === 'COD'}
                onChange={handleChange}
              />
              <Truck size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <span style={{ fontWeight: '700', fontSize: '15px', display: 'block' }}>Cash on Delivery (COD)</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pay comfortably when your order arrives</span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: formData.payment_method === 'Razorpay' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: formData.payment_method === 'Razorpay' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="payment_method"
                value="Razorpay"
                checked={formData.payment_method === 'Razorpay'}
                onChange={handleChange}
              />
              <CreditCard size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <span style={{ fontWeight: '700', fontSize: '15px', display: 'block' }}>Razorpay / UPI / NetBanking</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Instant online payment gateway</span>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary Column */}
        <div>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Order Summary ({cartItems.length} items)</h3>

            {/* Item List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}>
                  <span>Coupon Discount ({coupon?.discount}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--accent)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <span>Total Due</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            >
              {loading ? 'Processing Order...' : `Place Order (₹${total.toFixed(2)})`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> 256-bit Encrypted Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
