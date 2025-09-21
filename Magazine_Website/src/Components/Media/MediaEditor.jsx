import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mediaService } from '../../services/mediaService';

const MediaEditor = ({ 
  media, 
  onSave, 
  onCancel, 
  showCropTools = true,
  showFilterTools = true,
  showResizeTools = true 
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Editing state
  const [editMode, setEditMode] = useState(null); // 'crop', 'filter', 'resize', 'rotate'
  const [hasChanges, setHasChanges] = useState(false);

  // Crop state
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0
  });

  // Resize state
  const [resizeSettings, setResizeSettings] = useState({
    width: 0,
    height: 0,
    maintainAspect: true,
    originalWidth: 0,
    originalHeight: 0
  });

  // Rotation state
  const [rotation, setRotation] = useState(0);

  // Metadata editing
  const [metadata, setMetadata] = useState({
    displayName: media?.displayName || '',
    altText: media?.altText || '',
    caption: media?.caption || '',
    tags: media?.tags || []
  });

  useEffect(() => {
    if (media && media.type === 'image') {
      loadImage();
    }
  }, [media]);

  const loadImage = async () => {
    try {
      setLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
        setEditedImage(img);
        setResizeSettings(prev => ({
          ...prev,
          width: img.naturalWidth,
          height: img.naturalHeight,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight
        }));
        drawImageToCanvas(img);
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load image');
        setLoading(false);
      };
      img.src = media.url;
    } catch (err) {
      setError('Failed to load image');
      setLoading(false);
    }
  };

  const drawImageToCanvas = (img, applyFilters = true) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply filters
    if (applyFilters) {
      const filterString = [
        `brightness(${filters.brightness}%)`,
        `contrast(${filters.contrast}%)`,
        `saturate(${filters.saturation}%)`,
        `blur(${filters.blur}px)`,
        `sepia(${filters.sepia}%)`,
        `grayscale(${filters.grayscale}%)`,
        `hue-rotate(${filters.hueRotate}deg)`
      ].join(' ');
      ctx.filter = filterString;
    }

    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none'; // Reset filter
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setHasChanges(true);
    
    if (originalImage) {
      drawImageToCanvas(originalImage);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hueRotate: 0
    };
    setFilters(resetFilters);
    setHasChanges(true);
    
    if (originalImage) {
      drawImageToCanvas(originalImage);
    }
  };

  const handleRotate = (degrees) => {
    setRotation(prev => (prev + degrees) % 360);
    setHasChanges(true);
    
    if (originalImage) {
      drawImageToCanvas(originalImage);
    }
  };

  const handleResize = (width, height) => {
    if (resizeSettings.maintainAspect) {
      const aspectRatio = resizeSettings.originalWidth / resizeSettings.originalHeight;
      if (width) {
        height = width / aspectRatio;
      } else if (height) {
        width = height * aspectRatio;
      }
    }

    setResizeSettings(prev => ({
      ...prev,
      width: Math.round(width),
      height: Math.round(height)
    }));
    setHasChanges(true);
  };

  const handleCropStart = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleCropMove = (e) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    });
  };

  const handleCropEnd = () => {
    setIsDragging(false);
    if (cropArea.width > 10 && cropArea.height > 10) {
      setHasChanges(true);
    }
  };

  const applyCrop = () => {
    if (!originalImage || !cropArea.width || !cropArea.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;
    
    // Draw the cropped portion
    croppedCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
    
    // Update the main canvas
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(croppedCanvas, 0, 0);
    
    // Reset crop area
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setEditMode(null);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!hasChanges) {
      onSave && onSave(media);
      return;
    }

    try {
      setLoading(true);
      const canvas = canvasRef.current;
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `edited_${media.originalFilename}`);
      formData.append('displayName', metadata.displayName);
      formData.append('altText', metadata.altText);
      formData.append('caption', metadata.caption);
      formData.append('tags', JSON.stringify(metadata.tags));
      formData.append('isEdited', 'true');
      formData.append('originalId', media.id);

      // Upload the edited image
      const response = await mediaService.uploadMedia(formData);
      
      if (response.media) {
        onSave && onSave(response.media);
      }
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async () => {
    try {
      setLoading(true);
      const updatedMedia = await mediaService.updateMedia(media.id, metadata);
      onSave && onSave(updatedMedia);
    } catch (err) {
      console.error('Failed to update metadata:', err);
      setError('Failed to update metadata');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
        </div>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!media || media.type !== 'image') {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No image selected</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please select an image to edit.
        </p>
      </div>
    );
  }

  return (
    <div className="media-editor flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Media
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {media.displayName || media.originalFilename}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={hasChanges ? saveChanges : updateMetadata}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            disabled={loading}
          >
            {hasChanges ? 'Save Changes' : 'Update Metadata'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Tool Selection */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {showCropTools && (
                <button
                  onClick={() => setEditMode(editMode === 'crop' ? null : 'crop')}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    editMode === 'crop'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="h-5 w-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Crop
                </button>
              )}
              
              {showFilterTools && (
                <button
                  onClick={() => setEditMode(editMode === 'filter' ? null : 'filter')}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    editMode === 'filter'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="h-5 w-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0V2a1 1 0 011-1h4a1 1 0 011 1v2m0 0v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4h16z" />
                  </svg>
                  Filters
                </button>
              )}
              
              <button
                onClick={() => setEditMode(editMode === 'rotate' ? null : 'rotate')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  editMode === 'rotate'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                <svg className="h-5 w-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rotate
              </button>
              
              {showResizeTools && (
                <button
                  onClick={() => setEditMode(editMode === 'resize' ? null : 'resize')}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    editMode === 'resize'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="h-5 w-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Resize
              </button>
              )}
            </div>
          </div>

          {/* Tool Controls */}
          <div className="p-4">
            {editMode === 'filter' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h4>
                
                {Object.entries(filters).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {key === 'hueRotate' ? 'Hue Rotate' : key}: {value}{key === 'blur' ? 'px' : key === 'hueRotate' ? '°' : '%'}
                    </label>
                    <input
                      type="range"
                      min={key === 'blur' ? 0 : key === 'hueRotate' ? 0 : 0}
                      max={key === 'blur' ? 10 : key === 'hueRotate' ? 360 : 200}
                      value={value}
                      onChange={(e) => handleFilterChange(key, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
                
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {editMode === 'crop' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Crop</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Click and drag on the image to select crop area
                </p>
                {cropArea.width > 0 && cropArea.height > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Selection: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                    </p>
                    <button
                      onClick={applyCrop}
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply Crop
                    </button>
                  </div>
                )}
              </div>
            )}

            {editMode === 'rotate' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Rotate</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRotate(-90)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ↺ 90° Left
                  </button>
                  <button
                    onClick={() => handleRotate(90)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ↻ 90° Right
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current rotation: {rotation}°
                </p>
              </div>
            )}

            {editMode === 'resize' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Resize</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.width}
                      onChange={(e) => handleResize(parseInt(e.target.value), null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={resizeSettings.height}
                      onChange={(e) => handleResize(null, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintainAspect"
                      checked={resizeSettings.maintainAspect}
                      onChange={(e) => setResizeSettings(prev => ({ ...prev, maintainAspect: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="maintainAspect" className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                      Maintain aspect ratio
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Editing */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Metadata</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={metadata.displayName}
                  onChange={(e) => setMetadata(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alt Text
                </label>
                <textarea
                  value={metadata.altText}
                  onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Caption
                </label>
                <textarea
                  value={metadata.caption}
                  onChange={(e) => setMetadata(prev => ({ ...prev, caption: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags.join(', ')}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain border border-gray-300 dark:border-gray-600 shadow-lg"
              onMouseDown={editMode === 'crop' ? handleCropStart : undefined}
              onMouseMove={editMode === 'crop' ? handleCropMove : undefined}
              onMouseUp={editMode === 'crop' ? handleCropEnd : undefined}
              style={{ cursor: editMode === 'crop' ? 'crosshair' : 'default' }}
            />
            
            {/* Crop Overlay */}
            {editMode === 'crop' && cropArea.width > 0 && cropArea.height > 0 && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                style={{
                  left: `${(cropArea.x / (canvasRef.current?.width || 1)) * 100}%`,
                  top: `${(cropArea.y / (canvasRef.current?.height || 1)) * 100}%`,
                  width: `${(cropArea.width / (canvasRef.current?.width || 1)) * 100}%`,
                  height: `${(cropArea.height / (canvasRef.current?.height || 1)) * 100}%`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;