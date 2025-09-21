import React, { useState, useEffect } from 'react';
import { searchService } from '../../services/searchService';
import SearchAnalytics from '../../Components/Search/SearchAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const SearchManagement = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('analytics');
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearches, setSelectedSearches] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (activeTab === 'saved-searches') {
      loadSavedSearches();
    }
  }, [activeTab, pagination.page, searchQuery]);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await searchService.getSavedSearches(params);
      
      if (response.success) {
        setSavedSearches(response.savedSearches);
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await searchService.deleteSavedSearch(searchId);
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete saved search:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSearches.map(id => searchService.deleteSavedSearch(id)));
      setSavedSearches(prev => prev.filter(search => !selectedSearches.includes(search.id)));
      setSelectedSearches([]);
    } catch (error) {
      console.error('Failed to bulk delete saved searches:', error);
    }
  };

  const toggleSearchSelection = (searchId) => {
    setSelectedSearches(prev => 
      prev.includes(searchId)
        ? prev.filter(id => id !== searchId)
        : [...prev, searchId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSearches.length === savedSearches.length) {
      setSelectedSearches([]);
    } else {
      setSelectedSearches(savedSearches.map(search => search.id));
    }
  };

  const tabs = [
    {
      id: 'analytics',
      label: 'Search Analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'saved-searches',
      label: 'Saved Searches',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      id: 'popular-queries',
      label: 'Popular Queries',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Search Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const getFilterSummary = (filters) => {
    if (!filters) return 'No filters';

    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value && (!Array.isArray(value) || value.length > 0))
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.length} items`;
        }
        return `${key}: ${value}`;
      });

    return activeFilters.length > 0 ? activeFilters.slice(0, 3).join(', ') : 'No filters';
  };

  const SavedSearchesTab = () => (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search saved searches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {selectedSearches.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSearches.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Saved Searches List */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No saved searches
            </h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery ? 'No saved searches match your search.' : 'No saved searches found.'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSearches.length === savedSearches.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`ml-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select All
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className={`p-6 hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedSearches.includes(search.id)}
                        onChange={() => toggleSearchSelection(search.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {search.name}
                        </h3>
                        
                        {search.isPublic && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Public
                          </span>
                        )}
                        
                        {search.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {search.category}
                          </span>
                        )}
                      </div>

                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                        <span className="font-medium">Query:</span> "{search.query}"
                      </div>

                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                        <span className="font-medium">Filters:</span> {getFilterSummary(search.filters)}
                      </div>

                      <div className={`flex items-center space-x-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>
                          {search.resultCount} result{search.resultCount !== 1 ? 's' : ''}
                        </span>
                        
                        {search.lastExecuted && (
                          <span>
                            Last run {formatDistanceToNow(new Date(search.lastExecuted), { addSuffix: true })}
                          </span>
                        )}
                        
                        <span>
                          Created {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
                        </span>
                        
                        {search.user && (
                          <span>
                            by {search.user.firstName} {search.user.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setDeleteTarget(search);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-md transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-t ${isDark ? 'border-gray-600' : 'border-gray-200'} flex items-center justify-between`}>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className={`px-3 py-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const PopularQueriesTab = () => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
      <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Popular Queries Feature
      </h3>
      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        This feature is under development and will show trending search queries.
      </p>
    </div>
  );

  const SettingsTab = () => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Search Settings
      </h3>
      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Configure search behavior, indexing, and advanced search options.
      </p>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} py-6 px-2 md:px-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Management</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage search analytics, saved searches, and search system configuration.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'analytics' && <SearchAnalytics />}
          {activeTab === 'saved-searches' && <SavedSearchesTab />}
          {activeTab === 'popular-queries' && <PopularQueriesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>
                  Delete Saved Search
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Are you sure you want to delete the saved search "{deleteTarget.name}"? This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => handleDeleteSavedSearch(deleteTarget.id)}
                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                    }}
                    className={`px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} text-base font-medium rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-gray-300`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchManagement;