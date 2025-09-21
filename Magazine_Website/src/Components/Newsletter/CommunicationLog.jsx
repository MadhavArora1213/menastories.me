import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';
import { formatDistanceToNow } from 'date-fns';

const CommunicationLog = ({
  campaignId,
  subscriberId,
  type = 'all', // 'all', 'email', 'whatsapp', 'sms'
  status = 'all', // 'all', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  dateRange = '7d', // '1d', '7d', '30d', '90d', 'all'
  onExport,
  className = ''
}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    type,
    status,
    dateRange
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
    uniqueOpens: 0,
    uniqueClicks: 0
  });

  useEffect(() => {
    loadLogs();
  }, [page, filters, campaignId, subscriberId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 50,
        ...filters
      };

      if (campaignId) params.campaignId = campaignId;
      if (subscriberId) params.subscriberId = subscriberId;

      let response;
      if (campaignId) {
        response = await newsletterService.getCampaignAnalytics(campaignId);
      } else if (subscriberId) {
        response = await newsletterService.getSubscriberAnalytics(subscriberId);
      } else {
        // Get general analytics
        response = await newsletterService.getAnalyticsOverview();
      }

      if (response) {
        setLogs(response.analytics || []);
        setTotalLogs(response.totalEvents || 0);
        setTotalPages(Math.ceil((response.totalEvents || 0) / 50));

        // Calculate statistics
        if (response.analytics) {
          calculateStats(response.analytics);
        }
      }
    } catch (err) {
      console.error('Failed to load communication logs:', err);
      setError('Failed to load communication logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logData) => {
    const newStats = {
      total: logData.length,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      uniqueOpens: 0,
      uniqueClicks: 0
    };

    const uniqueOpeners = new Set();
    const uniqueClickers = new Set();

    logData.forEach(log => {
      switch (log.eventType) {
        case 'sent':
          newStats.sent++;
          break;
        case 'delivered':
          newStats.delivered++;
          break;
        case 'opened':
          newStats.opened++;
          if (log.subscriberId) uniqueOpeners.add(log.subscriberId);
          break;
        case 'clicked':
          newStats.clicked++;
          if (log.subscriberId) uniqueClickers.add(log.subscriberId);
          break;
        case 'bounced':
          newStats.bounced++;
          break;
        case 'failed':
          newStats.failed++;
          break;
      }
    });

    newStats.uniqueOpens = uniqueOpeners.size;
    newStats.uniqueClicks = uniqueClickers.size;

    setStats(newStats);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleExport = async () => {
    try {
      if (onExport) {
        await onExport(logs, filters);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
      setError('Failed to export communication logs');
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      sent: '📤',
      delivered: '✅',
      opened: '👁️',
      clicked: '👆',
      bounced: '❌',
      complained: '⚠️',
      unsubscribed: '🚫',
      forwarded: '↗️',
      shared: '📤'
    };
    return icons[eventType] || '📧';
  };

  const getEventColor = (eventType) => {
    const colors = {
      sent: 'text-blue-600 dark:text-blue-400',
      delivered: 'text-green-600 dark:text-green-400',
      opened: 'text-purple-600 dark:text-purple-400',
      clicked: 'text-orange-600 dark:text-orange-400',
      bounced: 'text-red-600 dark:text-red-400',
      complained: 'text-yellow-600 dark:text-yellow-400',
      unsubscribed: 'text-gray-600 dark:text-gray-400',
      forwarded: 'text-indigo-600 dark:text-indigo-400',
      shared: 'text-pink-600 dark:text-pink-400'
    };
    return colors[eventType] || 'text-gray-600 dark:text-gray-400';
  };

  const getStatusLabel = (eventType) => {
    const labels = {
      sent: 'Sent',
      delivered: 'Delivered',
      opened: 'Opened',
      clicked: 'Clicked',
      bounced: 'Bounced',
      complained: 'Complained',
      unsubscribed: 'Unsubscribed',
      forwarded: 'Forwarded',
      shared: 'Shared'
    };
    return labels[eventType] || eventType;
  };

  const formatEventData = (eventData) => {
    if (!eventData) return null;

    const formatted = [];
    if (eventData.subject) {
      formatted.push(`Subject: ${eventData.subject}`);
    }
    if (eventData.linkClicked) {
      formatted.push(`Link: ${eventData.linkClicked}`);
    }
    if (eventData.userAgent) {
      formatted.push(`Browser: ${eventData.userAgent.split(' ')[0]}`);
    }
    if (eventData.ipAddress) {
      formatted.push(`IP: ${eventData.ipAddress}`);
    }

    return formatted.length > 0 ? formatted.join(' • ') : null;
  };

  const filterOptions = {
    type: [
      { value: 'all', label: 'All Types' },
      { value: 'email', label: 'Email' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'sms', label: 'SMS' }
    ],
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'sent', label: 'Sent' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'opened', label: 'Opened' },
      { value: 'clicked', label: 'Clicked' },
      { value: 'bounced', label: 'Bounced' },
      { value: 'failed', label: 'Failed' }
    ],
    dateRange: [
      { value: '1d', label: 'Last 24 hours' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
      { value: 'all', label: 'All time' }
    ]
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`communication-log bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Communication Log
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and analyze all communication activities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Export
          </button>
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.opened}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Opened</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.clicked}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Clicked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.bounced}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bounced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.uniqueOpens}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unique Opens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.uniqueClicks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unique Clicks</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filterOptions.type.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filterOptions.status.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filterOptions.dateRange.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No communication logs</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No communication activities found for the selected filters.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscriber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getEventIcon(log.eventType)}</span>
                      <div>
                        <div className={`text-sm font-medium ${getEventColor(log.eventType)}`}>
                          {getStatusLabel(log.eventType)}
                        </div>
                        {log.eventData?.bounceType && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {log.eventData.bounceType} bounce
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.subscriber?.email || 'Unknown'}
                    </div>
                    {log.subscriber?.firstName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.subscriber.firstName} {log.subscriber.lastName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.campaign?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {log.campaign?.type || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatEventData(log.eventData)}
                    </div>
                    {log.location?.country && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        📍 {log.location.city}, {log.location.country}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, totalLogs)} of {totalLogs} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationLog;