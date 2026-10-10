import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.95)' }}>
      {/* Benefit Highlights */}
      <div className="container" style={{ padding: '40px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Express Shipping</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fast delivery right to your door</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>100% Secure Checkout</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Razorpay & COD supported</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Easy Returns</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>30-day effortless replacement</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>24/7 Dedicated Support</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Always here to help you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ padding: '50px 20px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800' }}>AURA STORE</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              The modern destination for curated essentials, tech, and lifestyle items powered by Django REST & React.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <li><Link to="/shop" style={{ transition: 'color var(--transition-fast)' }}>All Products</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/orders">Order History</Link></li>
              <li><Link to="/contact">Customer Support</Link></li>
              <li><Link to="/login">Customer Login</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>


          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Architecture</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <li>React 19 + Vite Frontend</li>
              <li>Django REST Framework API</li>
              <li>MySQL Relational Database</li>
              <li>SimpleJWT Bearer Auth</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-dark)' }}>
          © {new Date().getFullYear()} Aura Store Fullstack Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
