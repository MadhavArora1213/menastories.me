import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';
import { formatDistanceToNow } from 'date-fns';

const SubscriberManagement = ({
  onSubscriberSelect,
  onBulkAction,
  selectable = false,
  className = ''
}) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Bulk actions
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    bounced: 0,
    unsubscribed: 0,
    whatsappEnabled: 0
  });

  useEffect(() => {
    loadSubscribers();
  }, [page, filters]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsletterService.getSubscribers({
        page,
        limit: 20,
        ...filters
      });

      setSubscribers(response.subscribers || []);
      setTotalSubscribers(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);

      // Calculate statistics
      calculateStats(response.subscribers || []);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setError('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subscriberList) => {
    const newStats = {
      total: subscriberList.length,
      active: 0,
      inactive: 0,
      bounced: 0,
      unsubscribed: 0,
      whatsappEnabled: 0
    };

    subscriberList.forEach(subscriber => {
      switch (subscriber.status) {
        case 'active':
          newStats.active++;
          break;
        case 'inactive':
          newStats.inactive++;
          break;
        case 'bounced':
          newStats.bounced++;
          break;
        case 'unsubscribed':
          newStats.unsubscribed++;
          break;
      }

      if (subscriber.whatsappEnabled) {
        newStats.whatsappEnabled++;
      }
    });

    setStats(newStats);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSubscriberSelect = (subscriber, isSelected) => {
    if (isSelected) {
      setSelectedSubscribers(prev => [...prev, subscriber]);
    } else {
      setSelectedSubscribers(prev => prev.filter(s => s.id !== subscriber.id));
    }

    if (onSubscriberSelect) {
      onSubscriberSelect(subscriber, isSelected);
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedSubscribers(subscribers);
    } else {
      setSelectedSubscribers([]);
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedSubscribers.length === 0) {
      setError('No subscribers selected');
      return;
    }

    try {
      setLoading(true);
      const subscriberIds = selectedSubscribers.map(s => s.id);

      switch (actionType) {
        case 'activate':
          await newsletterService.bulkUpdateSubscribers(subscriberIds, { status: 'active' });
          break;
        case 'deactivate':
          await newsletterService.bulkUpdateSubscribers(subscriberIds, { status: 'inactive' });
          break;
        case 'delete':
          await newsletterService.bulkDeleteSubscribers(subscriberIds);
          break;
        case 'export':
          const exportResponse = await newsletterService.exportSubscribers({
            status: filters.status,
            dateFrom: null,
            dateTo: null
          });
          // Handle export response
          break;
      }

      if (onBulkAction) {
        onBulkAction(actionType, selectedSubscribers);
      }

      // Refresh the list
      await loadSubscribers();
      setSelectedSubscribers([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError(`Failed to ${actionType} subscribers`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
      inactive: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
      bounced: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
      unsubscribed: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20',
      complained: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      bounced: 'Bounced',
      unsubscribed: 'Unsubscribed',
      complained: 'Complained'
    };
    return labels[status] || status;
  };

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'bounced', label: 'Bounced' },
      { value: 'unsubscribed', label: 'Unsubscribed' },
      { value: 'complained', label: 'Complained' }
    ],
    sortBy: [
      { value: 'createdAt', label: 'Date Joined' },
      { value: 'email', label: 'Email' },
      { value: 'firstName', label: 'First Name' },
      { value: 'lastName', label: 'Last Name' },
      { value: 'engagementScore', label: 'Engagement' }
    ]
  };

  const bulkActionOptions = [
    { value: 'activate', label: 'Activate', icon: '✅' },
    { value: 'deactivate', label: 'Deactivate', icon: '⏸️' },
    { value: 'delete', label: 'Delete', icon: '🗑️' },
    { value: 'export', label: 'Export', icon: '📤' }
  ];

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`subscriber-management bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscriber Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your newsletter subscribers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedSubscribers.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bulk Actions ({selectedSubscribers.length})
            </button>
          )}
          <button
            onClick={loadSubscribers}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
          Subscriber Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inactive}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.bounced}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bounced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.unsubscribed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unsubscribed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.whatsappEnabled}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedSubscribers.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedSubscribers.length} subscriber{selectedSubscribers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                {bulkActionOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleBulkAction(option.value)}
                    className="flex items-center px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowBulkActions(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by email or name..."
              className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filterOptions.sortBy.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DESC">Newest</option>
              <option value="ASC">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto">
        {subscribers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No subscribers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No subscribers match your current filters.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscriber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Preferences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {subscribers.map((subscriber) => {
                const isSelected = selectedSubscribers.find(s => s.id === subscriber.id);
                return (
                  <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={(e) => handleSubscriberSelect(subscriber, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {subscriber.firstName?.[0] || subscriber.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {subscriber.firstName} {subscriber.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {subscriber.email}
                          </div>
                          {subscriber.phoneNumber && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {subscriber.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscriber.status)}`}>
                        {getStatusLabel(subscriber.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <span className="capitalize">{subscriber.preferences?.frequency || 'Weekly'}</span>
                        </div>
                        {subscriber.preferences?.categories && subscriber.preferences.categories.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {subscriber.preferences.categories.slice(0, 3).join(', ')}
                            {subscriber.preferences.categories.length > 3 && '...'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscriber.whatsappEnabled ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/20 rounded-full">
                          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/20 rounded-full">
                          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(subscriber.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSubscriberSelect && onSubscriberSelect(subscriber, true)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {/* Handle edit */}}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalSubscribers)} of {totalSubscribers} subscribers
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

export default SubscriberManagement;