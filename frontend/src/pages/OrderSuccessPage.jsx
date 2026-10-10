import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck } from 'lucide-react';
import api from '../api/axios';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error('Failed to load order info:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        Retrieving order receipt...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '680px' }}>
      <div
        className="card"
        style={{
          padding: '48px 36px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <div>
          <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Order Confirmed</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Thank You for Your Order!</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '15px' }}>
            We've received your order #{id} and are prepping it for shipment.
          </p>
        </div>

        {/* Order Details Card */}
        {order && (
          <div
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
              <span style={{ fontWeight: '600' }}>{order.first_name} {order.last_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping Destination:</span>
              <span style={{ fontWeight: '600' }}>{order.city}, {order.postal_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <span style={{ fontWeight: '600' }}>{order.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--primary)' }}>₹{parseFloat(order.total_cost).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/orders" className="btn-outline">
            <Package size={18} /> View All Orders
          </Link>
          <Link to="/shop" className="btn-primary">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
