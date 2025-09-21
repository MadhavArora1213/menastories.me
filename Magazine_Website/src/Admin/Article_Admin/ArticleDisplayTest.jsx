import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaFilePdf, FaDownload, FaComments, FaThumbsUp, FaThumbsDown, FaShare, FaBookmark, FaPrint, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ArticleDisplayTest = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentStats, setCommentStats] = useState({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);

    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (articleId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments?articleId=${articleId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchCommentStats = async (articleId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments/stats?articleId=${articleId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCommentStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching comment stats:', error);
    }
  };

  const generateArticlePDF = async (article) => {
    try {
      setPdfLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/pdf/article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            articleId: article.id,
            format: 'A4'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF generated successfully');
      setShowPdfModal(false);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    fetchComments(article.id);
    fetchCommentStats(article.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Article Display System Test</h1>
          <p className="text-gray-600">Test the complete article display functionality</p>
        </div>
        
        <button
          onClick={() => setShowPdfModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaFilePdf className="w-4 h-4" />
          Generate Article PDF
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleArticleClick(article)}
          >
            {/* Article Image */}
            <div className="h-48 bg-gray-200 relative">
              {article.featuredImage ? (
                <img 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaEye className="w-12 h-12" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                  {article.status}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{formatDate(article.createdAt)}</span>
                {article.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {article.category.name}
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.excerpt || article.content.substring(0, 150)}...
              </p>

              {/* Article Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <FaComments className="w-3 h-3" />
                    <span>{article.commentCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaThumbsUp className="w-3 h-3" />
                    <span>{article.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaEye className="w-3 h-3" />
                    <span>{article.viewCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Article Detail */}
      {selectedArticle && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>By {selectedArticle.author?.name || 'Unknown Author'}</span>
                <span>•</span>
                <span>{formatDate(selectedArticle.createdAt)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedArticle.status)}`}>
                  {selectedArticle.status}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => generateArticlePDF(selectedArticle)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="Generate PDF"
              >
                <FaFilePdf className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                title="View Comments"
              >
                <FaComments className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          </div>

          {/* Article Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaShare className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaBookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaPrint className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FaEnvelope className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{selectedArticle.viewCount || 0} views</span>
              <span>{selectedArticle.likeCount || 0} likes</span>
              <span>{selectedArticle.commentCount || 0} comments</span>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && selectedArticle && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Comments</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Total: {commentStats.total || 0}</span>
              <span>Pending: {commentStats.pending || 0}</span>
              <span>Approved: {commentStats.approved || 0}</span>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {comment.author?.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    comment.status === 'approved' ? 'text-green-600 bg-green-50' :
                    comment.status === 'rejected' ? 'text-red-600 bg-red-50' :
                    comment.status === 'spam' ? 'text-orange-600 bg-orange-50' :
                    'text-yellow-600 bg-yellow-50'
                  }`}>
                    {comment.status}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaComments className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Generation Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Article PDF</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Article
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => {
                    const article = articles.find(a => a.id === parseInt(e.target.value));
                    setSelectedArticle(article);
                  }}
                >
                  <option value="">Choose an article...</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPdfModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={pdfLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => selectedArticle && generateArticlePDF(selectedArticle)}
                disabled={pdfLoading || !selectedArticle}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {pdfLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaDownload className="w-4 h-4" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {articles.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl text-gray-300 mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">Create some articles to test the display system</p>
        </div>
      )}
    </div>
  );
};

export default ArticleDisplayTest;
