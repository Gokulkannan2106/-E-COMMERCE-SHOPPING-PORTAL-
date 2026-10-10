import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  // Filters State
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const res = await api.get(`/products/?${params.toString()}`);
      if (res.data.results) {
        setProducts(res.data.results);
        setCount(res.data.count);
      } else {
        setProducts(res.data);
        setCount(res.data.length);
      }
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('min_price', minPrice);
    else newParams.delete('min_price');

    if (maxPrice) newParams.set('max_price', maxPrice);
    else newParams.delete('max_price');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const totalPages = Math.ceil(count / 12) || 1;

  return (
    <div className="container" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Explore Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Showing {products.length} of {count} verified items
          </p>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sort By:</span>
          <select
            className="form-input"
            value={sortParam}
            onChange={(e) => updateFilter('sort', e.target.value)}
            style={{ width: 'auto', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', fontSize: '14px' }}
          >
            <option value="" style={{ background: '#0F172A' }}>Featured / Default</option>
            <option value="newest" style={{ background: '#0F172A' }}>Newest Arrivals</option>
            <option value="price_asc" style={{ background: '#0F172A' }}>Price: Low to High</option>
            <option value="price_desc" style={{ background: '#0F172A' }}>Price: High to Low</option>
            <option value="name" style={{ background: '#0F172A' }}>Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(categoryParam || searchParam || sortParam || searchParams.get('min_price') || searchParams.get('max_price')) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active filters:</span>
          {categoryParam && (
            <span className="badge badge-primary" style={{ gap: '6px' }}>
              Category: {categoryParam}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => updateFilter('category', '')} />
            </span>
          )}
          {searchParam && (
            <span className="badge badge-primary" style={{ gap: '6px' }}>
              Search: "{searchParam}"
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => updateFilter('search', '')} />
            </span>
          )}
          <button onClick={clearAllFilters} style={{ fontSize: '13px', color: 'var(--danger)', marginLeft: '8px', fontWeight: '600' }}>
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar & Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
        
        {/* Sidebar Filters */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Categories Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--primary)' }} /> Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => updateFilter('category', '')}
                style={{
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: !categoryParam ? '700' : '500',
                  color: !categoryParam ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: !categoryParam ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  style={{
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: categoryParam === cat.slug ? '700' : '500',
                    color: categoryParam === cat.slug ? 'var(--primary)' : 'var(--text-muted)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: categoryParam === cat.slug ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{cat.name}</span>
                  {cat.products_count > 0 && <span>{cat.products_count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} /> Price Range (₹)
            </h3>
            <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ padding: '8px', fontSize: '13px' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ padding: '8px', fontSize: '13px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '8px', fontSize: '13px' }}>
                Apply Filter
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid & Pagination */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              Loading products...
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid-products">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateFilter('page', pageParam - 1)}
                    className="btn-outline"
                    style={{ padding: '8px 14px', opacity: pageParam <= 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Page {pageParam} of {totalPages}
                  </span>

                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateFilter('page', pageParam + 1)}
                    className="btn-outline"
                    style={{ padding: '8px 14px', opacity: pageParam >= totalPages ? 0.4 : 1 }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No products match your selected filters.</p>
              <button onClick={clearAllFilters} className="btn-outline" style={{ marginTop: '14px' }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
