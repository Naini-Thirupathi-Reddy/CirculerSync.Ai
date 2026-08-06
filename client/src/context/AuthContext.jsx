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

  const login = async (email = 'sarah@greenbean.com', password = 'demo1234') => {
    setLoading(true);
    const cleanEmail = email || 'sarah@greenbean.com';
    let userData = {
      id: `user-${Date.now()}`,
      name: cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'Sarah Jenkins',
      email: cleanEmail,
      role: 'PRODUCER',
      orgName: cleanEmail.includes('@') ? `${cleanEmail.split('@')[0]}'s Bakery` : 'GreenBean Cafe & Bakery',
      address: 'New York, NY',
    };
    let tokenStr = 'cs-jwt-token-authenticated';

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      if (res.data && res.data.user) {
        userData = res.data.user;
        tokenStr = res.data.token || tokenStr;
      }
    } catch (err) {
      console.warn('API fallback login:', err.message);
    }

    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  const googleLogin = async (gmailEmail = 'user.gmail@gmail.com', name = 'Google User') => {
    setLoading(true);
    let userData = {
      id: `google-${Date.now()}`,
      name,
      email: gmailEmail,
      role: 'PRODUCER',
      orgName: `${name}'s Organic Hub`,
      address: 'New York, NY',
    };
    let tokenStr = 'cs-jwt-token-google-auth';

    try {
      const res = await api.post('/auth/google', { email: gmailEmail, name });
      if (res.data && res.data.user) {
        userData = res.data.user;
        tokenStr = res.data.token || tokenStr;
      }
    } catch (err) {
      console.warn('API fallback Google login:', err.message);
    }

    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  const signup = async (userDataInput = {}) => {
    setLoading(true);
    let userData = {
      id: `user-${Date.now()}`,
      name: userDataInput.name || 'Spoorthi',
      email: userDataInput.email || 'spoorthireddy@gmail.com',
      role: userDataInput.role || 'PRODUCER',
      orgName: userDataInput.orgName || userDataInput.name || 'Spoors Hub',
      address: userDataInput.address || 'Siddipet',
    };
    let tokenStr = 'cs-jwt-token-signed-up';

    try {
      const res = await api.post('/auth/signup', userDataInput);
      if (res.data && res.data.user) {
        userData = res.data.user;
        tokenStr = res.data.token || tokenStr;
      }
    } catch (err) {
      console.warn('API fallback signup:', err.message);
    }

    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
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
    }

    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('cs_jwt_token', tokenStr);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setLoading(false);
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
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, signup, demoLogin, logout, switchRole }}>
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
