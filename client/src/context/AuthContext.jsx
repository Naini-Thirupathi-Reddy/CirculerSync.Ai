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

  // Auto-logout on 401
  useEffect(() => {
    const handle = () => { setUser(null); setToken(null); localStorage.removeItem('cs_user'); localStorage.removeItem('cs_jwt_token'); };
    window.addEventListener('cs-unauthorized', handle);
    return () => window.removeEventListener('cs-unauthorized', handle);
  }, []);

  const setSession = (tokenStr, userData) => {
    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
  };

  // ─── Sign Up ───────────────────────────────────────────
  const signUp = async (name, email, password, orgName) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password, orgName });
      const { token: t, user: u } = res.data;
      setSession(t, u);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // ─── Sign In ───────────────────────────────────────────
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: t, user: u } = res.data;
      setSession(t, u);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // ─── Demo Login (judges) ──────────────────────────────
  const demoLogin = async (role = 'PRODUCER') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      const { token: t, user: u } = res.data;
      setSession(t, u);
      return res.data;
    } catch (e) {
      // Fallback if server unavailable
      const userData = { id: `demo-${role.toLowerCase()}`, name: `Demo ${role}`, email: `demo.${role.toLowerCase()}@circularsync.com`, role, orgName: `Demo ${role} Hub` };
      setSession(`cs-demo-${role}`, userData);
      return { user: userData };
    } finally {
      setLoading(false);
    }
  };

  // ─── Switch Role ──────────────────────────────────────
  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('cs_user', JSON.stringify(updated));
  };

  // ─── Logout ───────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cs_jwt_token');
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, demoLogin, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
