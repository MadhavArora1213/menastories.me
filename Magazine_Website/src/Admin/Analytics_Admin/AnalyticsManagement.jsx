import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  AnalyticsDashboard,
  ContentPerformance,
  UserAnalytics,
  AuthorPerformance,
  RealtimeAnalytics,
  SEOAnalytics,
  SocialAnalytics,
  CustomReports
} from '../../Components/Analytics';

// Professional Icons Component
const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    content: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    people: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    author: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    realtime: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    seo: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    social: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    ),
    reports: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return icons[name] || icons.dashboard;
};

const AnalyticsManagement = () => {
  const location = useLocation();
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Define all possible tabs with their required permissions
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard', component: AnalyticsDashboard, requiredPermission: 'analytics.read' },
    { id: 'content', label: 'Content', iconName: 'content', component: ContentPerformance, requiredPermission: 'analytics.read' },
    { id: 'users', label: 'Users', iconName: 'people', component: UserAnalytics, requiredPermission: 'analytics.read' },
    { id: 'authors', label: 'Authors', iconName: 'author', component: AuthorPerformance, requiredPermission: 'analytics.read' },
    { id: 'realtime', label: 'Real-time', iconName: 'realtime', component: RealtimeAnalytics, requiredPermission: 'analytics.read' },
    { id: 'seo', label: 'SEO', iconName: 'seo', component: SEOAnalytics, requiredPermission: 'analytics.read' },
    { id: 'social', label: 'Social', iconName: 'social', component: SocialAnalytics, requiredPermission: 'analytics.read' },
    { id: 'reports', label: 'Reports', iconName: 'reports', component: CustomReports, requiredPermission: 'analytics.export' }
  ];

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => hasPermission(tab.requiredPermission));

  useEffect(() => {
    // Determine active tab based on current URL
    const path = location.pathname;
    let newActiveTab = 'dashboard';

    if (path.includes('/content')) newActiveTab = 'content';
    else if (path.includes('/users')) newActiveTab = 'users';
    else if (path.includes('/authors')) newActiveTab = 'authors';
    else if (path.includes('/realtime')) newActiveTab = 'realtime';
    else if (path.includes('/seo')) newActiveTab = 'seo';
    else if (path.includes('/social')) newActiveTab = 'social';
    else if (path.includes('/reports')) newActiveTab = 'reports';

    // Only set active tab if user has permission for it
    const hasPermissionForTab = tabs.some(tab => tab.id === newActiveTab);
    if (hasPermissionForTab) {
      setActiveTab(newActiveTab);
    } else if (tabs.length > 0) {
      // Set to first available tab if current tab is not accessible
      setActiveTab(tabs[0].id);
    }
  }, [location.pathname, tabs]);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (tabs.length > 0 ? tabs[0].component : null);

  // If no tabs are available due to permissions, show access denied
  if (tabs.length === 0) {
    return (
      <div className="analytics-management">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-red-800 dark:text-red-400 font-semibold text-lg mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">You don't have permission to access analytics features.</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">Required permission: analytics.read</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-management">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive analytics and performance monitoring for your magazine website.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon name={tab.iconName} className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="analytics-content">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Quick Stats Footer - Only show if user has analytics.read permission */}
      {hasPermission('analytics.read') && (
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Stats Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tabs.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Analytics Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">∞</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Data Points</div>
            </div>
            {/* Export Formats - Only show if user has export permission */}
            {hasPermission('analytics.export') && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Export Formats</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManagement;