import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cs_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 response for auto cleanup (exclude authentication routes)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/') || url.includes('/login') || url.includes('/google');

    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('cs_jwt_token');
      localStorage.removeItem('cs_user');
      window.dispatchEvent(new Event('cs-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
