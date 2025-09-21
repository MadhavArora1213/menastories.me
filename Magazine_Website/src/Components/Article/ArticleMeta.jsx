import React from 'react';

const ArticleMeta = ({ article }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 border-b border-gray-200 pb-6">
      {/* Author */}
      {article.primaryAuthor && (
        <div className="flex items-center gap-2">
          <span className="font-medium">By</span>
          <span className="text-gray-900">{article.primaryAuthor.name}</span>
          {article.primaryAuthor.title && (
            <span className="text-gray-500">• {article.primaryAuthor.title}</span>
          )}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Published</span>
        <time dateTime={article.publish_date || article.createdAt}>
          {formatDate(article.publish_date || article.createdAt)}
        </time>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-2">
        <span className="font-medium">Reading time</span>
        <span>{calculateReadingTime(article.content)} min read</span>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Tags:</span>
          <div className="flex gap-1">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleMeta;