import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaEye, FaCalendar, FaUser } from 'react-icons/fa';

const RelatedArticles = ({ articleId, categoryId, limit = 6 }) => {
  const navigate = useNavigate();
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleId, categoryId]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/public/articles/${articleId}/related?limit=${limit}`
      );

      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to fetch related articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/articles/${article.slug || article.id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-[#162048]">Related Articles</h3>
        <button
          onClick={() => navigate('/articles')}
          className="flex items-center space-x-2 text-[#162048] hover:text-blue-600 transition-colors"
        >
          <span>View All</span>
          <FaArrowRight />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article)}
            className="group cursor-pointer bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Article Image */}
            <div className="relative h-48 overflow-hidden">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#e3e7f7] to-[#162048] flex items-center justify-center">
                  <div className="text-center text-[#162048]">
                    <FaUser className="text-3xl mx-auto mb-2 opacity-50" />
                    <div className="text-sm font-medium">Article</div>
                  </div>
                </div>
              )}

              {/* Category Badge */}
              {article.category && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#162048] px-3 py-1 rounded-full text-xs font-medium">
                  {article.category.name}
                </div>
              )}

              {/* View Count */}
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <FaEye />
                <span>{formatViewCount(article.viewCount || 0)}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#162048] transition-colors">
                {article.title}
              </h4>

              {article.excerpt && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  {article.author && (
                    <div className="flex items-center space-x-1">
                      <FaUser className="text-xs" />
                      <span>{article.author.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <FaCalendar className="text-xs" />
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#e3e7f7] text-[#162048] px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {relatedArticles.length >= limit && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/articles')}
            className="inline-flex items-center space-x-2 bg-[#162048] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Explore More Articles</span>
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default RelatedArticles;