import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const PowerListEntries = () => {
  const { theme } = useTheme();
  const { admin } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300';

  const [powerList, setPowerList] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch power list and entries
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch power list details
      const listResponse = await api.get(`/lists/power-lists/${id}`);
      setPowerList(listResponse.data.data);

      // Fetch entries
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter
      });

      const entriesResponse = await api.get(`/lists/power-lists/${id}/entries?${params}`);
      setEntries(entriesResponse.data.data.entries);
      setTotalPages(entriesResponse.data.data.pagination.total_pages);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        showError('Power list not found');
        navigate('/admin/power-lists');
      } else {
        showError('Failed to fetch power list entries');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, currentPage, searchTerm, statusFilter]);

  // Handle delete entry
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await api.delete(`/lists/power-lists/entries/${entryId}`);
      showSuccess('Entry deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      if (error.response?.status === 403) {
        showError('Access denied: You do not have permission to delete this entry');
      } else {
        showError(error.response?.data?.message || 'Failed to delete entry');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-center ${textMain}`}>Loading entries...</p>
        </div>
      </div>
    );
  }

  if (!powerList) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Power list not found</p>
            <Link to="/admin/power-lists" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Power Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Manage Entries</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              {powerList.title} • {entries.length} entries
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/admin/power-lists/${id}/entries/create`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Entry
            </Link>
            <Link
              to={`/admin/power-lists/${id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Power List
            </Link>
            <Link
              to={`/admin/power-lists/${id}/edit`}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Edit Power List
            </Link>
            <Link
              to="/admin/power-lists"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium ${textMain} mb-2`}>
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entries..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className={`${cardBg} rounded-lg border overflow-hidden`}>
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                No entries found. <Link to={`/admin/power-lists/${id}/entries/create`} className="text-blue-600 hover:underline">Create your first entry</Link>
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Rank
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Designation
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Organization
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Category
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${textMain} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {entries.map((entry) => (
                      <tr key={entry.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.rank || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {entry.photo && (
                              <img
                                src={entry.photo.startsWith('http') ? entry.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${entry.photo.replace('/api', '')}`}
                                alt={entry.name}
                                className="h-8 w-8 rounded-full object-cover mr-3"
                                onError={(e) => {
                                  e.target.src = '/placeholder-avatar.png';
                                }}
                              />
                            )}
                            <div>
                              <div className={`text-sm font-medium ${textMain}`}>
                                {entry.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.designation || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.organization || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/power-lists/${id}/entries/edit/${entry.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
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
                    Page {currentPage} of {totalPages}
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

export default PowerListEntries;