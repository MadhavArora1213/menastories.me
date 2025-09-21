import React, { useState, useEffect } from 'react';
import { seoService } from '../../services/seoService';

const SchemaBuilder = ({
  contentId,
  contentType,
  content,
  onSchemaUpdate,
  className = ''
}) => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);

  const [formData, setFormData] = useState({
    schemaType: 'Article',
    name: '',
    description: '',
    url: '',
    image: '',
    customFields: {}
  });

  const schemaTypes = [
    { value: 'Article', label: 'Article', icon: '📝', description: 'News articles, blog posts, and editorial content' },
    { value: 'NewsArticle', label: 'News Article', icon: '📰', description: 'Breaking news and time-sensitive content' },
    { value: 'BlogPosting', label: 'Blog Posting', icon: '📝', description: 'Informal blog posts and personal writings' },
    { value: 'Organization', label: 'Organization', icon: '🏢', description: 'Business or organization information' },
    { value: 'Person', label: 'Person', icon: '👤', description: 'Individual person profiles' },
    { value: 'Event', label: 'Event', icon: '📅', description: 'Events, conferences, and gatherings' },
    { value: 'Place', label: 'Place', icon: '📍', description: 'Locations and venues' },
    { value: 'LocalBusiness', label: 'Local Business', icon: '🏪', description: 'Local businesses and services' },
    { value: 'Product', label: 'Product', icon: '📦', description: 'Products and merchandise' },
    { value: 'Review', label: 'Review', icon: '⭐', description: 'Product or service reviews' },
    { value: 'FAQPage', label: 'FAQ Page', icon: '❓', description: 'Frequently asked questions' },
    { value: 'HowTo', label: 'How-To Guide', icon: '📋', description: 'Step-by-step instructions' },
    { value: 'Recipe', label: 'Recipe', icon: '👨‍🍳', description: 'Cooking recipes and instructions' },
    { value: 'VideoObject', label: 'Video', icon: '🎥', description: 'Video content and media' },
    { value: 'ImageObject', label: 'Image', icon: '🖼️', description: 'Image galleries and media' },
    { value: 'JobPosting', label: 'Job Posting', icon: '💼', description: 'Job listings and career opportunities' },
    { value: 'Course', label: 'Course', icon: '🎓', description: 'Educational courses and programs' },
    { value: 'Book', label: 'Book', icon: '📚', description: 'Books and publications' },
    { value: 'BreadcrumbList', label: 'Breadcrumb', icon: '🍞', description: 'Navigation breadcrumbs' },
    { value: 'WebSite', label: 'Website', icon: '🌐', description: 'Website information and search functionality' }
  ];

  useEffect(() => {
    if (contentId && contentType) {
      loadSchemas();
    }
  }, [contentId, contentType]);

  const loadSchemas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await seoService.getSchemaMarkup(contentType, contentId);
      if (response.data) {
        setSchemas([response.data]); // API returns single schema
      } else {
        setSchemas([]);
      }
    } catch (err) {
      console.error('Failed to load schema markup:', err);
      setSchemas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Generate JSON-LD based on schema type
      const jsonLdData = generateJsonLd(formData.schemaType, formData, content);

      const schemaData = {
        ...formData,
        jsonLdData,
        contentId,
        contentType
      };

      const response = await seoService.updateSchemaMarkup(contentType, contentId, schemaData);

      if (onSchemaUpdate) {
        onSchemaUpdate(response.data);
      }

      setShowForm(false);
      setEditingSchema(null);
      resetForm();
      await loadSchemas();
    } catch (err) {
      console.error('Failed to save schema markup:', err);
      setError('Failed to save schema markup');
    } finally {
      setSaving(false);
    }
  };

  const generateJsonLd = (schemaType, data, contentData) => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': schemaType
    };

    switch (schemaType) {
      case 'Article':
      case 'NewsArticle':
      case 'BlogPosting':
        return {
          ...baseData,
          headline: data.name || contentData?.title,
          description: data.description || contentData?.excerpt,
          image: data.image || contentData?.featuredImage,
          datePublished: contentData?.publishedAt,
          dateModified: contentData?.updatedAt,
          author: contentData?.author ? {
            '@type': 'Person',
            name: contentData.author.name,
            url: contentData.author.profileUrl
          } : undefined,
          publisher: {
            '@type': 'Organization',
            name: 'Your Organization Name',
            logo: {
              '@type': 'ImageObject',
              url: 'https://your-domain.com/logo.png'
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url || `https://your-domain.com/content/${contentId}`
          }
        };

      case 'Organization':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          url: data.url,
          logo: data.image,
          address: data.customFields?.address ? {
            '@type': 'PostalAddress',
            ...data.customFields.address
          } : undefined,
          contactPoint: data.customFields?.contact ? {
            '@type': 'ContactPoint',
            telephone: data.customFields.contact.phone,
            contactType: 'customer service'
          } : undefined
        };

      case 'Event':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          image: data.image,
          startDate: data.customFields?.startDate,
          endDate: data.customFields?.endDate,
          location: data.customFields?.location ? {
            '@type': 'Place',
            name: data.customFields.location.name,
            address: data.customFields.location.address
          } : undefined
        };

      case 'Product':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          image: data.image,
          offers: data.customFields?.offers ? {
            '@type': 'Offer',
            ...data.customFields.offers
          } : undefined
        };

      case 'FAQPage':
        return {
          ...baseData,
          mainEntity: data.customFields?.faqs?.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          })) || []
        };

      case 'HowTo':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          step: data.customFields?.steps?.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text
          })) || []
        };

      case 'Recipe':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          image: data.image,
          recipeIngredient: data.customFields?.ingredients || [],
          recipeInstructions: data.customFields?.instructions || [],
          cookTime: data.customFields?.cookTime,
          prepTime: data.customFields?.prepTime
        };

      default:
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          url: data.url,
          image: data.image
        };
    }
  };

  const resetForm = () => {
    setFormData({
      schemaType: 'Article',
      name: '',
      description: '',
      url: '',
      image: '',
      customFields: {}
    });
  };

  const getSchemaTypeInfo = (type) => {
    return schemaTypes.find(schema => schema.value === type) || schemaTypes[0];
  };

  const validateJsonLd = (jsonLd) => {
    const errors = [];

    if (!jsonLd['@context']) {
      errors.push('Missing @context field');
    }
    if (!jsonLd['@type']) {
      errors.push('Missing @type field');
    }

    return errors;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`schema-builder bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schema Markup Builder
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create JSON-LD structured data for rich snippets
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Schema
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Schema List */}
      <div className="p-6">
        <div className="space-y-4">
          {schemas.map((schema) => {
            const typeInfo = getSchemaTypeInfo(schema.schemaType);
            const validationErrors = validateJsonLd(schema.jsonLdData);

            return (
              <div key={schema.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {typeInfo.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {schema.name || 'Unnamed Schema'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schema.isValid
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {schema.isValid ? 'Valid' : 'Invalid'}
                    </span>

                    <button
                      onClick={() => {
                        setEditingSchema(schema);
                        setFormData({
                          schemaType: schema.schemaType,
                          name: schema.name || '',
                          description: schema.description || '',
                          url: schema.url || '',
                          image: schema.image || '',
                          customFields: schema.customFields || {}
                        });
                        setShowForm(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Validation Errors:
                    </h4>
                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <p className="text-gray-900 dark:text-white">{schema.schemaType}</p>
                  </div>

                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Generated:</span>
                    <p className="text-gray-900 dark:text-white">
                      {schema.lastGenerated ? new Date(schema.lastGenerated).toLocaleString() : 'Never'}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="text-gray-900 dark:text-white">
                      {schema.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      View JSON-LD Code
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-600 rounded text-xs font-mono overflow-x-auto">
                      <pre>{JSON.stringify(schema.jsonLdData, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        {schemas.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No schema markup found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create structured data to enhance search engine understanding.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Schema Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingSchema ? 'Edit Schema Markup' : 'Create Schema Markup'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchema(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Schema Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Schema Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {schemaTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, schemaType: type.value }))}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.schemaType === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {type.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name/Title
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter name or title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-domain.com/page"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://your-domain.com/image.jpg"
                  />
                </div>

                {/* Schema-specific fields would go here */}
                {renderSchemaSpecificFields(formData.schemaType)}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchema(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Schema'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderSchemaSpecificFields(schemaType) {
    switch (schemaType) {
      case 'Event':
        return (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Event Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.customFields?.startDate || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customFields: { ...prev.customFields, startDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.customFields?.endDate || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customFields: { ...prev.customFields, endDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'Product':
        return (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Product Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.customFields?.price || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customFields: { ...prev.customFields, price: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.customFields?.currency || 'AED'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customFields: { ...prev.customFields, currency: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default SchemaBuilder;