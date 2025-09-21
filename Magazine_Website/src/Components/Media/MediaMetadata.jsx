import React, { useState, useEffect } from 'react';
import { mediaService } from '../../services/mediaService';
import { formatDistanceToNow } from 'date-fns';

const MediaMetadata = ({ 
  media, 
  editable = false, 
  onUpdate, 
  onClose,
  showUsageInfo = true,
  showTechnicalInfo = true,
  showEditHistory = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [editHistory, setEditHistory] = useState([]);

  // Editable metadata state
  const [editableData, setEditableData] = useState({
    displayName: media?.displayName || '',
    altText: media?.altText || '',
    caption: media?.caption || '',
    description: media?.description || '',
    tags: media?.tags || [],
    category: media?.category || '',
    isPrivate: media?.isPrivate || false,
    allowDownload: media?.allowDownload !== false,
    customFields: media?.customFields || {}
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (media) {
      setEditableData({
        displayName: media.displayName || '',
        altText: media.altText || '',
        caption: media.caption || '',
        description: media.description || '',
        tags: media.tags || [],
        category: media.category || '',
        isPrivate: media.isPrivate || false,
        allowDownload: media.allowDownload !== false,
        customFields: media.customFields || {}
      });

      // Load usage data and edit history
      loadAdditionalData();
    }
  }, [media]);

  const loadAdditionalData = async () => {
    if (!media?.id) return;

    try {
      // Load usage information
      if (showUsageInfo) {
        const usage = await mediaService.getMediaUsage(media.id);
        setUsageData(usage);
      }

      // Load edit history
      if (showEditHistory) {
        const history = await mediaService.getMediaHistory(media.id);
        setEditHistory(history);
      }
    } catch (err) {
      console.error('Failed to load additional data:', err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const updatedMedia = await mediaService.updateMedia(media.id, editableData);
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(updatedMedia);
      }
    } catch (err) {
      console.error('Failed to update metadata:', err);
      setError('Failed to update metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditableData({
      displayName: media?.displayName || '',
      altText: media?.altText || '',
      caption: media?.caption || '',
      description: media?.description || '',
      tags: media?.tags || [],
      category: media?.category || '',
      isPrivate: media?.isPrivate || false,
      allowDownload: media?.allowDownload !== false,
      customFields: media?.customFields || {}
    });
    setIsEditing(false);
    setError(null);
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !editableData.tags.includes(trimmedTag)) {
      setEditableData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setEditableData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (!media) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No media selected</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select a media file to view its metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="media-metadata bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-3">
          {getMediaTypeIcon(media.type)}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {media.displayName || media.originalFilename}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {media.type?.charAt(0).toUpperCase() + media.type?.slice(1)} • {formatFileSize(media.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {editable && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Edit
                </button>
              )}
            </>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="ml-2 text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
          <div className="space-y-3">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableData.displayName}
                  onChange={(e) => setEditableData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-white">
                  {media.displayName || media.originalFilename}
                </p>
              )}
            </div>

            {/* Alt Text */}
            {media.type === 'image' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alt Text
                </label>
                {isEditing ? (
                  <textarea
                    value={editableData.altText}
                    onChange={(e) => setEditableData(prev => ({ ...prev, altText: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this image for accessibility..."
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {media.altText || <span className="text-gray-500 dark:text-gray-400 italic">No alt text</span>}
                  </p>
                )}
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Caption
              </label>
              {isEditing ? (
                <textarea
                  value={editableData.caption}
                  onChange={(e) => setEditableData(prev => ({ ...prev, caption: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a caption..."
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-white">
                  {media.caption || <span className="text-gray-500 dark:text-gray-400 italic">No caption</span>}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editableData.description}
                  onChange={(e) => setEditableData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a detailed description..."
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-white">
                  {media.description || <span className="text-gray-500 dark:text-gray-400 italic">No description</span>}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {editableData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder="Add tags (press Enter or comma to add)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {media.tags && media.tags.length > 0 ? (
                    media.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">No tags</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Information */}
        {showTechnicalInfo && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Technical Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                <p className="text-gray-900 dark:text-white">{formatFileSize(media.size)}</p>
              </div>
              
              <div>
                <span className="text-gray-500 dark:text-gray-400">Format:</span>
                <p className="text-gray-900 dark:text-white">{media.format?.toUpperCase()}</p>
              </div>

              {media.dimensions && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                  <p className="text-gray-900 dark:text-white">
                    {media.dimensions.width} × {media.dimensions.height}
                  </p>
                </div>
              )}

              {media.duration && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <p className="text-gray-900 dark:text-white">
                    {Math.floor(media.duration / 60)}:{String(Math.floor(media.duration % 60)).padStart(2, '0')}
                  </p>
                </div>
              )}

              <div>
                <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                <p className="text-gray-900 dark:text-white">
                  {formatDistanceToNow(new Date(media.createdAt), { addSuffix: true })}
                </p>
              </div>

              {media.updatedAt !== media.createdAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                  <p className="text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(media.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              )}

              <div>
                <span className="text-gray-500 dark:text-gray-400">MIME Type:</span>
                <p className="text-gray-900 dark:text-white">{media.mimeType}</p>
              </div>

              {media.checksum && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Checksum:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                    {media.checksum}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Information */}
        {showUsageInfo && usageData && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Usage Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Used in articles:</span>
                <span className="text-gray-900 dark:text-white">{usageData.articleCount || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Download count:</span>
                <span className="text-gray-900 dark:text-white">{usageData.downloadCount || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last accessed:</span>
                <span className="text-gray-900 dark:text-white">
                  {usageData.lastAccessed 
                    ? formatDistanceToNow(new Date(usageData.lastAccessed), { addSuffix: true })
                    : 'Never'
                  }
                </span>
              </div>

              {usageData.articles && usageData.articles.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Used in:</span>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-2">
                    {usageData.articles.slice(0, 5).map((article) => (
                      <li key={article.id}>• {article.title}</li>
                    ))}
                    {usageData.articles.length > 5 && (
                      <li className="text-gray-500 dark:text-gray-400">
                        ... and {usageData.articles.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit History */}
        {showEditHistory && editHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Edit History</h4>
            <div className="space-y-2">
              {editHistory.slice(0, 5).map((edit, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                  <span>{edit.action}</span>
                  <span>{formatDistanceToNow(new Date(edit.createdAt), { addSuffix: true })}</span>
                </div>
              ))}
              {editHistory.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ... and {editHistory.length - 5} more changes
                </p>
              )}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {isEditing && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Privacy Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={editableData.isPrivate}
                  onChange={(e) => setEditableData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Private (only visible to admins)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={editableData.allowDownload}
                  onChange={(e) => setEditableData(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allowDownload" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Allow downloads
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaMetadata;