import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const PowerListManagement = () => {
  const { theme } = useTheme();
  const { admin } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300';

  const [powerLists, setPowerLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch power lists
  const fetchPowerLists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        year: yearFilter,
        category: categoryFilter
      });

      const response = await api.get(`/lists/power-lists?${params}`);
      setPowerLists(response.data.data.lists);
      setTotalPages(response.data.data.pagination.total_pages);
      setTotalItems(response.data.data.pagination.total_items);
    } catch (error) {
      console.error('Error fetching power lists:', error);
      showError('Failed to fetch power lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowerLists();
  }, [currentPage, searchTerm, statusFilter, yearFilter, categoryFilter]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this power list?')) {
      return;
    }

    try {
      await api.delete(`/lists/power-lists/${id}`);
      showSuccess('Power list deleted successfully');
      fetchPowerLists();
    } catch (error) {
      console.error('Error deleting power list:', error);

      // Handle specific error types
      if (error.response?.status === 403) {
        showError('Access denied: You do not have permission to delete this power list. Only the creator or Master Admin can delete power lists.');
      } else if (error.response?.status === 404) {
        showError('Power list not found. It may have already been deleted.');
      } else if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
      } else {
        showError(error.response?.data?.message || 'Failed to delete power list. Please try again.');
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/lists/power-lists/${id}`, { status: newStatus });
      showSuccess('Power list status updated successfully');
      fetchPowerLists();
    } catch (error) {
      console.error('Error updating power list status:', error);

      // Handle specific error types
      if (error.response?.status === 403) {
        showError('Access denied: You do not have permission to update this power list.');
      } else if (error.response?.status === 404) {
        showError('Power list not found.');
      } else if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
      } else {
        showError(error.response?.data?.message || 'Failed to update power list status. Please try again.');
      }
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get years for filter
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push((currentYear + 1 - i).toString());
    }
    return years;
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Power List Management</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Manage your power lists and their entries
            </p>
          </div>
          <Link
            to="/admin/power-lists/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Power List
          </Link>
        </div>

        {/* Filters */}
        <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search power lists..."
                className={`w-full p-2 border rounded ${inputBg}`}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full p-2 border rounded ${inputBg}`}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={`w-full p-2 border rounded ${inputBg}`}
              >
                <option value="all">All Years</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full p-2 border rounded ${inputBg}`}
              >
                <option value="all">All Categories</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Sports">Sports</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setYearFilter('all');
                  setCategoryFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Power Lists Table */}
        <div className={`${cardBg} rounded-lg border overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-4 ${textMain}`}>Loading power lists...</p>
            </div>
          ) : powerLists.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                No power lists found. <Link to="/admin/power-lists/create" className="text-blue-600 hover:underline">Create your first power list</Link>
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Power List
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Category
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Year
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Entries
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Created
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {powerLists.map((powerList) => (
                      <tr key={powerList.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {powerList.featuredImage && (
                              <img
                                src={powerList.featuredImage.startsWith('http') ? powerList.featuredImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${powerList.featuredImage.replace('/api', '')}`}
                                alt={powerList.title}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.png';
                                }}
                              />
                            )}
                            <div>
                              <div className={`text-sm font-medium ${textMain}`}>
                                {powerList.title}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                {powerList.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {powerList.category || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {powerList.year || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {powerList.powerListEntries?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={powerList.status}
                            onChange={(e) => handleStatusChange(powerList.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(powerList.status)} border-0`}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {new Date(powerList.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/power-lists/${powerList.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link
                              to={`/admin/power-lists/${powerList.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/admin/power-lists/${powerList.id}/entries`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Entries
                            </Link>
                            <button
                              onClick={() => handleDelete(powerList.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className={`text-sm ${textMain}`}>
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerListManagement;