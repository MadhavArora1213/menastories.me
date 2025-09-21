import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';

const MediaLibrary = ({ onSelectMedia, onClose, allowMultiple = false }) => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({});

  // Load media items
  const loadMediaItems = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/media?page=${page}&type=${filterType}&search=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMediaItems(page === 1 ? data.media : [...mediaItems, ...data.media]);
        setFilteredItems(page === 1 ? data.media : [...filteredItems, ...data.media]);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
    setLoading(false);
  }, [filterType, searchTerm, mediaItems]);

  // Load initial media
  useEffect(() => {
    loadMediaItems(1);
  }, [filterType, searchTerm]);

  // Handle file upload
  const uploadFiles = async (files) => {
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');
      formData.append('altText', '');
      formData.append('caption', '');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          return data.media;
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
      return null;
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        setMediaItems(prev => [...successfulUploads, ...prev]);
        setFilteredItems(prev => [...successfulUploads, ...prev]);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
    
    setUploading(false);
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    uploadFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    multiple: true
  });

  // Handle media selection
  const handleMediaSelect = (mediaItem) => {
    if (allowMultiple) {
      const isSelected = selectedItems.some(item => item.id === mediaItem.id);
      if (isSelected) {
        setSelectedItems(prev => prev.filter(item => item.id !== mediaItem.id));
      } else {
        setSelectedItems(prev => [...prev, mediaItem]);
      }
    } else {
      onSelectMedia(mediaItem);
    }
  };

  // Handle multiple selection confirmation
  const handleConfirmSelection = () => {
    if (allowMultiple && selectedItems.length > 0) {
      onSelectMedia(selectedItems);
    }
  };

  // Filter media items
  const filterMedia = (items, type, search) => {
    let filtered = items;
    
    if (type !== 'all') {
      filtered = filtered.filter(item => item.type === type);
    }
    
    if (search) {
      filtered = filtered.filter(item =>
        item.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
        item.caption?.toLowerCase().includes(search.toLowerCase()) ||
        item.altText?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Media item component
  const MediaItem = ({ item, isSelected, onSelect }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div
        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSelect(item)}
      >
        <div className="aspect-square">
          {item.type === 'image' && !imageError ? (
            <img
              src={item.url}
              alt={item.altText || item.originalFilename}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : item.type === 'video' ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM6 8.5v3l4-1.5-4-1.5z" />
              </svg>
            </div>
          ) : item.type === 'audio' ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Media info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
          <p className="text-xs truncate" title={item.originalFilename}>
            {item.originalFilename}
          </p>
          <p className="text-xs text-gray-300">
            {item.type} • {Math.round(item.fileSize / 1024)} KB
          </p>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Media Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {isDragActive ? (
                  'Drop files here'
                ) : (
                  <>
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    {' or drag and drop'}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, MP4, WebM up to 10MB
              </p>
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Uploading files...</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && mediaItems.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No media found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by uploading some media files.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <MediaItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.some(selected => selected.id === item.id)}
                  onSelect={handleMediaSelect}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center mt-6">
              <button
                onClick={() => loadMediaItems(currentPage + 1)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Insert Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;