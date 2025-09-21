import axios from 'axios';

// Create axios instance for role management
const roleApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
roleApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
roleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.message || 'Authentication failed';
      // Clear stored tokens on auth failure
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Role management API functions
export const roleService = {
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await roleApi.get('/admin/roles');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    try {
      const response = await roleApi.get(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await roleApi.post('/admin/roles', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update role
  updateRole: async (roleId, roleData) => {
    try {
      const response = await roleApi.put(`/admin/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete role
  deleteRole: async (roleId) => {
    try {
      const response = await roleApi.delete(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await roleApi.get('/admin/permissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add permission to role
  addPermissionToRole: async (roleId, resource, actions) => {
    try {
      const response = await roleApi.post(`/admin/roles/${roleId}/permissions`, {
        resource,
        actions
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (roleId, permissionIds) => {
    try {
      const response = await roleApi.delete(`/admin/roles/${roleId}/permissions`, {
        data: { permissionIds }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default roleService;