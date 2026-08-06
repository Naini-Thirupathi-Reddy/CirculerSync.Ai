import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cs_jwt_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cs_user');
      localStorage.removeItem('cs_jwt_token');
    };
    window.addEventListener('cs-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cs-unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('cs_jwt_token', token);
      localStorage.setItem('cs_user', JSON.stringify(user));
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', userData);
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('cs_jwt_token', token);
      localStorage.setItem('cs_user', JSON.stringify(user));
      return user;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role = 'PRODUCER') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('cs_jwt_token', token);
      localStorage.setItem('cs_user', JSON.stringify(user));
      return user;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem('cs_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cs_jwt_token');
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, demoLogin, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
