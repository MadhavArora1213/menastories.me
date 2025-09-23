import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://menastories.me/api', // Make sure this matches your backend
  timeout: 45000, // 45 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST DEBUG ===');
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    console.log('Request data:', config.data);

    // For FormData requests, don't set Content-Type - let axios set it automatically
    if (config.data instanceof FormData) {
      console.log('FormData detected - removing default Content-Type header');
      delete config.headers['Content-Type'];
    }

    // Check for regular user token first
    const userToken = localStorage.getItem('authToken');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    // For admin routes, check for admin token and ensure cookies are sent
    // Exclude ALL user-facing routes including comments, OTPs, and public endpoints from admin authentication
    if (config.url && (
        config.url.includes('/admin/') ||
        config.url.includes('/categories') ||
        config.url.includes('/media') ||
        config.url.includes('/tags') ||
        // config.url.includes('/subcategories') || // Temporarily disable admin auth for subcategories
        (config.url.includes('/events') &&
         !config.url.includes('/events/user/submit') &&
         !config.url.includes('/events/categories') &&
         !config.url.includes('/events/types') &&
         !config.url.includes('/events/locations') &&
         !config.url.includes('/events/user/submit/send-otp')) ||
        (config.url.includes('/articles') &&
         !config.url.includes('/public/homepage') &&
         !config.url.includes('/comments') &&
         !config.url.includes('/user/submit') &&
         !config.url.includes('/send-otp') &&
         !config.url.includes('/verify-otp')) ||
        config.url.includes('/video-articles') ||
        config.url.includes('/newsletter') ||
        config.url.includes('/analytics') ||
        config.url.includes('/flipbook') ||
        config.url.includes('/lists')
      ) &&
      // Explicitly exclude ALL user-facing routes from admin authentication
      !config.url.includes('/public/') &&
      !config.url.includes('/comments') &&
      !config.url.includes('/comment') &&
      !config.url.includes('/send-otp') &&
      !config.url.includes('/verify-otp') &&
      !config.url.includes('/user/submit') &&
      !config.url.includes('/auth/') &&
      !config.url.includes('/login') &&
      !config.url.includes('/register')) {

      // Check for admin token (separate from regular user token)
      const adminToken = localStorage.getItem('adminToken');
      console.log('=== ADMIN ROUTE DETECTED ===');
      console.log('Request URL:', config.url);
      console.log('Admin token from localStorage:', adminToken ? 'Found' : 'Not found');
      console.log('Current Authorization header before admin check:', config.headers.Authorization);

      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.log('Set Authorization header with admin token');
      } else {
        console.warn('No admin token found for admin route:', config.url);
        // If no admin token but we have a user token, keep the user token
        // If no tokens at all, leave Authorization header as is (undefined is fine)
      }
      config.withCredentials = true;
      console.log('Set withCredentials to true');
      console.log('Final Authorization header:', config.headers.Authorization);
    } else {
      console.log('=== PUBLIC/USER ROUTE ===');
      console.log('Request URL:', config.url);
      console.log('Using user token for public/user route');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Response URL:', response.config.url);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.error('Authentication failed - redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');

      // Check if we're in admin section
      if (window.location.pathname.startsWith('/admin')) {
        console.log('Redirecting to admin login due to authentication failure');
        window.location.href = '/admin/login?message=session_expired';
      } else {
        window.location.href = '/login?message=session_expired';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied:', error.response.data?.message || 'Insufficient permissions');
      // Don't redirect on 403 - this is authorization failure, not authentication
      // The component should handle this error appropriately
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data?.message || error.response.data || 'Unknown server error');
    } else if (!error.response) {
      // Network error
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  // Handle file uploads with progress
  uploadFile: async (url, file, onProgress, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    return api.post(url, formData, config);
  },

  // Handle bulk operations
  bulkOperation: async (url, data, onProgress) => {
    const config = {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    return api.post(url, data, config);
  },

  // Handle paginated requests
  getPaginated: async (url, params = {}) => {
    const defaultParams = {
      page: 1,
      limit: 20,
      ...params,
    };

    return api.get(url, { params: defaultParams });
  },

  // Handle search requests
  search: async (url, query, filters = {}) => {
    const params = {
      q: query,
      ...filters,
    };

    return api.get(url, { params });
  },

  // Handle export requests
  exportData: async (url, params = {}, filename = 'export') => {
    const response = await api.get(url, {
      params,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return response;
  },
};

export default api;