import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  Layers,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [linksDropdown, setLinksDropdown] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    api.get('/categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error loading categories:', err));
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setUserDropdown(false);
        setLinksDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header ref={navRef} className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px', gap: '20px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={22} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #FFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AURA<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>STORE</span>
          </span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="desktop-search" style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search premium electronics, gadgets..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.04)' }}
          />
          <Search 
            size={18} 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
        </form>

        {/* Navigation Links (Desktop) */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/shop" style={{ fontWeight: '500', color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.color = '#FFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
            Explore Shop
          </Link>

          {/* Quick Menu (Compressed Project Links in Single Dropdown) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setLinksDropdown(!linksDropdown);
                setUserDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                color: linksDropdown ? 'var(--primary)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: linksDropdown ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Layers size={16} />
              <span>Quick Links</span>
              <ChevronDown size={14} style={{ transform: linksDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {linksDropdown && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '260px',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)' }}>
                  All Project Sections
                </div>

                <Link
                  to="/shop"
                  onClick={() => setLinksDropdown(false)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ShoppingBag size={15} style={{ color: 'var(--primary)' }} /> Store Catalog
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setLinksDropdown(false)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Heart size={15} style={{ color: 'var(--danger)' }} /> Saved Wishlist ({wishlist.length})
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setLinksDropdown(false)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <HelpCircle size={15} style={{ color: 'var(--accent)' }} /> 24/7 Support Desk
                </Link>

                {categories.length > 0 && (
                  <>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dark)' }}>
                      Categories
                    </div>
                    {categories.slice(0, 5).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        onClick={() => setLinksDropdown(false)}
                        style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#FFF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </>
                )}

                {isAdmin && (
                  <>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <Link
                      to="/admin"
                      onClick={() => setLinksDropdown(false)}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={15} /> Merchant Dashboard
                    </Link>
                    <a
                      href="/django-admin/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setLinksDropdown(false)}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ShieldCheck size={15} /> Django Admin Panel <ExternalLink size={12} />
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/contact" style={{ fontWeight: '500', color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.color = '#FFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
            Support
          </Link>

          {/* Wishlist Button */}
          <Link 
            to="/wishlist" 
            style={{ position: 'relative', padding: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            title="My Saved Wishlist"
          >
            <Heart size={22} />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'var(--danger)',
                color: '#FFF',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Orders Navigation Button */}
          <Link
            to="/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title="My Orders & Tracking"
          >
            <Package size={18} style={{ color: 'var(--accent)' }} />
            <span>Orders</span>
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#FFF',
              fontWeight: '600'
            }}
          >
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: '#FFF',
                borderRadius: '50%',
                padding: '2px 8px',
                fontSize: '12px'
              }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth Dropdown */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setUserDropdown(!userDropdown);
                  setLinksDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFF'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700'
                }}>
                  {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{user?.first_name || user?.username || 'User'}</span>
              </button>

              {userDropdown && (
                <div 
                  className="glass-panel animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '200px',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <Link 
                    to="/orders" 
                    onClick={() => setUserDropdown(false)}
                    style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <ShoppingBag size={16} /> My Orders
                  </Link>

                  <Link 
                    to="/profile" 
                    onClick={() => setUserDropdown(false)}
                    style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} /> Profile & Settings
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setUserDropdown(false)}
                      style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--danger)',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Join Free
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger & Cart Triggers */}
        <div className="mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ position: 'relative', padding: '8px', color: 'var(--text-main)' }}
          >
            <ShoppingBag size={22} style={{ color: 'var(--primary)' }} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'var(--primary)',
                color: '#FFF',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: '700',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ padding: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%', borderRadius: 'var(--radius-full)' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </form>

          {/* Mobile Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)' }}
            >
              🛍️ Explore Shop
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)' }}
            >
              ❤️ Saved Wishlist ({wishlist.length})
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)' }}
            >
              💬 Support & Help
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)' }}
                >
                  📦 My Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)' }}
                >
                  👤 Profile & Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    📊 Merchant Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontWeight: '600', color: 'var(--danger)', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  🚪 Sign Out ({user?.username})
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline"
                  style={{ flex: 1, textAlign: 'center', padding: '10px' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center', padding: '10px' }}
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
