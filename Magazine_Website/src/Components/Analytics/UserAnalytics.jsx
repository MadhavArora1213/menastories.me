import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';

const UserAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = analyticsService.getDateRanges()[dateRange];
      const response = await analyticsService.getUserBehavior(params);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load user analytics:', err);
      setError('Failed to load user analytics data');
    } finally {
      setLoading(false);
    }
  };

  const DeviceBreakdown = ({ devices }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Device Usage
      </h3>
      <div className="space-y-4">
        {devices?.map((device, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                device.deviceType === 'desktop' ? 'bg-blue-500' :
                device.deviceType === 'mobile' ? 'bg-green-500' :
                device.deviceType === 'tablet' ? 'bg-purple-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {device.deviceType}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(device.count)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analyticsService.formatPercentage(device.count, devices.reduce((sum, d) => sum + d.count, 0))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const GeographicData = ({ countries }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Geographic Distribution
      </h3>
      <div className="space-y-3">
        {countries?.slice(0, 10).map((country, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                {index + 1}.
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {country.country || 'Unknown'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {analyticsService.formatNumber(country.visits)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">visits</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BrowserStats = ({ browsers }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Browser Usage
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {browsers?.slice(0, 6).map((browser, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {analyticsService.formatNumber(browser.count)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {browser.browser}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
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
          onClick={loadData}
          className="mt-4 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-analytics space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Understand your audience behavior and demographics.
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="last90days">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.bounceRate ? `${data.bounceRate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.sessionStats?.length > 0
                  ? `${Math.round(
                      data.sessionStats.reduce((sum, session) => sum + session.pageViews, 0) /
                      data.sessionStats.length
                    )}`
                  : '0'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">pages per session</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Country</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.geographicData?.[0]?.country || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data?.geographicData?.[0] ? analyticsService.formatNumber(data.geographicData[0].visits) + ' visits' : ''}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌍</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mobile Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.demographics?.find(d => d.deviceType === 'mobile')?.count || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">of total users</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceBreakdown devices={data?.demographics} />
        <GeographicData countries={data?.geographicData} />
      </div>

      <BrowserStats browsers={data?.demographics?.filter(d => d.browser)} />

      {/* User Journey Analysis */}
      {data?.userJourney && data.userJourney.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            User Journey Analysis
          </h3>
          <div className="space-y-4">
            {data.userJourney.slice(0, 10).map((journey, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {journey.step}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {journey.url}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Session: {journey.sessionId?.substring(0, 8)}...
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(journey.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Statistics */}
      {data?.sessionStats && data.sessionStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Session Statistics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Page Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    First Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.sessionStats.slice(0, 20).map((session, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        {session.sessionId?.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {session.pageViews}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {Math.round((new Date(session.lastVisit) - new Date(session.firstVisit)) / 1000 / 60)}m
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(session.firstVisit).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(session.lastVisit).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;