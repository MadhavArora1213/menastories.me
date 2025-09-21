import React, { useState } from 'react';

const FlipbookControls = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomLevel,
  isVisible,
  readingProgress,
  className = ''
}) => {
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onGoToPage(pageNum);
    }
    setShowPageInput(false);
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageClick = () => {
    setShowPageInput(true);
    setPageInput(currentPage.toString());
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className}`}>
      <div className="p-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            disabled={currentPage <= 1}
            className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-10 disabled:cursor-not-allowed rounded-full transition-all duration-200 group"
            title="Previous Page"
          >
            <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Indicator */}
          <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-4 py-2">
            {showPageInput ? (
              <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
                <input
                  type="number"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  min="1"
                  max={totalPages}
                  className="w-16 text-center bg-transparent text-white border border-white border-opacity-30 rounded px-2 py-1 focus:outline-none focus:border-white"
                  autoFocus
                  onBlur={() => setShowPageInput(false)}
                />
                <span className="text-white text-sm">/ {totalPages}</span>
              </form>
            ) : (
              <button
                onClick={handlePageClick}
                className="text-white hover:text-gray-300 transition-colors"
                title="Click to jump to page"
              >
                <span className="text-lg font-medium">{currentPage}</span>
                <span className="text-sm ml-1">/ {totalPages}</span>
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={currentPage >= totalPages}
            className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-10 disabled:cursor-not-allowed rounded-full transition-all duration-200 group"
            title="Next Page"
          >
            <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg p-2">
            <button
              onClick={onZoomOut}
              className="flex items-center justify-center w-8 h-8 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Zoom Out"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <span className="text-white text-sm min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={onZoomIn}
              className="flex items-center justify-center w-8 h-8 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Zoom In"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <button
              onClick={onResetZoom}
              className="flex items-center justify-center w-8 h-8 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Reset Zoom"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Reading Progress */}
          <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">
              {Math.round(readingProgress)}% Complete
            </span>
          </div>
        </div>

        {/* Page Navigation Thumbnails (for touch devices) */}
        <div className="md:hidden mt-4">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2 + i);
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onGoToPage(pageNum)}
                  className={`w-8 h-8 rounded border text-xs transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipbookControls;