import React, { useState, useEffect } from 'react';
import { FaUser, FaReply, FaSort } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { videoService } from '../../services/videoService';
import CommentAuthModal from './CommentAuthModal';

const CommentSection = ({ articleId, articleSlug, allowComments = true, contentType }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  // Detect if this is a video article
  const isVideoArticle = contentType === 'video' || location.pathname.includes('/videos/') || videoService.isVideoArticle(contentType, location.pathname);

  useEffect(() => {
    fetchComments();
  }, [articleSlug, sortBy]);

  useEffect(() => {
    // Check if user is already authenticated from localStorage or sessionStorage
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
          console.log('User already authenticated:', parsedUser.name);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log('Authentication successful:', userData);
    setIsAuthenticated(true);
    setUser(userData);
    setShowAuthModal(false);
    
    // Store authentication data
    const token = userData.token || userData.accessToken;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setNewComment('');
    setReplyText('');
    setReplyingTo(null);
    
    // Clear stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Use different endpoints for video articles vs regular articles
      const endpoint = isVideoArticle 
        ? `/public/videos/${articleSlug}/comments?sort=${sortBy}`
        : `/public/articles/${articleSlug}/comments?sort=${sortBy}`;
      
      console.log('Fetching comments from endpoint:', endpoint);
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setComments(response.data.comments || []);
        console.log('Comments fetched successfully:', response.data.comments?.length || 0);
      } else {
        console.error('Failed to fetch comments:', response.data.message);
        toast.error('Failed to load comments');
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err.response?.data || err.message);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!allowComments) {
      toast.error('Comments are not allowed for this article');
      return;
    }

    if (!isAuthenticated) {
      if (!showAuthModal) {
        setShowAuthModal(true);
      }
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    console.log('Submitting comment:', {
      articleSlug,
      content: newComment.trim().substring(0, 50) + '...',
      allowComments,
      user: user?.name,
      isVideo: isVideoArticle,
      userAuth: !!user,
      userEmail: user?.email
    });

    try {
      const commentData = {
        content: newComment.trim(),
        parentId: null,
        author_name: user?.name || 'Anonymous',
        author_email: user?.email || ''
      };

      // Use different endpoints for video articles vs regular articles
      const endpoint = isVideoArticle 
        ? `/public/videos/${articleSlug}/comments`
        : `/public/articles/${articleSlug}/comments`;
      
      console.log('Using endpoint:', endpoint);
      console.log('Comment data being sent:', commentData);
      
      const response = await api.post(endpoint, commentData);

      console.log('Comment response status:', response.status);
      console.log('Comment response data:', response.data);

      if (response.data.success) {
        console.log('Comment created successfully:', response.data.comment?.id);
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment('');
        toast.success(response.data.message || 'Comment posted successfully');
      } else {
        console.error('Comment creation failed:', response.data.message);
        toast.error(response.data.message || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Failed to post comment:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        headers: err.config?.headers
      });

      let errorMessage = 'Failed to post comment';
      if (err.response?.data?.message) {
        errorMessage = typeof err.response.data.message === 'string'
          ? err.response.data.message
          : JSON.stringify(err.response.data.message);
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      
      // If authentication error, prompt re-authentication
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUser(null);
        setShowAuthModal(true);
      }
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!allowComments) {
      toast.error('Comments are not allowed for this article');
      return;
    }

    if (!isAuthenticated) {
      if (!showAuthModal) {
        setShowAuthModal(true);
      }
      return;
    }

    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const commentData = {
        content: replyText.trim(),
        parentId,
        author_name: user?.name || 'Anonymous',
        author_email: user?.email || ''
      };

      // Use different endpoints for video articles vs regular articles
      const endpoint = isVideoArticle 
        ? `/public/videos/${articleSlug}/comments`
        : `/public/articles/${articleSlug}/comments`;
      
      console.log('Using reply endpoint:', endpoint);
      console.log('Reply data being sent:', commentData);
      
      const response = await api.post(endpoint, commentData);

      if (response.data.success) {
        console.log('Reply created successfully:', response.data.comment?.id);
        setComments(prev => prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), response.data.comment] }
            : comment
        ));
        setReplyText('');
        setReplyingTo(null);
        toast.success(response.data.message || 'Reply posted successfully');
      } else {
        console.error('Reply creation failed:', response.data.message);
        toast.error(response.data.message || 'Failed to post reply');
      }
    } catch (err) {
      console.error('Failed to post reply:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });

      let errorMessage = 'Failed to post reply';
      if (err.response?.data?.message) {
        errorMessage = typeof err.response.data.message === 'string'
          ? err.response.data.message
          : JSON.stringify(err.response.data.message);
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      
      // If authentication error, prompt re-authentication
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        setUser(null);
        setShowAuthModal(true);
      }
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-4' : 'mb-6'} rounded-lg p-4`} style={{backgroundColor: '#f8fafc'}}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {comment.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#162048'}}>
              <FaUser className="text-white text-xs" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-sm text-black">
              {comment.author?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-600">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-600">(edited)</span>
            )}
          </div>

          <p className="text-gray-800 mb-3 leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center space-x-4">
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover"
                style={{color: 'gray'}}
                onMouseEnter={(e) => e.target.style.color = '#162048'}
                onMouseLeave={(e) => e.target.style.color = 'gray'}
              >
                <FaReply />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 bg-white"
                style={{borderColor: '#162048'}}
                rows="3"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  className="px-4 py-2 text-white text-sm rounded-lg hover"
                  style={{backgroundColor: '#162048'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1419'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#162048'}
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* User Authentication Status */}
      {isAuthenticated && user && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#162048'}}>
                <FaUser className="text-white text-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Logged in as: <span className="text-green-700">{user.name}</span>
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-white rounded-lg p-6 border" style={{borderColor: '#162048'}}>
        <h3 className="text-lg font-semibold text-black mb-4">
          Leave a Comment
        </h3>

        {allowComments ? (
          <>
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Please log in to post a comment
                </p>
                <button
                  onClick={() => {
                    if (!showAuthModal) {
                      setShowAuthModal(true);
                    }
                  }}
                  disabled={showAuthModal}
                  className="px-6 py-2 text-white rounded-lg hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundColor: '#162048'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1419'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#162048'}
                >
                  Login to Comment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 bg-white text-black"
                  style={{borderColor: '#162048'}}
                  rows="4"
                  required
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-lg hover transition-colors"
                    style={{backgroundColor: '#162048'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1419'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#162048'}
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Comments are not allowed for this article
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">
            Comments ({comments.length})
          </h3>

          <div className="flex items-center space-x-2">
            <FaSort className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded px-3 py-1 focus:outline-none focus:ring-2 bg-white"
              style={{borderColor: '#162048'}}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg p-4 animate-pulse" style={{backgroundColor: '#f8fafc'}}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#162048'}}></div>
                  <div className="flex-1">
                    <div className="h-4 rounded w-1/4 mb-2" style={{backgroundColor: '#162048'}}></div>
                    <div className="h-4 rounded w-3/4" style={{backgroundColor: '#162048'}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <CommentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        articleSlug={articleSlug}
      />
    </div>
  );
};

export default CommentSection;