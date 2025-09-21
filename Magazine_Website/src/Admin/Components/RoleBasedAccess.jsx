import React, { useContext, useEffect, useState } from 'react';

// Role-based access control component
const RoleBasedAccess = ({
  children,
  allowedRoles = [],
  allowedPermissions = [],
  fallback = null,
  requireAllPermissions = false
}) => {
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role and permissions from localStorage or context
    const getUserAccess = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const role = userData.role || null;
        const permissions = userData.permissions || [];

        setUserRole(role);
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error getting user access:', error);
        setUserRole(null);
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    getUserAccess();
  }, []);

  // Show loading state
  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>;
  }

  // Check role-based access
  const hasRoleAccess = () => {
    if (!allowedRoles.length) return true;
    if (!userRole) return false;
    return allowedRoles.includes(userRole.name);
  };

  // Check permission-based access
  const hasPermissionAccess = () => {
    if (!allowedPermissions.length) return true;
    if (!userPermissions.length) return false;

    if (requireAllPermissions) {
      // User must have ALL specified permissions
      return allowedPermissions.every(permission =>
        userPermissions.some(userPerm =>
          userPerm.includes(permission) || permission.includes(userPerm)
        )
      );
    } else {
      // User must have at least ONE of the specified permissions
      return allowedPermissions.some(permission =>
        userPermissions.some(userPerm =>
          userPerm.includes(permission) || permission.includes(userPerm)
        )
      );
    }
  };

  // Grant access if user has required role OR required permissions
  const hasAccess = hasRoleAccess() || hasPermissionAccess();

  // Return children if access granted, otherwise return fallback
  return hasAccess ? children : (fallback || null);
};

// Higher-order component for role-based access
export const withRoleAccess = (allowedRoles = [], allowedPermissions = [], fallback = null) => {
  return (WrappedComponent) => {
    return (props) => (
      <RoleBasedAccess
        allowedRoles={allowedRoles}
        allowedPermissions={allowedPermissions}
        fallback={fallback}
      >
        <WrappedComponent {...props} />
      </RoleBasedAccess>
    );
  };
};

// Hook for checking access programmatically
export const useRoleAccess = () => {
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const getUserAccess = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(userData.role || null);
        setUserPermissions(userData.permissions || []);
      } catch (error) {
        setUserRole(null);
        setUserPermissions([]);
      }
    };

    getUserAccess();
  }, []);

  const hasRole = (roles) => {
    if (!userRole || !roles.length) return false;
    return roles.includes(userRole.name);
  };

  const hasPermission = (permissions, requireAll = false) => {
    if (!userPermissions.length || !permissions.length) return false;

    if (requireAll) {
      return permissions.every(permission =>
        userPermissions.some(userPerm =>
          userPerm.includes(permission) || permission.includes(userPerm)
        )
      );
    } else {
      return permissions.some(permission =>
        userPermissions.some(userPerm =>
          userPerm.includes(permission) || permission.includes(userPerm)
        )
      );
    }
  };

  const hasAccess = (roles = [], permissions = [], requireAllPermissions = false) => {
    return hasRole(roles) || hasPermission(permissions, requireAllPermissions);
  };

  return {
    userRole,
    userPermissions,
    hasRole,
    hasPermission,
    hasAccess
  };
};

// Predefined access components for common roles
export const MasterAdminOnly = ({ children, fallback }) => (
  <RoleBasedAccess allowedRoles={['Master Admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const AdminOnly = ({ children, fallback }) => (
  <RoleBasedAccess allowedRoles={['Master Admin', 'Webmaster', 'Content Admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const EditorOnly = ({ children, fallback }) => (
  <RoleBasedAccess
    allowedRoles={['Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief', 'Section Editors']}
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

export const WriterOnly = ({ children, fallback }) => (
  <RoleBasedAccess
    allowedRoles={[
      'Master Admin', 'Webmaster', 'Content Admin', 'Editor-in-Chief',
      'Section Editors', 'Senior Writers', 'Staff Writers'
    ]}
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);

// Permission-based components
export const ContentManagerOnly = ({ children, fallback }) => (
  <RoleBasedAccess allowedPermissions={['content:create', 'content:edit']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const UserManagerOnly = ({ children, fallback }) => (
  <RoleBasedAccess allowedPermissions={['user:manage']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export default RoleBasedAccess;