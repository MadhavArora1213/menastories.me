import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaEye, FaBookmark, FaShare, FaUser } from 'react-icons/fa';

const ArticleCard = ({ 
  article, 
  variant = 'default', 
  showAuthor = true, 
  showStats = true,
  className = '' 
}) => {
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Different card variants
  const renderCard = () => {
    switch (variant) {
      case 'featured':
        return renderFeaturedCard();
      case 'horizontal':
        return renderHorizontalCard();
      case 'minimal':
        return renderMinimalCard();
      case 'grid':
        return renderGridCard();
      default:
        return renderDefaultCard();
    }
  };

  const renderFeaturedCard = () => (
    <Link 
      to={`/articles/${article.slug}`}
      className={`block relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="relative h-80 md:h-96">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-6xl text-gray-400">📰</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {article.category && (
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                {article.category.name}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="text-gray-200 mb-4 line-clamp-2">
                {article.subtitle}
              </p>
            )}
            {showAuthor && article.author && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FaUser className="text-xs" />
                <span>{article.author.name}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  const renderHorizontalCard = () => (
    <Link
      to={`/articles/${article.slug}`}
      className={`block group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/3 relative overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-32 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-2xl text-gray-400">📰</div>
            </div>
          )}
        </div>
        <div className="flex-1 p-3 sm:p-4">
          {article.category && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mb-2">
              {article.category.name}
            </span>
          )}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 hidden sm:block">
              {article.excerpt}
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {showAuthor && article.author && (
                <span>{article.author.name}</span>
              )}
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
            {showStats && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaClock />
                  {calculateReadingTime(article.content)} min
                </span>
                {article.viewCount && (
                  <span className="flex items-center gap-1">
                    <FaEye />
                    {article.viewCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  const renderMinimalCard = () => (
    <Link 
      to={`/articles/${article.slug}`}
      className={`block group py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${className}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {showAuthor && article.author && (
              <span>{article.author.name}</span>
            )}
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            <span className="flex items-center gap-1">
              <FaClock />
              {calculateReadingTime(article.content)} min
            </span>
          </div>
        </div>
        {article.featuredImage && (
          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </Link>
  );

  const renderGridCard = () => (
    <Link
      to={`/articles/${article.slug}`}
      className={`block group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="relative overflow-hidden">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl text-gray-400">📰</div>
          </div>
        )}
        {article.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 sm:line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {showAuthor && article.author && (
              <>
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                  />
                )}
                <span className="truncate">{article.author.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
            <span className="hidden sm:inline">{formatDate(article.publishedAt || article.createdAt)}</span>
            <span className="sm:hidden">{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
            <span className="flex items-center gap-1">
              <FaClock />
              {calculateReadingTime(article.content)} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderDefaultCard = () => (
    <Link
      to={`/articles/${article.slug}`}
      className={`block group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      <div className="relative overflow-hidden">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl text-gray-400">📰</div>
          </div>
        )}
        {article.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          {showAuthor && article.author && (
            <div className="flex items-center gap-3">
              {article.author.avatar && (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(article.publishedAt || article.createdAt)}
                </p>
              </div>
            </div>
          )}

          {showStats && (
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FaClock />
                {calculateReadingTime(article.content)} min
              </span>
              {article.viewCount && (
                <span className="flex items-center gap-1">
                  <FaEye />
                  <span className="hidden sm:inline">{article.viewCount.toLocaleString()}</span>
                  <span className="sm:hidden">{article.viewCount > 999 ? `${(article.viewCount / 1000).toFixed(1)}k` : article.viewCount}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                #{tag.name}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );

  return renderCard();
};

export default ArticleCard;