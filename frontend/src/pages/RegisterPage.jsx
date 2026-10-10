import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      // Auto-login after successful registration
      await login(formData.username, formData.password);
      navigate('/shop');
    } catch (err) {
      console.error('Registration failed:', err);
      const resData = err.response?.data;
      if (resData) {
        const firstKey = Object.keys(resData)[0];
        setError(`${firstKey}: ${Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]}`);
      } else {
        setError('Failed to create account. Please check your information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '480px' }}>
      <div
        className="glass-panel"
        style={{
          padding: '40px 32px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              margin: '0 auto 12px',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Create an Account</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Unlock exclusive discounts, track orders & save wishlist items
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>First Name</label>
              <input
                type="text"
                name="first_name"
                required
                className="form-input"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                className="form-input"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              name="username"
              required
              className="form-input"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              name="password"
              required
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
            <input
              type="password"
              name="password_confirm"
              required
              className="form-input"
              value={formData.password_confirm}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{ padding: '14px', fontSize: '15px', marginTop: '10px' }}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
