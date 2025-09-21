import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance for admin authentication
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    // Add any additional headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response?.status === 401) {
      const message = error.response.data?.message || 'Authentication failed';
      toast.error(message);

      // If token is invalid/expired, redirect to login
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      const message = error.response.data?.message || 'An error occurred';
      toast.error(message);
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Admin Authentication API functions
export const adminAuthService = {
  // Admin login
  login: async (credentials) => {
    try {
      const response = await adminApi.post('/admin/auth/login', credentials);

      if (response.data.admin) {
        // Store admin info in localStorage for quick access
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));

        // Store the JWT token for API authentication
        if (response.data.token) {
          localStorage.setItem('adminToken', response.data.token);
        }

        toast.success(`Welcome back, ${response.data.admin.name}!`);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin logout
  logout: async () => {
    try {
      const response = await adminApi.post('/admin/auth/logout');

      // Clear stored admin info and token
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('adminToken');

      toast.success('Logged out successfully');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('adminInfo');
      throw error.response?.data || error.message;
    }
  },

  // Check authentication status
  checkAuthStatus: async () => {
    try {
      const response = await adminApi.get('/admin/auth/status');
      return response.data;
    } catch (error) {
      // If status check fails, user is not authenticated
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('adminToken');
      throw error.response?.data || error.message;
    }
  },

  // Get stored admin info (without API call)
  getStoredAdminInfo: () => {
    try {
      const adminInfo = localStorage.getItem('adminInfo');
      return adminInfo ? JSON.parse(adminInfo) : null;
    } catch (error) {
      console.error('Error parsing stored admin info:', error);
      return null;
    }
  },

  // Clear stored admin info
  clearStoredAdminInfo: () => {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('adminToken');
  },

  // Check if user is authenticated (quick check)
  isAuthenticated: () => {
    const adminInfo = adminAuthService.getStoredAdminInfo();
    return adminInfo !== null;
  },

  // Get admin role
  getAdminRole: () => {
    const adminInfo = adminAuthService.getStoredAdminInfo();
    return adminInfo?.role || null;
  },

  // Check if admin has specific permission
  hasPermission: (permission) => {
    // If no permission is specified, deny access
    if (!permission) return false;

    const adminInfo = adminAuthService.getStoredAdminInfo();
    if (!adminInfo?.permissions) return false;

    const permissions = adminInfo.permissions;

    // Check direct permission
    if (permissions[permission]) {
      return true;
    }

    // Check wildcard permissions (e.g., 'content.*' covers 'content.create', 'content.edit', etc.)
    const permissionParts = permission.split('.');
    for (let i = permissionParts.length - 1; i > 0; i--) {
      const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
      if (permissions[wildcardPermission]) {
        return true;
      }
    }

    return false;
  },

  // Get accessible menu items for current admin
  getMenuItems: async () => {
    try {
      const response = await adminApi.get('/admin/menu');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default adminApi;