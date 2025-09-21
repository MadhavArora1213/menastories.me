import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NewsContent = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadNewsArticles = async () => {
      try {
        setLoading(true);

        // First, get all categories to find the "News Content" category
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const categoriesResponse = await fetch(`${base}/api/public/categories`);
        const categoriesData = await categoriesResponse.json();

        // Validate that we have a proper response with data
        if (!categoriesData || !categoriesData.success || !categoriesData.data) {
          throw new Error('Invalid response from categories API');
        }

        const allCategories = Array.isArray(categoriesData.data) ? categoriesData.data : [];
        console.log('Categories loaded:', allCategories.length, 'categories found');
        console.log('Available categories:', allCategories.map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug })));

        // Find the "News Content" category
        const newsContentCategory = allCategories.find(category =>
          category && category.name && category.name.toLowerCase() === 'news content'
        );

        if (newsContentCategory) {
          console.log('Found News Content category:', newsContentCategory);
          console.log('Category ID:', newsContentCategory.id);

          // Fetch articles for the "News Content" category using public endpoint
          const articlesResponse = await fetch(`${base}/api/categories/${newsContentCategory.id}/articles?limit=6`);
          const articlesData = await articlesResponse.json();

          console.log('Articles API response:', articlesData);

          // Validate articles response
          if (!articlesData || !articlesData.success || !articlesData.data) {
            console.error('Invalid articles response:', articlesData);
            throw new Error('Invalid response from articles API');
          }

          const articles = Array.isArray(articlesData.data) ? articlesData.data : [];
          console.log('Processed articles:', articles.length, 'articles found');

          const formattedArticles = articles.slice(0, 6)
            .filter(article => article && article.id) // Filter out invalid articles
            .map(article => ({
              id: article.id,
              title: article.title || 'Untitled Article',
              image: article.featuredImage || article.featured_image || '',
              category: article.category?.name || 'News Content',
              slug: article.slug || `article-${article.id}`,
              description: article.description || article.excerpt || article.subtitle || '',
              author: article.primaryAuthor?.name || article.author?.name || 'Editorial Team',
              publishedAt: article.publishedAt || article.publishDate || article.createdAt || new Date().toISOString(),
              readTime: article.readTime || '5 min read'
            }));

          setNewsArticles(formattedArticles);
        } else {
          // If "News Content" category not found, try to use the first available category
          console.warn('News Content category not found in database');
          console.log('Available categories:', allCategories.map(cat => cat.name));

          if (allCategories.length > 0) {
            console.log('Using first available category:', allCategories[0].name);
            // Use the first available category as fallback
            const fallbackCategory = allCategories[0];

            try {
              const articlesResponse = await fetch(`${base}/api/categories/${fallbackCategory.id}/articles?limit=6`);
              const articlesData = await articlesResponse.json();

              if (articlesData && articlesData.success && articlesData.data) {
                const articles = Array.isArray(articlesData.data) ? articlesData.data : [];
                console.log('Using fallback category articles:', articles.length, 'articles found');

                const formattedArticles = articles.slice(0, 6)
                  .filter(article => article && article.id)
                  .map(article => ({
                    id: article.id,
                    title: article.title || 'Untitled Article',
                    image: article.featuredImage || article.featured_image || '',
                    category: article.category?.name || fallbackCategory.name,
                    slug: article.slug || `article-${article.id}`,
                    description: article.description || article.excerpt || article.subtitle || '',
                    author: article.primaryAuthor?.name || article.author?.name || 'Editorial Team',
                    publishedAt: article.publishedAt || article.publishDate || article.createdAt || new Date().toISOString(),
                    readTime: article.readTime || '5 min read'
                  }));

                setNewsArticles(formattedArticles);
                return;
              }
            } catch (fallbackError) {
              console.error('Fallback category also failed:', fallbackError);
            }
          }

          setNewsArticles([]);
          setError(`News Content category not found. Available categories: ${allCategories.map(cat => cat.name).join(', ')}`);
        }
      } catch (error) {
        console.error('Error loading news articles:', error);
        setNewsArticles([]);
        setError('Failed to load news articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNewsArticles();
  }, []);

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
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#162048]"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load News Content</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (newsArticles.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V8a2 2 0 012-2h2a2 2 0 012 2v11a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No News Content Available</h3>
            <p className="text-gray-600 text-sm">There are currently no articles in the News Content category. Please check back later or contact your administrator.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#162048] mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#162048] via-[#162048] to-[#162048]/90 bg-clip-text text-transparent">
              News Content
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the most recent developments and breaking news from around the world
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {newsArticles.map((article, index) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#162048]/20 flex flex-col h-full transform hover:-translate-y-2"
            >
              {article.image && (
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                  {/* Article type badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-[#162048] to-[#162048]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      News
                    </span>
                  </div>
                  {/* Read time badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium">
                      {article.readTime}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {article.author}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#162048] mb-4 group-hover:text-[#162048]/90 transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {truncateDescription(article.description, 25)}
                </p>

                <Link
                  to={`/articles/${article.slug}`}
                  className="inline-flex items-center gap-2 text-[#162048] font-semibold hover:text-white transition-all duration-300 group/link text-sm mt-auto px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-[#162048] border border-gray-200 hover:border-[#162048]"
                >
                  Read Article
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsContent;