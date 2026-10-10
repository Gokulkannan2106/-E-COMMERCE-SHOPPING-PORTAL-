import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ExternalLink,
  Layers,
  ShoppingBasket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminDashboardPage = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'inventory'

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalMsg, setModalMsg] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    image_url: '',
    description: '',
    available: true,
  });

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, catRes] = await Promise.all([
        api.get('/admin/stats/'),
        api.get('/categories/')
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data);
      if (catRes.data?.length > 0 && !newProduct.category) {
        setNewProduct(prev => ({ ...prev, category: catRes.data[0]?.id || '' }));
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    setCreating(true);
    setModalMsg(null);

    try {
      await api.post('/admin/products/create/', {
        ...newProduct,
        price: parseFloat(newProduct.price),
      });
      setModalMsg({ success: true, text: 'Product added successfully!' });
      setTimeout(() => {
        setShowAddModal(false);
        setModalMsg(null);
        setNewProduct({
          name: '',
          category: categories[0]?.id || '',
          price: '',
          image_url: '',
          description: '',
          available: true,
        });
        loadDashboardData();
      }, 1000);
    } catch (err) {
      console.error('Error creating product:', err);
      setModalMsg({ success: false, text: err.response?.data?.detail || 'Failed to create product' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}/`);
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
        <h2>Admin Access Required</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          You must be logged in as an administrator or staff user to access this dashboard.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Merchant Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Live store metrics, order processing & inventory controls
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ gap: '8px' }}
          >
            <Plus size={18} /> Add New Product
          </button>
          <a
            href="/django-admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ gap: '8px' }}
          >
            Django Admin <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'metrics' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'metrics' ? '#FFF' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <DollarSign size={16} /> Overview & Orders
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'inventory' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'inventory' ? '#FFF' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Layers size={16} /> Inventory Management ({stats?.products?.length || 0})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading dashboard metrics...
        </div>
      ) : stats ? (
        <>
          {activeTab === 'metrics' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Key Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                
                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <DollarSign size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Revenue</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>₹{parseFloat(stats.total_revenue).toFixed(2)}</h3>
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <ShoppingBag size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Orders</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>{stats.total_orders}</h3>
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                    <Package size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Live Products</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>{stats.total_products}</h3>
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Users size={26} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Registered Users</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF' }}>{stats.total_users}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Customer Orders</h3>

                {stats.recent_orders && stats.recent_orders.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 14px' }}>Order ID</th>
                          <th style={{ padding: '12px 14px' }}>Customer</th>
                          <th style={{ padding: '12px 14px' }}>Date</th>
                          <th style={{ padding: '12px 14px' }}>Status</th>
                          <th style={{ padding: '12px 14px' }}>Payment</th>
                          <th style={{ padding: '12px 14px' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent_orders.map((order) => (
                          <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '14px', fontWeight: '700' }}>#{order.id}</td>
                            <td style={{ padding: '14px' }}>{order.first_name} {order.last_name}</td>
                            <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{new Date(order.created).toLocaleDateString()}</td>
                            <td style={{ padding: '14px' }}>
                              <span className={order.paid ? 'badge badge-accent' : 'badge badge-primary'}>
                                {order.paid ? 'Paid' : 'Payment on Delivery'}
                              </span>
                            </td>
                            <td style={{ padding: '14px' }}>{order.payment_method}</td>
                            <td style={{ padding: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                              ₹{parseFloat(order.total_cost).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No orders placed yet.</p>
                )}
              </div>
            </div>
          ) : (
            /* Inventory Management Tab */
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Live Product Catalog</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Showing {stats.products?.length || 0} items</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Item</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Price</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.products?.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#0F172A' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{prod.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID #{prod.id}</div>
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className="badge badge-primary">{prod.category_name}</span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                          ₹{parseFloat(prod.price).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={prod.available ? 'badge badge-accent' : 'badge badge-primary'}>
                            {prod.available ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Link
                              to={`/product/${prod.id}`}
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              title="View on store"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
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
            </div>
          )}
        </>
      ) : null}

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div
            onClick={() => setShowAddModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          <div
            className="glass-panel"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '520px',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: modalMsg.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: modalMsg.success ? 'var(--accent)' : 'var(--danger)', fontSize: '13px' }}>
                {modalMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Ultra Wireless Headphones"
                  className="form-input"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select
                    className="form-input"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#0F172A' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="999.00"
                    className="form-input"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="form-input"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Key features, specifications, and benefits..."
                  className="form-input"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
              >
                {creating ? 'Saving Product...' : 'Publish Product to Store'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
