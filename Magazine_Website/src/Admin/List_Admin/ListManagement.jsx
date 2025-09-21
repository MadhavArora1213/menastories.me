import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';

const ListManagement = () => {
  const { theme } = useTheme();
  const { isMasterAdmin, hasPermission } = useAdminAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    year: 'all',
    category: 'all',
    recommended: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchLists();
  }, [filters, pagination.current_page]);

  const fetchLists = async () => {
    try {
      setLoading(true);

      // Prepare query parameters
      const params = {
        page: pagination.current_page,
        limit: 10
      };

      // Add filters only if they have values and are not 'all'
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.year !== 'all') params.year = filters.year;
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.recommended !== 'all') params.recommended = filters.recommended === 'true';
      if (filters.search) params.search = filters.search;

      const response = await listService.getAllLists(params);

      if (response.success) {
        setLists(response.data.lists || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0
        });
      } else {
        setLists([]);
        toast.error('Failed to fetch lists');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      setLists([]);
      toast.error('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        const response = await listService.deleteList(listId);
        if (response.success) {
          toast.success('List deleted successfully');
          fetchLists();
        }
      } catch (error) {
        toast.error('Failed to delete list');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.draft;
  };

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
            <h1 className={`text-3xl font-bold ${textMain}`}>List Management</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Manage all lists and their entries
            </p>
          </div>
          {/* Only show Create New List button if user has content.create permission */}
          {hasPermission('content.create') && (
            <Link
              to="/admin/lists/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New List
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Lists', value: pagination.total_items, color: 'blue' },
            { label: 'Published', value: lists.filter(l => l.status === 'published').length, color: 'green' },
            { label: 'Drafts', value: lists.filter(l => l.status === 'draft').length, color: 'gray' },
            { label: 'Recommended', value: lists.filter(l => l.recommended).length, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`${cardBg} p-6 rounded-lg border`}>
              <div className={`text-2xl font-bold ${textMain}`}>{stat.value}</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`${cardBg} p-4 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search lists..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Years</option>
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.recommended}
              onChange={(e) => setFilters(prev => ({ ...prev, recommended: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All Lists</option>
              <option value="true">Recommended Only</option>
              <option value="false">Not Recommended</option>
            </select>
            <input
              type="text"
              placeholder="Filter by category..."
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        {/* Lists Table */}
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
                      List
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Year
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Entries
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
                  {lists.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`px-6 py-12 text-center ${textMain}`}>
                        No lists found. {hasPermission('content.create') && <Link to="/admin/lists/create" className="text-blue-600 hover:text-blue-800">Create your first list</Link>}
                      </td>
                    </tr>
                  ) : (
                    lists.map((list) => (
                      <tr key={list.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-16 bg-gray-300 rounded mr-3 flex-shrink-0">
                              {list.featuredImage && (
                                <img
                                  src={`${import.meta.env?.VITE_API_URL || 'http://localhost:5000'}${list.featuredImage}`}
                                  alt={list.title}
                                  className="h-12 w-16 object-cover rounded"
                                  onError={(e) => {
                                    console.error('Image failed to load:', e.target.src);
                                    console.log('Original path:', list.featuredImage);
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${textMain} line-clamp-2`}>
                                {list.title}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                                {list.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {list.category || 'Uncategorized'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {list.year || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(list.status)}`}>
                            {list.status.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {list.entries?.length || 0} entries
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(list.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {/* View Entries - requires content.read permission */}
                          {hasPermission('content.read') && (
                            <Link
                              to={`/admin/lists/${list.id}/entries`}
                              className="text-green-600 hover:text-green-900"
                            >
                              View Entries
                            </Link>
                          )}

                          {/* Edit button - requires content.edit permission */}
                          {hasPermission('content.edit') && (
                            <Link
                              to={`/admin/lists/edit/${list.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Delete button - requires content.delete permission */}
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => deleteList(list.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}

                          {/* Show message if no actions available */}
                          {!hasPermission('content.read') && !hasPermission('content.edit') && !hasPermission('content.delete') && (
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
              Showing {lists.length} of {pagination.total_items} lists
            </div>
            <div className="flex space-x-2">
              {pagination.current_page > 1 && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  className={`px-3 py-1 border rounded ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
              )}
              {pagination.current_page < pagination.total_pages && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  className={`px-3 py-1 border rounded ${isDark ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ListManagement;