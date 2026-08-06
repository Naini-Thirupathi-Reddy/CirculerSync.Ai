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
    const handleUnauthorized = () => { setUser(null); setToken(null); localStorage.removeItem('cs_user'); localStorage.removeItem('cs_jwt_token'); };
    window.addEventListener('cs-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cs-unauthorized', handleUnauthorized);
  }, []);

  const setSession = (tokenStr, userData) => {
    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
  };

  /**
   * Send real Google credential to backend for verification + OTP generation
   */
  const googleLogin = async (credentialOrEmail) => {
    setLoading(true);
    try {
      // If it's a long JWT string, it's a real Google credential
      const isCredential = credentialOrEmail && credentialOrEmail.length > 100;
      const payload = isCredential
        ? { credential: credentialOrEmail }
        : { email: credentialOrEmail };

      const res = await api.post('/auth/google', payload);
      return res.data; // { requiresOtp, email, demoOtp, ... }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify 6-digit OTP and create session
   */
  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { token: t, user: u } = res.data;
      setSession(t, u);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role = 'PRODUCER') => {
    setLoading(true);
    let userData = { id: `demo-${role.toLowerCase()}`, name: `Demo ${role}`, email: `demo.${role.toLowerCase()}@circularsync.com`, role, orgName: `Demo ${role} Hub` };
    let tokenStr = `cs-demo-${role}`;
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data?.user) { userData = res.data.user; tokenStr = res.data.token || tokenStr; }
    } catch (e) { console.warn(e.message); }
    setSession(tokenStr, userData);
    setLoading(false);
    return userData;
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('cs_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('cs_jwt_token');
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, googleLogin, verifyOtp, resendOtp, demoLogin, logout, switchRole, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
