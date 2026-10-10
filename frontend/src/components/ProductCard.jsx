import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? product.image : `/${product.image}`))
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Product Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '85%', background: '#0F172A', overflow: 'hidden' }}>
        <Link to={`/product/${product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        </Link>

        {/* Category Pill */}
        {product.category_name && (
          <span 
            className="badge badge-primary"
            style={{ position: 'absolute', top: '12px', left: '12px', backdropFilter: 'blur(8px)' }}
          >
            {product.category_name}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: inWishlist ? 'var(--danger)' : '#FFF',
            transition: 'transform var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card Info */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Rating & Review count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FBBF24' }}>
            <Star size={14} fill="currentColor" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
              {product.average_rating > 0 ? product.average_rating : '4.8'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ({product.reviews_count || 12} reviews)
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.id}`} style={{ marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.4' }}>
            {product.name}
          </h3>
        </Link>

        {/* Price & Add to Cart Action */}
        <div style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Price</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>{formattedPrice}</span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)' }}
          >
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
