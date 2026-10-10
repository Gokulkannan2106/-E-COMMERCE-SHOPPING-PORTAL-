import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, Check, ArrowLeft, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}/`);
      setProduct(res.data);
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      await api.post(`/products/${id}/reviews/create/`, {
        rating,
        comment,
      });
      setReviewMsg({ success: true, text: 'Review and rating posted successfully!' });
      setComment('');
      fetchProduct(); // Refresh reviews and average rating
    } catch (err) {
      if (err.response?.status === 401) {
        setReviewMsg({ success: false, text: 'Please sign in to submit a review.' });
      } else {
        const errorDetail = err.response?.data?.detail || err.response?.data?.comment?.[0] || err.response?.data?.error || 'Failed to submit review. Please try again.';
        setReviewMsg({ success: false, text: errorDetail });
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : (product.image.startsWith('/') ? product.image : `/${product.image}`))
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="container" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '50px' }}>
      
      {/* Back Link */}
      <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {/* Main Product Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px' }}>
        
        {/* Product Media Gallery */}
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '440px', background: 'rgba(15, 23, 42, 0.6)' }}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>

        {/* Product Purchase Actions & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Category & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-primary">{product.category_name || 'Electronics'}</span>
            <span className="badge badge-accent">
              <Check size={12} style={{ marginRight: '4px' }} /> In Stock
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2' }}>
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', color: '#FBBF24' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.round(product.average_rating || 5) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700' }}>
              {product.average_rating > 0 ? product.average_rating : '4.9'}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)' }}>
            ₹{parseFloat(product.price).toFixed(2)}
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '15px' }}>
            {product.description || 'Elevate your daily experience with our meticulously engineered product, built with durable materials and tested for supreme performance.'}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '12px 18px', fontSize: '16px', color: 'var(--text-muted)' }}
              >
                -
              </button>
              <span style={{ padding: '0 16px', fontWeight: '700', fontSize: '16px' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '12px 18px', fontSize: '16px', color: 'var(--text-muted)' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary"
              style={{ flex: 1, padding: '14px 28px', fontSize: '16px' }}
            >
              <ShoppingBag size={20} />
              {addedAnimation ? 'Added to Bag!' : 'Add to Shopping Bag'}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="btn-outline"
              style={{ padding: '14px 18px', color: inWishlist ? 'var(--danger)' : '#FFF' }}
              title="Save to wishlist"
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Truck size={18} style={{ color: 'var(--primary)' }} />
              <span>Fast Express Dispatch</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Customer Reviews & Ratings</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Write a Review Card */}
          <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Share Your Experience</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Rating</label>
                  <select
                    className="form-input"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  >
                    <option value={5} style={{ background: '#0F172A' }}>⭐⭐⭐⭐⭐ 5 - Outstanding</option>
                    <option value={4} style={{ background: '#0F172A' }}>⭐⭐⭐⭐ 4 - Good</option>
                    <option value={3} style={{ background: '#0F172A' }}>⭐⭐⭐ 3 - Average</option>
                    <option value={2} style={{ background: '#0F172A' }}>⭐⭐ 2 - Poor</option>
                    <option value={1} style={{ background: '#0F172A' }}>⭐ 1 - Terrible</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Your Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="What did you like or dislike about this product?"
                    className="form-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {reviewMsg && (
                  <p style={{ fontSize: '13px', color: reviewMsg.success ? 'var(--accent)' : 'var(--danger)' }}>
                    {reviewMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '12px' }}>Please log in to write a product review.</p>
                <Link to="/login" className="btn-outline" style={{ display: 'inline-block' }}>
                  Log In
                </Link>
              </div>
            )}
          </div>

          {/* Existing Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{rev.user_name}</div>
                    <div style={{ display: 'flex', color: '#FBBF24' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{rev.comment}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-dark)', marginTop: '4px' }}>
                    {new Date(rev.created).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No customer reviews yet. Be the first to review this product!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
