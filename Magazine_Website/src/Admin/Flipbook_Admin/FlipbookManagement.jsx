import React, { useState, useEffect, useCallback } from 'react';
import { flipbookService } from '../../services/flipbookService';
import FlipbookUploader from '../../Components/Flipbook/FlipbookUploader';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';

const EditMagazineForm = ({ magazine, categories, onSave, onCancel }) => {
   const [formData, setFormData] = useState({
     title: magazine.title || '',
     description: magazine.description || '',
     magazineType: magazine.magazineType || 'monthly',
     category: magazine.category || 'lifestyle',
     accessType: magazine.accessType || 'free',
     price: magazine.price || 0,
     isPublished: magazine.isPublished || false,
     allowDownload: magazine.allowDownload || false,
     allowPrint: magazine.allowPrint || false,
     allowShare: magazine.allowShare !== false
   });
   const [selectedFile, setSelectedFile] = useState(null);
   const [fileError, setFileError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/x-pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Please select a valid PDF file');
        return;
      }

      // Validate file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setFileError('File size must be less than 100MB');
        return;
      }

      setFileError('');
    }

    onSave(formData, selectedFile);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Magazine Type
          </label>
          <select
            value={formData.magazineType}
            onChange={(e) => handleChange('magazineType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="special">Special Edition</option>
            <option value="annual">Annual</option>
            <option value="digital_only">Digital Only</option>
            <option value="print_digital">Print + Digital</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Replace PDF File (Optional)
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFileError('');
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {fileError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {fileError}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Leave empty to keep the current PDF file. Only PDF files up to 100MB are allowed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Access Type
          </label>
          <select
            value={formData.accessType}
            onChange={(e) => handleChange('accessType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="free">Free Access</option>
            <option value="subscriber">Subscriber Only</option>
            <option value="premium">Premium</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {formData.accessType === 'paid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Permissions
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-isPublished"
              checked={formData.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit-isPublished" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Publish magazine
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-allowDownload"
              checked={formData.allowDownload}
              onChange={(e) => handleChange('allowDownload', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit-allowDownload" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Allow users to download
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-allowPrint"
              checked={formData.allowPrint}
              onChange={(e) => handleChange('allowPrint', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit-allowPrint" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Allow users to print
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-allowShare"
              checked={formData.allowShare}
              onChange={(e) => handleChange('allowShare', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="edit-allowShare" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Allow users to share
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const FlipbookManagement = () => {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('magazines');
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMagazines, setSelectedMagazines] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [editingMagazine, setEditingMagazine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    magazineType: 'all',
    accessType: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  // Categories from database
  const [categories, setCategories] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Statistics
  const [stats, setStats] = useState({
    totalMagazines: 0,
    totalViews: 0,
    totalDownloads: 0,
    processingCount: 0
  });

  useEffect(() => {
    loadCategories();
    loadMagazines();
    loadStats();
  }, [pagination.page, filters]);

  const loadMagazines = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await flipbookService.getFlipbookMagazines(params);
      setMagazines(response.magazines || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));

      // Show success toast only if this is not the initial load
      if (filters.search || filters.category !== 'all' || filters.magazineType !== 'all' ||
          filters.accessType !== 'all' || filters.status !== 'all') {
        toast.success(`Found ${response.pagination?.total || 0} magazines`);
      }
    } catch (err) {
      console.error('Failed to load magazines:', err);
      setError('Failed to load magazines');
      toast.error('Failed to load magazines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsResponse = await flipbookService.getFlipbookStats();
      setStats(statsResponse || stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesResponse = await flipbookService.getCategories();
      setCategories(categoriesResponse.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleMagazineSelect = (magazineId, isSelected) => {
    if (isSelected) {
      setSelectedMagazines(prev => [...prev, magazineId]);
    } else {
      setSelectedMagazines(prev => prev.filter(id => id !== magazineId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedMagazines(magazines.map(m => m.id));
    } else {
      setSelectedMagazines([]);
    }
  };

  const handleBulkAction = async (action, params = {}) => {
    if (selectedMagazines.length === 0) return;

    try {
      setLoading(true);

      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedMagazines.length} magazine(s)? This action cannot be undone.`)) {
            await flipbookService.bulkDeleteMagazines(selectedMagazines);
            toast.success(`${selectedMagazines.length} magazine(s) deleted successfully!`);
          } else {
            setLoading(false);
            return; // Don't proceed if user cancelled
          }
          break;
        case 'update':
          await flipbookService.bulkUpdateMagazines({
            magazineIds: selectedMagazines,
            updateData: params
          });
          const actionName = params.isPublished ? 'published' : params.isFeatured ? 'featured' : 'updated';
          toast.success(`${selectedMagazines.length} magazine(s) ${actionName} successfully!`);
          break;
      }

      await loadMagazines();
      setSelectedMagazines([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError('Bulk action failed');
      toast.error(`Failed to ${action} selected magazines. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMagazineAction = async (action, magazineId) => {
    try {
      const magazine = magazines.find(m => m.id === magazineId);
      const magazineTitle = magazine?.title || 'Magazine';

      switch (action) {
        case 'publish':
          await flipbookService.updateFlipbookMagazine(magazineId, {
            isPublished: true,
            publishedAt: new Date()
          });
          toast.success(`"${magazineTitle}" published successfully!`);
          break;
        case 'unpublish':
          await flipbookService.updateFlipbookMagazine(magazineId, {
            isPublished: false
          });
          toast.success(`"${magazineTitle}" unpublished successfully!`);
          break;
        case 'feature':
          await flipbookService.updateFlipbookMagazine(magazineId, {
            isFeatured: true
          });
          toast.success(`"${magazineTitle}" featured successfully!`);
          break;
        case 'unfeature':
          await flipbookService.updateFlipbookMagazine(magazineId, {
            isFeatured: false
          });
          toast.success(`"${magazineTitle}" unfeatured successfully!`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete "${magazineTitle}"? This action cannot be undone.`)) {
            await flipbookService.deleteFlipbookMagazine(magazineId);
            toast.success(`"${magazineTitle}" deleted successfully!`);
          } else {
            return; // Don't reload if user cancelled
          }
          break;
      }

      await loadMagazines();
    } catch (err) {
      console.error('Magazine action failed:', err);
      setError('Action failed');
      toast.error(`Failed to ${action} magazine. Please try again.`);
    }
  };

  const handleUploadComplete = async (uploadedMagazine) => {
    setShowUploader(false);
    await loadMagazines();
    await loadStats();
    toast.success(`Magazine "${uploadedMagazine.title}" uploaded successfully!`);
  };

  const handleDownloadMagazine = async (magazine) => {
    try {
      await flipbookService.downloadMagazineWithFilename(magazine.id, magazine.title);
      toast.success(`"${magazine.title}" downloaded successfully!`);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download magazine');
      toast.error('Failed to download magazine. Please try again.');
    }
  };

  const StatsCard = ({ title, value, icon, color = 'blue' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <div className={`text-${color}-600 dark:text-${color}-400`}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const MagazineCard = ({ magazine }) => {
    const typeInfo = flipbookService.getMagazineTypeInfo(magazine.magazineType);
    const accessInfo = flipbookService.getAccessTypeInfo(magazine.accessType);
    const categoryInfo = flipbookService.getCategoryInfo(magazine.category);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:-translate-y-1">
        {/* Magazine Cover */}
        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700">
          {magazine.coverImageUrl ? (
            <img
              src={magazine.coverImageUrl}
              alt={magazine.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {magazine.isFeatured && (
              <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
                Featured
              </span>
            )}
            {magazine.isPublished ? (
              <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
                Published
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded">
                Draft
              </span>
            )}
          </div>

          {/* Processing Status */}
          {magazine.processingStatus === 'processing' && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                <div className="flex items-center justify-between">
                  <span>Processing...</span>
                  <span>{magazine.processingProgress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${magazine.processingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selection Checkbox */}
          <div className="absolute top-2 right-2">
            <input
              type="checkbox"
              checked={selectedMagazines.includes(magazine.id)}
              onChange={(e) => handleMagazineSelect(magazine.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Magazine Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {magazine.title}
          </h3>

          {magazine.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {magazine.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className={`px-2 py-1 text-xs rounded ${typeInfo.color}`}>
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${categoryInfo.color}`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${accessInfo.color}`}>
              {accessInfo.icon} {accessInfo.label}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>{magazine.totalPages} pages</span>
            <span>{magazine.viewCount} views</span>
            <span>{magazine.downloadCount} downloads</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Edit button - requires content.edit permission */}
              {hasPermission('content.edit') && (
                <button
                  onClick={() => {
                    setEditingMagazine(magazine);
                    setShowEditModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {/* Download button - always available for viewing */}
              <button
                onClick={() => handleDownloadMagazine(magazine)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Download PDF"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Publish/Unpublish buttons - requires content.publish permission */}
              {hasPermission('content.publish') && (
                <>
                  {!magazine.isPublished ? (
                    <button
                      onClick={() => handleMagazineAction('publish', magazine.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMagazineAction('unpublish', magazine.id)}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Unpublish
                    </button>
                  )}
                </>
              )}

              {/* Delete button - requires content.delete permission */}
              {hasPermission('content.delete') && (
                <button
                  onClick={() => handleMagazineAction('delete', magazine.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}

              {/* Show message if no actions available */}
              {!hasPermission('content.edit') && !hasPermission('content.publish') && !hasPermission('content.delete') && (
                <span className="text-xs text-gray-400">No actions available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flipbook-management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Flipbook Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your digital magazine collection
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Only show Upload Magazine button if user has content.create permission */}
            {hasPermission('content.create') && (
              <button
                onClick={() => setShowUploader(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Magazine</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Magazines"
          value={stats.totalMagazines}
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>}
          color="blue"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews?.toLocaleString() || '0'}
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>}
          color="green"
        />
        <StatsCard
          title="Total Downloads"
          value={stats.totalDownloads?.toLocaleString() || '0'}
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
          color="purple"
        />
        <StatsCard
          title="Processing"
          value={stats.processingCount || 0}
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>}
          color="orange"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          <button
            onClick={() => {
              setFilters({
                search: '',
                category: 'all',
                magazineType: 'all',
                accessType: 'all',
                status: 'all',
                sortBy: 'createdAt',
                sortOrder: 'DESC'
              });
              toast.success('Filters cleared successfully!');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search magazines..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filters.magazineType}
            onChange={(e) => setFilters(prev => ({ ...prev, magazineType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="monthly">Monthly</option>
            <option value="special">Special Edition</option>
            <option value="annual">Annual</option>
            <option value="digital_only">Digital Only</option>
            <option value="print_digital">Print + Digital</option>
            <option value="interactive">Interactive</option>
          </select>

          <select
            value={filters.accessType}
            onChange={(e) => setFilters(prev => ({ ...prev, accessType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Access Types</option>
            <option value="free">Free</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="processing">Processing</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="title-ASC">Title A-Z</option>
            <option value="title-DESC">Title Z-A</option>
            <option value="viewCount-DESC">Most Viewed</option>
            <option value="downloadCount-DESC">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMagazines.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {selectedMagazines.length} magazine{selectedMagazines.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              {/* Publish Selected - requires content.publish permission */}
              {hasPermission('content.publish') && (
                <button
                  onClick={() => handleBulkAction('update', { isPublished: true })}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Publish Selected
                </button>
              )}

              {/* Feature Selected - requires content.edit permission */}
              {hasPermission('content.edit') && (
                <button
                  onClick={() => handleBulkAction('update', { isFeatured: true })}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  Feature Selected
                </button>
              )}

              {/* Delete Selected - requires content.delete permission */}
              {hasPermission('content.delete') && (
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
              )}

              {/* Show message if no bulk actions available */}
              {!hasPermission('content.publish') && !hasPermission('content.edit') && !hasPermission('content.delete') && (
                <span className="text-sm text-gray-400">No bulk actions available</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Magazines Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading magazines...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      ) : magazines.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No magazines found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by uploading your first magazine.
          </p>
          {/* Only show Upload Magazine button if user has content.create permission */}
          {hasPermission('content.create') && (
            <button
              onClick={() => setShowUploader(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Magazine
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedMagazines.length === magazines.length && magazines.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Select All ({magazines.length})
              </span>
            </div>
          </div>

          {/* Magazines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {magazines.map((magazine) => (
              <MagazineCard key={magazine.id} magazine={magazine} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Upload Magazine
                </h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <FlipbookUploader
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                  setError('Upload failed');
                  toast.error('Failed to upload magazine. Please try again.');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMagazine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Magazine
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMagazine(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <EditMagazineForm
                magazine={editingMagazine}
                categories={categories}
                onSave={async (updatedData, selectedFile) => {
                  try {
                    await flipbookService.updateFlipbookMagazine(editingMagazine.id, updatedData, selectedFile);
                    await loadMagazines();
                    setShowEditModal(false);
                    setEditingMagazine(null);
                    toast.success(`"${editingMagazine.title}" updated successfully!`);
                  } catch (err) {
                    console.error('Failed to update magazine:', err);
                    setError('Failed to update magazine');
                    toast.error('Failed to update magazine. Please try again.');
                  }
                }}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingMagazine(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipbookManagement;