import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaFlag, FaTrash, FaUser, FaClock, FaThumbsUp, FaThumbsDown, FaReply, FaSearch, FaFilter, FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const CommentModeration = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComments, setSelectedComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0
  });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [filter, searchTerm, currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filter !== 'all' ? filter : '',
        search: searchTerm,
        page: currentPage.toString(),
        limit: '20'
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
      setTotalPages(Math.ceil((data.total || 0) / 20));

    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const moderateComment = async (commentId, action) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments/${commentId}/moderate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ action })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to moderate comment');
      }

      toast.success(`Comment ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action}d successfully`);
      fetchComments();
      fetchStats();

    } catch (error) {
      console.error('Error moderating comment:', error);
      toast.error(`Failed to ${action} comment`);
    }
  };

  const bulkModerate = async (action) => {
    if (selectedComments.length === 0) {
      toast.error('Please select comments to moderate');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments/bulk-moderate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ 
            commentIds: selectedComments,
            action 
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to moderate comments');
      }

      toast.success(`${selectedComments.length} comments ${action}d successfully`);
      setSelectedComments([]);
      fetchComments();
      fetchStats();

    } catch (error) {
      console.error('Error bulk moderating:', error);
      toast.error('Failed to moderate comments');
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      toast.success('Comment deleted successfully');
      fetchComments();
      fetchStats();

    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'spam': return 'text-orange-600 bg-orange-50';
      case 'pending': 
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedComments(comments.map(comment => comment.id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (commentId, checked) => {
    if (checked) {
      setSelectedComments(prev => [...prev, commentId]);
    } else {
      setSelectedComments(prev => prev.filter(id => id !== commentId));
    }
  };

  const generateCommentReportPDF = async () => {
    try {
      setPdfLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/pdf/comment-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            status: filter !== 'all' ? filter : undefined,
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
      link.download = `comment_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF report generated successfully');
      setShowPdfModal(false);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setPdfLoading(false);
    }
  };

  const StatsCard = ({ title, count, color, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{count.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-300 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
          <p className="text-gray-600">Manage and moderate user comments</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaFilePdf className="w-4 h-4" />
            Generate PDF Report
          </button>
          
          {selectedComments.length > 0 && (
            <>
              <button
                onClick={() => bulkModerate('approve')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaCheck className="w-4 h-4" />
                Approve ({selectedComments.length})
              </button>
              <button
                onClick={() => bulkModerate('reject')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                Reject ({selectedComments.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard title="Total Comments" count={stats.total} color="bg-blue-500" icon={FaEye} />
        <StatsCard title="Pending" count={stats.pending} color="bg-yellow-500" icon={FaClock} />
        <StatsCard title="Approved" count={stats.approved} color="bg-green-500" icon={FaCheck} />
        <StatsCard title="Rejected" count={stats.rejected} color="bg-red-500" icon={FaTimes} />
        <StatsCard title="Spam" count={stats.spam} color="bg-orange-500" icon={FaFlag} />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedComments.length === comments.length && comments.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900">
                Select All
              </label>
            </div>
            <span className="text-sm text-gray-500">
              {comments.length} comments
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {comments.map((comment) => (
            <div key={comment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedComments.includes(comment.id)}
                    onChange={(e) => handleSelectComment(comment.id, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {comment.author?.name || comment.authorName || 'Anonymous'}
                        </span>
                        {comment.author?.verified && (
                          <span className="text-blue-500 text-sm">✓</span>
                        )}
                      </div>
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(comment.status)}`}>
                        {comment.status}
                      </span>
                      
                      <div className="flex items-center space-x-1 text-gray-500 text-sm">
                        <FaClock className="w-3 h-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    {/* Article Info */}
                    {comment.article && (
                      <div className="text-sm text-gray-600 mb-2">
                        On article: <span className="font-medium">{comment.article.title}</span>
                      </div>
                    )}

                    {/* Comment Content */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    {/* Comment Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <FaThumbsUp className="w-3 h-3" />
                        <span>{comment.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaThumbsDown className="w-3 h-3" />
                        <span>{comment.downvotes || 0}</span>
                      </div>
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <FaReply className="w-3 h-3" />
                          <span>{comment.replies.length} replies</span>
                        </div>
                      )}
                      {comment.reports && comment.reports.length > 0 && (
                        <div className="flex items-center space-x-1 text-red-500">
                          <FaFlag className="w-3 h-3" />
                          <span>{comment.reports.length} reports</span>
                        </div>
                      )}
                    </div>

                    {/* Reports */}
                    {comment.reports && comment.reports.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3 mb-3">
                        <div className="text-sm font-medium text-red-800 mb-1">Reports:</div>
                        {comment.reports.slice(0, 3).map((report, index) => (
                          <div key={index} className="text-sm text-red-700">
                            {report.reason} - {report.reporter?.name || 'Anonymous'}
                          </div>
                        ))}
                        {comment.reports.length > 3 && (
                          <div className="text-sm text-red-600">
                            +{comment.reports.length - 3} more reports
                          </div>
                        )}
                      </div>
                    )}

                    {/* Moderator Notes */}
                    {comment.moderationNotes && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="text-sm font-medium text-blue-800 mb-1">Moderator Notes:</div>
                        <div className="text-sm text-blue-700">{comment.moderationNotes}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => moderateComment(comment.id, 'approve')}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="Approve"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moderateComment(comment.id, 'reject')}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        title="Reject"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {comment.status !== 'pending' && (
                    <button
                      onClick={() => moderateComment(comment.id, 'pending')}
                      className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors"
                      title="Mark as Pending"
                    >
                      <FaClock className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => moderateComment(comment.id, 'spam')}
                    className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"
                    title="Mark as Spam"
                  >
                    <FaFlag className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Delete"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {comments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl text-gray-300 mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No comments to display' 
              : `No ${filter} comments found`}
          </p>
        </div>
      )}

      {/* PDF Generation Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate PDF Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="text-sm text-gray-600">
                  Comment Moderation Report
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Filter
                </label>
                <div className="text-sm text-gray-600">
                  {filter === 'all' ? 'All Comments' : filter.charAt(0).toUpperCase() + filter.slice(1)} Comments
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Comments
                </label>
                <div className="text-sm text-gray-600">
                  {stats[filter] || stats.total} comments
                </div>
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
                onClick={generateCommentReportPDF}
                disabled={pdfLoading}
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
    </div>
  );
};

export default CommentModeration;