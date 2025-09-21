import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Sidebar from '../../Admin/Components/Sidebar';

const TechnicalAccess = () => {
  const { admin, hasPermission } = useAdminAuth();
  const [technicalData, setTechnicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check if user has technical access permission
  if (!admin || !hasPermission('system.technical_access')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Access Denied</h2>
            <p className="text-red-600 text-sm mb-4">You don't have permission to access technical information.</p>
            <p className="text-red-600 text-sm">Only Webmaster and Master Admin can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchTechnicalData();
  }, []);

  const fetchTechnicalData = async () => {
    try {
      setLoading(true);
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${base}/api/admin/technical-access`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch technical data');
      }

      const data = await response.json();
      setTechnicalData(data.data);

    } catch (error) {
      console.error('Technical access data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading technical information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Technical Data</h2>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchTechnicalData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleSidebarClose}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : ''
      }`}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={handleMenuClick}
                  className="md:hidden mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Technical Access</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                System Technical Information
              </h2>
              <p className="text-gray-600">
                Monitor and manage technical aspects of the system infrastructure.
              </p>
            </div>
          </div>

          {/* Technical Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Server Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Node.js Version</dt>
                      <dd className="text-lg font-medium text-gray-900">{technicalData?.server?.nodeVersion || 'N/A'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Platform</dt>
                      <dd className="text-lg font-medium text-gray-900">{technicalData?.server?.platform || 'N/A'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Architecture</dt>
                      <dd className="text-lg font-medium text-gray-900">{technicalData?.server?.architecture || 'N/A'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Memory Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {technicalData?.server?.memoryUsage && Object.entries(technicalData.server.memoryUsage).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(value / 1024 / 1024)} MB</div>
                    <div className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Database</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${technicalData?.database?.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-900">{technicalData?.database?.status || 'Unknown'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{technicalData?.database?.connectionPool || 'N/A'}</p>
              </div>
            </div>

            {/* Cache Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cache</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${technicalData?.cache?.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium text-gray-900">{technicalData?.cache?.status || 'Unknown'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Hit Rate: {technicalData?.cache?.hitRate || 'N/A'}</p>
              </div>
            </div>

            {/* Environment */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Environment</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${technicalData?.server?.environment === 'production' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{technicalData?.server?.environment || 'Unknown'}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Uptime: {technicalData?.server?.uptime ? Math.floor(technicalData.server.uptime / 3600) + 'h ' + Math.floor((technicalData.server.uptime % 3600) / 60) + 'm' : 'N/A'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TechnicalAccess;