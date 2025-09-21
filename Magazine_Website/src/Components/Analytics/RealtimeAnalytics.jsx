import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import { formatDistanceToNow } from 'date-fns';

const RealtimeAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRealtimeData();
    // Set up real-time updates
    const interval = setInterval(loadRealtimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRealtimeData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getRealtimeAnalytics();
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load real-time data:', err);
      setError('Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };

  const RealtimeMetric = ({ title, value, icon, color = 'blue', subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
          color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="realtime-analytics space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Real-time Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live data updates every 30 seconds.
          </p>
        </div>
        <button
          onClick={loadRealtimeData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Now
        </button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RealtimeMetric
          title="Active Users"
          value={data?.activeUsers || 0}
          icon="👥"
          color="blue"
          subtitle="Currently online"
        />
        <RealtimeMetric
          title="Page Views"
          value={data?.realtimeMetrics?.page_view || 0}
          icon="👁️"
          color="green"
          subtitle="In last 5 minutes"
        />
        <RealtimeMetric
          title="Article Views"
          value={data?.realtimeMetrics?.article_view || 0}
          icon="📖"
          color="purple"
          subtitle="In last 5 minutes"
        />
        <RealtimeMetric
          title="Searches"
          value={data?.realtimeMetrics?.search_query || 0}
          icon="🔍"
          color="orange"
          subtitle="In last 5 minutes"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {data?.recentEvents?.map((event, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  event.eventType === 'page_view' ? 'bg-blue-100 dark:bg-blue-900' :
                  event.eventType === 'article_view' ? 'bg-green-100 dark:bg-green-900' :
                  event.eventType === 'search_query' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <span className="text-sm">
                    {event.eventType === 'page_view' ? '👁️' :
                     event.eventType === 'article_view' ? '📖' :
                     event.eventType === 'search_query' ? '🔍' :
                     event.eventType === 'newsletter_signup' ? '📧' :
                     event.eventType === 'social_share' ? '🔗' : '📊'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.user?.name || 'Anonymous user'} • {event.url || event.eventData?.url}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Live Engagement
          </h3>
          <div className="space-y-4">
            {Object.entries(data?.realtimeMetrics || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {value}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Data Collection
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Last Update
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Update Frequency
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Every 30 seconds
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;