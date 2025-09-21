import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import roleService from '../services/roleService';

const RoleManagement = () => {
  const { theme } = useTheme();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    accessLevel: 1,
    isAdmin: false,
    canManageUsers: false,
    canManageRoles: false,
    rolePermissions: {}
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';
  const modalBg = isDark ? 'bg-gray-900' : 'bg-white';


  // Available permissions grouped by category
  const permissionCategories = {
    system: [
      { key: 'full_access', label: 'Full System Access' },
      { key: 'user_management', label: 'User Management' },
      { key: 'role_management', label: 'Role Management' },
      { key: 'site_config', label: 'Site Configuration' }
    ],
    content: [
      { key: 'create', label: 'Create Content' },
      { key: 'edit', label: 'Edit Content' },
      { key: 'delete', label: 'Delete Content' },
      { key: 'publish', label: 'Publish Content' },
      { key: 'moderate', label: 'Moderate Content' },
      { key: 'schedule', label: 'Schedule Content' },
      { key: 'approve', label: 'Approve Content' },
      { key: 'quality_control', label: 'Quality Control' },
      { key: 'feature_articles', label: 'Feature Articles' },
      { key: 'investigative', label: 'Investigative Reporting' }
    ],
    editorial: [
      { key: 'strategy', label: 'Editorial Strategy' },
      { key: 'standards', label: 'Editorial Standards' },
      { key: 'approvals', label: 'Content Approvals' },
      { key: 'section_strategy', label: 'Section Strategy' },
      { key: 'writer_coordination', label: 'Writer Coordination' }
    ],
    analytics: [
      { key: 'view', label: 'View Analytics' },
      { key: 'export', label: 'Export Analytics' }
    ],
    security: [
      { key: 'view_logs', label: 'View Security Logs' },
      { key: 'manage_security', label: 'Manage Security Settings' }
    ],
    technical: [
      { key: 'performance_monitoring', label: 'Performance Monitoring' },
      { key: 'maintenance', label: 'System Maintenance' },
      { key: 'backup_restore', label: 'Backup and Restore' }
    ],
    social: [
      { key: 'manage_platforms', label: 'Manage Social Platforms' },
      { key: 'content_promotion', label: 'Content Promotion' },
      { key: 'engagement', label: 'Engagement Management' },
      { key: 'analytics', label: 'Social Analytics' }
    ],
    files: [
      { key: 'dashboard.view', label: 'View Dashboard' },
      { key: 'articles.view', label: 'View Articles' },
      { key: 'articles.edit', label: 'Edit Articles' },
      { key: 'video_articles.view', label: 'View Video Articles' },
      { key: 'video_articles.edit', label: 'Edit Video Articles' },
      { key: 'categories.view', label: 'View Categories' },
      { key: 'categories.edit', label: 'Edit Categories' },
      { key: 'authors.view', label: 'View Authors' },
      { key: 'authors.edit', label: 'Edit Authors' },
      { key: 'media.view', label: 'View Media' },
      { key: 'media.edit', label: 'Edit Media' },
      { key: 'newsletter.view', label: 'View Newsletter' },
      { key: 'newsletter.edit', label: 'Edit Newsletter' },
      { key: 'analytics.view', label: 'View Analytics' },
      { key: 'users.view', label: 'View Users' },
      { key: 'users.edit', label: 'Edit Users' },
      { key: 'roles.view', label: 'View Roles' },
      { key: 'roles.edit', label: 'Edit Roles' },
      { key: 'settings.view', label: 'View Settings' },
      { key: 'settings.edit', label: 'Edit Settings' },
      { key: 'security.view', label: 'View Security' },
      { key: 'security.edit', label: 'Edit Security' },
      { key: 'events.view', label: 'View Events' },
      { key: 'events.edit', label: 'Edit Events' },
      { key: 'flipbooks.view', label: 'View Flipbooks' },
      { key: 'flipbooks.edit', label: 'Edit Flipbooks' },
      { key: 'downloads.view', label: 'View Downloads' },
      { key: 'downloads.edit', label: 'Edit Downloads' },
      { key: 'lists.view', label: 'View Lists' },
      { key: 'lists.edit', label: 'Edit Lists' }
    ],
    users: [
      { key: 'view_content_users', label: 'View Content Users' }
    ]
  };

  // Load roles and permissions from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, permissionsResponse] = await Promise.all([
          roleService.getAllRoles(),
          roleService.getAllPermissions()
        ]);


        setRoles(rolesResponse.roles || []);
        setPermissions(permissionsResponse.permissions || []);
      } catch (error) {
        console.error('Error loading roles and permissions:', error);
        // Fallback to empty arrays if API fails
        setRoles([]);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccessLevelColor = (level) => {
    if (level >= 8) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level >= 6) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (level >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const permissions = Object.entries(newRole.rolePermissions).flatMap(([category, perms]) =>
        perms.map(perm => `${category}.${perm}`)
      );

      const roleData = {
        name: newRole.name,
        description: newRole.description,
        isAdmin: newRole.isAdmin,
        canManageUsers: newRole.canManageUsers,
        canManageRoles: newRole.canManageRoles,
        accessLevel: newRole.accessLevel,
        permissions: permissions
      };

      console.log('Sending role data:', roleData);

      const response = await roleService.createRole(roleData);
      setRoles(prev => [response.role, ...prev]);

      setNewRole({
        name: '',
        description: '',
        accessLevel: 1,
        isAdmin: false,
        canManageUsers: false,
        canManageRoles: false,
        rolePermissions: {}
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole({ ...role });
    setShowEditModal(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roleData = {
        name: editingRole.name,
        description: editingRole.description,
        isAdmin: editingRole.isAdmin,
        canManageUsers: editingRole.canManageUsers,
        canManageRoles: editingRole.canManageRoles,
        accessLevel: editingRole.accessLevel,
        permissions: Object.entries(editingRole.rolePermissions).flatMap(([category, perms]) =>
          perms.map(perm => `${category}.${perm}`)
        )
      };

      const response = await roleService.updateRole(editingRole.id, roleData);
      setRoles(prev => prev.map(role =>
        role.id === editingRole.id ? response.role : role
      ));

      setShowEditModal(false);
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await roleService.deleteRole(roleId);
        setRoles(prev => prev.filter(role => role.id !== roleId));
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Failed to delete role: ' + error.message);
      }
    }
  };

  const togglePermission = (role, category, permission) => {
    const updatedPermissions = { ...role.rolePermissions };

    if (!updatedPermissions[category]) {
      updatedPermissions[category] = [];
    }

    if (updatedPermissions[category].includes(permission)) {
      updatedPermissions[category] = updatedPermissions[category].filter(p => p !== permission);
    } else {
      updatedPermissions[category].push(permission);
    }

    if (role === editingRole) {
      setEditingRole(prev => ({ ...prev, rolePermissions: updatedPermissions }));
    } else {
      setNewRole(prev => ({ ...prev, rolePermissions: updatedPermissions }));
    }
  };

  const PermissionSelector = ({ role, isEditing }) => (
    <div className="space-y-4">
      {Object.entries(permissionCategories).map(([category, perms]) => (
        <div key={category} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className={`font-medium mb-3 capitalize ${textMain}`}>{category.replace('_', ' ')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {perms.map(perm => (
              <label key={perm.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={role.rolePermissions[category]?.includes(perm.key) || false}
                  onChange={() => togglePermission(role, category, perm.key)}
                  className="rounded"
                />
                <span className={`text-sm ${textMain}`}>{perm.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${textMain} mb-2`}>Roles & Permissions</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage user roles and their associated permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create New Role
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Roles
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{roles.length}</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Admin Roles
            </h3>
            <p className={`text-3xl font-bold text-blue-600`}>
              {roles.filter(r => r.isAdmin).length}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Users
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>
              {roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              System Roles
            </h3>
            <p className={`text-3xl font-bold text-green-600`}>
              {roles.filter(r => r.accessLevel >= 8).length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className={`rounded-lg border ${cardBg} p-6 mb-8`}>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Role Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Access Level
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Admin
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Users
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Permissions
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${textMain}`}>
                          {role.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {role.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelColor(role.accessLevel)}`}>
                        Level {role.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isAdmin
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {role.isAdmin ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                      {role.userCount || 0}
                    </td>
                    <td className={`px-6 py-4 text-sm ${textMain}`}>
                      {role.rolePermissions && typeof role.rolePermissions === 'object'
                        ? Object.values(role.rolePermissions).reduce((total, perms) =>
                            total + (Array.isArray(perms) ? perms.length : 0), 0)
                        : 0} permissions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* Create Role Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${modalBg} p-6 rounded-lg w-full max-w-4xl mx-4 max-h-screen overflow-y-auto`}>
              <h2 className={`text-xl font-bold ${textMain} mb-4`}>Create New Role</h2>
              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Role Name</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      list="existing-roles"
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter role name or select from existing"
                      required
                    />
                    <datalist id="existing-roles">
                      {roles.map(role => (
                        <option key={role.id} value={role.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Access Level</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRole.accessLevel || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? '' : parseInt(value);
                        setNewRole(prev => ({ ...prev, accessLevel: numValue === '' ? 1 : (isNaN(numValue) ? 1 : numValue) }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRole.isAdmin}
                      onChange={(e) => setNewRole(prev => ({ ...prev, isAdmin: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Admin Role</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRole.canManageUsers}
                      onChange={(e) => setNewRole(prev => ({ ...prev, canManageUsers: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Can Manage Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRole.canManageRoles}
                      onChange={(e) => setNewRole(prev => ({ ...prev, canManageRoles: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Can Manage Roles</span>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-4`}>Permissions</label>
                  <PermissionSelector role={newRole} isEditing={false} />
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
                    {loading ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && editingRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${modalBg} p-6 rounded-lg w-full max-w-4xl mx-4 max-h-screen overflow-y-auto`}>
              <h2 className={`text-xl font-bold ${textMain} mb-4`}>Edit Role</h2>
              <form onSubmit={handleUpdateRole} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Role Name</label>
                    <input
                      type="text"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole(prev => ({ ...prev, name: e.target.value }))}
                      list="existing-roles-edit"
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter role name or select from existing"
                      required
                    />
                    <datalist id="existing-roles-edit">
                      {roles.map(role => (
                        <option key={role.id} value={role.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Access Level</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingRole.accessLevel || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? '' : parseInt(value);
                        setEditingRole(prev => ({ ...prev, accessLevel: numValue === '' ? 1 : (isNaN(numValue) ? 1 : numValue) }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Description</label>
                  <textarea
                    value={editingRole.description}
                    onChange={(e) => setEditingRole(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRole.isAdmin}
                      onChange={(e) => setEditingRole(prev => ({ ...prev, isAdmin: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Admin Role</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRole.canManageUsers}
                      onChange={(e) => setEditingRole(prev => ({ ...prev, canManageUsers: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Can Manage Users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRole.canManageRoles}
                      onChange={(e) => setEditingRole(prev => ({ ...prev, canManageRoles: e.target.checked }))}
                      className="rounded"
                    />
                    <span className={`text-sm ${textMain}`}>Can Manage Roles</span>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-4`}>Permissions</label>
                  <PermissionSelector role={editingRole} isEditing={true} />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRole(null);
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
                    {loading ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;