import axios from 'axios';
import { adminAuthService } from '../../services/adminAuthService';

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
    // Get admin token from localStorage
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
    // Handle different error types
    if (error.response?.status === 401) {
      const message = error.response.data?.message || 'Authentication required';
      console.error('RoleService request error:', message);

      // Clear stored admin info and redirect to login
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('adminToken');

      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }

      return Promise.reject(new Error('Authentication required'));
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      console.error('RoleService error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        fullResponse: error.response,
        message: message
      });

      // Log the actual response data content
      console.error('Response data details:', JSON.stringify(error.response.data, null, 2));

      return Promise.reject(new Error(message));
    } else if (error.response?.status >= 500) {
      console.error('RoleService server error');
      return Promise.reject(new Error('Server error. Please try again later.'));
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('RoleService network error');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

// Role Service API functions
const roleService = {
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await roleApi.get('/admin/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (roleId) => {
    try {
      const response = await roleApi.get(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await roleApi.post('/admin/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update role
  updateRole: async (roleId, roleData) => {
    try {
      const response = await roleApi.put(`/admin/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  // Delete role
  deleteRole: async (roleId) => {
    try {
      const response = await roleApi.delete(`/admin/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  // Assign permissions to role
  assignPermissions: async (roleId, permissionIds) => {
    try {
      const response = await roleApi.post(`/admin/roles/${roleId}/permissions`, { permissionIds });
      return response.data;
    } catch (error) {
      console.error('Error assigning permissions:', error);
      throw error;
    }
  },

  // Remove permissions from role
  removePermissions: async (roleId, permissionIds) => {
    try {
      const response = await roleApi.delete(`/admin/roles/${roleId}/permissions`, {
        data: { permissionIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing permissions:', error);
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await roleApi.get('/admin/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  },

  // Get permission by ID
  getPermissionById: async (permissionId) => {
    try {
      const response = await roleApi.get(`/admin/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permission:', error);
      throw error;
    }
  },

  // Create new permission
  createPermission: async (permissionData) => {
    try {
      const response = await roleApi.post('/admin/permissions', permissionData);
      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  },

  // Update permission
  updatePermission: async (permissionId, permissionData) => {
    try {
      const response = await roleApi.put(`/admin/permissions/${permissionId}`, permissionData);
      return response.data;
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  },

  // Delete permission
  deletePermission: async (permissionId) => {
    try {
      const response = await roleApi.delete(`/admin/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  },

  // Add permission to role
  addPermissionToRole: async (roleId, resource, actions) => {
    try {
      const response = await roleApi.post(`/admin/roles/${roleId}/permissions/add`, {
        resource,
        actions
      });
      return response.data;
    } catch (error) {
      console.error('Error adding permission to role:', error);
      throw error;
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (roleId, permissionIds) => {
    try {
      const response = await roleApi.post(`/admin/roles/${roleId}/permissions/remove`, {
        permissionIds
      });
      return response.data;
    } catch (error) {
      console.error('Error removing permission from role:', error);
      throw error;
    }
  }
};

export default roleService;