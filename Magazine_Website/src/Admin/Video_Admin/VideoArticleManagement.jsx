import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useVideoArticleContext } from '../../context/VideoArticleContext';
import videoArticleService from '../../services/videoArticleService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const VideoArticleManagement = () => {
  const { theme } = useTheme();
  const { isMasterAdmin, hasPermission } = useAdminAuth();
  const {
    videoArticles,
    loading,
    filters,
    pagination,
    fetchVideoArticles,
    updateFilters,
    updatePagination
  } = useVideoArticleContext();

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [filterDataLoading, setFilterDataLoading] = useState(true);

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchVideoArticles();
  }, [filters, pagination.current_page, fetchVideoArticles]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setFilterDataLoading(true);
        await Promise.all([fetchCategories(), fetchAuthors()]);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setFilterDataLoading(false);
      }
    };

    loadFilterData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();

      // Axios wraps the response, so response.data is the actual API response
      if (response && response.data && response.data.success && response.data.data) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await videoArticleService.getAuthors();

      if (response && response.success && response.data) {
        setAuthors(response.data);
      } else {
        setAuthors([]);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setAuthors([]);
    }
  };

  const handleStatusChange = async (videoArticleId, newStatus, reviewNotes = '') => {
    try {
      const response = await videoArticleService.changeVideoArticleStatus(videoArticleId, {
        status: newStatus,
        review_notes: reviewNotes
      });

      if (response.success) {
        toast.success(`Video article status updated to ${newStatus}`);
        fetchVideoArticles(); // Refresh the list from context
      }
    } catch (error) {
      toast.error('Failed to update video article status');
    }
  };

  const deleteVideoArticle = async (videoArticleId) => {
    if (window.confirm('Are you sure you want to delete this video article?')) {
      try {
        const response = await videoArticleService.deleteVideoArticle(videoArticleId);
        if (response.success) {
          toast.success('Video article deleted successfully');
          fetchVideoArticles(); // Refresh the list from context
        }
      } catch (error) {
        toast.error('Failed to delete video article');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      scheduled: 'bg-purple-100 text-purple-800',
      published: 'bg-emerald-100 text-emerald-800',
      archived: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const StatusChangeModal = ({ videoArticle, onClose, onConfirm }) => {
    const [newStatus, setNewStatus] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');

    const statusOptions = {
      draft: ['pending_review'],
      pending_review: ['in_review', 'rejected'],
      in_review: ['approved', 'rejected', 'pending_review'],
      approved: ['scheduled', 'published'],
      scheduled: ['published'],
      published: ['archived'],
      rejected: ['draft', 'pending_review']
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${cardBg} rounded-lg p-6 w-full max-w-md border`}>
          <h3 className={`text-lg font-semibold ${textMain} mb-4`}>
            Change Video Article Status
          </h3>

          <div className="mb-4">
            <label className={`block text-sm font-medium ${textMain} mb-2`}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={`w-full p-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
            >
              <option value="">Select Status</option>
              {statusOptions[videoArticle.status]?.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {(newStatus === 'rejected' || newStatus === 'in_review') && (
            <div className="mb-4">
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Review Notes {newStatus === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                className={`w-full p-2 border rounded-lg h-24 ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                required={newStatus === 'rejected'}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded border ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(newStatus, reviewNotes)}
              disabled={!newStatus || (newStatus === 'rejected' && !reviewNotes)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedVideoArticle, setSelectedVideoArticle] = useState(null);

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Video Article Management</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Manage all video articles across the editorial workflow
            </p>
          </div>
          {/* Only show Create New Video Article button if user has content.create permission */}
          {hasPermission('content.create') && (
            <Link
              to="/admin/video-articles/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Video Article
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Video Articles', value: pagination.total_items, color: 'blue' },
            { label: 'Published', value: videoArticles.filter(a => a.status === 'published').length, color: 'green' },
            { label: 'In Review', value: videoArticles.filter(a => a.status === 'in_review').length, color: 'yellow' },
            { label: 'Drafts', value: videoArticles.filter(a => a.status === 'draft').length, color: 'gray' }
          ].map((stat, index) => (
            <div key={index} className={`${cardBg} p-6 rounded-lg border`}>
              <div className={`text-2xl font-bold ${textMain}`}>{stat.value}</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`${cardBg} p-4 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search video articles..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Categories</option>
              {filterDataLoading ? (
                <option disabled>Loading categories...</option>
              ) : categories && categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories found</option>
              )}
            </select>
            <select
              value={filters.author}
              onChange={(e) => updateFilters({ author: e.target.value })}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Authors</option>
              {filterDataLoading ? (
                <option disabled>Loading authors...</option>
              ) : authors && authors.length > 0 ? (
                authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))
              ) : (
                <option disabled>No authors found</option>
              )}
            </select>
          </div>
        </div>

        {/* Video Articles Table */}
        <div className={`${cardBg} rounded-lg border overflow-hidden`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Video Article
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Author
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {videoArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-12 text-center ${textMain}`}>
                        No video articles found. <Link to="/admin/video-articles/create" className="text-blue-600 hover:text-blue-800">Create your first video article</Link>
                      </td>
                    </tr>
                  ) : (
                    videoArticles.map((videoArticle) => (
                      <tr key={videoArticle.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-16 bg-gray-300 rounded mr-3 flex-shrink-0">
                              {videoArticle.thumbnailUrl && (
                                <img
                                  src={videoArticle.thumbnailUrl}
                                  alt={videoArticle.title}
                                  className="h-12 w-16 object-cover rounded"
                                />
                              )}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${textMain} line-clamp-2`}>
                                {videoArticle.title}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                                {videoArticle.excerpt}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                {videoArticle.youtubeUrl ? 'YouTube Video' : 'Video Article'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {videoArticle.primaryAuthor?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(videoArticle.status)}`}>
                            {videoArticle.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {videoArticle.videoCategory?.name || 'Uncategorized'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(videoArticle.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {/* Edit button - Show if user has content.edit permission */}
                          {hasPermission('content.edit') && (
                            <Link
                              to={`/admin/video-articles/edit/${videoArticle.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Status button - Show if user has content.edit permission */}
                          {hasPermission('content.edit') && (
                            <button
                              onClick={() => {
                                setSelectedVideoArticle(videoArticle);
                                setShowStatusModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Status
                            </button>
                          )}

                          {/* Delete button - Show if user has content.delete permission */}
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => deleteVideoArticle(videoArticle.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}

                          {/* Show message if no actions available */}
                          {!hasPermission('content.edit') && !hasPermission('content.delete') && (
                            <span className="text-xs text-gray-400">No actions available</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {videoArticles.length} of {pagination.total_items} video articles
            </div>
            <div className="flex space-x-2">
              {pagination.current_page > 1 && (
                <button
                  onClick={() => updatePagination({ current_page: pagination.current_page - 1 })}
                  className={`px-3 py-1 border rounded ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
              )}
              {pagination.current_page < pagination.total_pages && (
                <button
                  onClick={() => updatePagination({ current_page: pagination.current_page + 1 })}
                  className={`px-3 py-1 border rounded ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedVideoArticle && (
          <StatusChangeModal
            videoArticle={selectedVideoArticle}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedVideoArticle(null);
            }}
            onConfirm={(newStatus, reviewNotes) => {
              handleStatusChange(selectedVideoArticle.id, newStatus, reviewNotes);
              setShowStatusModal(false);
              setSelectedVideoArticle(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoArticleManagement;