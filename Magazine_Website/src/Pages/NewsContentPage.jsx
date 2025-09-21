import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../Components/SEO';

const NewsContentPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [articlePage, setArticlePage] = useState(1);

  const fetchArticles = async (page = 1, reset = false) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/categories/dd3ee7e2-a4ca-4293-856a-af3bfe8abc87/articles?limit=12&page=${page}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setArticles(data.data || []);
        } else {
          setArticles(prev => [...prev, ...(data.data || [])]);
        }
        setHasMoreArticles(data.data && data.data.length === 12);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const loadMoreArticles = async () => {
    if (!loadingMore && hasMoreArticles) {
      setLoadingMore(true);
      const nextPage = articlePage + 1;
      setArticlePage(nextPage);
      await fetchArticles(nextPage);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, true);
    setLoading(false);
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasMoreArticles && !loadingMore) {
          loadMoreArticles();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreArticles, loadingMore]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (text, wordLimit = 20) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#162048]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Error Loading News Content</h1>
          <p className="text-[#1a1a1a]/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen mt-16">
      <SEO
        title="News Content"
        description="Stay informed with the most recent developments and breaking news from around the world. Explore our comprehensive news coverage and analysis."
        keywords="news, breaking news, current events, world news, latest updates"
        type="website"
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="w-full h-96 md:h-[500px] bg-gradient-to-br from-[#162048] via-[#1a1a1a] to-[#162048] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {/* Category Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide drop-shadow-lg">
              News Content
            </h1>

            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Stay informed with the most recent developments and breaking news from around the world
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                📄 {articles.length} Articles
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                📰 Latest News & Updates
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                📊 {articles.length} Total Content
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length > 0 && (
          <div className="mb-16">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#162048] mb-4 tracking-wide">
                ALL NEWS ARTICLES
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our comprehensive collection of news articles and breaking stories
              </p>
              <div className="mt-4 flex justify-center">
                <div className="bg-[#e3e7f7] inline-block px-4 py-2 rounded-full border-2 border-[#162048]">
                  <span className="text-[#162048] font-semibold">
                    📄 {articles.length} Articles Available
                  </span>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-full"
                >
                  {/* Article Featured Image */}
                  <div className="relative h-48 overflow-hidden">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e3e7f7] to-[#162048] flex items-center justify-center">
                        <svg className="w-16 h-16 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                    )}

                    {/* Article Type Badge */}
                    <div className="absolute top-4 left-4 bg-[#ffe000] text-[#162048] px-3 py-1 rounded-full text-xs font-bold border-2 border-[#162048]">
                      📰 NEWS
                    </div>

                    {/* Read Time Badge */}
                    <div className="absolute top-4 right-4 bg-[#162048] text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {article.readTime || '5 min read'}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#162048] mb-3 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt || article.content?.substring(0, 150) + '...' || 'No description available for this article.'}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e3e7f7] rounded-full flex items-center justify-center border-2 border-[#162048]">
                          <span className="text-[#162048] font-bold text-sm">
                            {article.author?.charAt(0)?.toUpperCase() || 'N'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#162048]">
                            {article.author || 'News Team'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(article.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <Link
                      to={`/article/${article.slug}`}
                      className="w-full bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center justify-center transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Read Article
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Articles Button */}
            {hasMoreArticles && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreArticles}
                  disabled={loadingMore}
                  className="bg-[#162048] text-white px-6 py-3 rounded-lg hover:bg-[#162048]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load More Articles'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Content Message */}
        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">No News Content Found</h2>
            <p className="text-[#1a1a1a]/70">There are no news articles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsContentPage;