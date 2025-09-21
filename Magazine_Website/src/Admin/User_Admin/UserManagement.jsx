import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const UserManagement = () => {
  const { theme } = useTheme();
  const { admin: currentAdmin, hasPermission } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'author',
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  const isDark = theme === 'dark';

  // Theme-based styles - Updated for proper contrast
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const bgMain = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const borderMain = isDark ? 'border-gray-700' : 'border-gray-300';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  // Fetch real admin data from API
  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${base}/api/admin/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform admin data to match component structure
        const transformedAdmins = data.admins.map(admin => ({
          id: admin.id,
          firstName: admin.name.split(' ')[0] || '',
          lastName: admin.name.split(' ').slice(1).join(' ') || '',
          email: admin.email,
          phone: '', // Admin model doesn't have phone field
          role: admin.role?.name?.toLowerCase() || 'admin',
          status: admin.isActive ? 'active' : 'inactive',
          avatar: null,
          articles_count: 0, // We'll need to fetch this separately or add to admin model
          last_login: admin.lastLogin || null,
          created_at: admin.createdAt,
          updated_at: admin.updatedAt,
          // Add password field (masked for security)
          password: '••••••••', // Masked password
          permissions: admin.role?.permissions || []
        }));
        setUsers(transformedAdmins);
      } else {
        console.error('Failed to fetch admins:', response.status);
        // Fallback to empty array if API fails
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${base}/api/admin/roles`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform role data to match component structure
        const transformedRoles = data.roles.map(role => ({
          id: role.id,
          name: role.name.toLowerCase(),
          display_name: role.name,
          permissions: role.permissions || []
        }));
        setRoles(transformedRoles);
      } else {
        console.error('Failed to fetch roles:', response.status);
        // Fallback roles
        setRoles([
          { id: 1, name: 'master admin', display_name: 'Master Admin', permissions: ['all'] },
          { id: 2, name: 'content admin', display_name: 'Content Admin', permissions: ['content'] },
          { id: 3, name: 'editor-in-chief', display_name: 'Editor-in-Chief', permissions: ['publish', 'edit'] },
          { id: 4, name: 'section editors', display_name: 'Section Editor', permissions: ['publish', 'edit'] },
          { id: 5, name: 'senior writers', display_name: 'Senior Writer', permissions: ['write'] },
          { id: 6, name: 'staff writers', display_name: 'Staff Writer', permissions: ['write'] },
          { id: 7, name: 'contributors', display_name: 'Contributor', permissions: ['write'] },
          { id: 8, name: 'reviewers', display_name: 'Reviewer', permissions: ['review'] },
          { id: 9, name: 'social media manager', display_name: 'Social Media Manager', permissions: ['social'] },
          { id: 10, name: 'webmaster', display_name: 'Webmaster', permissions: ['technical'] }
        ]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback roles
      setRoles([
        { id: 1, name: 'master admin', display_name: 'Master Admin', permissions: ['all'] },
        { id: 2, name: 'content admin', display_name: 'Content Admin', permissions: ['content'] },
        { id: 3, name: 'editor-in-chief', display_name: 'Editor-in-Chief', permissions: ['publish', 'edit'] },
        { id: 4, name: 'section editors', display_name: 'Section Editor', permissions: ['publish', 'edit'] },
        { id: 5, name: 'senior writers', display_name: 'Senior Writer', permissions: ['write'] },
        { id: 6, name: 'staff writers', display_name: 'Staff Writer', permissions: ['write'] },
        { id: 7, name: 'contributors', display_name: 'Contributor', permissions: ['write'] },
        { id: 8, name: 'reviewers', display_name: 'Reviewer', permissions: ['review'] },
        { id: 9, name: 'social media manager', display_name: 'Social Media Manager', permissions: ['social'] },
        { id: 10, name: 'webmaster', display_name: 'Webmaster', permissions: ['technical'] }
      ]);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filter.role === 'all' || user.role === filter.role;
    const matchesStatus = filter.status === 'all' || user.status === filter.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'author': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contributor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPermissionBadgeColor = (permission) => {
    const category = permission.split('.')[0];
    switch (category) {
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'content': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'users': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'analytics': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'security': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'technical': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'editorial': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'files': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      // Find the selected role ID
      const selectedRole = roles.find(role => role.name === newUser.role);
      if (!selectedRole) {
        alert('Invalid role selected');
        setLoading(false);
        return;
      }

      const response = await fetch(`${base}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          name: `${newUser.firstName} ${newUser.lastName}`.trim(),
          roleId: selectedRole.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Admin user created successfully!');

        // Reset form
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'author',
          status: 'active',
          password: '',
          confirmPassword: ''
        });
        setShowCreateModal(false);

        // Refresh the admin list
        fetchAdmins();
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      // Find the selected role ID
      const selectedRole = roles.find(role => role.name === editingUser.role);
      if (!selectedRole) {
        alert('Invalid role selected');
        setLoading(false);
        return;
      }

      const response = await fetch(`${base}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: `${editingUser.firstName} ${editingUser.lastName}`.trim(),
          email: editingUser.email,
          roleId: selectedRole.id,
          isActive: editingUser.status === 'active'
        })
      });

      if (response.ok) {
        alert('Admin user updated successfully!');
        setShowEditModal(false);
        setEditingUser(null);
        // Refresh the admin list
        fetchAdmins();
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      setLoading(true);

      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('adminToken');

        const response = await fetch(`${base}/api/admin/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (response.ok) {
          alert('Admin user deleted successfully!');
          // Refresh the admin list
          fetchAdmins();
        } else {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select admin users first');
      return;
    }

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedUsers.length} admin user(s)? This action cannot be undone.`
      : `Are you sure you want to ${action} ${selectedUsers.length} admin user(s)?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      // Process each selected user
      const results = await Promise.allSettled(
        selectedUsers.map(async (userId) => {
          if (action === 'delete') {
            const response = await fetch(`${base}/api/admin/users/${userId}`, {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });
            return { userId, success: response.ok };
          } else {
            // For activate/deactivate, update the user status
            const isActive = action === 'activate';
            const response = await fetch(`${base}/api/admin/users/${userId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              },
              body: JSON.stringify({ isActive })
            });
            return { userId, success: response.ok };
          }
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} operation completed for ${successful} admin user(s).`);
        if (failed > 0) {
          alert(`${failed} operation(s) failed.`);
        }
        // Refresh the admin list
        fetchAdmins();
      } else {
        alert('All operations failed. Please try again.');
      }

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getUserInitials = (user) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Get current admin's permissions
  const getCurrentAdminPermissions = () => {
    if (!currentAdmin?.permissions) return [];
    return Object.keys(currentAdmin.permissions).filter(key => currentAdmin.permissions[key]);
  };

  const handleExportUsers = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.id,
          `"${user.firstName}"`,
          `"${user.lastName}"`,
          `"${user.email}"`,
          `"${roles.find(r => r.name === user.role)?.display_name || user.role}"`,
          `"${user.status}"`,
          `"${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}"`,
          `"${new Date(user.created_at).toLocaleDateString()}"`
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Admin users exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users. Please try again.');
    }
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-200 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin User Management</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage admin users, roles, and permissions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className={`px-6 py-3 ${showPasswords ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded-xl transition-all duration-200 font-medium shadow-sm`}
            >
              {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
            </button>
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className={`px-6 py-3 ${showPermissions ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-xl transition-all duration-200 font-medium shadow-sm`}
            >
              {showPermissions ? 'Hide Permissions' : 'Show Permissions'}
            </button>
            <button
              onClick={handleExportUsers}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium shadow-sm"
            >
              Export Users
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-accent text-primary-bg rounded-xl hover:bg-primary-accent-hover transition-all duration-200 font-medium shadow-sm"
            >
              Add New Admin
            </button>
          </div>
        </div>

        {/* Current Admin Info */}
        {currentAdmin && (
          <div className={`mb-8 p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'}`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Current Admin Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentAdmin.name}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentAdmin.email}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Role</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentAdmin.role}</p>
              </div>
            </div>
            {showPermissions && (
              <div className="mt-4">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Your Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {getCurrentAdminPermissions().map(permission => (
                    <span
                      key={permission}
                      className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getPermissionBadgeColor(permission)}`}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Admins
            </h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
          </div>
          <div className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Active Admins
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Roles
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {roles.length}
            </p>
          </div>
          <div className={`border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Permissions
            </h3>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`border rounded-2xl p-6 mb-8 shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
            </div>
            <div>
              <select
                value={filter.role}
                onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.name} value={role.name}>{role.display_name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedUsers.length} admin{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-all duration-200"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className={`rounded ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                    />
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Admin User
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email & ID
                  </th>
                  {showPasswords && (
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Password
                    </th>
                  )}
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Role
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Status
                  </th>
                  {showPermissions && (
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Permissions
                    </th>
                  )}
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Last Login
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`transition-colors duration-200 ${selectedUsers.includes(user.id) ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className={`rounded ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold text-white mr-4 shadow-sm">
                          {getUserInitials(user)}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.email}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        User ID: {user.id}
                      </div>
                    </td>
                    {showPasswords && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user.password}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.password === '••••••••' ? 'Masked' : 'Visible'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {roles.find(r => r.name === user.role)?.display_name || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    {showPermissions && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.permissions?.slice(0, 3).map(permission => (
                            <span
                              key={permission}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPermissionBadgeColor(permission)}`}
                            >
                              {permission}
                            </span>
                          ))}
                          {user.permissions?.length > 3 && (
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              +{user.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-green-600 hover:text-green-700 transition-colors font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-600 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Admin User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>First Name</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Last Name</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {roles.filter(r => r.name !== 'admin').map(role => (
                        <option key={role.name} value={role.name}>{role.display_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Status</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Confirm Password</label>
                    <input
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Admin User</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>First Name</label>
                    <input
                      type="text"
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Last Name</label>
                    <input
                      type="text"
                      value={editingUser.lastName}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {roles.map(role => (
                        <option key={role.name} value={role.name}>{role.display_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? 'Updating...' : 'Update Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && viewingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin User Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingUser(null);
                  }}
                  className={`text-2xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-semibold text-white shadow-lg">
                    {getUserInitials(viewingUser)}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {viewingUser.firstName} {viewingUser.lastName}
                    </h3>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {viewingUser.email}
                    </p>
                  </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Basic Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>User ID:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingUser.id}</p>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>First Name:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingUser.firstName}</p>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Name:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingUser.lastName}</p>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewingUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Role:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {roles.find(r => r.name === viewingUser.role)?.display_name || viewingUser.role}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(viewingUser.status)}`}>
                          {viewingUser.status.charAt(0).toUpperCase() + viewingUser.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Login:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {viewingUser.last_login ? new Date(viewingUser.last_login).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created:</span>
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(viewingUser.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                {showPermissions && viewingUser.permissions && viewingUser.permissions.length > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Permissions</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingUser.permissions.map(permission => (
                        <span
                          key={permission}
                          className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getPermissionBadgeColor(permission)}`}
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingUser(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} transition-colors`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleEditUser(viewingUser);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;