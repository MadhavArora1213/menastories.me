import React, { useState, useEffect } from 'react';
import seoService from '../../services/seoService';

const BulkSEOEditor = ({ contentTypes, onLoadData, bulkData, loading }) => {
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkUpdates, setBulkUpdates] = useState({
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    applyToAll: false
  });
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (selectedContentType) {
      onLoadData(selectedContentType);
    }
  }, [selectedContentType]);

  const handleContentTypeChange = (contentType) => {
    setSelectedContentType(contentType);
    setSelectedItems([]);
    setBulkUpdates({
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      applyToAll: false
    });
  };

  const handleItemSelection = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(bulkData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkUpdateChange = (field, value) => {
    setBulkUpdates({ ...bulkUpdates, [field]: value });
  };

  const generatePreview = () => {
    if (!selectedItems.length) return;

    const selectedData = bulkData.filter(item => selectedItems.includes(item.id));
    const previewData = selectedData.map(item => ({
      id: item.id,
      title: item.title || item.name || 'Untitled',
      currentSEO: item.seo || {},
      newSEO: {
        ...item.seo,
        ...Object.fromEntries(
          Object.entries(bulkUpdates).filter(([key, value]) =>
            value && (key !== 'applyToAll')
          )
        )
      }
    }));

    setPreview(previewData);
  };

  const applyBulkUpdates = async () => {
    if (!selectedItems.length || !selectedContentType) return;

    try {
      const updates = selectedItems.map(itemId => ({
        id: itemId,
        ...Object.fromEntries(
          Object.entries(bulkUpdates).filter(([key, value]) =>
            value && (key !== 'applyToAll')
          )
        )
      }));

      await seoService.bulkUpdateSEOData(selectedContentType, updates);
      alert('Bulk SEO updates applied successfully!');
      onLoadData(selectedContentType); // Refresh data
      setSelectedItems([]);
      setPreview([]);
    } catch (error) {
      console.error('Failed to apply bulk updates:', error);
      alert('Failed to apply bulk updates. Please try again.');
    }
  };

  const seoFields = selectedContentType ? seoService.getSEOFieldsForContentType(selectedContentType) : [];

  return (
    <div className="bulk-seo-editor space-y-6">
      {/* Content Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select Content Type for Bulk SEO Updates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {contentTypes.map((contentType) => (
            <button
              key={contentType}
              onClick={() => handleContentTypeChange(contentType)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedContentType === contentType
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {contentType === 'articles' ? '📝' :
                   contentType === 'videoArticles' ? '🎥' :
                   contentType === 'events' ? '📅' :
                   contentType === 'lists' ? '📋' : '📄'}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {seoService.getContentTypeDisplayName(contentType)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedContentType && (
        <>
          {/* Content Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Select Items to Update ({bulkData.length} total)
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === bulkData.length && bulkData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="mr-2"
                />
                Select All
              </label>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading content...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bulkData.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedItems.includes(item.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleItemSelection(item.id, !selectedItems.includes(item.id))}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                          className="mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.title || item.name || 'Untitled'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {item.id}
                          </p>
                          {item.seo && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              {item.seo.metaTitle && <span className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded mr-1">Title</span>}
                              {item.seo.metaDescription && <span className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Description</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.length} of {bulkData.length} items selected
            </div>
          </div>

          {/* Bulk Update Form */}
          {selectedItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Bulk SEO Updates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {seoFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.label}
                        {field.maxLength && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Max {field.maxLength} characters)
                          </span>
                        )}
                      </label>

                      {field.type === 'array' ? (
                        <textarea
                          value={Array.isArray(bulkUpdates[field.key]) ? bulkUpdates[field.key].join(', ') : bulkUpdates[field.key]}
                          onChange={(e) => handleBulkUpdateChange(field.key, e.target.value.split(',').map(item => item.trim()).filter(item => item))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={3}
                          placeholder={`Enter ${field.label.toLowerCase()} separated by commas`}
                        />
                      ) : (
                        <textarea
                          value={bulkUpdates[field.key] || ''}
                          onChange={(e) => handleBulkUpdateChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows={field.key.includes('Title') ? 2 : 3}
                          maxLength={field.maxLength}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex space-x-4">
                    <button
                      onClick={generatePreview}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Preview Changes
                    </button>
                    <button
                      onClick={applyBulkUpdates}
                      disabled={!selectedItems.length}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Bulk Updates
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Preview Changes
                  </h4>

                  {preview.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {preview.slice(0, 5).map((item) => (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h5>

                          <div className="space-y-2">
                            {item.newSEO.metaTitle && item.newSEO.metaTitle !== item.currentSEO.metaTitle && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Title:</span>
                                <p className="text-sm text-green-600 dark:text-green-400">{item.newSEO.metaTitle}</p>
                              </div>
                            )}

                            {item.newSEO.metaDescription && item.newSEO.metaDescription !== item.currentSEO.metaDescription && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Description:</span>
                                <p className="text-sm text-green-600 dark:text-green-400">{item.newSEO.metaDescription}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {preview.length > 5 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          ... and {preview.length - 5} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Click "Preview Changes" to see how updates will affect selected items
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BulkSEOEditor;