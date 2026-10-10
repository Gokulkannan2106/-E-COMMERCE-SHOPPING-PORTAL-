import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, ArrowLeft, Package, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    setCouponMsg(res);
  };

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <Link to="/orders" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', fontSize: '13px' }}>
          <Package size={16} style={{ color: 'var(--accent)' }} /> View My Orders
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Your Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={clearCart} style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: '600' }}>
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={56} style={{ opacity: 0.3 }} />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>Your cart is empty</h2>
          <p style={{ maxWidth: '400px', fontSize: '15px' }}>
            Looks like you haven't added anything to your cart yet. Explore our curated gadgets and premium electronics!
          </p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/shop" className="btn-primary">
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link to="/orders" className="btn-outline">
              <Package size={16} /> Track My Orders
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '36px' }}>
          
          {/* Cart Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => {
              const itemImg = item.image 
                ? (item.image.startsWith('http') ? item.image : (item.image.startsWith('/') ? item.image : `/${item.image}`))
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '18px 24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <img
                    src={itemImg}
                    alt={item.name}
                    style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: '10px', background: '#0F172A' }}
                  />

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <Link to={`/product/${item.id}`}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {item.name}
                      </h3>
                    </Link>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Unit Price: ₹{item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '8px 12px', color: 'var(--text-muted)' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '700' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '8px 12px', color: 'var(--text-muted)' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Total Line Price */}
                  <div style={{ minWidth: '100px', textAlign: 'right' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', display: 'block' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: 'var(--text-dark)', padding: '6px', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
                    title="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary & Checkout Box */}
          <div>
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Order Summary</h2>

              {/* Coupon Code Section */}
              {coupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '13px', fontWeight: '600' }}>
                    <Tag size={16} /> Promo '{coupon.code}' ({coupon.discount}% OFF)
                  </div>
                  <button onClick={removeCoupon} style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: '600' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter promo coupon code"
                    className="form-input"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                    Apply
                  </button>
                </form>
              )}

              {couponMsg && (
                <p style={{ fontSize: '12px', color: couponMsg.success ? 'var(--accent)' : 'var(--danger)' }}>
                  {couponMsg.message}
                </p>
              )}

              {/* Price Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Shipping</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '600' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', color: '#FFF', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Order Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> 100% Secure Checkout Guarantee
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
