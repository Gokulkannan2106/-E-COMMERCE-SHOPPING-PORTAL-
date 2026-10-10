import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('auth_tokens');
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setUser(res.data);
      localStorage.setItem('auth_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokens?.access) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [tokens]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    setTokens(res.data);
    localStorage.setItem('auth_tokens', JSON.stringify(res.data));
    
    // Fetch profile
    const profileRes = await api.get('/auth/profile/', {
      headers: { Authorization: `Bearer ${res.data.access}` },
    });
    setUser(profileRes.data);
    localStorage.setItem('auth_user', JSON.stringify(profileRes.data));
    return profileRes.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens?.access,
        isAdmin: user?.is_staff || false,
        login,
        register,
        logout,
        fetchUserProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
