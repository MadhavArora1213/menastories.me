import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import categoryService from "../services/categoryService";

const designBadges = {
    design1: (
        <span className="inline-flex flex-nowrap items-center gap-2 px-3 py-1.5 rounded-full bg-primary-accent text-primary-bg text-xs font-semibold shadow-sm">
            <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <rect x="4" y="4" width="16" height="16" rx="4" />
            </svg>
            Design 1
        </span>
    ),
    design2: (
        <span className="inline-flex flex-nowrap items-center gap-2 px-3 py-1.5 rounded-full bg-primary-bg text-primary-text border border-primary-border text-xs font-semibold shadow-sm">
            <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="8" />
            </svg>
            Design 2
        </span>
    ),
    design3: (
        <span className="inline-flex flex-nowrap items-center gap-2 px-3 py-1.5 rounded-full bg-primary-accent text-primary-bg text-xs font-semibold border border-primary-bg shadow-sm">
            <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <polygon points="12,4 20,20 4,20" />
            </svg>
            Design 3
        </span>
    ),
};

const statusBadge = (status) =>
    status === "active" ? (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
            <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
            </svg>
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-bg text-primary-text border border-primary-border shadow-sm">
            <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="15 9l-6 6M9 9l6 6" />
            </svg>
            Inactive
        </span>
    );

const AllCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingDesign, setUpdatingDesign] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });
    const [pageSize] = useState(10);
    const { theme } = useTheme();
    const { admin, hasPermission } = useAdminAuth();
    const navigate = useNavigate();
    
    // Improved theme variables
    const isDark = theme === "dark";
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
        dangerHover: isDark ? "bg-red-700" : "bg-red-600"
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories(1);
    }, []);

    const fetchCategories = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching categories for page:', page);

            const response = await categoryService.getCategories({ page, limit: pageSize });
            console.log('API Response:', response);

            // Ensure categories is always an array
            let categoriesArray = [];
            if (response && typeof response === 'object') {
                console.log('Response structure:', Object.keys(response));

                // Check if response.success and response.data exists (backend API structure)
                if (response.success && response.data && Array.isArray(response.data)) {
                    categoriesArray = response.data;
                    console.log('Found categories in response.data:', categoriesArray.length);
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    categoriesArray = response.data.data;
                    console.log('Found categories in response.data.data:', categoriesArray.length);
                } else if (response.data && Array.isArray(response.data)) {
                    categoriesArray = response.data;
                    console.log('Response.data is array:', categoriesArray.length);
                } else if (Array.isArray(response)) {
                    categoriesArray = response;
                    console.log('Response is array:', categoriesArray.length);
                } else if (response.categories && Array.isArray(response.categories)) {
                    categoriesArray = response.categories;
                    console.log('Response.categories is array:', categoriesArray.length);
                } else if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
                    categoriesArray = response.data.categories;
                    console.log('Response.data.categories is array:', categoriesArray.length);
                } else {
                    console.log('Could not find categories array in response');
                    console.log('Full response:', JSON.stringify(response, null, 2));
                }
            } else {
                console.log('Response is not an object:', typeof response);
            }

            console.log('Setting categories:', categoriesArray.length);
            setCategories(categoriesArray);

            // Update pagination state
            if (response && response.pagination) {
                setPagination(response.pagination);
            } else if (response && response.success) {
                // Fallback: construct pagination from direct response properties
                setPagination({
                    currentPage: response.currentPage || 1,
                    totalPages: response.totalPages || 1,
                    totalCount: response.totalCount || 0,
                    hasNextPage: (response.currentPage || 1) < (response.totalPages || 1),
                    hasPrevPage: (response.currentPage || 1) > 1,
                    nextPage: (response.currentPage || 1) < (response.totalPages || 1) ? (response.currentPage || 1) + 1 : null,
                    prevPage: (response.currentPage || 1) > 1 ? (response.currentPage || 1) - 1 : null
                });
            }

            // Update pagination state
            if (response && response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError(err.message || 'Failed to fetch categories');
            setCategories([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await categoryService.deleteCategory(categoryId);
            // Note: cmsService.deleteCategory expects the ID as a parameter, which should work
            setCategories(categories.filter(cat => cat.id !== categoryId));
            alert('Category deleted successfully!');
        } catch (err) {
            alert(`Error deleting category: ${err.message}`);
        }
    };

    const handleToggleStatus = async (categoryId) => {
        try {
            const response = await categoryService.toggleCategoryStatus(categoryId);
            const newStatus = response?.data?.status || response?.status;
            if (newStatus) {
                setCategories(categories.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, status: newStatus }
                        : cat
                ));
            }
        } catch (err) {
            alert(`Error updating status: ${err.message}`);
        }
    };

    const handleDesignChange = async (categoryId, newDesign) => {
        try {
            setUpdatingDesign(categoryId);
            const response = await categoryService.updateCategoryDesign(categoryId, newDesign);

            // Update local state
            setCategories(categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, design: newDesign }
                    : cat
            ));

            alert(`Category design updated to ${newDesign}!`);
        } catch (err) {
            alert(`Error updating design: ${err.message}`);
        } finally {
            setUpdatingDesign(null);
        }
    };

    const handleEdit = (category) => {
        navigate(`/admin/category/update/${category.id}`, {
            state: { category }
        });
    };

    // Pagination functions
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchCategories(newPage);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-accent border-t-transparent mx-auto mb-4"></div>
                    <p className="text-xl text-primary-text font-medium">Loading categories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-primary-text">Error Loading Categories</h2>
                    <p className="mb-6 text-primary-text-secondary">{error}</p>
                    <button
                        onClick={() => fetchCategories(1)}
                        className="bg-primary-accent text-primary-bg px-6 py-2.5 rounded-xl hover:bg-primary-accent-hover transition-all duration-200 font-medium shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.bgMain} py-6 px-4 md:px-6 transition-all duration-200`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
                    <div>
                        <h1 className={`text-3xl md:text-4xl font-black mb-2 tracking-tight flex items-center gap-3 ${themeClasses.textPrimary}`}>
                            <div className={`w-10 h-10 ${themeClasses.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                                <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                    className="text-white"
                                >
                                    <rect x="3" y="7" width="18" height="10" rx="4" />
                                    <circle cx="8" cy="12" r="2" />
                                </svg>
                            </div>
                            All Categories
                        </h1>
                        <p className={`text-lg ${themeClasses.textSecondary}`}>
                            Overview of all magazine categories with their design and status.
                        </p>
                    </div>
                    {/* Only show Add Category button if user has content.create permission */}
                    {hasPermission('content.create') && (
                        <Link
                            to="/admin/category/create"
                            className={`${themeClasses.accent} hover:${themeClasses.accentHover.split('-').slice(1).join('-')} ${themeClasses.accentText} px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl inline-flex items-center space-x-2 transform hover:scale-105`}
                        >
                            <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                            </svg>
                            <span>Add Category</span>
                        </Link>
                    )}
                </div>

                {/* Design Preview Section */}
                <div className={`mb-8 ${themeClasses.bgCard} ${themeClasses.border} border rounded-2xl p-6 shadow-lg`}>
                    <h3 className={`text-xl font-semibold mb-6 ${themeClasses.textPrimary}`}>Available Designs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`text-center p-6 ${themeClasses.bgCardSecondary} rounded-xl ${themeClasses.border} border hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                            <div className={`w-16 h-16 mx-auto mb-4 ${themeClasses.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white">
                                    <rect x="4" y="4" width="16" height="16" rx="4" />
                                </svg>
                            </div>
                            <h4 className={`font-semibold mb-2 ${themeClasses.textPrimary}`}>Design 1</h4>
                            <p className={`text-sm ${themeClasses.textSecondary}`}>Card Grid Layout</p>
                        </div>
                        <div className={`text-center p-6 ${themeClasses.bgCardSecondary} rounded-xl ${themeClasses.border} border hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                            <div className={`w-16 h-16 mx-auto mb-4 ${themeClasses.bgCard} rounded-xl flex items-center justify-center ${themeClasses.border} border shadow-lg`}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={themeClasses.textPrimary}>
                                    <circle cx="12" cy="12" r="8" />
                                </svg>
                            </div>
                            <h4 className={`font-semibold mb-2 ${themeClasses.textPrimary}`}>Design 2</h4>
                            <p className={`text-sm ${themeClasses.textSecondary}`}>Table Layout</p>
                        </div>
                        <div className={`text-center p-6 ${themeClasses.bgCardSecondary} rounded-xl ${themeClasses.border} border hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                            <div className={`w-16 h-16 mx-auto mb-4 ${themeClasses.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white">
                                    <polygon points="12,4 20,20 4,20" />
                                </svg>
                            </div>
                            <h4 className={`font-semibold mb-2 ${themeClasses.textPrimary}`}>Design 3</h4>
                            <p className={`text-sm ${themeClasses.textSecondary}`}>Glassmorphism</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className={`${themeClasses.bgCard} ${themeClasses.border} border rounded-2xl overflow-hidden shadow-lg`}>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${themeClasses.border}`}>
                            <thead className={themeClasses.bgCardSecondary}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Name
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Slug
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Design
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Status
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Description
                                    </th>
                                    <th className={`px-6 py-4 text-center text-xs font-semibold ${themeClasses.textSecondary} uppercase tracking-wider`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeClasses.border}`}>
                                {categories.map((cat, idx) => (
                                    <tr key={cat.id} className={`hover:${themeClasses.bgCardSecondary.split('-').slice(1).join('-')} transition-colors duration-200`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.textPrimary}`}>
                                            {cat.name}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                                            {cat.slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {designBadges[cat.design]}
                                                <select
                                                    value={cat.design}
                                                    onChange={(e) => handleDesignChange(cat.id, e.target.value)}
                                                    disabled={updatingDesign === cat.id}
                                                    className={`text-xs px-3 py-1.5 rounded-lg ${themeClasses.border} border ${themeClasses.bgCard} ${themeClasses.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                >
                                                    <option value="design1">Design 1</option>
                                                    <option value="design2">Design 2</option>
                                                    <option value="design3">Design 3</option>
                                                </select>
                                                {updatingDesign === cat.id && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(cat.id)}
                                                className="hover:opacity-80 transition-opacity duration-200"
                                            >
                                                {statusBadge(cat.status)}
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${themeClasses.textSecondary} max-w-xs truncate`}>
                                            {cat.description || 'No description'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {/* Edit button - Show if user has content.edit permission */}
                                                {hasPermission('content.edit') && (
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className={`inline-flex items-center gap-2 px-3 py-2 ${themeClasses.accent} hover:${themeClasses.accentHover.split('-').slice(1).join('-')} ${themeClasses.accentText} text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
                                                        title="Edit"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
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
                                                        onClick={() => handleDelete(cat.id)}
                                                        className={`inline-flex items-center gap-2 px-3 py-2 ${themeClasses.danger} hover:${themeClasses.dangerHover.split('-').slice(1).join('-')} text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
                                                        title="Delete"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
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
                                                    <span className={`text-xs ${themeClasses.textMuted}`}>No actions available</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center space-y-4">
                                                <svg className={`w-16 h-16 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <div>
                                                    <p className={`${themeClasses.textPrimary} font-medium mb-2`}>No categories found</p>
                                                    <p className={`${themeClasses.textSecondary} text-sm`}>Get started by creating your first category.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className={`text-sm ${themeClasses.textSecondary}`}>
                            Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} categories
                        </div>

                        <div className="flex items-center gap-2">
                            {/* First Page */}
                            <button
                                onClick={handleFirstPage}
                                disabled={!pagination.hasPrevPage}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pagination.hasPrevPage
                                        ? `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textPrimary} hover:${themeClasses.bgCard.split('-').slice(1).join('-')} hover:shadow-md`
                                        : `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textMuted} cursor-not-allowed opacity-50`
                                }`}
                            >
                                First
                            </button>

                            {/* Previous Page */}
                            <button
                                onClick={handlePrevPage}
                                disabled={!pagination.hasPrevPage}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pagination.hasPrevPage
                                        ? `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textPrimary} hover:${themeClasses.bgCard.split('-').slice(1).join('-')} hover:shadow-md`
                                        : `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textMuted} cursor-not-allowed opacity-50`
                                }`}
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.currentPage - 2)) + i;
                                    if (pageNum > pagination.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                pageNum === pagination.currentPage
                                                    ? `${themeClasses.accent} ${themeClasses.accentText} shadow-lg`
                                                    : `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textPrimary} hover:${themeClasses.bgCard.split('-').slice(1).join('-')} hover:shadow-md`
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
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pagination.hasNextPage
                                        ? `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textPrimary} hover:${themeClasses.bgCard.split('-').slice(1).join('-')} hover:shadow-md`
                                        : `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textMuted} cursor-not-allowed opacity-50`
                                }`}
                            >
                                Next
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={handleLastPage}
                                disabled={!pagination.hasNextPage}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    pagination.hasNextPage
                                        ? `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textPrimary} hover:${themeClasses.bgCard.split('-').slice(1).join('-')} hover:shadow-md`
                                        : `${themeClasses.bgCardSecondary} ${themeClasses.border} border ${themeClasses.textMuted} cursor-not-allowed opacity-50`
                                }`}
                            >
                                Last
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllCategory;
