import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAdminAuth } from "../context/AdminAuthContext";

const navLinks = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
];

const navSections = [
  {
    title: "Content Management",
    icon: "content",
    key: "content",
    requiredPermission: "content",
    links: [
      { to: "/admin/articles", label: "Articles", icon: "article", requiredPermission: "content.read" },
      { to: "/admin/articles/create", label: "Create Article", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/video-articles", label: "Video Articles", icon: "article", requiredPermission: "content.read" },
      { to: "/admin/video-articles/create", label: "Create Video Article", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/categories", label: "Categories", icon: "category", requiredPermission: "content.read" },
      { to: "/admin/categories/create", label: "Create Category", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/subcategories", label: "Sub Categories", icon: "subcategory", requiredPermission: "content.read" },
      { to: "/admin/subcategories/create", label: "Create Subcategory", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/tags", label: "Tags", icon: "tag", requiredPermission: "content.read" },
      { to: "/admin/tag/create", label: "Create Tag", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/events", label: "Events", icon: "event", requiredPermission: "content.read" },
      { to: "/admin/events/create", label: "Create Event", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/flipbooks", label: "Flipbook Management", icon: "article", requiredPermission: "content.read" },
      { to: "/admin/lists", label: "List Management", icon: "article", requiredPermission: "content.read" },
      { to: "/admin/lists/create", label: "Create List", icon: "plus", requiredPermission: "content.create" },
      { to: "/admin/power-lists", label: "Power List Management", icon: "article", requiredPermission: "content.read" },
      { to: "/admin/power-lists/create", label: "Create Power List", icon: "plus", requiredPermission: "content.create" },
    ]
  },
  {
    title: "Downloads",
    icon: "download",
    key: "downloads",
    requiredPermission: "content",
    links: [
      { to: "/admin/downloads", label: "All Downloads", icon: "download", requiredPermission: "content.read" },
      { to: "/admin/downloads/create", label: "Create Download", icon: "plus", requiredPermission: "content.create" },
    ]
  },
  {
    title: "Media Kit",
    icon: "media",
    key: "media-kit",
    requiredPermission: "content",
    links: [
      { to: "/admin/media-kits", label: "All Media Kits", icon: "media", requiredPermission: "content.read" },
      { to: "/admin/media-kits/create", label: "Create Media Kit", icon: "plus", requiredPermission: "content.create" },
    ]
  },
  {
    title: "User Management",
    icon: "users",
    key: "users",
    requiredPermission: "users",
    links: [
      { to: "/admin/users", label: "All Users", icon: "user", requiredPermission: "users.read" },
      { to: "/admin/roles", label: "Roles & Permissions", icon: "shield", requiredPermission: "users.manage_roles" },
    ]
  },
  // {
  //   title: "Communication",
  //   icon: "communication",
  //   key: "communication",
  //   requiredPermission: "communication",
  //   links: [
  //     { to: "/admin/newsletter", label: "Newsletter", icon: "mail", requiredPermission: "communication.manage" },
  //     { to: "/admin/sms", label: "SMS Management", icon: "sms", requiredPermission: "communication.manage" },
  //     { to: "/admin/notifications", label: "Notifications", icon: "bell", requiredPermission: "communication.manage" },
  //   ]
  // },
  {
    title: "Analytics & Performance",
    icon: "analytics",
    key: "analytics",
    requiredPermission: "analytics",
    links: [
      { to: "/admin/analytics", label: "Analytics Dashboard", icon: "chart", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/content", label: "Content Performance", icon: "article", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/users", label: "User Analytics", icon: "user", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/authors", label: "Author Performance", icon: "user", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/realtime", label: "Real-time", icon: "speed", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/seo", label: "SEO Analytics", icon: "search", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/social", label: "Social Media", icon: "communication", requiredPermission: "analytics.read" },
      { to: "/admin/analytics/reports", label: "Custom Reports", icon: "report", requiredPermission: "analytics.read" },
    ]
  },
  // {
  //   title: "Security",
  //   icon: "security",
  //   key: "security",
  //   requiredPermission: "security",
  //   links: [
  //     { to: "/admin/security", label: "Security Dashboard", icon: "shield", requiredPermission: "security.read" },
  //     { to: "/admin/security/logs", label: "Security Logs", icon: "logs", requiredPermission: "security.view_logs" },
  //     { to: "/admin/security/incidents", label: "Incidents", icon: "alert", requiredPermission: "security.read" },
  //     { to: "/admin/security/threats", label: "Threat Intelligence", icon: "security", requiredPermission: "security.read" },
  //     { to: "/admin/security/settings", label: "Security Settings", icon: "settings", requiredPermission: "security.manage" },
  //     { to: "/admin/security/backup", label: "Backup & Recovery", icon: "backup", requiredPermission: "security.manage" },
  //   ]
  // },
  // {
  //   title: "System",
  //   icon: "system",
  //   key: "system",
  //   requiredPermission: "system",
  //   links: [
  //     { to: "/admin/settings", label: "Settings", icon: "settings", requiredPermission: "system.settings" },
  //     { to: "/admin/logs", label: "System Logs", icon: "logs", requiredPermission: "system.logs" },
  //     { to: "/admin/technical-access", label: "Technical Access", icon: "system", requiredPermission: "system.technical_access" },
  //     { to: "/admin/performance-monitoring", label: "Performance Monitoring", icon: "analytics", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/server-logs", label: "Server Logs", icon: "logs", requiredPermission: "system.technical_access" },
  //     { to: "/admin/database-management", label: "Database Management", icon: "database", requiredPermission: "system.technical_access" },
  //     { to: "/admin/deployment-tools", label: "Code Deployment", icon: "deploy", requiredPermission: "system.technical_access" },
  //     { to: "/admin/system-config", label: "System Configuration", icon: "settings", requiredPermission: "system.technical_access" },
  //     { to: "/admin/environment-vars", label: "Environment Variables", icon: "key", requiredPermission: "system.technical_access" },
  //     { to: "/admin/api-endpoints", label: "API Endpoints", icon: "api", requiredPermission: "system.technical_access" },
  //     { to: "/admin/file-system", label: "File System Access", icon: "folder", requiredPermission: "system.technical_access" },
  //     { to: "/admin/analytics-dashboards", label: "Analytics Dashboards", icon: "chart", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/uptime-reports", label: "Uptime Reports", icon: "uptime", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/resource-usage", label: "Resource Usage Metrics", icon: "gauge", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/error-monitoring", label: "Error Monitoring", icon: "alert", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/performance-alerts", label: "Performance Alerts", icon: "bell", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/load-testing", label: "Load Testing", icon: "test", requiredPermission: "system.performance_monitoring" },
  //     { to: "/admin/system-backups", label: "System Backups", icon: "backup", requiredPermission: "system.maintenance" },
  //     { to: "/admin/maintenance-mode", label: "Maintenance Mode", icon: "maintenance", requiredPermission: "system.maintenance" },
  //     { to: "/admin/cron-jobs", label: "Cron Jobs", icon: "schedule", requiredPermission: "system.maintenance" },
  //     { to: "/admin/ssl-certificates", label: "SSL Certificates", icon: "certificate", requiredPermission: "system.maintenance" },
  //     { to: "/admin/domain-management", label: "Domain Management", icon: "domain", requiredPermission: "system.maintenance" },
  //     { to: "/admin/cdn-config", label: "CDN Configuration", icon: "cdn", requiredPermission: "system.maintenance" },
  //     { to: "/admin/cache-management", label: "Cache Management", icon: "cache", requiredPermission: "system.maintenance" },
  //     { to: "/admin/queue-management", label: "Queue Management", icon: "queue", requiredPermission: "system.maintenance" },
  //     { to: "/admin/email-config", label: "Email Configuration", icon: "mail", requiredPermission: "system.maintenance" },
  //     { to: "/admin/notification-settings", label: "Notification Settings", icon: "notification", requiredPermission: "system.maintenance" },
  //   ]
  // }
];

const Sidebar = ({ open, onClose, collapsed }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { hasPermission, admin } = useAdminAuth();
  const [openSections, setOpenSections] = useState({
    content: true,
    users: false,
    communication: false,
    analytics: false,
    security: false,
    system: false,
    'media-kit': false,
    downloads: false,
    'download-section': false
  });

  // Update open sections based on admin role
  useEffect(() => {
    if (admin?.role === 'Webmaster' || admin?.role === 'Content Admin') {
      // For Webmaster and Content Admin, start with all sections closed
      setOpenSections({
        content: false,
        users: false,
        communication: false,
        analytics: false,
        security: false,
        system: false,
        'media-kit': false,
        downloads: false,
        'download-section': false
      });
    } else {
      // For Master Admin and other roles, content section open by default
      setOpenSections(prev => ({
        ...prev,
        content: true
      }));
    }
  }, [admin?.role]);
  const [adminStats, setAdminStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0
  });

  // Fetch admin stats
  useEffect(() => {
    if (admin?.role === 'Master Admin' || hasPermission('users.read')) {
      fetchAdminStats();
    }
  }, [admin, hasPermission]);

  const fetchAdminStats = async () => {
    try {
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
        const totalAdmins = data.admins.length;
        const activeAdmins = data.admins.filter(admin => admin.isActive).length;
        setAdminStats({ totalAdmins, activeAdmins });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // Filter navigation sections and links based on permissions and roles
  const filteredNavSections = navSections
    .filter(section => {
      // Master Admin can see all sections
      if (admin?.role === 'Master Admin') return true;

      // Check section-level permissions
      if (section.requiredPermission && !hasPermission(section.requiredPermission)) {
        return false;
      }

      // Check if section has any accessible links
      const accessibleLinks = section.links.filter(link => {
        // Master Admin can see all links
        if (admin?.role === 'Master Admin') return true;

        // Check role-based access (for specific role requirements)
        if (link.requiredRole && admin?.role !== link.requiredRole) {
          return false;
        }

        // Check permission-based access
        if (link.requiredPermission) {
          return hasPermission(link.requiredPermission);
        }

        // If no specific requirements, check section permission
        return hasPermission(section.requiredPermission);
      });

      return accessibleLinks.length > 0;
    })
    .map(section => ({
      ...section,
      links: section.links.filter(link => {
        // Master Admin can see all links
        if (admin?.role === 'Master Admin') return true;

        // Check role-based access (for specific role requirements)
        if (link.requiredRole && admin?.role !== link.requiredRole) {
          return false;
        }

        // Check permission-based access
        if (link.requiredPermission) {
          return hasPermission(link.requiredPermission);
        }

        // If no specific requirements, check section permission
        return hasPermission(section.requiredPermission);
      })
    }))
    .filter(section => section.links.length > 0); // Only show sections with accessible links

  // Debug logging for permission checks
  useEffect(() => {
    if (admin) {
      console.log('Sidebar: Current admin role:', admin.role);
      console.log('Sidebar: Admin permissions:', admin.permissions);
      console.log('Sidebar: Filtered sections count:', filteredNavSections.length);
    }
  }, [admin, filteredNavSections.length]);

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Icon color logic for best contrast
  const getIconColor = (isActive) =>
    isActive
      ? (isDark ? "#FFFFFF" : "#000000")
      : (isDark ? "#D1D5DB" : "#6B7280");

  // SVG icons for all admin sections
  const icons = {
    // Dashboard
    dashboard: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 12L12 4l9 8" />
        <rect x="6" y="12" width="12" height="8" rx="2" />
      </svg>
    ),
    // Content Management
    content: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    article: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    category: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="10" rx="4" />
        <circle cx="8" cy="12" r="2" />
      </svg>
    ),
    subcategory: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="10" rx="4" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="16" cy="12" r="2" />
      </svg>
    ),
    tag: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    media: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    download: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    comments: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M12.5 7.5s.5 2 2 2c1.5 0 2-2 2-2" />
      </svg>
    ),
    // User Management
    users: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    user: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    userplus: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
    shield: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    // Communication
    communication: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    mail: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    sms: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    bell: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    // Analytics
    analytics: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    chart: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    speed: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
        <path d="M12 1a10 10 0 0 0-5 19.31l1.12-3.36A7 7 0 1 1 12 1z" />
      </svg>
    ),
    report: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    // System
    system: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    settings: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    backup: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    logs: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="16" y2="16" />
      </svg>
    ),
    // Security icons
    security: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    alert: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    test: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
        <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
        <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
        <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
      </svg>
    ),
    // Common
    plus: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
    chevronDown: (color) => (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    chevronUp: (color) => (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    ),
    search: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    event: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    upload: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    // Additional icons for expanded menu
    database: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    deploy: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2l3 3-3 3-3-3 3-3z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
        <path d="M12 16l3 3-3 3-3-3 3-3z" />
      </svg>
    ),
    key: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    api: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    folder: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    uptime: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    gauge: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    certificate: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    domain: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    cdn: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 12h16M4 12l4-4m-4 4l4 4" />
        <path d="M20 12l-4-4m4 4l-4 4" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    queue: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
      </svg>
    ),
    notification: (color) => (
      <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <circle cx="18" cy="4" r="2" />
      </svg>
    ),
  };

  // Collapsed: show only icons
  if (collapsed) {
    return (
      <aside
        className={`w-20 ${isDark ? 'bg-gray-900' : 'bg-white'} border-r border-primary-border transition-all duration-200 flex-shrink-0 shadow-lg`}
        style={{ minHeight: "100vh" }}
      >
        <div className="flex flex-col items-center py-4 gap-4">
          {/* Admin Panel Title */}
          <div className="mb-6 px-2">
            <span className={`text-xs font-bold tracking-widest uppercase select-none text-center leading-tight ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              ADMIN<br />PANEL
            </span>
          </div>

          {/* Dashboard link - For Master Admin and Webmaster */}
          {(admin?.role === 'Master Admin' || admin?.role === 'Webmaster') && (
            <Link
              to="/admin"
              onClick={onClose}
              className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-200 group
                ${location.pathname === "/admin"
                  ? "bg-blue-600 text-white shadow-md"
                  : `hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-gray-300' : 'text-gray-600'} hover:${isDark ? 'text-white' : 'text-black'}`
                }`}
              title="Dashboard"
              aria-label="Dashboard"
            >
              {icons.dashboard(location.pathname === "/admin" ? "#FFFFFF" : getIconColor(location.pathname === "/admin"))}
            </Link>
          )}

          {/* Section icons - filtered based on permissions */}
          {filteredNavSections.map((section) => (
            <button
              key={section.key}
              className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-200 group hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} hover:${isDark ? 'text-white' : 'text-black'} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              onClick={() => toggleSection(section.key)}
              title={section.title}
              aria-label={section.title}
            >
              {icons[section.icon](getIconColor(false))}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  // Expanded: show full navigation
  return (
    <aside
      className={`w-64 ${isDark ? 'bg-gray-900' : 'bg-white'} border-r border-primary-border transition-all duration-200 flex-shrink-0 shadow-lg
        ${open ? "block" : "hidden md:block"}
        ${open ? "fixed md:relative z-50 md:z-auto top-0 left-0 h-full md:h-auto" : ""}`}
      style={{ minHeight: "100vh" }}
    >
        <div className="py-4 px-4 flex flex-col gap-4 overflow-y-auto">
          {/* Admin Panel Title */}
          <div className="mb-6">
            <span className={`text-xl font-bold tracking-widest uppercase select-none ${isDark ? 'text-white' : 'text-black'}`}>
              ADMIN PANEL
            </span>
          </div>

          {/* Admin Info Section */}
          {(admin?.role === 'Master Admin' || hasPermission('users.read')) && (
            <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">
                    {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {admin?.name || 'Admin'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {admin?.role || 'Administrator'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {adminStats.totalAdmins}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Admins
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <p className={`text-lg font-bold text-green-600`}>
                    {adminStats.activeAdmins}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard link - For Master Admin and Webmaster */}
          {(admin?.role === 'Master Admin' || admin?.role === 'Webmaster') && (
            <Link
              to="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 mb-4 text-sm group
                ${location.pathname === "/admin"
                  ? "bg-blue-600 text-white shadow-md"
                  : `hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-gray-300' : 'text-gray-600'} hover:${isDark ? 'text-white' : 'text-black'}`
                }`}
              aria-label="Dashboard"
            >
              {icons.dashboard(location.pathname === "/admin" ? "#FFFFFF" : getIconColor(location.pathname === "/admin"))}
              <span className="tracking-tight font-medium">Dashboard</span>
            </Link>
          )}

          {/* Navigation Sections */}
          {filteredNavSections.map((section) => (
            <div key={section.key} className="mb-4">
              {/* Section Header */}
              <button
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 mb-3 w-full text-left group hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-gray-300' : 'text-gray-600'} hover:${isDark ? 'text-white' : 'text-black'}`}
                onClick={() => toggleSection(section.key)}
                aria-expanded={openSections[section.key]}
                aria-controls={`section-${section.key}`}
              >
                {icons[section.icon](getIconColor(false))}
                <span className="tracking-tight flex-1 font-semibold">{section.title}</span>
                <span className="ml-auto transition-transform duration-200">
                  {openSections[section.key]
                    ? icons.chevronUp(getIconColor(false))
                    : icons.chevronDown(getIconColor(false))}
                </span>
              </button>

              {/* Section Links */}
              {openSections[section.key] && (
                <div className="ml-6 space-y-2" id={`section-${section.key}`}>
                  {section.links.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm group
                          ${isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : `hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-gray-300' : 'text-gray-600'} hover:${isDark ? 'text-white' : 'text-black'}`
                          }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {icons[link.icon](isActive ? "#FFFFFF" : getIconColor(isActive))}
                        <span className="tracking-tight">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
    </aside>
  );
};

export default Sidebar;