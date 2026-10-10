import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured/'),
          api.get('/categories/')
        ]);
        setFeaturedProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
      
      {/* Hero Banner */}
      <section className="container" style={{ paddingTop: '40px' }}>
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '60px 40px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '24px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.8) 100%)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Subtle decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <span className="badge badge-primary" style={{ gap: '6px' }}>
            <Sparkles size={14} /> New Season Collection 2026
          </span>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', lineHeight: '1.1', maxWidth: '720px' }}>
            Next-Gen Shopping <br />
            <span style={{ background: 'linear-gradient(135deg, #818CF8 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Crafted for Speed & Elegance
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '580px', lineHeight: '1.6' }}>
            Experience seamless checkout, verified reviews, and real-time inventory on the fullstack React + Django REST platform.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Link to="/shop" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Browse Catalog <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-outline" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      {categories.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Explore by Category</h2>
            <Link to="/shop" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>
              View all →
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="card"
                style={{
                  padding: '16px 24px',
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Zap size={16} style={{ color: 'var(--primary)' }} />
                <span>{cat.name}</span>
                {cat.products_count > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ({cat.products_count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={24} style={{ color: '#F97316' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Featured Arrivals</h2>
          </div>
          <Link to="/shop" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>
            See all products →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading top products...
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid-products">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No products available yet. Visit the Admin to populate inventory.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
