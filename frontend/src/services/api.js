import axios from 'axios';

// Axios instance with JWT interceptor — all API calls go through here
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('dispatch_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) { /* ignore */ }
  return config;
});

// Response interceptor — handle 401 by redirecting to auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dispatch_user');
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
