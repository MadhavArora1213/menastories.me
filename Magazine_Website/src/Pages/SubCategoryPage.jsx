import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SEO from '../Components/SEO';

const SubCategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [videoArticles, setVideoArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  const fetchSubCategoryData = async () => {
    try {
      setLoading(true);

      // First fetch the category
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const categoryResponse = await fetch(`${apiBaseUrl}/categories?slug=${categorySlug}`);
      const categoryData = await categoryResponse.json();

      if (categoryData.success && categoryData.data.length > 0) {
        const foundCategory = categoryData.data[0];
        setCategory(foundCategory);

        // Then fetch the subcategory
        const subcategoryResponse = await fetch(`${apiBaseUrl}/subcategories?slug=${subcategorySlug}&categoryId=${foundCategory.id}`);
        const subcategoryData = await subcategoryResponse.json();

        if (subcategoryData.success && subcategoryData.data.length > 0) {
          const foundSubcategory = subcategoryData.data[0];
          console.log('✅ Subcategory loaded:', foundSubcategory);
          console.log('📸 Subcategory featureImage:', foundSubcategory.featureImage);
          setSubcategory(foundSubcategory);

          // Fetch both regular articles and video articles
          await Promise.all([
            fetchArticles(foundSubcategory.id, 1, true),
            fetchVideoArticles(foundSubcategory.id, 1, true)
          ]);
        } else {
          setError('Subcategory not found');
        }
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching subcategory data:', err);
      setError('Failed to load subcategory');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (subcategoryId, page = 1, reset = false) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/articles?subcategory_id=${subcategoryId}&status=published&_limit=12&_page=${page}&_sort=publishedAt&_order=desc`);
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

  const fetchVideoArticles = async (subcategoryId, page = 1, reset = false) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBaseUrl}/video-articles?subcategory_id=${subcategoryId}&status=published&_limit=12&_page=${page}&_sort=createdAt&_order=desc`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setVideoArticles(data.data || []);
        } else {
          setVideoArticles(prev => [...prev, ...(data.data || [])]);
        }
        setHasMoreVideos(data.data && data.data.length === 12);
      }
    } catch (err) {
      console.error('Error fetching video articles:', err);
    }
  };

  const loadMoreArticles = async () => {
    if (!loadingMore && hasMoreArticles && subcategory) {
      setLoadingMore(true);
      const nextPage = articlePage + 1;
      setArticlePage(nextPage);
      await fetchArticles(subcategory.id, nextPage);
      setLoadingMore(false);
    }
  };

  const loadMoreVideos = async () => {
    if (!loadingMore && hasMoreVideos && subcategory) {
      setLoadingMore(true);
      const nextPage = videoPage + 1;
      setVideoPage(nextPage);
      await fetchVideoArticles(subcategory.id, nextPage);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (categorySlug && subcategorySlug) {
      fetchSubCategoryData();
    }
  }, [categorySlug, subcategorySlug]);

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

  if (error || !category || !subcategory) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Page Not Found</h1>
          <p className="text-[#1a1a1a]/70">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={subcategory.name}
        description={subcategory.description || `Explore ${subcategory.name} content in ${category.name}. Discover specialized articles, videos, and insights on our premium magazine platform.`}
        keywords={`${subcategory.name}, ${category.name}, articles, videos, magazine, specialized content`}
        image={subcategory.featureImage}
        url={`/${categorySlug}/${subcategorySlug}`}
        type="website"
      />

      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <a href="/" className="text-[#1a1a1a]/60 hover:text-[#162048]">Home</a>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-[#1a1a1a]/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <a href={`/${category.slug}`} className="text-[#1a1a1a]/60 hover:text-[#162048]">{category.name}</a>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-[#1a1a1a]/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-[#162048] font-medium">{subcategory.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Enhanced Subcategory Hero Section */}
      <div className="relative overflow-hidden">
        {/* Featured Image Background */}
        {(() => {
          console.log('Subcategory featureImage:', subcategory.featureImage);
          console.log('Subcategory object:', subcategory);
          return subcategory.featureImage ? (
            <div
              className="w-full h-[70vh] min-h-[500px] bg-cover bg-center bg-no-repeat relative"
              style={{
                backgroundImage: `url(${subcategory.featureImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onError={(e) => {
                console.error('Featured image failed to load:', subcategory.featureImage);
                e.target.style.backgroundImage = 'linear-gradient(135deg, #162048 0%, #1a1a1a 50%, #162048 100%)';
              }}
            >
            {/* Enhanced overlay with better gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"></div>
          </div>
        ) : (
          <div className="w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-[#162048] via-[#1a1a1a] to-[#162048] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        )})()}

        {/* Enhanced Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {category.name}
            </div>

            {/* Enhanced subcategory name */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-2xl mb-6">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                {subcategory.name}
              </span>
            </h1>

            {subcategory.description && (
              <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-md">
                {subcategory.description}
              </p>
            )}

           
          </div>
        </div>
      </div>

      {/* Content Sections - Professional Magazine Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Regular Articles Section */}
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
                SPECIALIZED ARTICLES
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                In-depth content focused on {subcategory.name.toLowerCase()}
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
                      📄 ARTICLE
                    </div>

                    {/* Read Time Badge */}
                    <div className="absolute top-4 right-4 bg-[#162048] text-white px-2 py-1 rounded-full text-xs font-semibold">
                      5 min read
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#162048] mb-3 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt || article.content?.substring(0, 150) + '...'}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e3e7f7] rounded-full flex items-center justify-center border-2 border-[#162048]">
                          <span className="text-[#162048] font-bold text-sm">
                            {article.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#162048]">
                            {article.author?.name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <a
                      href={`/articles/${article.slug}`}
                      className="w-full bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center justify-center transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Read Article
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Articles Button */}
            {hasMoreArticles && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreArticles}
                  disabled={loadingMore}
                  className="bg-[#ffe000] text-[#162048] font-extrabold px-8 py-4 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {loadingMore ? 'Loading Articles...' : 'Load More Articles'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Video Articles Section - Professional Style */}
        {videoArticles.length > 0 && (
          <div className="mb-16">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#162048] mb-4 tracking-wide">
                VIDEO CONTENT
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch our engaging video stories, interviews, and visual content
              </p>
              <div className="mt-4 flex justify-center">
                <div className="bg-[#e3e7f7] inline-block px-4 py-2 rounded-full border-2 border-[#162048]">
                  <span className="text-[#162048] font-semibold">
                    🎬 {videoArticles.length} Videos Available
                  </span>
                </div>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoArticles.map((videoArticle, index) => (
                <div
                  key={videoArticle.id}
                  className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-full"
                >
                  {/* Video Featured Image with YouTube/Shorts Icon */}
                  <div className="relative h-48 overflow-hidden">
                    {videoArticle.thumbnailUrl ? (
                      <img
                        src={videoArticle.thumbnailUrl}
                        alt={videoArticle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                        <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                    )}

                    {/* YouTube/Shorts Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Video Platform Badge */}
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white">
                      ▶️ YOUTUBE
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {videoArticle.duration || '5:30'}
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      👁️ {videoArticle.viewCount || 0} views
                    </div>
                  </div>

                  {/* Video Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#162048] mb-3 line-clamp-2">
                      {videoArticle.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {videoArticle.excerpt || videoArticle.content?.substring(0, 150) + '...'}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#e3e7f7] rounded-full flex items-center justify-center border-2 border-[#162048]">
                          <span className="text-[#162048] font-bold text-sm">
                            {videoArticle.author?.name?.charAt(0)?.toUpperCase() || 'V'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#162048]">
                            {videoArticle.author?.name || 'Video Team'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(videoArticle.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Watch Now Button */}
                    <a
                      href={`/videos/${videoArticle.slug}`}
                      className="w-full bg-red-600 text-white font-extrabold px-6 py-3 rounded-full hover:bg-red-700 transition-colors border-2 border-red-600 shadow-lg inline-flex items-center justify-center transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Watch Video
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Videos Button */}
            {hasMoreVideos && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMoreVideos}
                  disabled={loadingMore}
                  className="bg-red-600 text-white font-extrabold px-8 py-4 rounded-full hover:bg-red-700 transition-colors border-2 border-red-600 shadow-lg inline-flex items-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {loadingMore ? 'Loading Videos...' : 'Load More Videos'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Content Message */}
        {articles.length === 0 && videoArticles.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#162048]">
              <svg className="w-10 h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#162048] mb-2">No Content Yet</h3>
            <p className="text-gray-600 mb-6">This subcategory doesn't have any content published yet.</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-[#162048] rounded-full animate-ping"></div>
              <div className="w-3 h-3 bg-[#162048] rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-[#162048] rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoryPage;