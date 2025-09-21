import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flipbookService } from '../../services/flipbookService';
import FlipbookControls from './FlipbookControls';
import FlipbookBookmarks from './FlipbookBookmarks';
import FlipbookSearch from './FlipbookSearch';
import { formatDistanceToNow } from 'date-fns';

const FlipbookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Magazine state
  const [magazine, setMagazine] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reading state
  const [bookmarks, setBookmarks] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadMagazine();
  }, [id]);

  useEffect(() => {
    if (magazine && pages.length > 0) {
      loadPage(currentPage);
      updateReadingProgress();
    }
  }, [currentPage, magazine, pages]);

  useEffect(() => {
    // Auto-hide controls after inactivity
    const timer = setTimeout(() => {
      if (!isFullscreen) return;
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isFullscreen]);

  const loadMagazine = async () => {
    try {
      setLoading(true);
      setError(null);

      const [magazineResponse, pagesResponse] = await Promise.all([
        flipbookService.getFlipbookMagazineById(id),
        flipbookService.getFlipbookPages(id)
      ]);

      setMagazine(magazineResponse.magazine);
      setPages(pagesResponse.pages || []);
      setStartTime(new Date());

      // Load user bookmarks and progress
      loadUserData();

    } catch (err) {
      console.error('Failed to load magazine:', err);
      setError('Failed to load magazine');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load bookmarks and reading progress
      const [bookmarksResponse, progressResponse] = await Promise.all([
        flipbookService.getBookmarks(id),
        flipbookService.getReadingProgress(id)
      ]);

      setBookmarks(bookmarksResponse.bookmarks || []);
      if (progressResponse.progress) {
        setCurrentPage(progressResponse.progress.currentPage);
        setReadingProgress(progressResponse.progress.percentage);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const loadPage = async (pageNumber) => {
    if (!pages[pageNumber - 1]) return;

    try {
      const page = pages[pageNumber - 1];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate canvas size based on zoom
        const scaledWidth = img.naturalWidth * zoomLevel;
        const scaledHeight = img.naturalHeight * zoomLevel;

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        // Center the image
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      };

      img.src = page.imageUrl;
    } catch (err) {
      console.error('Failed to load page:', err);
    }
  };

  const updateReadingProgress = async () => {
    if (!magazine) return;

    const progress = (currentPage / magazine.totalPages) * 100;
    setReadingProgress(progress);

    // Save progress to server
    try {
      await flipbookService.updateReadingProgress(id, {
        currentPage,
        percentage: progress,
        timeSpent: startTime ? (new Date() - startTime) / 1000 : 0
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const goToPage = useCallback(async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > magazine?.totalPages || isAnimating) return;

    setIsAnimating(true);
    setCurrentPage(pageNumber);

    // Add page turn animation/sound effect here
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [magazine, isAnimating]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowControls(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;

    if (isLeftSwipe && Math.abs(distanceX) > Math.abs(distanceY)) {
      nextPage();
    } else if (isRightSwipe && Math.abs(distanceX) > Math.abs(distanceY)) {
      previousPage();
    } else if (isUpSwipe) {
      // Swipe up to show controls
      setShowControls(true);
    }

    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [nextPage, previousPage, toggleFullscreen, zoomIn, zoomOut, resetZoom, isFullscreen]);

  const addBookmark = async () => {
    try {
      await flipbookService.addBookmark(id, currentPage);
      setBookmarks(prev => [...prev, { pageNumber: currentPage, createdAt: new Date() }]);
    } catch (err) {
      console.error('Failed to add bookmark:', err);
    }
  };

  const removeBookmark = async (pageNumber) => {
    try {
      await flipbookService.removeBookmark(id, pageNumber);
      setBookmarks(prev => prev.filter(b => b.pageNumber !== pageNumber));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  const handleSearchResult = (pageNumber) => {
    goToPage(pageNumber);
    setShowThumbnails(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading magazine...</p>
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">
            {error || 'Magazine not found'}
          </h3>
          <p className="text-gray-400 mb-4">
            The magazine you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/flipbook')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Magazines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 ${isFullscreen ? 'h-screen w-screen' : 'min-h-screen'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black/70 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/flipbook')}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">{magazine.title}</h1>
              <p className="text-sm text-gray-400">
                Page {currentPage} of {magazine.totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FlipbookSearch
              magazineId={id}
              onResultClick={handleSearchResult}
              className="hidden md:block"
            />
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="text-white hover:text-gray-300 transition-colors p-2"
              title="Thumbnails"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors p-2"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Page Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-full shadow-2xl ${isAnimating ? 'animate-pulse' : ''}`}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease'
              }}
            />

            {/* Page turn animation overlay */}
            {isAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
            )}
          </div>
        </div>

        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">Pages</h3>
              <div className="grid grid-cols-2 gap-2">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => goToPage(index + 1)}
                    className={`aspect-[3/4] rounded border-2 transition-colors ${
                      currentPage === index + 1
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={page.thumbnailUrl || page.imageUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-75 px-1 py-0.5 rounded">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <FlipbookControls
        currentPage={currentPage}
        totalPages={magazine.totalPages}
        onPrevious={previousPage}
        onNext={nextPage}
        onGoToPage={goToPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        zoomLevel={zoomLevel}
        isVisible={showControls}
        readingProgress={readingProgress}
      />

      {/* Bookmarks */}
      <FlipbookBookmarks
        bookmarks={bookmarks}
        currentPage={currentPage}
        onBookmark={addBookmark}
        onRemoveBookmark={removeBookmark}
        onGoToBookmark={(pageNumber) => goToPage(pageNumber)}
        isVisible={showControls}
      />

      {/* Mobile Search */}
      <div className="md:hidden">
        <FlipbookSearch
          magazineId={id}
          onResultClick={handleSearchResult}
          className="fixed bottom-20 left-4 right-4"
        />
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
    </div>
  );
};

export default FlipbookReader;