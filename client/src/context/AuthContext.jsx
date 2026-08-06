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

  /**
   * 1. Google OAuth & Gmail Verification Step
   */
  const googleLogin = async (gmailEmail) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { email: gmailEmail });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. Verify 6-Digit OTP Step
   */
  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('cs_jwt_token', token);
      localStorage.setItem('cs_user', JSON.stringify(user));
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. Resend OTP Step
   */
  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email) => {
    return googleLogin(email);
  };

  const signup = async (userData) => {
    return googleLogin(userData.email || 'sarah@greenbean.com');
  };

  const demoLogin = async (role = 'PRODUCER') => {
    setLoading(true);
    let userData = {
      id: `demo-${role.toLowerCase()}`,
      name: `Demo ${role}`,
      email: `demo.${role.toLowerCase()}@circularsync.com`,
      role,
      orgName: `Demo ${role} Hub`,
      address: 'New York, NY',
    };
    let tokenStr = `cs-jwt-token-demo-${role}`;

    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data && res.data.user) {
        userData = res.data.user;
        tokenStr = res.data.token || tokenStr;
      }
    } catch (err) {
      console.warn('API fallback demoLogin:', err.message);
    } finally {
      setToken(tokenStr);
      setUser(userData);
      localStorage.setItem('cs_jwt_token', tokenStr);
      localStorage.setItem('cs_user', JSON.stringify(userData));
      setLoading(false);
    }
    return userData;
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
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, verifyOtp, resendOtp, signup, demoLogin, logout, switchRole }}>
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
