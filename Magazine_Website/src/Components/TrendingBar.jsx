import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleService from '../services/articleService';

const TrendingBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [trendingContent, setTrendingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('TrendingBar: Starting to fetch trending articles...');
        const trendingArticles = await ArticleService.getTrendingArticles(10);
        console.log('TrendingBar: Received trending articles:', trendingArticles);

        // Transform the data to match the expected format
        const transformedData = trendingArticles.map((article, index) => ({
          id: article.id,
          title: article.title,
          category: article.category?.name || 'General',
          urgency: 'trending', // Default urgency for trending articles
          path: `/article/${article.slug || article.id}`,
          timestamp: getTimeAgo(article.publishDate || article.createdAt || article.updatedAt)
        }));

        console.log('TrendingBar: Transformed data:', transformedData);
        setTrendingContent(transformedData);
      } catch (err) {
        console.error('TrendingBar: Error fetching trending articles:', err);
        setError('Failed to load trending articles');
        setTrendingContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingArticles();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Auto-scroll through trending items
  useEffect(() => {
    if (!isAutoScrolling || trendingContent.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingContent.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoScrolling, trendingContent.length]);

  const handleItemClick = (index) => {
    setCurrentIndex(index);
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 8000);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'breaking':
        return 'bg-[#1a1a1a] text-[#ffffff] animate-pulse';
      case 'hot':
        return 'bg-[#162048] text-[#ffffff]';
      case 'trending':
        return 'bg-[#162048] text-[#ffffff]';
      case 'new':
        return 'bg-[#1a1a1a] text-[#ffffff]';
      default:
        return 'bg-[#1a1a1a] text-[#ffffff]';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'breaking':
        return (
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        );
      case 'hot':
        return (
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" clipRule="evenodd" />
          </svg>
        );
      case 'trending':
        return (
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" clipRule="evenodd" />
          </svg>
        );
      case 'new':
        return (
          <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    console.log('TrendingBar: Showing loading state');
    return (
      <div className="relative bg-[#1a1a1a]/5 border-t border-b border-[#1a1a1a]/10 py-2 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#162048]"></div>
            <span className="ml-2 text-sm text-[#1a1a1a]/60">Loading trending articles...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if no trending articles
  if (!loading && trendingContent.length === 0) {
    console.log('TrendingBar: Showing empty state - no trending articles');
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>No trending articles available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('TrendingBar: Rendering main component with', trendingContent.length, 'articles');
  return (
    <div className="relative bg-[#1a1a1a]/5 border-t border-b border-[#1a1a1a]/10 py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Layout (below 768px) - Compact Scrolling Ticker */}
        <div className="block md:hidden">
          <div className="bg-[#ffffff] border border-[#1a1a1a]/10 rounded-lg p-2 overflow-hidden">
            {/* Compact Header */}
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="bg-[#162048] text-[#ffffff] px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                <svg className="h-3 w-3 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                TRENDING
              </div>
              <div className="h-px flex-1 bg-[#1a1a1a]/20"></div>
            </div>

            {/* Scrolling Ticker */}
            <div className="relative overflow-hidden h-6">
              <div
                className="flex items-center space-x-6 whitespace-nowrap"
                style={{
                  animation: 'marquee 60s linear infinite'
                }}
              >
                {/* Show all news once, then repeat from start */}
                {trendingContent.concat(trendingContent).map((item, index) => (
                  <Link
                    key={`${item.id}-${index}`}
                    to={item.path}
                    className="flex items-center space-x-2 text-xs text-[#1a1a1a] hover:text-[#162048] transition-colors duration-200 flex-shrink-0"
                    onClick={() => handleItemClick(index % trendingContent.length)}
                  >
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${getUrgencyColor(item.urgency).split(' ')[0]}`} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout (768px and above) */}
        <div className="hidden md:flex items-center">
          {/* Trending Label */}
          <div className="flex items-center space-x-2 mr-6 shrink-0">
            <div className="bg-[#162048] text-[#ffffff] px-3 py-1 rounded-full text-sm font-bold flex items-center">
              <svg className="h-4 w-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              TRENDING
            </div>
            <div className="hidden sm:block h-6 w-px bg-[#1a1a1a]/30" />
          </div>

          {/* Trending Content Slider */}
          <div className="flex-1 overflow-hidden">
            <div className="relative">
              {/* Current Trending Item */}
              <div className="flex items-center justify-between min-h-[2.5rem]">
                <Link
                  to={trendingContent[currentIndex]?.path || '#'}
                  className="flex items-center space-x-3 hover:text-[#162048] transition-colors duration-200 flex-1"
                  onMouseEnter={() => setIsAutoScrolling(false)}
                  onMouseLeave={() => setIsAutoScrolling(true)}
                >
                  {/* Urgency Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getUrgencyColor(trendingContent[currentIndex]?.urgency)}`}>
                    {getUrgencyIcon(trendingContent[currentIndex]?.urgency)}
                    {(trendingContent[currentIndex]?.urgency || '').toUpperCase()}
                  </span>

                  {/* Title */}
                  <span className="text-sm font-medium text-[#1a1a1a] truncate">
                    {trendingContent[currentIndex]?.title || ''}
                  </span>

                  {/* Category and Timestamp */}
                  <div className="hidden md:flex items-center space-x-2 text-xs text-[#1a1a1a]/60">
                    <span className="bg-[#1a1a1a]/10 px-2 py-1 rounded-full">
                      {trendingContent[currentIndex]?.category || ''}
                    </span>
                    <span>•</span>
                    <span>{trendingContent[currentIndex]?.timestamp || ''}</span>
                  </div>
                </Link>

                {/* Navigation Dots */}
                <div className="flex items-center space-x-1 ml-4">
                  {trendingContent.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === (currentIndex % 5)
                          ? 'bg-[#162048]'
                          : 'bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/50'
                      }`}
                      aria-label={`Go to trending item ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]/20">
                <div
                  className="h-full bg-[#162048] transition-all duration-1000 ease-linear"
                  style={{
                    width: isAutoScrolling ? '100%' : `${((currentIndex + 1) / trendingContent.length) * 100}%`,
                    transition: isAutoScrolling ? 'width 4s linear' : 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 ml-4 shrink-0">
            {/* Pause/Play Button */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className="p-1 rounded hover:bg-[#1a1a1a]/10 transition-colors duration-200"
              aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Resume auto-scroll'}
            >
              {isAutoScrolling ? (
                <svg className="h-4 w-4 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Previous/Next Buttons */}
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + trendingContent.length) % trendingContent.length)}
              className="p-1 rounded hover:bg-[#1a1a1a]/10 transition-colors duration-200"
              aria-label="Previous trending item"
            >
              <svg className="h-4 w-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % trendingContent.length)}
              className="p-1 rounded hover:bg-[#1a1a1a]/10 transition-colors duration-200"
              aria-label="Next trending item"
            >
              <svg className="h-4 w-4 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* View All Link */}
            <Link
              to="/trending"
              className="text-xs text-[#162048] hover:text-[#1a1a1a] font-medium transition-colors duration-200 ml-2"
            >
              View All
            </Link>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default TrendingBar;
