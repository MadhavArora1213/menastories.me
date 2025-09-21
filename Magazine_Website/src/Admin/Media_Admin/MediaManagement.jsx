import React, { useState, useEffect, useCallback } from 'react';
import { mediaService } from '../../services/mediaService';
import { MediaLibrary, MediaUploader, MediaEditor, MediaMetadata, BulkMediaActions } from '../../Components/Media';
import { formatDistanceToNow } from 'date-fns';

const MediaManagement = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Folder management state
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    parentId: null
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byType: {},
    recentUploads: 0
  });

  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    folder: null,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    dateRange: 'all'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMedia();
  }, [pagination.page, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load media, folders, and statistics concurrently
      const [mediaResponse, foldersResponse, statsResponse] = await Promise.all([
        mediaService.getMedia({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        mediaService.getFolderTree(),
        mediaService.getMediaStats()
      ]);

      setMedia(mediaResponse.media || []);
      setPagination(prev => ({
        ...prev,
        total: mediaResponse.totalMedia || 0,
        totalPages: mediaResponse.totalPages || 0
      }));

      setFolders(foldersResponse.tree || []);
      setStats(statsResponse || stats);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load media management data');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      if (filters.dateRange !== 'all') {
        const now = new Date();
        const days = {
          today: 1,
          week: 7,
          month: 30,
          quarter: 90
        };
        
        if (days[filters.dateRange]) {
          const fromDate = new Date(now - days[filters.dateRange] * 24 * 60 * 60 * 1000);
          params.fromDate = fromDate.toISOString();
        }
      }

      const response = await mediaService.getMedia(params);
      
      setMedia(response.media || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalMedia || 0,
        totalPages: response.totalPages || 0
      }));
    } catch (err) {
      console.error('Failed to load media:', err);
      setError('Failed to load media files');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMediaUpdate = async (updatedMedia) => {
    // Update the media in the list
    setMedia(prev => prev.map(item => 
      item.id === updatedMedia.id ? updatedMedia : item
    ));

    // Update current media if it's the same
    if (currentMedia && currentMedia.id === updatedMedia.id) {
      setCurrentMedia(updatedMedia);
    }

    // Reload stats
    try {
      const statsResponse = await mediaService.getMediaStats();
      setStats(statsResponse || stats);
    } catch (err) {
      console.error('Failed to reload stats:', err);
    }
  };

  const handleMediaDelete = async (mediaId) => {
    try {
      await mediaService.deleteMedia(mediaId);
      
      // Remove from list
      setMedia(prev => prev.filter(item => item.id !== mediaId));
      
      // Clear current media if it was deleted
      if (currentMedia && currentMedia.id === mediaId) {
        setCurrentMedia(null);
        setShowMetadata(false);
        setShowEditor(false);
      }

      // Remove from selection
      setSelectedMedia(prev => prev.filter(item => item.id !== mediaId));

      // Reload stats
      const statsResponse = await mediaService.getMediaStats();
      setStats(statsResponse || stats);
    } catch (err) {
      console.error('Failed to delete media:', err);
      setError('Failed to delete media file');
    }
  };

  const handleUploadComplete = (uploadedMedia) => {
    // Add to media list
    if (Array.isArray(uploadedMedia)) {
      setMedia(prev => [...uploadedMedia, ...prev]);
    } else {
      setMedia(prev => [uploadedMedia, ...prev]);
    }

    // Reload stats and folders
    loadInitialData();
    setShowUploader(false);
  };

  const handleBulkActionComplete = (action, results) => {
    // Refresh data after bulk operations
    if (['delete', 'move', 'copy'].includes(action)) {
      loadInitialData();
    } else {
      loadMedia();
    }
    setShowBulkActions(false);
  };

  // Folder management functions
  const handleCreateFolder = async () => {
    try {
      const newFolder = await mediaService.createFolder(folderForm);
      setFolders(prev => [...prev, newFolder]);
      setFolderForm({ name: '', description: '', color: '#3B82F6', parentId: null });
      setShowFolderForm(false);
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError('Failed to create folder');
    }
  };

  const handleUpdateFolder = async () => {
    try {
      const updatedFolder = await mediaService.updateFolder(editingFolder.id, folderForm);
      setFolders(prev => prev.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      ));
      setEditingFolder(null);
      setFolderForm({ name: '', description: '', color: '#3B82F6', parentId: null });
      setShowFolderForm(false);
    } catch (err) {
      console.error('Failed to update folder:', err);
      setError('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Are you sure you want to delete this folder? All media in this folder will be moved to the root.')) {
      return;
    }

    try {
      await mediaService.deleteFolder(folderId);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      // Reload media in case some were moved
      loadMedia();
    } catch (err) {
      console.error('Failed to delete folder:', err);
      setError('Failed to delete folder');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="media-management h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and organize your media files
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploader(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Media</span>
          </button>

          <button
            onClick={() => setShowFolderForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>New Folder</span>
          </button>

          {selectedMedia.length > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Bulk Actions ({selectedMedia.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 m-6 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="ml-2 text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.byType?.image || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 6V8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1v-1" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Recent (7d)</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.recentUploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64 relative">
            <input
              type="text"
              placeholder="Search media files..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="originalFilename-ASC">Name A-Z</option>
            <option value="originalFilename-DESC">Name Z-A</option>
            <option value="size-DESC">Largest First</option>
            <option value="size-ASC">Smallest First</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MediaLibrary
          selectable={true}
          multiple={true}
          onSelect={setSelectedMedia}
          selectedMedia={selectedMedia}
          showUploader={false}
          viewMode="grid"
        />
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Media Files</h3>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MediaUploader
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                  setError('Failed to upload media files');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Editor Modal */}
      {showEditor && currentMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
            <MediaEditor
              media={currentMedia}
              onSave={(updatedMedia) => {
                handleMediaUpdate(updatedMedia);
                setShowEditor(false);
              }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Metadata Panel Modal */}
      {showMetadata && currentMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <MediaMetadata
              media={currentMedia}
              editable={true}
              onUpdate={handleMediaUpdate}
              onClose={() => setShowMetadata(false)}
            />
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActions && selectedMedia.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bulk Actions</h3>
              <button
                onClick={() => setShowBulkActions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BulkMediaActions
              selectedMedia={selectedMedia}
              onActionComplete={handleBulkActionComplete}
              onSelectionChange={setSelectedMedia}
            />
          </div>
        </div>
      )}

      {/* Folder Form Modal */}
      {showFolderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingFolder ? 'Edit Folder' : 'Create New Folder'}
              </h3>
              <button
                onClick={() => {
                  setShowFolderForm(false);
                  setEditingFolder(null);
                  setFolderForm({ name: '', description: '', color: '#3B82F6', parentId: null });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter folder name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={folderForm.description}
                  onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter folder description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={folderForm.color}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={folderForm.color}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowFolderForm(false);
                    setEditingFolder(null);
                    setFolderForm({ name: '', description: '', color: '#3B82F6', parentId: null });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  disabled={!folderForm.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingFolder ? 'Update Folder' : 'Create Folder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;