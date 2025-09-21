import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import listService from '../../services/listService';
import { toast } from 'react-toastify';

const ListEntries = () => {
  const { theme } = useTheme();
  const { isMasterAdmin } = useAdminAuth();
  const { id: listId } = useParams();
  const [list, setList] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  const [docxFile, setDocxFile] = useState(null);
  const [parsingDocx, setParsingDocx] = useState(false);

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  useEffect(() => {
    fetchListAndEntries();
  }, [listId, filters, pagination.current_page]);

  const fetchListAndEntries = async () => {
    try {
      setLoading(true);

      // Fetch list details
      const listResponse = await listService.getList(listId);
      if (listResponse.success) {
        setList(listResponse.data);
      }

      // Fetch entries with filters
      const params = {
        page: pagination.current_page,
        limit: 20
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const entriesResponse = await listService.getListEntries(listId, params);
      if (entriesResponse.success) {
        setEntries(entriesResponse.data.entries || []);
        setPagination(entriesResponse.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0
        });
      }
    } catch (error) {
      console.error('Error fetching list entries:', error);
      toast.error('Failed to fetch list entries');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        const response = await listService.deleteListEntry(entryId);
        if (response.success) {
          toast.success('Entry deleted successfully');
          fetchListAndEntries();
        }
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const handleDocxFileChange = (e) => {
    setDocxFile(e.target.files[0]);
  };

  const parseDocxFile = async () => {
    if (!docxFile) {
      toast.error('Please select a DOCX file first');
      return;
    }

    setParsingDocx(true);
    try {
      const response = await listService.parseDocxFile(listId, docxFile);
      if (response.success) {
        toast.success(`Successfully parsed and created ${response.data.totalCreated} entries`);
        setDocxFile(null);
        fetchListAndEntries();
      } else {
        toast.error(response.message || 'Failed to parse DOCX file');
      }
    } catch (error) {
      console.error('Error parsing DOCX file:', error);
      toast.error('Failed to parse DOCX file');
    } finally {
      setParsingDocx(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  if (!list) {
    return (
      <div className={`min-h-screen ${bgMain} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <h1 className={`text-3xl font-bold ${textMain}`}>List Entries</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              {list.title} - {pagination.total_items} entries
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to={`/admin/lists/${listId}/entries/create`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Entry
            </Link>
            <Link
              to="/admin/lists"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Lists
            </Link>
          </div>
        </div>

        {/* DOCX Parser */}
        <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
          <h3 className={`text-lg font-semibold ${textMain} mb-4`}>Parse DOCX File</h3>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".docx,.txt"
              onChange={handleDocxFileChange}
              className={`flex-1 p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={parseDocxFile}
              disabled={!docxFile || parsingDocx}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {parsingDocx ? 'Parsing...' : 'Parse DOCX'}
            </button>
          </div>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload a DOCX or TXT file to automatically parse and create list entries
          </p>
        </div>

        {/* List Info Card */}
        <div className={`${cardBg} p-6 rounded-lg border mb-6`}>
          <div className="flex items-start space-x-4">
            <div className="h-16 w-24 bg-gray-300 rounded flex-shrink-0">
              {list.featuredImage && (
                <img
                  src={`${import.meta.env?.VITE_API_URL || 'http://localhost:5000'}${list.featuredImage}`}
                  alt={list.title}
                  className="h-16 w-24 object-cover rounded"
                  onError={(e) => {
                    console.error('List image failed to load:', e.target.src);
                    console.log('Original path:', list.featuredImage);
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-semibold ${textMain} mb-2`}>{list.title}</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                {list.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className={`px-2 py-1 rounded ${getStatusColor(list.status)}`}>
                  {list.status.toUpperCase()}
                </span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Category: {list.category || 'Uncategorized'}
                </span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Year: {list.year || 'N/A'}
                </span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Created: {new Date(list.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Entries', value: pagination.total_items, color: 'blue' },
            { label: 'Active', value: entries.filter(e => e.status === 'active').length, color: 'green' },
            { label: 'Inactive', value: entries.filter(e => e.status === 'inactive').length, color: 'red' },
            { label: 'With Images', value: entries.filter(e => e.image).length, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`${cardBg} p-6 rounded-lg border`}>
              <div className={`text-2xl font-bold ${textMain}`}>{stat.value}</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`${cardBg} p-4 rounded-lg border mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search entries..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={fetchListAndEntries}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Entries Table */}
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
                      Entry
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Rank
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Company
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Designation
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-12 text-center ${textMain}`}>
                        No entries found. <Link to={`/admin/lists/${listId}/entries/create`} className="text-blue-600 hover:text-blue-800">Add your first entry</Link>
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-300 rounded-full mr-3 flex-shrink-0">
                              {entry.image && (
                                <img
                                  src={`${import.meta.env?.VITE_API_URL || 'http://localhost:5000'}${entry.image}`}
                                  alt={entry.name}
                                  className="h-10 w-10 object-cover rounded-full"
                                  onError={(e) => {
                                    console.error('Entry image failed to load:', e.target.src);
                                    console.log('Original path:', entry.image);
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${textMain}`}>
                                {entry.name}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {entry.nationality && `${entry.nationality}`}
                                {entry.residence && ` • ${entry.residence}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.rank || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.company || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {entry.designation || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            to={`/admin/lists/${listId}/entries/edit/${entry.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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
              Showing {entries.length} of {pagination.total_items} entries
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

export default ListEntries;