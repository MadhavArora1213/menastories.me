import React, { useState, useCallback, useRef, useEffect } from 'react';
import { flipbookService } from '../../services/flipbookService';

const FlipbookUploader = ({ onUploadComplete, onUploadError, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    magazineType: 'monthly',
    category: 'business-leadership', // Default to first category from database
    accessType: 'free',
    price: 0,
    isPublished: false,
    allowDownload: false,
    allowPrint: false,
    allowShare: true
  });

  // Categories from database
  const [categories, setCategories] = useState([]);

  const fileInputRef = useRef(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await flipbookService.getCategories();
        setCategories(categoriesResponse.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/x-pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid PDF file.');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB.');
      return;
    }

    setUploadedFile(file);
    setError(null);

    // Auto-fill title if empty
    if (!formData.title) {
      const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError('Please select a file to upload.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for the magazine.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const uploadData = new FormData();
      uploadData.append('flipbook', uploadedFile);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('magazineType', formData.magazineType);
      uploadData.append('category', formData.category);
      uploadData.append('accessType', formData.accessType);
      uploadData.append('price', formData.price.toString());
      uploadData.append('isPublished', formData.isPublished.toString());
      uploadData.append('allowDownload', formData.allowDownload.toString());
      uploadData.append('allowPrint', formData.allowPrint.toString());
      uploadData.append('allowShare', formData.allowShare.toString());

      const response = await flipbookService.uploadFlipbook(uploadData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(progress);
      });

      if (onUploadComplete) {
        onUploadComplete(response.magazine);
      }

      // Reset form
      setUploadedFile(null);
      setFormData({
        title: '',
        description: '',
        magazineType: 'monthly',
        category: 'business-leadership',
        accessType: 'free',
        price: 0,
        isPublished: false,
        allowDownload: false,
        allowPrint: false,
        allowShare: true
      });
      setUploadProgress(0);

    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err.response?.data?.error || 'Upload failed. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flipbook-uploader ${className}`}>
      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Magazine PDF File
        </label>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : uploadedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>

              <button
                onClick={() => setUploadedFile(null)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop your PDF file here
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or click to browse files
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Uploading...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}% complete
                  </p>
                </div>
                <div className="w-full max-w-xs mx-auto">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Maximum file size: 100MB. Supported format: PDF only.
        </p>
      </div>

      {/* Magazine Details Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter magazine title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Magazine Type
            </label>
            <select
              value={formData.magazineType}
              onChange={(e) => handleFormChange('magazineType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="special">Special Edition</option>
              <option value="annual">Annual</option>
              <option value="digital_only">Digital Only</option>
              <option value="print_digital">Print + Digital</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter magazine description"
          />
        </div>

        {/* Category and Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Type
            </label>
            <select
              value={formData.accessType}
              onChange={(e) => handleFormChange('accessType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="free">Free Access</option>
            </select>
          </div>

          {formData.accessType === 'paid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Permissions
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => handleFormChange('isPublished', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Publish immediately after upload
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowDownload"
                checked={formData.allowDownload}
                onChange={(e) => handleFormChange('allowDownload', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowDownload" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Allow users to download the magazine
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPrint"
                checked={formData.allowPrint}
                onChange={(e) => handleFormChange('allowPrint', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowPrint" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Allow users to print the magazine
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowShare"
                checked={formData.allowShare}
                onChange={(e) => handleFormChange('allowShare', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowShare" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Allow users to share the magazine
              </label>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!uploadedFile || !formData.title.trim() || uploading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Magazine</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlipbookUploader;