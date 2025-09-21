import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import downloadService from '../../services/downloadService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const DownloadManagement = () => {
  const { theme } = useTheme();
  const { isMasterAdmin, hasPermission } = useAdminAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filterDataLoading, setFilterDataLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    file_type: 'all',
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
    fetchDownloads();
  }, [filters, pagination.current_page]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setFilterDataLoading(true);
        await fetchCategories();
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setFilterDataLoading(false);
      }
    };

    loadFilterData();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);

      // Prepare query parameters
      const params = {
        page: pagination.current_page,
        limit: 10
      };

      // Add filters only if they have values and are not 'all'
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.category !== 'all') params.category_id = filters.category;
      if (filters.file_type !== 'all') params.file_type = filters.file_type;
      if (filters.search) params.search = filters.search;

      const response = await downloadService.getAllDownloads(params);

      if (response.success) {
        setDownloads(response.data.downloads || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0
        });
      } else {
        setDownloads([]);
        toast.error('Failed to fetch downloads');
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      setDownloads([]);
      toast.error('Failed to fetch downloads');
    } finally {
      setLoading(false);
    }
  };

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

  const deleteDownload = async (downloadId) => {
    if (window.confirm('Are you sure you want to delete this download?')) {
      try {
        const response = await downloadService.deleteDownload(downloadId);
        if (response.success) {
          toast.success('Download deleted successfully');
          fetchDownloads();
        }
      } catch (error) {
        toast.error('Failed to delete download');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-emerald-100 text-emerald-800',
      archived: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.draft;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textMain}`}>Download Management</h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Manage downloadable files and resources
            </p>
          </div>
          {/* Only show Upload New Download button if user has content.create permission */}
          {hasPermission('content.create') && (
            <Link
              to="/admin/downloads/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload New Download
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Downloads', value: pagination.total_items, color: 'blue' },
            { label: 'Published', value: downloads.filter(d => d.status === 'published').length, color: 'green' },
            { label: 'Drafts', value: downloads.filter(d => d.status === 'draft').length, color: 'gray' },
            { label: 'Total Downloads', value: downloads.reduce((sum, d) => sum + (d.downloadCount || 0), 0), color: 'purple' }
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
              placeholder="Search downloads..."
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
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
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
              value={filters.file_type}
              onChange={(e) => setFilters(prev => ({ ...prev, file_type: e.target.value }))}
              className={`p-2 border rounded ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="docx">DOCX</option>
              <option value="xls">XLS</option>
              <option value="xlsx">XLSX</option>
              <option value="ppt">PPT</option>
              <option value="pptx">PPTX</option>
              <option value="txt">TXT</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="gif">GIF</option>
              <option value="webp">WEBP</option>
              <option value="mp4">MP4</option>
              <option value="avi">AVI</option>
              <option value="mov">MOV</option>
              <option value="mp3">MP3</option>
              <option value="wav">WAV</option>
              <option value="zip">ZIP</option>
              <option value="rar">RAR</option>
            </select>
          </div>
        </div>

        {/* Downloads Table */}
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
                      Download
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      File Info
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Downloads
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
                  {downloads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-12 text-center ${textMain}`}>
                        No downloads found. {hasPermission('content.create') && <Link to="/admin/downloads/create" className="text-blue-600 hover:text-blue-800">Upload your first download</Link>}
                      </td>
                    </tr>
                  ) : (
                    downloads.map((download) => (
                      <tr key={download.id} className={`${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-300 rounded mr-3 flex-shrink-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600 uppercase">
                                {download.fileType || 'FILE'}
                              </span>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${textMain} line-clamp-2`}>
                                {download.title}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                                {download.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          <div>{download.originalFileName}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatFileSize(download.fileSize)} • {download.fileType?.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(download.status)}`}>
                            {download.status.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                          {download.downloadCount || 0}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(download.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {/* Edit button - requires content.edit permission */}
                          {hasPermission('content.edit') && (
                            <Link
                              to={`/admin/downloads/edit/${download.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                          )}

                          {/* Delete button - requires content.delete permission */}
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => deleteDownload(download.id)}
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
              Showing {downloads.length} of {pagination.total_items} downloads
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

export default DownloadManagement;