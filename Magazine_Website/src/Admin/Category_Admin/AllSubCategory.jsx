import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import { subcategoryService } from "../services/subcategoryService";
import { Link, useNavigate, useLocation } from "react-router-dom";

const AllSubCategory = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess, showError } = useToast();
  const { hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [parentCategories, setParentCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSubcategories: 0,
    regularSubcategories: 0,
    parentCategories: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null
  });

  // Helper function to ensure pagination values are valid numbers
  const getValidPaginationValue = (value, defaultValue = 1) => {
    const num = Number(value);
    return isNaN(num) || num <= 0 ? defaultValue : num;
  };
  const [pageSize] = useState(100); // Increased to show all subcategories
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadSubcategories();
        await loadParentCategories();
        // Statistics will be loaded automatically by the useEffect that watches subcategories/pagination
      } catch (error) {
        console.error('Error loading initial data:', error);
        showError('Failed to load initial data');
      }
    };
    loadInitialData();
  }, []);

  // Check for refresh flag when component mounts or location changes
  useEffect(() => {
    if (location.state?.refreshData) {
      console.log('🔄 Refresh flag detected, reloading subcategories...');
      console.log('📊 Updated subcategory data:', location.state.updatedSubcategory);

      // Show success message if we have updated data
      if (location.state.updatedSubcategory) {
        const updatedSub = location.state.updatedSubcategory;
        showSuccess(`Subcategory "${updatedSub.name}" updated successfully! ${updatedSub.featureImage ? 'Image saved.' : 'No image.'}`);
      }

      // Reload the data
      loadSubcategories();
      loadParentCategories();

      // Clear the location state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, showSuccess]);

  // Recalculate statistics whenever subcategories or pagination data changes
  useEffect(() => {
    if (subcategories && parentCategories) {
      loadStatistics();
    }
  }, [subcategories, pagination, parentCategories]);

  const loadSubcategories = async (page = 1) => {
    try {
      setLoading(true);
      // Fetch all subcategories without pagination to show all 56 items
      const response = await subcategoryService.getSubcategories({ limit: 1000 }); // Large limit to get all
      console.log('Subcategories response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));

      // Check if response is valid
      if (!response) {
        throw new Error('No response received from server');
      }

      // Handle the API response structure - Axios wraps response in .data
      let subcategoriesData = [];

      // Axios response is wrapped, so we need to access response.data
      const apiResponse = response?.data || response;

      console.log('API Response structure:', apiResponse);
      console.log('API Response success:', apiResponse?.success);
      console.log('API Response data type:', typeof apiResponse?.data);
      console.log('API Response data isArray:', Array.isArray(apiResponse?.data));

      if (Array.isArray(apiResponse)) {
        // Direct array response (unlikely with current API)
        subcategoriesData = apiResponse;
        console.log('Using direct array response');
      } else if (apiResponse && typeof apiResponse === 'object') {
        // Object response - check various possible structures
        if (apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data)) {
          // Standard API response format: { success: true, data: [...] }
          subcategoriesData = apiResponse.data;
          console.log('Using apiResponse.data (standard format)');
        } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
          // Direct data array: { data: [...] }
          subcategoriesData = apiResponse.data;
          console.log('Using apiResponse.data (direct data)');
        } else if (apiResponse.subcategories && Array.isArray(apiResponse.subcategories)) {
          // Alternative format: { subcategories: [...] }
          subcategoriesData = apiResponse.subcategories;
          console.log('Using apiResponse.subcategories');
        } else if (apiResponse.items && Array.isArray(apiResponse.items)) {
          // Alternative format: { items: [...] }
          subcategoriesData = apiResponse.items;
          console.log('Using apiResponse.items');
        } else if (apiResponse.results && Array.isArray(apiResponse.results)) {
          // Alternative format: { results: [...] }
          subcategoriesData = apiResponse.results;
          console.log('Using apiResponse.results');
        } else {
          console.warn('Unexpected API response structure:', apiResponse);
          subcategoriesData = [];
        }
      } else {
        console.warn('Invalid API response:', apiResponse);
        subcategoriesData = [];
      }

      console.log('Setting subcategories:', subcategoriesData.length);
      console.log('First few subcategories:', subcategoriesData.slice(0, 3));
      console.log('Sample subcategory featureImage values:');
      subcategoriesData.slice(0, 5).forEach((sub, index) => {
        console.log(`  ${index + 1}. ${sub.name}:`, sub.featureImage);
      });
      console.log('API Response for debugging:', {
        originalResponse: response,
        parsedData: apiResponse,
        subcategoriesData: subcategoriesData,
        dataLength: subcategoriesData.length
      });
      setSubcategories(subcategoriesData);

      // Update pagination state - handle Axios response structure
      const paginationResponse = response?.data || response;

      console.log('Setting up pagination from:', paginationResponse);

      if (paginationResponse && typeof paginationResponse === 'object' && !Array.isArray(paginationResponse)) {
        // Check if API response has pagination data
        if (paginationResponse.pagination) {
          console.log('Using paginationResponse.pagination');
          setPagination({
            currentPage: getValidPaginationValue(paginationResponse.pagination.currentPage, page),
            totalPages: getValidPaginationValue(paginationResponse.pagination.totalPages, 1),
            totalCount: getValidPaginationValue(paginationResponse.pagination.totalCount, 0),
            hasNextPage: paginationResponse.pagination.hasNextPage || false,
            hasPrevPage: paginationResponse.pagination.hasPrevPage || false,
            nextPage: paginationResponse.pagination.nextPage || null,
            prevPage: paginationResponse.pagination.prevPage || null
          });
        } else if (paginationResponse.currentPage || paginationResponse.totalPages || paginationResponse.totalCount) {
          // Direct pagination properties on API response
          console.log('Using direct pagination properties');
          const currentPage = getValidPaginationValue(paginationResponse.currentPage, page);
          const totalPages = getValidPaginationValue(paginationResponse.totalPages, 1);
          const totalCount = getValidPaginationValue(paginationResponse.totalCount, 0);

          setPagination({
            currentPage,
            totalPages,
            totalCount,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null
          });
        } else {
          // No pagination data available, show all items on one page
          console.log('No pagination data, using defaults');
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: subcategoriesData.length,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null
          });
        }
      } else {
        // Response is an array (no pagination metadata), use defaults
        console.log('Response is array, using defaults');
        setPagination({
          currentPage: page,
          totalPages: 1,
          totalCount: subcategoriesData.length,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        });
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      showError(`Failed to load subcategories: ${error.message || 'Unknown error'}`);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadParentCategories = async () => {
    try {
      const response = await subcategoryService.getParentCategories();
      console.log('Parent categories response:', response);
      console.log('Parent categories type:', typeof response);
      console.log('Parent categories isArray:', Array.isArray(response));

      // Handle different response formats for parent categories
      let categoriesData = [];

      if (Array.isArray(response)) {
        // Direct array response
        categoriesData = response;
      } else if (response && typeof response === 'object') {
        // Object response - check various possible structures
        if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (response.items && Array.isArray(response.items)) {
          categoriesData = response.items;
        } else if (response.results && Array.isArray(response.results)) {
          categoriesData = response.results;
        } else {
          console.warn('Unexpected parent categories response format:', response);
          categoriesData = [];
        }
      } else {
        console.warn('Invalid parent categories response:', response);
        categoriesData = [];
      }

      console.log('Setting parent categories:', categoriesData.length);
      setParentCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load parent categories:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      showError(`Failed to load parent categories: ${error.message || 'Unknown error'}`);
      setParentCategories([]);
    }
  };

  const loadStatistics = () => {
    try {
      // Calculate statistics from existing loaded data
      const totalCount = subcategories.length;
      const regularCount = subcategories.filter(item => item.type === 'regular' || !item.type).length;
      const parentCount = parentCategories.length;

      console.log('Statistics calculation from loaded data:', {
        totalCount,
        regularCount,
        parentCount,
        subcategoriesLength: subcategories.length
      });

      setStatistics({
        totalSubcategories: totalCount,
        regularSubcategories: regularCount,
        parentCategories: parentCount
      });
    } catch (error) {
      console.error('Error calculating statistics:', error);
      // Set default values to prevent errors
      setStatistics({
        totalSubcategories: 0,
        regularSubcategories: 0,
        parentCategories: 0
      });
    }
  };


  const filteredSubcategories = subcategories.filter(sub => {
    // Add null checks for all properties
    const subName = sub?.name || '';
    const subDescription = sub?.description || '';
    const subCategoryId = sub?.categoryId;

    const matchesSearch = subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          subDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent = !selectedParent || subCategoryId === selectedParent;
    return matchesSearch && matchesParent;
  });

  // Group subcategories by parent
  const groupedSubcategories = filteredSubcategories.reduce((acc, sub) => {
    const parentId = sub.categoryId;
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(sub);
    return acc;
  }, {});

  const getTypeInfo = (type) => {
    const typeMap = {
      regular: { name: "Regular", icon: "🏷️", color: "bg-blue-500" },
      featured: { name: "Featured", icon: "⭐", color: "bg-yellow-500" },
      special: { name: "Special", icon: "🎯", color: "bg-purple-500" }
    };
    return typeMap[type] || { name: "Regular", icon: "🏷️", color: "bg-blue-500" };
  };

  // Pagination functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadSubcategories(newPage);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(pagination.totalPages);
  };

  const handleDeleteClick = (subcategoryId, subcategoryName) => {
    setDeleteTarget({ id: subcategoryId, name: subcategoryName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await subcategoryService.deleteSubcategory(deleteTarget.id);
      // Remove from local state
      setSubcategories(subcategories.filter(sub => sub.id !== deleteTarget.id));
      showSuccess(`Subcategory "${deleteTarget.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      // Refresh data to get updated statistics
      loadSubcategories();
      loadParentCategories();
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      showError(error.response?.data?.message || error.message || 'Failed to delete subcategory');
    }
  };

  // Manual refresh function for user-triggered updates
  const handleManualRefresh = async () => {
    try {
      console.log('🔄 Manual refresh triggered by user');
      await loadSubcategories();
      await loadParentCategories();
      showSuccess('Data refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      showError('Failed to refresh data');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleEdit = (subcategory) => {
    navigate(`/admin/subcategory/update/${subcategory.id}`, {
      state: { subcategory }
    });
  };

  const cardBg = isDark ? "bg-black border border-white/10" : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const innerCardBg = isDark ? "bg-gray-800/50" : "bg-gray-50";
  const innerBorderColor = isDark ? "border-white/10" : "border-gray-200";

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className={`text-xl ${textMain}`}>Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2`}>
      <div className={`w-full max-w-7xl mx-auto ${cardBg} rounded-2xl p-8 md:p-12`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              All Subcategories
            </h2>
            <p className={`text-base ${subText}`}>
              Manage all subcategories organized by their parent categories.
            </p>
          </div>
          <div className="flex gap-3">
            {/* Refresh button */}
            <button
              onClick={handleManualRefresh}
              className={`px-4 py-3 rounded-lg font-medium transition ${isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`}
              title="Refresh data"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {/* Only show Create Subcategory button if user has content.create permission */}
            {hasPermission('content.create') && (
              <Link
                to="/admin/subcategories/create"
                className={`px-6 py-3 rounded-lg font-bold transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
              >
                + Create Subcategory
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>Search Subcategories</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/20"}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${textMain}`}>Filter by Parent Category</label>
            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/20"}`}
            >
              <option value="">All Parent Categories</option>
              {Array.isArray(parentCategories) && parentCategories.length > 0 ? (
                parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Total Subcategories</p>
                <p className={`text-3xl font-bold ${textMain}`}>{statistics.totalSubcategories}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                <svg className={`w-6 h-6 ${textMain}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Regular Subcategories</p>
                <p className={`text-3xl font-bold ${textMain}`}>{statistics.regularSubcategories}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-green-500/20" : "bg-green-100"}`}>
                <svg className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${subText}`}>Parent Categories</p>
                <p className={`text-3xl font-bold ${textMain}`}>{statistics.parentCategories}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <svg className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories Table */}
        <div className={`overflow-x-auto rounded-2xl shadow-2xl ${isDark ? "bg-gray-900" : "bg-white"} border ${innerBorderColor} w-full`}>
          <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className={isDark ? "bg-gray-800" : "bg-gray-100"}>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Name
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Slug
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Type
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Status
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Parent Category
                </th>
                <th className={`py-4 px-4 text-left font-semibold ${textMain}`}>
                  Description
                </th>
                <th className={`py-4 px-4 text-center font-semibold ${textMain}`}>
                  Image
                </th>
                <th className={`py-4 px-4 text-center font-semibold ${textMain}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center"
                  >
                    <svg className={`w-16 h-16 mx-auto mb-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>No subcategories found</h3>
                    <p className={`text-sm ${subText} mb-4`}>
                      {searchTerm || selectedParent ? "Try adjusting your search or filter criteria." : "Create your first subcategory to get started."}
                    </p>
                    {!searchTerm && !selectedParent && hasPermission('content.create') && (
                      <Link
                        to="/admin/subcategories/create"
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900"}`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Subcategory
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSubcategories.map((subcategory, idx) => {
                  const typeInfo = getTypeInfo(subcategory.type);
                  const parentCategoryName = subcategory.category ? subcategory.category.name : 'Unknown Parent';

                  return (
                    <tr
                      key={subcategory.id}
                      className={
                        idx % 2 === 0
                          ? `${isDark ? "bg-gray-900" : "bg-white"} hover:${isDark ? "bg-gray-800" : "bg-gray-100"} transition`
                          : `${isDark ? "bg-gray-800" : "bg-gray-50"} hover:${isDark ? "bg-gray-800" : "bg-gray-100"} transition`
                      }
                    >
                      <td className={`py-3 px-4 font-medium ${textMain}`}>
                        {subcategory.name}
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {subcategory.slug}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subcategory.status === 'active'
                            ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800')
                            : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800')
                        }`}>
                          {subcategory.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {parentCategoryName}
                      </td>
                      <td className={`py-3 px-4 ${subText}`}>
                        {subcategory.description || 'No description'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(() => {
                          console.log(`Subcategory ${subcategory.name} featureImage:`, subcategory.featureImage);
                          return subcategory.featureImage ? (
                            <div className="flex justify-center">
                              <img
                                src={subcategory.featureImage}
                                alt={`${subcategory.name} feature`}
                                className="w-12 h-12 object-cover rounded-lg border"
                                onError={(e) => {
                                  console.error(`Failed to load image for ${subcategory.name}:`, subcategory.featureImage);
                                  e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                }}
                                onLoad={() => {
                                  console.log(`Successfully loaded image for ${subcategory.name}:`, subcategory.featureImage);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                                <svg className={`w-6 h-6 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-row gap-2 justify-center items-center">
                          {/* Edit button - Show if user has content.edit permission */}
                          {hasPermission('content.edit') && (
                            <button
                              onClick={() => handleEdit(subcategory)}
                              className={`inline-flex items-center gap-1 ${isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-800 text-white"} px-3 py-1 rounded transition shadow`}
                              title="Edit"
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                              </svg>
                              Edit
                            </button>
                          )}

                          {/* Delete button - Show if user has content.delete permission */}
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleDeleteClick(subcategory.id, subcategory.name)}
                              className={`inline-flex items-center gap-1 ${isDark ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"} px-3 py-1 rounded transition shadow`}
                              title="Delete"
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <rect x="5" y="7" width="14" height="12" rx="2" />
                                <path d="M9 11v6M15 11v6" strokeLinecap="round" />
                                <path d="M10 7V5a2 2 0 0 1 4 0v2" />
                              </svg>
                              Delete
                            </button>
                          )}

                          {/* Show message if no actions available */}
                          {!hasPermission('content.edit') && !hasPermission('content.delete') && (
                            <span className="text-xs text-primary-text-secondary">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Hidden when showing all items on one page */}
        {pagination.totalPages > 1 && pagination.totalCount > pageSize && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`text-sm ${subText}`}>
              Showing all {getValidPaginationValue(pagination.totalCount, 0)} subcategories
            </div>

            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={handleFirstPage}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  pagination.hasPrevPage
                    ? `${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`
                    : `${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                }`}
              >
                First
              </button>

              {/* Previous Page */}
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  pagination.hasPrevPage
                    ? `${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`
                    : `${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, getValidPaginationValue(pagination.totalPages, 1)) }, (_, i) => {
                  const totalPages = getValidPaginationValue(pagination.totalPages, 1);
                  const currentPage = getValidPaginationValue(pagination.currentPage, 1);
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                        pageNum === currentPage
                          ? `${isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`
                          : `${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  pagination.hasNextPage
                    ? `${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`
                    : `${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                }`}
              >
                Next
              </button>

              {/* Last Page */}
              <button
                onClick={handleLastPage}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  pagination.hasNextPage
                    ? `${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`
                    : `${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"} cursor-not-allowed`
                }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
                  <svg className={`w-6 h-6 ${isDark ? "text-red-400" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${textMain}`}>Delete Subcategory</h3>
                  <p className={`text-sm ${subText}`}>This action cannot be undone</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-sm ${textMain}`}>
                  Are you sure you want to delete <span className="font-semibold">"{deleteTarget.name}"</span>?
                </p>
                <p className={`text-xs ${subText} mt-2`}>
                  This will permanently remove the subcategory and may affect existing articles.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSubCategory;