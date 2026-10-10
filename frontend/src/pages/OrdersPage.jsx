import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShoppingBag, ArrowRight, Search, CheckCircle2, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    let combined = [];

    // 1. If authenticated, fetch from backend API
    if (isAuthenticated) {
      try {
        const res = await api.get('/orders/my-orders/');
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        combined = [...list];
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
      }
    }

    // 2. Also merge with any orders placed from this browser session
    try {
      const local = JSON.parse(localStorage.getItem('local_orders') || '[]');
      if (Array.isArray(local)) {
        // Merge without duplicates by ID
        local.forEach((locOrder) => {
          if (!combined.some((o) => o.id === locOrder.id)) {
            combined.push(locOrder);
          }
        });
      }
    } catch (e) {
      console.warn('Could not read local_orders:', e);
    }

    // Sort by id descending
    combined.sort((a, b) => b.id - a.id);
    setOrders(combined);
    setLoading(false);
  };

  const handleLookupOrder = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await api.get(`/orders/${lookupId.trim()}/`);
      setLookupResult(res.data);
    } catch (err) {
      setLookupError('Order not found. Please verify the order number.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>My Orders & Receipts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Track deliveries, past orders, and payment receipts.
          </p>
        </div>

        {/* Quick Order Lookup Form */}
        <form onSubmit={handleLookupOrder} style={{ display: 'flex', gap: '8px', maxWidth: '340px', width: '100%' }}>
          <input
            type="number"
            placeholder="Track Order ID (e.g. 13)"
            className="form-input"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            style={{ fontSize: '13px', padding: '8px 12px' }}
          />
          <button type="submit" disabled={searching} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <Search size={15} /> Track
          </button>
        </form>
      </div>

      {/* Lookup Result Box if searched */}
      {lookupResult && (
        <div className="card animate-fade-in" style={{ padding: '24px', borderColor: 'var(--primary)', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-accent">Found Order #{lookupResult.id}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: {lookupResult.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recipient: {lookupResult.first_name} {lookupResult.last_name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lookupResult.address}, {lookupResult.city}</p>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
              ₹{parseFloat(lookupResult.total_cost || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {lookupError && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '14px' }}>
          {lookupError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading orders...
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Order #{order.id}</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Placed on {new Date(order.created).toLocaleDateString()} at {new Date(order.created).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={order.paid ? 'badge badge-accent' : 'badge badge-primary'}>
                    {order.paid ? 'Paid' : 'Payment on Delivery'}
                  </span>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                    {order.status || 'Processing'}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{parseFloat(order.total_cost || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{item.product_name}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × ₹{parseFloat(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span>Delivery: {order.address}, {order.city} ({order.postal_code})</span>
                <span>Payment Method: {order.payment_method}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <ShoppingBag size={52} style={{ opacity: 0.3 }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>No orders yet</h2>
          <p style={{ maxWidth: '420px', fontSize: '14px' }}>
            When you place orders through the cart or checkout, they will appear here along with tracking updates and item receipts.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Explore Products <ArrowRight size={16} />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn-outline">
                Sign In to View Saved Account Orders
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
