import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mediaService } from '../../services/mediaService';
import VideoPlayer from './VideoPlayer';
import { formatDistanceToNow } from 'date-fns';

const ImageGallery = ({ 
  images = [],
  showMetadata = true,
  showNavigation = true,
  showThumbnails = true,
  autoPlay = false,
  slideInterval = 5000,
  onImageChange,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [isPlaying, images.length, slideInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!fullscreen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          exitFullscreen();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowMetadataPanel(prev => !prev);
          break;
      }
    };

    if (fullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [fullscreen, images.length]);

  // Notify parent component when image changes
  useEffect(() => {
    if (onImageChange && images[currentIndex]) {
      onImageChange(images[currentIndex], currentIndex);
    }
  }, [currentIndex, images, onImageChange]);

  const currentImage = useMemo(() => images[currentIndex], [images, currentIndex]);

  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    document.body.style.overflow = 'auto';
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distance = touchStart.x - touchEnd.x;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.originalFilename || `image-${image.id}.${image.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!images.length) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No images</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No images available in this gallery.
          </p>
        </div>
      </div>
    );
  }

  const GalleryContent = () => (
    <div className={`relative ${fullscreen ? 'fixed inset-0 bg-black z-50' : 'bg-white dark:bg-gray-900 rounded-lg overflow-hidden'} ${className}`}>
      {/* Main Image Display */}
      <div 
        className={`relative ${fullscreen ? 'h-full' : 'aspect-video'} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage ? (
          <>
            {currentImage.type === 'image' ? (
              <img
                src={currentImage.url}
                alt={currentImage.altText || currentImage.displayName}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLoading(false)}
                onLoadStart={() => setLoading(true)}
                onError={(e) => {
                  e.target.src = '/api/placeholder/800/600';
                  setLoading(false);
                }}
              />
            ) : currentImage.type === 'video' ? (
              <VideoPlayer
                src={currentImage.url}
                poster={currentImage.thumbnailUrl}
                className="max-w-full max-h-full"
              />
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {currentImage.displayName}
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Navigation Arrows */}
            {showNavigation && images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 ${fullscreen ? 'scale-125' : ''}`}
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 ${fullscreen ? 'scale-125' : ''}`}
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Controls Overlay */}
            <div className={`absolute ${fullscreen ? 'top-4 right-4' : 'top-2 right-2'} flex items-center space-x-2`}>
              {/* Auto-play toggle */}
              {images.length > 1 && (
                <button
                  onClick={togglePlayPause}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Metadata toggle */}
              {showMetadata && (
                <button
                  onClick={() => setShowMetadataPanel(prev => !prev)}
                  className={`bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 ${showMetadataPanel ? 'bg-blue-500 bg-opacity-70' : ''}`}
                  title="Toggle metadata"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}

              {/* Download */}
              <button
                onClick={() => downloadImage(currentImage)}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title="Download image"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={fullscreen ? exitFullscreen : enterFullscreen}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className={`absolute ${fullscreen ? 'bottom-4 left-4' : 'bottom-2 left-2'} bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm`}>
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Progress Bar for Auto-play */}
            {isPlaying && images.length > 1 && (
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30`}>
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    animation: `progress ${slideInterval}ms linear infinite`,
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Failed to load image
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && !fullscreen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {image.type === 'image' ? (
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.altText || image.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/64/64';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Panel */}
      {showMetadata && showMetadataPanel && currentImage && (
        <div className={`${fullscreen ? 'absolute top-0 right-0 h-full w-80 bg-black bg-opacity-90 text-white overflow-y-auto' : 'border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} transition-all duration-300`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Image Details</h3>
              <button
                onClick={() => setShowMetadataPanel(false)}
                className={`${fullscreen ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  Name
                </label>
                <p className={`text-sm ${fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {currentImage.displayName || currentImage.originalFilename}
                </p>
              </div>

              {currentImage.caption && (
                <div>
                  <label className={`block text-sm font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Caption
                  </label>
                  <p className={`text-sm ${fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {currentImage.caption}
                  </p>
                </div>
              )}

              {currentImage.altText && (
                <div>
                  <label className={`block text-sm font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Alt Text
                  </label>
                  <p className={`text-sm ${fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {currentImage.altText}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className={`block font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Size
                  </label>
                  <p className={fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}>
                    {formatFileSize(currentImage.size)}
                  </p>
                </div>
                
                <div>
                  <label className={`block font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Format
                  </label>
                  <p className={fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}>
                    {currentImage.format?.toUpperCase()}
                  </p>
                </div>

                {currentImage.dimensions && (
                  <div className="col-span-2">
                    <label className={`block font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Dimensions
                    </label>
                    <p className={fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}>
                      {currentImage.dimensions.width} × {currentImage.dimensions.height}
                    </p>
                  </div>
                )}

                <div className="col-span-2">
                  <label className={`block font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Uploaded
                  </label>
                  <p className={fullscreen ? 'text-white' : 'text-gray-900 dark:text-white'}>
                    {formatDistanceToNow(new Date(currentImage.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {currentImage.tags && currentImage.tags.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium ${fullscreen ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'} mb-2`}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {currentImage.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          fullscreen 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );

  return <GalleryContent />;
};

export default ImageGallery;