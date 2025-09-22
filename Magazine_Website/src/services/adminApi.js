import axios from 'axios';

// Create admin-specific axios instance
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for admin API
adminApi.interceptors.request.use(
  (config) => {
    console.log('=== ADMIN API REQUEST ===');
    console.log('Admin Request URL:', config.url);
    console.log('Admin Request method:', config.method);

    // Get admin token from localStorage
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log('Admin token set in Authorization header');
    } else {
      console.warn('No admin token found for admin API request');
    }

    // Enable credentials for cookies
    config.withCredentials = true;
    console.log('withCredentials set to true for admin API');

    return config;
  },
  (error) => {
    console.error('Admin API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for admin API
adminApi.interceptors.response.use(
  (response) => {
    console.log('=== ADMIN API RESPONSE ===');
    console.log('Admin Response URL:', response.config.url);
    console.log('Admin Response status:', response.status);
    return response;
  },
  (error) => {
    console.error('=== ADMIN API ERROR ===');
    console.error('Admin API Error URL:', error.config?.url);
    console.error('Admin API Error status:', error.response?.status);
    console.error('Admin API Error message:', error.response?.data?.message || error.message);

    if (error.response?.status === 401) {
      console.error('Admin authentication failed - redirecting to admin login');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/admin/login?message=session_expired';
    }

    return Promise.reject(error);
  }
);

export default adminApi;