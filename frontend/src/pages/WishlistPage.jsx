import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Heart size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px', opacity: 0.5 }} />
        <h2>Your Wishlist is waiting</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Sign in to view and save your favorite items across devices.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>My Saved Items</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {wishlist.length} item{wishlist.length === 1 ? '' : 's'} saved for later
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading your wishlist...
        </div>
      ) : wishlist.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '85%', background: '#0F172A' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--danger)'
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Link to={`/product/${product.id}`}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
                  </Link>

                  <div style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        addToCart(product);
                        toggleWishlist(product.id);
                      }}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                      <ShoppingBag size={14} /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Heart size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <h3>Your wishlist is currently empty</h3>
          <p style={{ marginTop: '6px' }}>Explore the catalog and click the heart icon on any product to save it here.</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Browse Store <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
