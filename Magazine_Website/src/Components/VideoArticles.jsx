import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import videoArticleService from '../services/videoArticleService';

const VideoArticles = () => {
  const [videoArticles, setVideoArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideoArticles = async () => {
      try {
        setLoading(true);
        const response = await videoArticleService.getAllVideoArticles({ limit: 4, status: 'published' });
        const articles = response.data || [];

        if (articles.length > 0) {
          const formattedArticles = articles.slice(0, 4).map(article => ({
            id: article.id,
            title: article.title,
            image: article.featuredImage || article.featured_image || '',
            slug: article.slug,
            description: article.description || article.excerpt || article.subtitle || '',
            author: article.primaryAuthor?.name || article.author?.name || 'Editorial Team',
            publishedAt: article.publishedAt || article.publishDate || article.createdAt,
            readTime: article.readTime || '5 min read',
            youtubeUrl: article.youtubeUrl || article.youtube_url || '',
            videoType: article.videoType || article.video_type || 'youtube'
          }));

          setVideoArticles(formattedArticles);
        } else {
          setVideoArticles([]);
        }
      } catch (error) {
        console.error('Error loading video articles:', error);
        setVideoArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVideoArticles();
  }, []);

  // Helper function to truncate description to specific word count
  const truncateDescription = (text, wordLimit = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render anything if no video articles
  if (loading || videoArticles.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 relative">
          Video Articles
          <div
            className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
            style={{ backgroundColor: '#162048' }}
          ></div>
        </h2>
        <Link
          to="/video-articles"
          className="font-medium flex items-center gap-2 transition-colors duration-200"
          style={{ color: '#162048' }}
          onMouseOver={(e) => e.target.style.color = '#162048'}
          onMouseOut={(e) => e.target.style.color = '#162048'}
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {videoArticles.map(article => (
          <article key={article.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300">
            <Link to={`/video-article/${article.slug}`} className="block">
              <div className="relative overflow-hidden">
                <img
                  src={article.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Video Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-60 rounded-full p-4 group-hover:bg-opacity-80 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className="text-white px-3 py-1.5 text-xs font-medium rounded-full shadow-lg"
                    style={{ backgroundColor: '#162048' }}
                  >
                    Video
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3
                  className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 transition-colors duration-200"
                  style={{ color: 'inherit' }}
                  onMouseOver={(e) => e.target.style.color = '#162048'}
                  onMouseOut={(e) => e.target.style.color = 'inherit'}
                >
                  {article.title}
                </h3>

                {article.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {truncateDescription(article.description, 15)}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  {article.publishedAt && (
                    <span>{formatDate(article.publishedAt)}</span>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VideoArticles;