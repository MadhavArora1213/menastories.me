import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaEnvelope, FaPrint, FaDownload, FaBookmark, FaEye, FaCalendar, FaClock, FaTag, FaUser, FaShare, FaHeart, FaComment } from 'react-icons/fa';
import AuthorByline from './AuthorByline';
import ShareButtons from './ShareButtons';
import RelatedArticles from './RelatedArticles';
import CommentSection from './CommentSection';
import ReadingProgress from './ReadingProgress';
import PrintVersion from './PrintVersion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userActivityTracker } from '../../utils/userActivityTracker';
import articleService from '../../services/articleService';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    fetchArticle();
    trackView();

    // Start reading timer for authenticated users
    if (user) {
      setReadingStartTime(Date.now());
    }

    // Track reading when user leaves the page
    const handleBeforeUnload = () => {
      if (user && article && readingStartTime) {
        const readingTime = Math.round((Date.now() - readingStartTime) / 1000 / 60); // in minutes
        userActivityTracker.trackArticleRead(user.id, article.id, article.title, readingTime);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Track reading time when component unmounts
      if (user && article && readingStartTime) {
        const readingTime = Math.round((Date.now() - readingStartTime) / 1000 / 60);
        userActivityTracker.trackArticleRead(user.id, article.id, article.title, readingTime);
      }
    };
  }, [slug, user, article]);

  useEffect(() => {
    if (article && article.id) {
      fetchSuggestedArticles();
    }
  }, [article]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/articles/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          throw new Error('Failed to fetch article');
        }
        return;
      }

      const data = await response.json();
      setArticle(data.article);
      setShareCount(data.article.shareCount || 0);
      setViewCount(data.article.viewCount || 0);

      // Check if article is saved using the new tracking system
      if (user) {
        setIsBookmarked(userActivityTracker.isArticleSaved(user.id, data.article.id));
      } else {
        // Fallback for non-authenticated users
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        setIsBookmarked(bookmarks.includes(data.article.id));
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedArticles = async () => {
    if (!article || !article.id) return;

    try {
      setSuggestedLoading(true);
      const suggestions = await articleService.getSuggestedArticles(article.id, 8);
      setSuggestedArticles(suggestions);
    } catch (err) {
      console.error('Error fetching suggested articles:', err);
      // Don't show error to user, just log it
    } finally {
      setSuggestedLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/public/articles/${slug}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleShare = async (platform) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/public/articles/${article.id}/share-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform })
      });

      setShareCount(prev => prev + 1);
      toast.success(`Shared on ${platform}!`);
    } catch (err) {
      console.error('Error updating share count:', err);
    }
  };

  const handleBookmark = () => {
    if (!user) {
      // Fallback for non-authenticated users
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');

      if (isBookmarked) {
        const updatedBookmarks = bookmarks.filter(id => id !== article.id);
        localStorage.setItem('bookmarkedArticles', JSON.stringify(updatedBookmarks));
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        bookmarks.push(article.id);
        localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        toast.success('Added to bookmarks');
      }
    } else {
      // Use the new tracking system for authenticated users
      if (isBookmarked) {
        userActivityTracker.trackArticleSave(user.id, article.id, article.title, false);
        setIsBookmarked(false);
        toast.success('Removed from saved articles');
      } else {
        userActivityTracker.trackArticleSave(user.id, article.id, article.title, true);
        setIsBookmarked(true);
        toast.success('Added to saved articles');
      }
    }
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/articles/${article.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="w-full h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-white" ref={articleRef}>
      {/* Reading Progress */}
      <ReadingProgress />

      {/* Hero Section - Canva Style */}
      <div className="relative bg-gradient-to-br from-[#162048] via-[#1a1a1a] to-[#162048] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div className="text-white space-y-8">
              {/* Category Badge */}
              {article.category && (
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="text-sm font-medium">{article.category.name}</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                  {article.subtitle}
                </p>
              )}

              {/* Author & Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
                <div className="flex items-center gap-4">
                  {article.author?.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-12 h-12 rounded-full border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <FaUser className="text-white/80" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg">{article.author?.name || 'Anonymous'}</div>
                    <div className="text-white/70 text-sm">
                      {formatDate(article.publishedAt || article.createdAt)} • {calculateReadingTime(article.content)} min read
                    </div>
                  </div>
                </div>

                {/* Social Share Preview */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaFacebook className="text-white text-xs" />
                    </div>
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <FaTwitter className="text-white text-xs" />
                    </div>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <FaEnvelope className="text-white text-xs" />
                    </div>
                  </div>
                  <span className="text-white/70 text-sm">{shareCount} shares</span>
                </div>
              </div>
            </div>

            {/* Featured Image Side */}
            <div className="relative">
              {article.featuredImage ? (
                <div className="relative">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-80 md:h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                  />
                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>

                  {/* View Count Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <FaEye className="inline mr-1" />
                    {viewCount.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="w-full h-80 md:h-96 lg:h-[500px] bg-gradient-to-br from-[#e3e7f7] to-[#162048] rounded-2xl flex items-center justify-center">
                  <div className="text-center text-[#162048]">
                    <FaTag className="text-6xl mx-auto mb-4 opacity-50" />
                    <div className="text-xl font-semibold">Featured Article</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Article Content */}
        <div className="prose prose-xl max-w-none text-gray-800 leading-relaxed mb-16">
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="article-content space-y-6"
          />
        </div>

        {/* Image Gallery Section */}
        {article.gallery && JSON.parse(article.gallery).length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-[#162048] mb-8 text-center">Article Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {JSON.parse(article.gallery).map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 016 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-16 text-center">
            <h3 className="text-xl font-semibold text-[#162048] mb-6">Related Topics</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {article.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => navigate(`/tags/${tag.slug}`)}
                  className="bg-[#e3e7f7] text-[#162048] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#162048] hover:text-white transition-colors border border-[#162048]/20"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Section */}
        {article.author && (
          <div className="bg-gradient-to-r from-[#e3e7f7] to-white rounded-2xl p-8 mb-16 border border-[#162048]/10">
            <div className="flex flex-col md:flex-row gap-6">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-20 h-20 rounded-full border-4 border-[#162048] flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-[#162048] rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-xl" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#162048] mb-2">About {article.author.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {article.author.bio || 'Passionate writer and content creator sharing insights and stories.'}
                </p>

                {/* Author Social Links */}
                <div className="flex gap-4">
                  {article.author.socialLinks?.twitter && (
                    <a
                      href={article.author.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#1da1f2] text-white rounded-full flex items-center justify-center hover:bg-[#1a91da] transition-colors"
                    >
                      <FaTwitter />
                    </a>
                  )}
                  {article.author.socialLinks?.linkedin && (
                    <a
                      href={article.author.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#0077b5] text-white rounded-full flex items-center justify-center hover:bg-[#005885] transition-colors"
                    >
                      <FaLinkedin />
                    </a>
                  )}
                  {article.author.socialLinks?.facebook && (
                    <a
                      href={article.author.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#1877f2] text-white rounded-full flex items-center justify-center hover:bg-[#166fe5] transition-colors"
                    >
                      <FaFacebook />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Share Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#162048] mb-2">Share this article</h3>
            <p className="text-gray-600">Help others discover this content</p>
          </div>

          <ShareButtons
            article={article}
            shareCount={shareCount}
            onShare={handleShare}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors border-2 ${
                isBookmarked
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaBookmark />
              {isBookmarked ? 'Saved' : 'Save Article'}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FaPrint />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FaDownload />
              Download PDF
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <FaComment className="text-[#162048] text-xl" />
            <h3 className="text-xl font-bold text-[#162048]">Comments & Discussion</h3>
          </div>
          <CommentSection articleId={article.id} articleSlug={article.slug} />
        </div>

        {/* Related Articles */}
        <div className="mb-16">
          <RelatedArticles articleId={article.id} categoryId={article.category?.id} />
        </div>

        {/* Suggested Articles */}
        {suggestedArticles.length > 0 && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#162048] mb-2">Suggested Articles</h3>
                <p className="text-gray-600">Articles you might also enjoy</p>
              </div>

              {suggestedLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#162048]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {suggestedArticles.map((suggestedArticle) => (
                    <div
                      key={suggestedArticle.id}
                      className="group bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigate(`/article/${suggestedArticle.slug}`)}
                    >
                      {/* Article Image */}
                      <div className="relative h-48 overflow-hidden">
                        {suggestedArticle.featuredImage ? (
                          <img
                            src={suggestedArticle.featuredImage}
                            alt={suggestedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e3e7f7] to-[#162048] flex items-center justify-center">
                            <div className="text-center text-[#162048]">
                              <FaTag className="text-3xl mx-auto mb-2 opacity-50" />
                              <div className="text-sm font-semibold">Article</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                      </div>

                      {/* Article Content */}
                      <div className="p-4">
                        <h4 className="font-bold text-[#162048] text-sm mb-2 line-clamp-2 group-hover:text-[#1a1a1a] transition-colors">
                          {suggestedArticle.title}
                        </h4>

                        {suggestedArticle.excerpt && (
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {suggestedArticle.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{suggestedArticle.primaryAuthor?.name || 'Anonymous'}</span>
                          <span>{new Date(suggestedArticle.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Tags */}
                        {suggestedArticle.tags && suggestedArticle.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {suggestedArticle.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-[#e3e7f7] text-[#162048] px-2 py-1 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {suggestedArticle.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{suggestedArticle.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-[#162048] to-[#1a1a1a] text-white rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Stay in the loop</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Get the latest articles, insights, and exclusive content delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-white text-[#162048] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
            <p className="text-white/60 text-sm mt-3">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintVersion
          article={article}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};

export default ArticlePage;