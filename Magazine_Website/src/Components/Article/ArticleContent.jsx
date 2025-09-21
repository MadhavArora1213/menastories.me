import React from 'react';

const ArticleContent = ({ article }) => {
  return (
    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
      {/* Excerpt */}
      {article.excerpt && (
        <div className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed mb-6 sm:mb-8 border-l-4 border-blue-500 pl-4 sm:pl-6 italic">
          {article.excerpt}
        </div>
      )}

      {/* Main Content */}
      <div
        className="article-content text-gray-800 leading-relaxed text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Author Bio */}
      {article.primaryAuthor && (article.primaryAuthor.bio || article.author_bio_override) && (
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg border">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {article.primaryAuthor.profile_image && (
              <img
                src={article.primaryAuthor.profile_image}
                alt={article.primaryAuthor.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 mx-auto sm:mx-0"
              />
            )}
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                About {article.primaryAuthor.name}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                {article.author_bio_override || article.primaryAuthor.bio}
              </p>
              {article.primaryAuthor.title && (
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {article.primaryAuthor.title}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Stats */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 text-sm text-gray-600">
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <span className="text-base">👁️</span>
              <span className="hidden sm:inline">{article.view_count || 0} views</span>
              <span className="sm:hidden">{article.view_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">❤️</span>
              <span className="hidden sm:inline">{article.like_count || 0} likes</span>
              <span className="sm:hidden">{article.like_count || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">💬</span>
              <span className="hidden sm:inline">{article.comment_count || 0} comments</span>
              <span className="sm:hidden">{article.comment_count || 0}</span>
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">📅 Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
            <span className="sm:hidden">📅 {new Date(article.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;