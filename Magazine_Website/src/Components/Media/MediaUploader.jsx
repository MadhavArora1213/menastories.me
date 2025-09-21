import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { mediaService } from '../../services/mediaService';

const MediaUploader = ({ 
  multiple = true, 
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  onUploadComplete,
  onUploadError,
  folder = 'general',
  className = '' 
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const uploaderRef = useRef();

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rejection => ({
        file: rejection.file.name,
        errors: rejection.errors.map(e => e.message)
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setErrors([]);
    const totalFiles = acceptedFiles.length;
    let completedFiles = 0;

    try {
      for (const file of acceptedFiles) {
        const fileId = `${file.name}-${Date.now()}`;
        
        // Initialize progress for this file
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { progress: 0, status: 'uploading', file }
        }));

        try {
          // Create FormData for upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', folder);
          formData.append('displayName', file.name.split('.')[0]);
          
          // Add metadata if available
          if (file.type.startsWith('image/')) {
            formData.append('altText', `Image: ${file.name.split('.')[0]}`);
          }

          // Upload file with progress tracking
          const response = await mediaService.uploadMedia(formData, (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                progress: percentCompleted
              }
            }));
          });

          // Mark as completed
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              status: 'completed',
              progress: 100,
              media: response.media
            }
          }));

          setUploadedFiles(prev => [...prev, response.media]);
          completedFiles++;

          // Call success callback for individual file
          if (onUploadComplete) {
            onUploadComplete(response.media, completedFiles, totalFiles);
          }

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              status: 'error',
              error: error.response?.data?.message || 'Upload failed'
            }
          }));

          setErrors(prev => [...prev, {
            file: file.name,
            errors: [error.response?.data?.message || 'Upload failed']
          }]);

          if (onUploadError) {
            onUploadError(error, file);
          }
        }
      }
    } finally {
      setUploading(false);
    }
  }, [folder, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
    disabled: uploading
  });

  const removeFile = (fileId) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const retryUpload = async (fileId) => {
    const fileData = uploadProgress[fileId];
    if (!fileData?.file) return;

    setUploadProgress(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'uploading',
        progress: 0,
        error: null
      }
    }));

    // Re-trigger upload for this file
    onDrop([fileData.file], []);
  };

  const clearCompleted = () => {
    setUploadProgress(prev => {
      const newProgress = {};
      Object.keys(prev).forEach(key => {
        if (prev[key].status !== 'completed') {
          newProgress[key] = prev[key];
        }
      });
      return newProgress;
    });
    setUploadedFiles([]);
  };

  const getFileTypeIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else if (file.type.startsWith('audio/')) {
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    } else {
      return (
        <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const progressEntries = Object.entries(uploadProgress);

  return (
    <div className={`media-uploader ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        ref={uploaderRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : uploading
            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto h-16 w-16">
            {uploading ? (
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive
                ? 'Drop files here...'
                : uploading
                ? 'Uploading files...'
                : 'Drag & drop files here'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {multiple ? 'or click to select files' : 'or click to select a file'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supported: {acceptedTypes.join(', ')} • Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {progressEntries.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Upload Progress ({progressEntries.length} files)
            </h4>
            {progressEntries.some(([_, data]) => data.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-2">
            {progressEntries.map(([fileId, data]) => (
              <div key={fileId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileTypeIcon(data.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {data.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(data.file.size)}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {data.status === 'uploading' && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {data.progress}%
                      </div>
                    )}
                    
                    {data.status === 'completed' && (
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    {data.status === 'error' && (
                      <button
                        onClick={() => retryUpload(fileId)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Retry upload"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileId)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {data.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {data.status === 'error' && data.error && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {data.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error.file}
                  </p>
                  {error.errors.map((err, errIndex) => (
                    <p key={errIndex} className="text-xs text-red-700 dark:text-red-300 mt-1">
                      {err}
                    </p>
                  ))}
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setErrors(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;