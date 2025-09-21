import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import { formatDistanceToNow } from 'date-fns';
import ContentPerformance from './ContentPerformance';
import UserAnalytics from './UserAnalytics';
import AuthorPerformance from './AuthorPerformance';
import RealtimeAnalytics from './RealtimeAnalytics';
import SEOAnalytics from './SEOAnalytics';
import SocialAnalytics from './SocialAnalytics';
import CustomReports from './CustomReports';

// Professional Icons Component
const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    eye: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} strokeWidth={2} />
        <path strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
    ),
    trending: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    book: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    mail: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    link: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
    ),
    refresh: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    filter: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    download: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    upload: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  return icons[name] || icons.dashboard;
};

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [realtimeData, setRealtimeData] = useState(null);

  // Date range options
  const dateRanges = analyticsService.getDateRanges();

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates
    const interval = setInterval(loadRealtimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [dateRange, customDateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = dateRange === 'custom'
        ? analyticsService.formatDateRange(customDateRange.startDate, customDateRange.endDate)
        : dateRanges[dateRange];

      const response = await analyticsService.getDashboard(params);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const response = await analyticsService.getRealtimeAnalytics();
      setRealtimeData(response.data);
    } catch (err) {
      console.error('Failed to load real-time data:', err);
    }
  };

  const MetricCard = ({ title, value, change, changeType, iconName, color = 'blue' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          {change && (
            <div className={`flex items-center text-sm font-medium ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' : changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <Icon
                name={changeType === 'positive' ? 'trending' : changeType === 'negative' ? 'trending' : 'trending'}
                className={`w-4 h-4 mr-1 ${changeType === 'negative' ? 'rotate-180' : ''}`}
              />
              {change} from last period
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
          color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25' :
          color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/25' :
          color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25' :
          color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25' :
          'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-gray-500/25'
        } shadow-lg`}>
          <Icon name={iconName} className="w-7 h-7" />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', iconName: 'dashboard' },
    { id: 'content', label: 'Content', iconName: 'content' },
    { id: 'users', label: 'Users', iconName: 'people' },
    { id: 'authors', label: 'Authors', iconName: 'author' },
    { id: 'realtime', label: 'Real-time', iconName: 'realtime' },
    { id: 'seo', label: 'SEO', iconName: 'seo' },
    { id: 'social', label: 'Social', iconName: 'social' },
    { id: 'reports', label: 'Reports', iconName: 'reports' }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
        </div>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights into your website performance and audience behavior.
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Range:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last90days">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Icon name="refresh" className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Real-time Status */}
        {realtimeData && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Live Data
                </span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {realtimeData.activeUsers} active users in last 5 minutes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Page Views"
                  value={analyticsService.formatNumber(dashboardData.traffic?.totalViews || 0)}
                  iconName="eye"
                  color="blue"
                />
                <MetricCard
                  title="Unique Visitors"
                  value={analyticsService.formatNumber(dashboardData.traffic?.uniqueVisitors || 0)}
                  iconName="users"
                  color="green"
                />
                <MetricCard
                  title="Avg. Session Duration"
                  value={`${Math.round((dashboardData.traffic?.avgSessionDuration || 0) / 60)}m`}
                  iconName="clock"
                  color="purple"
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${((dashboardData.traffic?.bounceRate || 0) / (dashboardData.traffic?.totalViews || 1) * 100).toFixed(1)}%`}
                  iconName="trending"
                  color="orange"
                />
              </div>
            </div>

            {/* Engagement Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Engagement</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Article Views"
                  value={analyticsService.formatNumber(dashboardData.engagement?.article_view || 0)}
                  iconName="book"
                  color="blue"
                />
                <MetricCard
                  title="Newsletter Signups"
                  value={analyticsService.formatNumber(dashboardData.engagement?.newsletter_signup || 0)}
                  iconName="mail"
                  color="green"
                />
                <MetricCard
                  title="Social Shares"
                  value={analyticsService.formatNumber(dashboardData.engagement?.social_share || 0)}
                  iconName="link"
                  color="purple"
                />
              </div>
            </div>

            {/* Content Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Content */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Icon name="trending" className="w-5 h-5 mr-2 text-blue-500" />
                  Top Performing Articles
                </h3>
                <div className="space-y-4">
                  {dashboardData.topArticles?.slice(0, 5).map((article, index) => (
                    <div key={article.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-8">
                          {index + 1}.
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {analyticsService.formatNumber(article.recentViews || 0)} recent views
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {analyticsService.formatNumber(article.viewCount || 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Icon name="settings" className="w-5 h-5 mr-2 text-purple-500" />
                  Device Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {dashboardData.deviceBreakdown?.map((device, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {analyticsService.formatNumber(device.count)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">
                        {device.deviceType}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && <ContentPerformance />}
        {activeTab === 'users' && <UserAnalytics />}
        {activeTab === 'authors' && <AuthorPerformance />}
        {activeTab === 'realtime' && <RealtimeAnalytics />}
        {activeTab === 'seo' && <SEOAnalytics />}
        {activeTab === 'social' && <SocialAnalytics />}
        {activeTab === 'reports' && <CustomReports />}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;