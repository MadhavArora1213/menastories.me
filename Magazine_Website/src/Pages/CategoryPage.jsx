import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../Components/SEO';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [videoArticles, setVideoArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      // Fetch category by slug
      console.log('Fetching category with slug:', categorySlug);
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const categoryResponse = await fetch(`${apiBaseUrl}/categories?slug=${categorySlug}`);
      const categoryData = await categoryResponse.json();
      console.log('Category API response:', categoryData);

      if (categoryData.success && categoryData.data && categoryData.data.length > 0) {
        const foundCategory = categoryData.data[0];
        console.log('Found category:', foundCategory);
        setCategory(foundCategory);

        // Fetch both regular articles and video articles
        await Promise.all([
          fetchArticles(foundCategory.id, 1, true),
          fetchVideoArticles(foundCategory.id, 1, true)
        ]);
      } else {
        console.log('Category not found - API response:', categoryData);
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (categoryId, page = 1, reset = false) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/articles?category_id=${categoryId}&status=published&_limit=12&_page=${page}&_sort=publishedAt&_order=desc`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setArticles(data.data.articles || []);
        } else {
          setArticles(prev => [...prev, ...(data.data.articles || [])]);
        }
        setHasMoreArticles(data.data.articles && data.data.articles.length === 12);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const fetchVideoArticles = async (categoryId, page = 1, reset = false) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/video-articles?category_id=${categoryId}&status=published&_limit=12&_page=${page}&_sort=createdAt&_order=desc`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setVideoArticles(data.data.videoArticles || []);
        } else {
          setVideoArticles(prev => [...prev, ...(data.data.videoArticles || [])]);
        }
        setHasMoreVideos(data.data.videoArticles && data.data.videoArticles.length === 12);
      }
    } catch (err) {
      console.error('Error fetching video articles:', err);
    }
  };

  const loadMoreArticles = async () => {
    if (!loadingMore && hasMoreArticles && category) {
      setLoadingMore(true);
      const nextPage = articlePage + 1;
      setArticlePage(nextPage);
      await fetchArticles(category.id, nextPage);
      setLoadingMore(false);
    }
  };

  const loadMoreVideos = async () => {
    if (!loadingMore && hasMoreVideos && category) {
      setLoadingMore(true);
      const nextPage = videoPage + 1;
      setVideoPage(nextPage);
      await fetchVideoArticles(category.id, nextPage);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug]);

  // Infinite scroll for articles
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

  // Infinite scroll for videos
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasMoreVideos && !loadingMore) {
          loadMoreVideos();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreVideos, loadingMore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#162048]"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Category Not Found</h1>
          <p className="text-[#1a1a1a]/70">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-40">
      <SEO
        title={category.name}
        description={`Explore ${category.name} articles, videos, and content on our premium magazine platform. Discover the latest stories and insights in ${category.name}.`}
        keywords={`${category.name}, articles, videos, magazine, ${category.name} news, ${category.name} content`}
        image={category.featureImage}
        url={`/${categorySlug}`}
        type="website"
      />

      {/* Simple Category Hero Section */}
      <div className="bg-gradient-to-r from-[#162048] to-[#1a1a1a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the latest {category.name.toLowerCase()} articles and videos
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Articles Section */}
          {articles.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Articles</h3>
                  <p className="text-gray-600">Read our latest articles</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Articles */}
            {articles.map((article, index) => (
              <article
                key={article.id}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col h-full"
              >
                {article.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Article image failed to load:', article.featuredImage);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                          <div class="absolute top-3 left-3">
                            <span class="bg-[#162048] text-white px-2 py-1 rounded text-xs font-medium">
                              Article
                            </span>
                          </div>
                        `;
                      }}
                      onLoad={(e) => {
                        console.log('Article image loaded successfully:', article.featuredImage);
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#162048] text-white px-2 py-1 rounded text-xs font-medium">
                        Article
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 flex flex-col flex-grow">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(article.createdAt || article.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#162048] transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                    {article.excerpt || article.content?.substring(0, 150) + '...'}
                  </p>

                  <a
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-2 text-[#162048] font-medium hover:text-[#162048]/80 transition-colors text-sm mt-auto"
                  >
                    Read Article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {videoArticles.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Videos</h3>
                  <p className="text-gray-600">Watch our latest video content</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {videoArticles.length} {videoArticles.length === 1 ? 'Video' : 'Videos'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {/* Video Articles */}
                {videoArticles.map((videoArticle, index) => (
                  <article
                    key={videoArticle.id}
                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col h-full"
                  >
                    {videoArticle.thumbnailUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={videoArticle.thumbnailUrl}
                          alt={videoArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Video thumbnail failed to load:', videoArticle.thumbnailUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                                <svg class="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </div>
                              <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                  <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                              <div class="absolute top-3 left-3">
                                <span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Video
                                </span>
                              </div>
                            `;
                          }}
                          onLoad={(e) => {
                            console.log('Video thumbnail loaded successfully:', videoArticle.thumbnailUrl);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Video
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(videoArticle.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                        {videoArticle.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                        {videoArticle.excerpt || videoArticle.content?.substring(0, 150) + '...'}
                      </p>

                      <a
                        href={`/videos/${videoArticle.slug}`}
                        className="inline-flex items-center gap-2 text-red-600 font-medium hover:text-red-700 transition-colors text-sm mt-auto"
                      >
                        Watch Video
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

        {/* Enhanced Load More Section */}
        {(hasMoreArticles || hasMoreVideos) && (
          <div className="flex justify-center gap-6 mt-16">
            {hasMoreArticles && (
              <button
                onClick={loadMoreArticles}
                disabled={loadingMore}
                className="group relative bg-[#162048] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#162048]/90 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Articles...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#162048] to-[#1a1a1a] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
            {hasMoreVideos && (
              <button
                onClick={loadMoreVideos}
                disabled={loadingMore}
                className="group relative bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Videos...
                    </>
                  ) : (
                    'Load More Videos'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        )}

        {/* Enhanced No Content Message */}
        {articles.length === 0 && videoArticles.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#162048] mb-4">No Content Yet</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're working hard to bring you amazing content in {category.name}. Check back soon for the latest articles and videos!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#162048] text-white px-6 py-3 rounded-lg hover:bg-[#162048]/90 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default CategoryPage;