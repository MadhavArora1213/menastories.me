import React, { useState, useCallback } from 'react';
import { mediaService } from '../../services/mediaService';

const BulkMediaActions = ({ 
  selectedMedia = [], 
  onActionComplete, 
  onSelectionChange,
  availableActions = [
    'move', 'copy', 'delete', 'tag', 'updateMetadata', 
    'optimize', 'download', 'makePrivate', 'makePublic'
  ]
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  // Action-specific state
  const [moveToFolder, setMoveToFolder] = useState('');
  const [copyToFolder, setCopyToFolder] = useState('');
  const [bulkTags, setBulkTags] = useState('');
  const [bulkMetadata, setBulkMetadata] = useState({
    altText: '',
    caption: '',
    description: ''
  });
  const [folders, setFolders] = useState([]);
  const [showFolderSelect, setShowFolderSelect] = useState(false);

  // Load folders when needed
  const loadFolders = useCallback(async () => {
    if (folders.length === 0) {
      try {
        const response = await mediaService.getFolders();
        setFolders(response.folders || []);
      } catch (err) {
        console.error('Failed to load folders:', err);
      }
    }
  }, [folders.length]);

  // Generic action processor
  const processAction = async (action, params = {}) => {
    if (selectedMedia.length === 0) {
      setError('No media files selected');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedMedia.length });
    setError(null);

    try {
      const results = [];
      
      for (let i = 0; i < selectedMedia.length; i++) {
        const media = selectedMedia[i];
        setProgress({ current: i + 1, total: selectedMedia.length });

        let result;
        switch (action) {
          case 'move':
            result = await mediaService.moveMedia(media.id, params.folderId);
            break;
          case 'copy':
            result = await mediaService.copyMedia(media.id, params.folderId);
            break;
          case 'delete':
            result = await mediaService.deleteMedia(media.id);
            break;
          case 'addTags':
            result = await mediaService.updateMedia(media.id, {
              tags: [...(media.tags || []), ...params.tags]
            });
            break;
          case 'removeTags':
            result = await mediaService.updateMedia(media.id, {
              tags: (media.tags || []).filter(tag => !params.tags.includes(tag))
            });
            break;
          case 'updateMetadata':
            result = await mediaService.updateMedia(media.id, params.metadata);
            break;
          case 'optimize':
            result = await mediaService.optimizeMedia(media.id, params.settings);
            break;
          case 'makePrivate':
            result = await mediaService.updateMedia(media.id, { isPrivate: true });
            break;
          case 'makePublic':
            result = await mediaService.updateMedia(media.id, { isPrivate: false });
            break;
          case 'download':
            // Handle download separately
            const link = document.createElement('a');
            link.href = media.url;
            link.download = media.originalFilename;
            link.click();
            result = { success: true };
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        results.push({ media, result });
        
        // Small delay to prevent overwhelming the server
        if (i < selectedMedia.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Notify completion
      if (onActionComplete) {
        onActionComplete(action, results);
      }

      // Clear selection for destructive actions
      if (['delete', 'move'].includes(action) && onSelectionChange) {
        onSelectionChange([]);
      }

      setShowConfirmDialog(null);
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
      setError(`Failed to ${action} media files: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Download all selected media as ZIP
  const downloadAsZip = async () => {
    if (selectedMedia.length === 0) return;

    try {
      setIsProcessing(true);
      const mediaIds = selectedMedia.map(media => media.id);
      const response = await mediaService.downloadBulkMedia(mediaIds);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-files-${Date.now()}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Bulk download failed:', err);
      setError('Failed to download media files');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm dialog component
  const ConfirmDialog = ({ action, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
              </h3>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to {action} {selectedMedia.length} selected media file{selectedMedia.length > 1 ? 's' : ''}?
            {action === 'delete' && ' This action cannot be undone.'}
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                action === 'delete'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {action === 'delete' ? 'Delete' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Progress indicator
  const ProgressIndicator = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Processing Media Files
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {progress.current} of {progress.total} files processed
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedMedia.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files selected</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select media files to perform bulk actions.
        </p>
      </div>
    );
  }

  return (
    <div className="bulk-media-actions bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Bulk Actions
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedMedia.length} file{selectedMedia.length > 1 ? 's' : ''} selected
          </span>
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

      <div className="p-4 space-y-6">
        {/* File Management Actions */}
        {(availableActions.includes('move') || availableActions.includes('copy') || availableActions.includes('delete')) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">File Management</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availableActions.includes('move') && (
                <div>
                  <select
                    value={moveToFolder}
                    onChange={(e) => setMoveToFolder(e.target.value)}
                    onFocus={loadFolders}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select folder to move to...</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => moveToFolder && processAction('move', { folderId: moveToFolder })}
                    disabled={!moveToFolder || isProcessing}
                    className="w-full mt-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Move Files
                  </button>
                </div>
              )}

              {availableActions.includes('copy') && (
                <div>
                  <select
                    value={copyToFolder}
                    onChange={(e) => setCopyToFolder(e.target.value)}
                    onFocus={loadFolders}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select folder to copy to...</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => copyToFolder && processAction('copy', { folderId: copyToFolder })}
                    disabled={!copyToFolder || isProcessing}
                    className="w-full mt-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Copy Files
                  </button>
                </div>
              )}

              {availableActions.includes('delete') && (
                <div>
                  <button
                    onClick={() => setShowConfirmDialog('delete')}
                    disabled={isProcessing}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete Files
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata Actions */}
        {(availableActions.includes('tag') || availableActions.includes('updateMetadata')) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Metadata</h4>
            
            {availableActions.includes('tag') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Add/Remove Tags (comma-separated)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={bulkTags}
                      onChange={(e) => setBulkTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const tags = bulkTags.split(',').map(tag => tag.trim()).filter(Boolean);
                        if (tags.length > 0) {
                          processAction('addTags', { tags });
                          setBulkTags('');
                        }
                      }}
                      disabled={!bulkTags.trim() || isProcessing}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Tags
                    </button>
                    <button
                      onClick={() => {
                        const tags = bulkTags.split(',').map(tag => tag.trim()).filter(Boolean);
                        if (tags.length > 0) {
                          processAction('removeTags', { tags });
                          setBulkTags('');
                        }
                      }}
                      disabled={!bulkTags.trim() || isProcessing}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove Tags
                    </button>
                  </div>
                </div>
              </div>
            )}

            {availableActions.includes('updateMetadata') && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alt Text (for images)
                  </label>
                  <input
                    type="text"
                    value={bulkMetadata.altText}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, altText: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Caption
                  </label>
                  <textarea
                    value={bulkMetadata.caption}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, caption: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={bulkMetadata.description}
                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => {
                    const metadata = Object.fromEntries(
                      Object.entries(bulkMetadata).filter(([_, value]) => value.trim())
                    );
                    if (Object.keys(metadata).length > 0) {
                      processAction('updateMetadata', { metadata });
                      setBulkMetadata({ altText: '', caption: '', description: '' });
                    }
                  }}
                  disabled={!Object.values(bulkMetadata).some(v => v.trim()) || isProcessing}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update Metadata
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Actions */}
        {(availableActions.includes('makePrivate') || availableActions.includes('makePublic')) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Privacy</h4>
            <div className="flex space-x-3">
              {availableActions.includes('makePrivate') && (
                <button
                  onClick={() => processAction('makePrivate')}
                  disabled={isProcessing}
                  className="flex-1 bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Make Private
                </button>
              )}
              
              {availableActions.includes('makePublic') && (
                <button
                  onClick={() => processAction('makePublic')}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Make Public
                </button>
              )}
            </div>
          </div>
        )}

        {/* Download Actions */}
        {availableActions.includes('download') && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Download</h4>
            <div className="flex space-x-3">
              <button
                onClick={() => processAction('download')}
                disabled={isProcessing}
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Download Individual Files
              </button>
              
              <button
                onClick={downloadAsZip}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Download as ZIP
              </button>
            </div>
          </div>
        )}

        {/* Optimization Actions */}
        {availableActions.includes('optimize') && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Optimization</h4>
            <button
              onClick={() => processAction('optimize', { 
                settings: { 
                  quality: 85, 
                  maxWidth: 1920, 
                  maxHeight: 1080,
                  format: 'webp'
                } 
              })}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Optimize Images
            </button>
          </div>
        )}

        {/* Clear Selection */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onSelectionChange && onSelectionChange([])}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          action={showConfirmDialog}
          onConfirm={() => processAction(showConfirmDialog)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}

      {/* Progress Indicator */}
      {isProcessing && <ProgressIndicator />}
    </div>
  );
};

export default BulkMediaActions;