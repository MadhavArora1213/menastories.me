import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './context/AdminAuthContext';
import { useTheme } from './context/ThemeContext';

const Dashboard = () => {
  const { admin, logout, isLoading: authLoading, checkAuthStatus, hasPermission } = useAdminAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [recentVideoArticles, setRecentVideoArticles] = useState([]);
  const [systemStats, setSystemStats] = useState({});

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Wait for authentication to be ready before fetching data
    if (!authLoading && admin) {
      fetchDashboardData();
    } else if (!authLoading && !admin) {
      setError('Please log in to access the dashboard');
      setLoading(false);
    }
  }, [authLoading, admin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('adminToken');

      console.log('Dashboard: Starting data fetch with token:', token ? 'present' : 'missing');

      // Fetch all data concurrently for better performance
      const [
        categoriesRes,
        subcategoriesRes,
        tagsRes,
        articlesRes,
        videoArticlesRes,
        adminUsersRes
      ] = await Promise.allSettled([
        fetch(`${base}/api/categories`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }),
        fetch(`${base}/api/subcategories`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }),
        fetch(`${base}/api/tags`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }),
        fetch(`${base}/api/articles?limit=5&sort=recent`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }),
        fetch(`${base}/api/video-articles?limit=5&sort=recent`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }),
        // Try a simpler endpoint that doesn't require Master Admin role
        fetch(`${base}/api/admin/auth/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        })
      ]);

      console.log('Dashboard: API responses received');
      console.log('Categories:', categoriesRes.status, categoriesRes.value?.ok);
      console.log('Subcategories:', subcategoriesRes.status, subcategoriesRes.value?.ok);
      console.log('Tags:', tagsRes.status, tagsRes.value?.ok);
      console.log('Articles:', articlesRes.status, articlesRes.value?.ok);
      console.log('Video Articles:', videoArticlesRes.status, videoArticlesRes.value?.ok);
      console.log('Admin Profile:', adminUsersRes.status, adminUsersRes.value?.ok);

      // Process responses
      let categoriesCount = 0;
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
        const categoriesJson = await categoriesRes.value.json();
        // The categories controller returns totalCount in response.totalCount
        categoriesCount = categoriesJson.totalCount || categoriesJson.data?.length || categoriesJson.length || 0;
        console.log('Categories data:', categoriesJson);
      } else {
        console.log('Categories failed:', categoriesRes.status, categoriesRes.value?.status);
      }

      let subcategoriesCount = 0;
      if (subcategoriesRes.status === 'fulfilled' && subcategoriesRes.value.ok) {
        const subcategoriesJson = await subcategoriesRes.value.json();
        // The subcategories controller returns totalCount in response.totalCount
        subcategoriesCount = subcategoriesJson.totalCount || subcategoriesJson.data?.length || subcategoriesJson.length || 0;
        console.log('Subcategories data:', subcategoriesJson);
      } else {
        console.log('Subcategories failed:', subcategoriesRes.status, subcategoriesRes.value?.status);
      }

      let tagsCount = 0;
      if (tagsRes.status === 'fulfilled' && tagsRes.value.ok) {
        const tagsJson = await tagsRes.value.json();
        // The tags route returns data in response.tags
        tagsCount = tagsJson.tags?.length || tagsJson.data?.length || tagsJson.length || 0;
        console.log('Tags data:', tagsJson);
      } else {
        console.log('Tags failed:', tagsRes.status, tagsRes.value?.status);
      }

      let articlesCount = 0;
      let articlesData = [];
      if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
        const articlesJson = await articlesRes.value.json();
        // The articles controller returns data in response.data.data.articles
        articlesCount = articlesJson.data?.pagination?.total_items || articlesJson.data?.data?.length || articlesJson.data?.length || articlesJson.length || 0;
        articlesData = Array.isArray(articlesJson.data?.data?.articles) ? articlesJson.data.data.articles : Array.isArray(articlesJson.data?.articles) ? articlesJson.data.articles : Array.isArray(articlesJson.data) ? articlesJson.data : [];
        console.log('Articles data:', articlesJson);
      } else if (articlesRes.status === 'fulfilled' && articlesRes.value.status === 401) {
        console.log('Articles auth failed, checking auth status');
        await checkAuthStatus();
        throw new Error('Session expired. Please refresh the page or log in again.');
      } else {
        console.log('Articles failed:', articlesRes.status, articlesRes.value?.status);
      }

      let videoArticlesCount = 0;
      let videoArticlesData = [];
      if (videoArticlesRes.status === 'fulfilled' && videoArticlesRes.value.ok) {
        const videoArticlesJson = await videoArticlesRes.value.json();
        // The video articles controller returns data in response.data.data.videoArticles
        videoArticlesCount = videoArticlesJson.data?.pagination?.total_items || videoArticlesJson.data?.data?.length || videoArticlesJson.data?.length || videoArticlesJson.length || 0;
        videoArticlesData = Array.isArray(videoArticlesJson.data?.data?.videoArticles) ? videoArticlesJson.data.data.videoArticles : Array.isArray(videoArticlesJson.data?.videoArticles) ? videoArticlesJson.data.videoArticles : Array.isArray(videoArticlesJson.data) ? videoArticlesJson.data : [];
        console.log('Video Articles data:', videoArticlesJson);
      } else {
        console.log('Video Articles failed:', videoArticlesRes.status, videoArticlesRes.value?.status);
      }

      let adminUsersCount = 0;
      if (adminUsersRes.status === 'fulfilled' && adminUsersRes.value.ok) {
        const adminUsersJson = await adminUsersRes.value.json();
        // For profile endpoint, we just count as 1 (current user)
        adminUsersCount = 1;
        console.log('Admin Profile data:', adminUsersJson);
      } else {
        console.log('Admin Profile failed:', adminUsersRes.status, adminUsersRes.value?.status);
      }

      // Calculate system stats
      const totalContent = articlesCount + videoArticlesCount;
      const avgContentPerCategory = categoriesCount > 0 ? Math.round(totalContent / categoriesCount) : 0;

      setDashboardData({
        categoriesCount,
        subcategoriesCount,
        tagsCount,
        articlesCount,
        videoArticlesCount,
        adminUsersCount,
        totalContent,
        avgContentPerCategory
      });

      setRecentArticles(Array.isArray(articlesData) ? articlesData.slice(0, 5) : []);
      setRecentVideoArticles(Array.isArray(videoArticlesData) ? videoArticlesData.slice(0, 5) : []);

      setSystemStats({
        totalContent,
        avgContentPerCategory,
        contentGrowth: Math.round((totalContent / Math.max(categoriesCount, 1)) * 100) / 100,
        lastUpdated: new Date().toLocaleString()
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-primary-text text-xl font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md shadow-lg">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-red-800 dark:text-red-400 font-semibold text-lg mb-2">Error Loading Dashboard</h2>
            <p className="text-red-700 dark:text-red-300 text-sm mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="bg-primary-accent text-primary-bg px-6 py-2.5 rounded-xl hover:bg-primary-accent-hover transition-all duration-200 font-medium shadow-sm"
              >
                Go to Login
              </button>
              <button
                onClick={fetchDashboardData}
                className="bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!admin) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 max-w-md shadow-lg">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-yellow-800 dark:text-yellow-400 font-semibold text-lg mb-2">Authentication Required</h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-6">Please log in to access the admin dashboard.</p>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="bg-primary-accent text-primary-bg px-8 py-3 rounded-xl hover:bg-primary-accent-hover transition-all duration-200 font-semibold shadow-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { categoriesCount, subcategoriesCount, tagsCount, articlesCount, videoArticlesCount, adminUsersCount, totalContent, avgContentPerCategory } = dashboardData || {};
  const usersCount = adminUsersCount || 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} py-6 px-4 md:px-6 transition-all duration-200`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <div>
            <h1 className={`text-3xl md:text-4xl font-black mb-2 tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
              <svg width="40" height="40" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="10" rx="4" />
                <circle cx="8" cy="12" r="2" />
              </svg>
              Magazine Admin Dashboard
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Content management overview and analytics.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <span className={`px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              Role: <span className="font-bold text-primary-accent">{admin?.role || 'Administrator'}</span>
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Last login: {new Date().toLocaleString()}
            </span>
            <button
              onClick={handleLogout}
              className={`mt-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Articles Card - Show if user has content.read permission */}
          {hasPermission('content.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Articles</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{articlesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Categories Card - Show if user has content.read permission */}
          {hasPermission('content.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Categories</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{categoriesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Subcategories Card - Show if user has content.read permission */}
          {hasPermission('content.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subcategories</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{subcategoriesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Tags Card - Show if user has content.read permission */}
          {hasPermission('content.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tags</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{tagsCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Video Articles Card - Show if user has content.read permission */}
          {hasPermission('content.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Video Articles</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{videoArticlesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Users Card - Show if user has users.read permission */}
          {hasPermission('users.read') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</dt>
                    <dd className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{usersCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* New Article - Show if user has content.create permission */}
              {hasPermission('content.create') && (
                <button className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Article
                </button>
              )}

              {/* New Video - Show if user has content.create permission */}
              {hasPermission('content.create') && (
                <button className="flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  New Video
                </button>
              )}

              {/* Manage Media - Show if user has content.read permission */}
              {hasPermission('content.read') && (
                <button className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0V1m10 3V1m0 3l1 1v16a2 2 0 01-2 2H6a2 2 0 01-2-2V5l1-1z" />
                  </svg>
                  Manage Media
                </button>
              )}

              {/* Send Newsletter - Show if user has communication.manage permission */}
              {hasPermission('communication.manage') && (
                <button className="flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Newsletter
                </button>
              )}
            </div>
          </div>

          {/* System Health - Show if user has system permissions */}
          {hasPermission('system') && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>System Health</h3>
              <div className="space-y-4">
                {/* Server Status - Always show for system access */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-sm"></div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Server Status</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>

                {/* Database Status - Always show for system access */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-sm"></div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Database</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>

                {/* Active Sessions - Show if user has performance monitoring */}
                {hasPermission('system.performance_monitoring') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-sm"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active Sessions</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">N/A</span>
                  </div>
                )}

                {/* Content Efficiency - Show if user has content access */}
                {hasPermission('content.read') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 shadow-sm"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Content Efficiency</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">{systemStats.contentGrowth}x</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;