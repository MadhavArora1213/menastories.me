import React from 'react';

const ArticleHeader = ({ article }) => {
  return (
    <header className="mb-8">
      {/* Category Badge */}
      {article.category && (
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {article.category.name}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {article.title}
      </h1>

      {/* Subtitle */}
      {article.subtitle && (
        <h2 className="text-xl text-gray-600 mb-6 font-light">
          {article.subtitle}
        </h2>
      )}

      {/* Featured Image */}
      {article.featured_image && (
        <div className="mb-8">
          <img
            src={article.featured_image}
            alt={article.featured_image_caption || article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            loading="lazy"
          />
          {article.featured_image_caption && (
            <p className="text-sm text-gray-500 mt-2 italic text-center">
              {article.featured_image_caption}
            </p>
          )}
        </div>
      )}
    </header>
  );
};

export default ArticleHeader;