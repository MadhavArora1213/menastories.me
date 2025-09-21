import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const FlipbookBookmarks = ({
  bookmarks = [],
  currentPage,
  onBookmark,
  onRemoveBookmark,
  onGoToBookmark,
  isVisible,
  className = ''
}) => {
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarks.some(b => b.pageNumber === currentPage)
  );

  const handleBookmark = async () => {
    if (isBookmarked) {
      // Remove bookmark
      const bookmark = bookmarks.find(b => b.pageNumber === currentPage);
      if (bookmark) {
        await onRemoveBookmark(currentPage);
        setIsBookmarked(false);
      }
    } else {
      // Add bookmark
      await onBookmark();
      setIsBookmarked(true);
    }
  };

  const handleGoToBookmark = (pageNumber) => {
    onGoToBookmark(pageNumber);
    setShowBookmarks(false);
  };

  return (
    <div className={`absolute bottom-20 right-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className}`}>
      <div className="flex flex-col items-end space-y-2">
        {/* Bookmark Toggle Button */}
        <button
          onClick={handleBookmark}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
            isBookmarked
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
        >
          <svg className="h-6 w-6" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Bookmarks List Toggle */}
        {bookmarks.length > 0 && (
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow-lg transition-colors"
            title="View Bookmarks"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Bookmarks List */}
        {showBookmarks && bookmarks.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto w-64">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Bookmarks</h3>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {bookmarks.map((bookmark, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <button
                      onClick={() => handleGoToBookmark(bookmark.pageNumber)}
                      className="text-left w-full"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          Page {bookmark.pageNumber}
                        </span>
                        {bookmark.pageNumber === currentPage && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      {bookmark.note && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {bookmark.note}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                      </p>
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveBookmark(bookmark.pageNumber)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Remove bookmark"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {bookmarks.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click the bookmark icon to save pages
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Page Bookmark Status */}
        {isBookmarked && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-yellow-600" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs text-yellow-800 font-medium">
                Page {currentPage} bookmarked
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlipbookBookmarks;