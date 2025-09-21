import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext({
  admin: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  changePassword: () => {},
  hasPermission: () => false,
  hasRole: () => false,
  isMasterAdmin: () => false,
  isContentAdmin: () => false,
  isEditorInChief: () => false,
  isSectionEditor: () => false,
  isWriter: () => false,
  isContributor: () => false,
  isReviewer: () => false,
  isSocialMediaManager: () => false,
  isWebmaster: () => false,
  checkAuthStatus: () => {}
});

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/auth/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAdmin(data.admin);
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
        }
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store admin info and token in localStorage
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      localStorage.setItem('adminToken', data.token);

      // Set admin data
      setAdmin(data.admin);

      return { success: true, admin: data.admin };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('http://localhost:5000/api/admin/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include' // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      setAdmin(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PUT',
        headers,
        credentials: 'include', // Include cookies
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setAdmin(prev => ({ ...prev, ...data.admin }));
      return { success: true, admin: data.admin };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/admin/auth/change-password', {
        method: 'PUT',
        headers,
        credentials: 'include', // Include cookies
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Permission checking based on backend permissions
  const hasPermission = (permission) => {
    if (!admin) return false;

    // Master Admin has all permissions
    if (admin.role === 'Master Admin') return true;

    // Check permissions from backend
    if (admin.permissions) {
      const permissions = admin.permissions;

      // Check for exact permission match
      if (permissions[permission]) {
        return true;
      }

      // Check for wildcard permissions (e.g., 'content.*' covers 'content.create')
      const permissionParts = permission.split('.');
      for (let i = permissionParts.length - 1; i > 0; i--) {
        const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
        if (permissions[wildcardPermission]) {
          return true;
        }
      }

      // For specific permissions like 'content.read', don't grant access based on
      // broader category permissions unless the category permission is explicitly set
      // This prevents 'content.create' from granting access to 'content.read'
      if (permissionParts.length > 1) {
        const category = permissionParts[0];
        // Only grant access if the broad category permission is explicitly set
        if (permissions[category] === true) {
          return true;
        }
      }
    }

    return false;
  };

  const hasRole = (role) => {
    if (!admin) return false;

    // Handle both single role and array of roles
    if (Array.isArray(role)) {
      return role.includes(admin.role?.name) || role.includes(admin.role);
    }

    return admin.role?.name === role || admin.role === role;
  };

  // Role-based access control
  const isMasterAdmin = () => hasRole('Master Admin');
  const isContentAdmin = () => ['Master Admin', 'Content Admin'].includes(admin?.role);
  const isEditorInChief = () => ['Master Admin', 'Content Admin', 'Editor-in-Chief'].includes(admin?.role);
  const isSectionEditor = () => ['Master Admin', 'Content Admin', 'Editor-in-Chief', 'Section Editors'].includes(admin?.role);
  const isWriter = () => ['Master Admin', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers'].includes(admin?.role);
  const isContributor = () => ['Master Admin', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Senior Writers', 'Staff Writers', 'Contributors'].includes(admin?.role);
  const isReviewer = () => ['Master Admin', 'Content Admin', 'Editor-in-Chief', 'Section Editors', 'Reviewers'].includes(admin?.role);
  const isSocialMediaManager = () => hasRole('Social Media Manager');
  const isWebmaster = () => hasRole('Webmaster');

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    isMasterAdmin,
    isContentAdmin,
    isEditorInChief,
    isSectionEditor,
    isWriter,
    isContributor,
    isReviewer,
    isSocialMediaManager,
    isWebmaster,
    checkAuthStatus
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
