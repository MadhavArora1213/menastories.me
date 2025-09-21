import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import articleService from '../../services/articleService';
import categoryService from '../services/categoryService';
import { toast } from 'react-toastify';

const ArticleManagement = () => {
  const { theme } = useTheme();
  const { isMasterAdmin, hasPermission } = useAdminAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [filterDataLoading, setFilterDataLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    author: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });

  // Improved theme variables
  const isDark = theme === 'dark';
  const themeClasses = {
    // Main backgrounds
    bgMain: isDark ? "bg-gray-900" : "bg-gray-50",
    bgCard: isDark ? "bg-gray-800" : "bg-white",
    bgCardSecondary: isDark ? "bg-gray-700" : "bg-gray-100",
    
    // Text colors
    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",
    
    // Border colors
    border: isDark ? "border-gray-700" : "border-gray-200",
    borderSecondary: isDark ? "border-gray-600" : "border-gray-300",
    
    // Accent colors
    accent: isDark ? "bg-blue-600" : "bg-blue-500",
    accentHover: isDark ? "bg-blue-700" : "bg-blue-600",
    accentText: "text-white",
    
    // Status colors
    success: isDark ? "bg-green-600" : "bg-green-500",
    danger: isDark ? "bg-red-600" : "bg-red-500",
    dangerHover: isDark ? "bg-red-700" : "bg-red-600",
    warning: isDark ? "bg-yellow-600" : "bg-yellow-500",
    info: isDark ? "bg-blue-600" : "bg-blue-500"
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800',
      pending_review: isDark ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800',
      in_review: isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-100 text-blue-800',
      approved: isDark ? 'bg-green-600 text-green-100' : 'bg-green-100 text-green-800',
      scheduled: isDark ? 'bg-purple-600 text-purple-100' : 'bg-purple-100 text-purple-800',
      published: isDark ? 'bg-emerald-600 text-emerald-100' : 'bg-emerald-100 text-emerald-800',
      archived: isDark ? 'bg-orange-600 text-orange-100' : 'bg-orange-100 text-orange-800',
      rejected: isDark ? 'bg-red-600 text-red-100' : 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  useEffect(() => {
    fetchArticles();
  }, [filters, pagination.current_page]);

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

  const fetchArticles = async () => {
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
      if (filters.author !== 'all') params.author_id = filters.author;
      if (filters.search) params.search = filters.search;

      const response = await articleService.getAllArticles(params);
      
      if (response.success) {
        setArticles(response.data.articles || []);
        setPagination(response.data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0
        });
      } else {
        setArticles([]);
        toast.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      toast.error('Failed to fetch articles');
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

  const fetchAuthors = async () => {
    try {
      const response = await articleService.getAuthors();

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


  const deleteArticle = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await articleService.deleteArticle(articleId);
        if (response.success) {
          toast.success('Article deleted successfully');
          fetchArticles();
        }
      } catch (error) {
        toast.error('Failed to delete article');
      }
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bgMain} p-6 transition-all duration-200`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} flex items-center gap-3`}>
              <div className={`w-10 h-10 ${themeClasses.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Article Management
            </h1>
            <p className={`${themeClasses.textSecondary} mt-2`}>
              Manage all articles across the editorial workflow
            </p>
          </div>
          {/* Only show Create New Article button if user has content.create permission */}
          {hasPermission('content.create') && (
            <Link
              to="/admin/articles/create"
              className={`${themeClasses.accent} hover:${themeClasses.accentHover.split('-').slice(1).join('-')} ${themeClasses.accentText} px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl inline-flex items-center space-x-2 transform hover:scale-105`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Article</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Articles', value: pagination.total_items, icon: 'article', color: 'blue' },
            { label: 'Published', value: articles.filter(a => a.status === 'published').length, icon: 'check', color: 'green' },
            { label: 'In Review', value: articles.filter(a => a.status === 'in_review').length, icon: 'eye', color: 'yellow' },
            { label: 'Drafts', value: articles.filter(a => a.status === 'draft').length, icon: 'edit', color: 'gray' }
          ].map((stat, index) => (
            <div key={index} className={`${themeClasses.bgCard} ${themeClasses.border} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-${stat.color}-500 rounded-xl flex items-center justify-center shadow-lg`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon === 'article' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                    {stat.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {stat.icon === 'eye' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                    {stat.icon === 'edit' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                  </svg>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${themeClasses.textPrimary}`}>{stat.value}</div>
                  <div className={`${themeClasses.textSecondary} font-medium`}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`${themeClasses.bgCard} ${themeClasses.border} border rounded-2xl p-6 mb-8 shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full px-4 py-3 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} placeholder-${themeClasses.textMuted.split('-')[1]}-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              />
              <svg className={`absolute right-3 top-3.5 w-4 h-4 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`px-4 py-3 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
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
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={`px-4 py-3 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
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
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
              className={`px-4 py-3 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
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

        {/* Articles Table */}
        <div className={`${themeClasses.bgCard} ${themeClasses.border} border rounded-2xl overflow-hidden shadow-lg`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className={themeClasses.textSecondary}>Loading articles...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${themeClasses.bgCardSecondary} border-b ${themeClasses.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Article
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Author
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Category
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Created
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.border}`}>
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <svg className={`w-16 h-16 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className={`${themeClasses.textPrimary} font-medium mb-2`}>No articles found</p>
                            <Link to="/admin/articles/create" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                              Create your first article →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className={`hover:${themeClasses.bgCardSecondary.split('-').slice(1).join('-')} transition-colors duration-200`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className={`h-14 w-20 ${themeClasses.bgCardSecondary} rounded-lg flex-shrink-0 overflow-hidden`}>
                              {article.featured_image ? (
                                <img
                                  src={article.featured_image}
                                  alt={article.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <svg className={`w-6 h-6 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-semibold ${themeClasses.textPrimary} line-clamp-2 mb-1`}>
                                {article.title}
                              </div>
                              <div className={`text-sm ${themeClasses.textSecondary} line-clamp-1`}>
                                {article.excerpt}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textPrimary} font-medium`}>
                          {article.primaryAuthor?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(article.status)}`}>
                            {article.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textPrimary} font-medium`}>
                          {article.category?.name || 'Uncategorized'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {/* Edit button - Show if user has content.edit permission */}
                            {hasPermission('content.edit') && (
                              <Link
                                to={`/admin/articles/edit/${article.id}`}
                                className="text-blue-500 hover:text-blue-600 transition-colors font-medium"
                              >
                                Edit
                              </Link>
                            )}

                            {/* Delete button - Show if user has content.delete permission */}
                            {hasPermission('content.delete') && (
                              <button
                                onClick={() => deleteArticle(article.id)}
                                className="text-red-500 hover:text-red-600 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            )}

                            {/* Show message if no actions available */}
                            {!hasPermission('content.edit') && !hasPermission('content.delete') && (
                              <span className={`text-xs ${themeClasses.textMuted}`}>No actions available</span>
                            )}
                          </div>
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 gap-4">
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              Showing {articles.length} of {pagination.total_items} articles
            </div>
            <div className="flex items-center space-x-3">
              {pagination.current_page > 1 && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  className={`px-4 py-2 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} hover:${themeClasses.bgCardSecondary.split('-').slice(1).join('-')} transition-all duration-200 font-medium hover:shadow-md`}
                >
                  ← Previous
                </button>
              )}
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              {pagination.current_page < pagination.total_pages && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  className={`px-4 py-2 ${themeClasses.border} border rounded-xl ${themeClasses.bgCard} ${themeClasses.textPrimary} hover:${themeClasses.bgCardSecondary.split('-').slice(1).join('-')} transition-all duration-200 font-medium hover:shadow-md`}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ArticleManagement;