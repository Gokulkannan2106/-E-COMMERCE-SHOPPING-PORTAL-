import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck,
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ExternalLink,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Store,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminDashboardPage = () => {
  const { user, isAdmin, isAuthenticated, login } = useAuth();
  
  // Dashboard & Navigation state
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'analytics'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  // Product Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'out_of_stock'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc', 'name'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    image_url: '',
    description: '',
    available: true,
  });

  // Login form state for quick login screen
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Trigger toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all admin data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, catRes, prodRes, ordersRes] = await Promise.all([
        api.get('/admin/stats/').catch(() => ({ data: null })),
        api.get('/categories/').catch(() => ({ data: [] })),
        api.get('/admin/products/?all=true').catch(() => ({ data: null })),
        api.get('/admin/orders/').catch(() => ({ data: null }))
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (catRes?.data) setCategories(catRes.data);

      // Handle products list
      let prods = [];
      if (prodRes?.data) {
        prods = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || [];
      } else if (statsRes?.data?.products) {
        prods = statsRes.data.products;
      }
      setProducts(prods);

      // Handle orders list
      let ords = [];
      if (ordersRes?.data) {
        ords = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.results || [];
      } else if (statsRes?.data?.recent_orders) {
        ords = statsRes.data.recent_orders;
      }
      setOrders(ords);

      // Initialize default category for form
      if (catRes?.data?.length > 0 && !productForm.category) {
        setProductForm(prev => ({ ...prev, category: catRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Failed to refresh some admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Quick Admin Login
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(loginUsername, loginPassword);
      showToast('Signed in successfully as Administrator!');
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PRODUCT MANAGEMENT ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setProductForm({
      name: '',
      category: categories[0]?.id || '',
      price: '',
      image_url: '',
      description: '',
      available: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category || categories.find(c => c.name === product.category_name)?.id || categories[0]?.id || '',
      price: product.price,
      image_url: product.image_url || product.image || '',
      description: product.description || '',
      available: product.available ?? true,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showToast('Please provide product name and price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        category: parseInt(productForm.category, 10),
        price: parseFloat(productForm.price),
        image_url: productForm.image_url.trim() || undefined,
        description: productForm.description.trim(),
        available: productForm.available,
      };

      const res = await api.post('/admin/products/', payload);
      const createdProd = res.data;

      // Update state immediately
      setProducts(prev => [createdProd, ...prev]);
      setShowAddModal(false);
      showToast(`Product "${createdProd.name}" added successfully!`);
      // Refresh stats
      loadAllData();
    } catch (err) {
      console.error('Error creating product:', err);
      const detail = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create product';
      showToast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        category: parseInt(productForm.category, 10),
        price: parseFloat(productForm.price),
        image_url: productForm.image_url.trim(),
        description: productForm.description.trim(),
        available: productForm.available,
      };

      const res = await api.patch(`/admin/products/${selectedProduct.id}/`, payload);
      const updatedProd = res.data;

      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      setShowEditModal(false);
      setSelectedProduct(null);
      showToast(`Product "${updatedProd.name}" updated successfully!`);
      // Refresh stats
      loadAllData();
    } catch (err) {
      console.error('Error updating product:', err);
      showToast(err.response?.data?.detail || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Stock / Availability
  const handleToggleStock = async (product) => {
    const newStatus = !product.available;
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: newStatus } : p));

    try {
      await api.patch(`/admin/products/${product.id}/`, { available: newStatus });
      showToast(`"${product.name}" marked as ${newStatus ? 'In Stock' : 'Out of Stock'}`);
    } catch (err) {
      console.error('Error updating stock status:', err);
      // Revert optimistic update
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: !newStatus } : p));
      showToast('Failed to update stock status', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      await api.delete(`/admin/products/${selectedProduct.id}/`);
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      showToast(`Product "${selectedProduct.name}" deleted successfully.`);
      setSelectedProduct(null);
      loadAllData();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Failed to delete product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order:', err);
      showToast('Failed to update order status', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FILTERED & SORTED PRODUCTS
  // ─────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search
      const matchesSearch = !searchQuery.trim() || 
        prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(prod.id).includes(searchQuery);

      // Category
      const matchesCategory = selectedCategory === 'all' || 
        String(prod.category) === String(selectedCategory) ||
        prod.category_name?.toLowerCase() === selectedCategory.toLowerCase();

      // Stock
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in_stock' && prod.available) ||
        (stockFilter === 'out_of_stock' && !prod.available);

      return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id; // default newest
    });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Inventory stats
  const totalInStock = useMemo(() => products.filter(p => p.available).length, [products]);
  const totalOutOfStock = useMemo(() => products.filter(p => !p.available).length, [products]);
  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
  }, [products]);

  // ─────────────────────────────────────────────────────────────
  // UNAUTHENTICATED OR NON-ADMIN LOCK SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 20px', maxWidth: '520px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '40px 32px', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--danger)',
            margin: '0 auto 20px'
          }}>
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Restricted access. Sign in with store administrator credentials to manage products, view sales metrics, and fulfill customer orders.
          </p>

          {/* Quick One-Click Admin Sign-In Pill */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
              <ShieldCheck size={16} /> Quick One-Click Admin Access
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Default admin demo credentials pre-filled (<strong>admin</strong> / <strong>admin123</strong>).
            </p>
            <button
              onClick={() => handleAdminLogin()}
              disabled={loginLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '10px 14px', fontSize: '14px', gap: '8px', justifyContent: 'center' }}
            >
              {loginLoading ? 'Signing In...' : '⚡ One-Click Admin Login'}
            </button>
          </div>

          {loginError && (
            <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          {/* Custom Credentials Form */}
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Username</label>
              <input
                type="text"
                required
                className="form-input"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-outline"
              style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '6px' }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In With Credentials'}
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Store size={14} /> Return to Store Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN ADMIN DASHBOARD RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#FFF',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          fontSize: '14px',
          fontWeight: '600',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>Merchant Admin Dashboard</h1>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Live Store
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Store inventory, real-time product management, customer orders and platform metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ gap: '8px', padding: '10px 20px', fontSize: '14px' }}
          >
            <Plus size={18} /> Add New Product
          </button>

          <button
            onClick={loadAllData}
            className="btn-outline"
            style={{ gap: '6px', padding: '10px 14px', fontSize: '14px' }}
            title="Refresh All Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <a
            href="/django-admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ gap: '6px', padding: '10px 14px', fontSize: '14px' }}
          >
            <span>Django Admin</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Total Products */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Live Catalog</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>{products.length} Products</div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px' }}>
              {totalInStock} In Stock • {totalOutOfStock} Out of Stock
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Store Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>
              ₹{stats?.total_revenue !== undefined ? parseFloat(stats.total_revenue).toFixed(2) : '0.00'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              From paid orders
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Total Orders</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>
              {stats?.total_orders || orders.length} Orders
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Active customer orders
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Registered Users</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>
              {stats?.total_users || 0} Accounts
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Customers & Merchants
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '9px 20px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'products' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'products' ? '#FFF' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Package size={17} />
          <span>Product Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '9px 20px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'orders' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'orders' ? '#FFF' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ShoppingBag size={17} />
          <span>Orders & Fulfillment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '9px 20px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'analytics' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'analytics' ? '#FFF' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <TrendingUp size={17} />
          <span>Sales & Analytics</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PRODUCT MANAGEMENT
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Controls Bar: Search, Category, Stock Filter, Sort, Add Button */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <input
                type="text"
                placeholder="Search products by title, description or ID..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: 'var(--radius-md)' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Category Filter */}
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '150px', borderRadius: 'var(--radius-md)' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#0F172A' }}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '130px', borderRadius: 'var(--radius-md)' }}
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock ({totalInStock})</option>
                <option value="out_of_stock">Out of Stock ({totalOutOfStock})</option>
              </select>

              {/* Sort By */}
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '140px', borderRadius: 'var(--radius-md)' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>

              <button
                onClick={handleOpenAdd}
                className="btn-primary"
                style={{ gap: '6px', padding: '10px 16px', fontSize: '13px' }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

          </div>

          {/* Product Table Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Table Header Summary */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                Showing <span style={{ color: 'var(--primary)' }}>{filteredProducts.length}</span> of {products.length} items
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Total Catalog Value: <strong style={{ color: '#FFF' }}>₹{totalInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                <div>Loading product inventory...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <h4 style={{ color: '#FFF', marginBottom: '6px' }}>No products found</h4>
                <p style={{ fontSize: '13px' }}>Try adjusting your search query or category filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setStockFilter('all'); }}
                  className="btn-outline"
                  style={{ marginTop: '14px', fontSize: '13px', padding: '8px 16px' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '14px 18px', width: '380px' }}>Product</th>
                      <th style={{ padding: '14px 18px' }}>Category</th>
                      <th style={{ padding: '14px 18px' }}>Price</th>
                      <th style={{ padding: '14px 18px' }}>Stock Status</th>
                      <th style={{ padding: '14px 18px' }}>Rating</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => (
                      <tr 
                        key={prod.id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background var(--transition-fast)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Thumbnail & Title */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img
                              src={prod.image || prod.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                              alt={prod.name}
                              style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', background: '#0F172A', flexShrink: 0 }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px', lineHeight: '1.3' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                <span>ID: #{prod.id}</span>
                                {prod.slug && <span>• {prod.slug}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '14px 18px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                            {prod.category_name || categories.find(c => c.id === prod.category)?.name || 'General'}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>
                          ₹{parseFloat(prod.price).toFixed(2)}
                        </td>

                        {/* Stock Toggle Switch */}
                        <td style={{ padding: '14px 18px' }}>
                          <button
                            onClick={() => handleToggleStock(prod)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: 'pointer',
                              background: prod.available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: prod.available ? 'var(--accent)' : 'var(--danger)',
                              transition: 'all 0.2s'
                            }}
                            title="Click to toggle availability"
                          >
                            <span style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: prod.available ? 'var(--accent)' : 'var(--danger)'
                            }} />
                            <span>{prod.available ? 'In Stock' : 'Out of Stock'}</span>
                          </button>
                        </td>

                        {/* Rating */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          ★ {prod.average_rating || '5.0'}
                        </td>

                        {/* Action Buttons */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            
                            {/* View live in store */}
                            <Link
                              to={`/product/${prod.id}`}
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              title="View on Storefront"
                              target="_blank"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            {/* Edit Product */}
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--primary)' }}
                              title="Edit product"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Product */}
                            <button
                              onClick={() => handleOpenDelete(prod)}
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--danger)' }}
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ORDERS MANAGEMENT
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Customer Orders & Fulfillment</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Manage incoming orders, update shipping statuses, and view customer purchase details.
                </p>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {orders.length} orders
              </div>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>No customer orders placed yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Order ID</th>
                      <th style={{ padding: '12px 14px' }}>Customer</th>
                      <th style={{ padding: '12px 14px' }}>Date</th>
                      <th style={{ padding: '12px 14px' }}>Fulfillment Status</th>
                      <th style={{ padding: '12px 14px' }}>Payment</th>
                      <th style={{ padding: '12px 14px' }}>Total</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '14px', fontWeight: '700' }}>#{order.id}</td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: '600' }}>{order.first_name} {order.last_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.email}</div>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {new Date(order.created).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' :
                                        order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' :
                                        order.status === 'Shipped' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: order.status === 'Delivered' ? 'var(--accent)' :
                                   order.status === 'Cancelled' ? 'var(--danger)' :
                                   order.status === 'Shipped' ? 'var(--primary)' : 'var(--warning)',
                          }}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div>
                            <span className={order.paid ? 'badge badge-accent' : 'badge badge-primary'} style={{ fontSize: '11px' }}>
                              {order.paid ? 'Paid' : 'Pending Payment'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {order.payment_method || 'Online / COD'}
                          </div>
                        </td>
                        <td style={{ padding: '14px', fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>
                          ₹{parseFloat(order.total_cost).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <select
                            className="form-input"
                            style={{ width: 'auto', padding: '6px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                            value={order.status || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="Pending" style={{ background: '#0F172A' }}>Pending</option>
                            <option value="Processing" style={{ background: '#0F172A' }}>Processing</option>
                            <option value="Shipped" style={{ background: '#0F172A' }}>Shipped</option>
                            <option value="Delivered" style={{ background: '#0F172A' }}>Delivered</option>
                            <option value="Cancelled" style={{ background: '#0F172A' }}>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SALES & ANALYTICS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Order Status Breakdown */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Order Status Distribution</h3>
            
            {stats?.status_breakdown ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(stats.status_breakdown).map(([statusName, count]) => {
                  const percentage = stats.total_orders > 0 ? ((count / stats.total_orders) * 100).toFixed(0) : 0;
                  return (
                    <div key={statusName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{statusName}</span>
                        <span style={{ fontWeight: '700' }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          borderRadius: '4px',
                          background: statusName === 'Delivered' ? 'var(--accent)' :
                                      statusName === 'Cancelled' ? 'var(--danger)' :
                                      statusName === 'Shipped' ? 'var(--primary)' : 'var(--warning)'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No order status data available yet.</p>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Top Performing Products</h3>

            {stats?.top_products && stats.top_products.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats.top_products.map((item, index) => (
                  <div key={item.product__id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--primary)'
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.product__name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹{item.product__price}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-accent" style={{ fontSize: '12px' }}>
                        {item.total_sold} units sold
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No completed sales registered yet.</p>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: ADD NEW PRODUCT
          ───────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            onClick={() => setShowAddModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}
          />

          <div
            className="glass-panel"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '560px',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-card)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Add New Product</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Create and publish a new item into store catalog</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Category *</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#0F172A' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="2499.00"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="form-input"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
                {productForm.image_url && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={productForm.image_url}
                      alt="Preview"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Key features, specifications, and warranty details..."
                  className="form-input"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="addAvailable"
                  checked={productForm.available}
                  onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="addAvailable" style={{ fontSize: '14px', cursor: 'pointer' }}>
                  Product is In Stock & Available for Purchase immediately
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 2, padding: '12px' }}
                >
                  {submitting ? 'Creating Product...' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: EDIT PRODUCT
          ───────────────────────────────────────────────────────────── */}
      {showEditModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            onClick={() => setShowEditModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}
          />

          <div
            className="glass-panel"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '560px',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-card)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Edit Product #{selectedProduct.id}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Modify product pricing, stock, title, or media</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Category *</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#0F172A' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
                {productForm.image_url && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={productForm.image_url}
                      alt="Preview"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="editAvailable"
                  checked={productForm.available}
                  onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="editAvailable" style={{ fontSize: '14px', cursor: 'pointer' }}>
                  Product is Available & In Stock
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 2, padding: '12px' }}
                >
                  {submitting ? 'Saving Changes...' : 'Save Product Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: DELETE PRODUCT CONFIRMATION
          ───────────────────────────────────────────────────────────── */}
      {showDeleteModal && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            onClick={() => setShowDeleteModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)' }}
          />

          <div
            className="glass-panel"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '460px',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trash2 size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{selectedProduct.name}"</strong>? This will remove it from the catalog and store search.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--danger)',
                  color: '#FFF',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
