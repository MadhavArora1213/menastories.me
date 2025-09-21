import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const TagManager = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#10B981',
    type: 'regular',
    isActive: true,
    metaTitle: '',
    metaDescription: ''
  });

  const [errors, setErrors] = useState({});

  const tagTypes = [
    { value: 'regular', label: 'Regular', color: '#10B981' },
    { value: 'featured', label: 'Featured', color: '#F59E0B' },
    { value: 'breaking', label: 'Breaking News', color: '#EF4444' },
    { value: 'trending', label: 'Trending', color: '#8B5CF6' },
    { value: 'sponsored', label: 'Sponsored', color: '#EC4899' }
  ];

  // Load tags
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tags`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || data);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };

      // Auto-generate slug when name changes
      if (name === 'name' && !editingTag) {
        updated.slug = generateSlug(value);
      }

      // Update color when type changes
      if (name === 'type') {
        const tagType = tagTypes.find(t => t.value === value);
        if (tagType) {
          updated.color = tagType.color;
        }
      }

      return updated;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title should be under 60 characters';
    }
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be under 160 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const url = editingTag 
        ? `${import.meta.env.VITE_API_URL}/api/tags/${editingTag.id}`
        : `${import.meta.env.VITE_API_URL}/api/tags`;
      
      const method = editingTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTag(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          color: '#10B981',
          type: 'regular',
          isActive: true,
          metaTitle: '',
          metaDescription: ''
        });
        loadTags();
      } else {
        const error = await response.json();
        alert('Failed to save tag: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save tag error:', error);
      alert('Failed to save tag');
    }
  };

  // Handle tag deletion
  const handleDelete = async (tagId) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tags/${tagId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        loadTags();
      } else {
        const error = await response.json();
        alert('Failed to delete tag: ' + (error.message || 'This tag may be associated with articles'));
      }
    } catch (error) {
      console.error('Delete tag error:', error);
      alert('Failed to delete tag');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedTags.length === 0) return;

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedTags.length} tags?`);
    if (!confirmed) return;

    try {
      if (action === 'delete') {
        const promises = selectedTags.map(tagId =>
          fetch(`${import.meta.env.VITE_API_URL}/api/tags/${tagId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        );
        await Promise.all(promises);
      } else {
        const promises = selectedTags.map(tagId =>
          fetch(`${import.meta.env.VITE_API_URL}/api/tags/${tagId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ isActive: action === 'activate' })
          })
        );
        await Promise.all(promises);
      }

      setSelectedTags([]);
      loadTags();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(`Failed to ${action} tags`);
    }
  };

  // Edit tag
  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#10B981',
      type: tag.type || 'regular',
      isActive: tag.isActive,
      metaTitle: tag.metaTitle || '',
      metaDescription: tag.metaDescription || ''
    });
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#10B981',
      type: 'regular',
      isActive: true,
      metaTitle: '',
      metaDescription: ''
    });
    setErrors({});
  };

  // Toggle tag selection
  const toggleTagSelection = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Select all tags
  const toggleSelectAll = () => {
    setSelectedTags(prev =>
      prev.length === filteredTags.length
        ? []
        : filteredTags.map(tag => tag.id)
    );
  };

  // Filter tags
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tag.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get tag type info
  const getTagTypeInfo = (type) => {
    return tagTypes.find(t => t.value === type) || tagTypes[0];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
          <p className="text-gray-600">{tags.length} tags total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Tag
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {tagTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedTags.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by creating your first tag.'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.length === filteredTags.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 mr-2"
                />
                Select all ({filteredTags.length} tags)
              </label>
            </div>

            {/* Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((tag) => {
                const typeInfo = getTagTypeInfo(tag.type);
                return (
                  <div
                    key={tag.id}
                    className={`relative border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      selectedTags.includes(tag.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTagSelection(tag.id)}
                        className="rounded border-gray-300"
                      />
                    </div>

                    {/* Tag Content */}
                    <div className="pt-6">
                      {/* Tag Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color || typeInfo.color }}
                          ></div>
                          <span
                            className="px-2 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: `${tag.color || typeInfo.color}20`,
                              color: tag.color || typeInfo.color
                            }}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tag.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tag.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Tag Name */}
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {tag.name}
                      </h3>
                      
                      {/* Tag Slug */}
                      <p className="text-sm text-gray-500 mb-2">
                        /{tag.slug}
                      </p>

                      {/* Tag Description */}
                      {tag.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {tag.description}
                        </p>
                      )}

                      {/* Tag Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{tag.articleCount || 0} articles</span>
                        <span>{new Date(tag.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tag Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingTag ? 'Edit Tag' : 'New Tag'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tag name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="tag-slug"
                    />
                    {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tag description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tagTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>

                {/* SEO Fields */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title ({formData.metaTitle.length}/60)
                      </label>
                      <input
                        type="text"
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.metaTitle ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="SEO title for this tag"
                      />
                      {errors.metaTitle && <p className="text-red-500 text-sm mt-1">{errors.metaTitle}</p>}
                    </div>

                    <div>
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description ({formData.metaDescription.length}/160)
                      </label>
                      <textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.metaDescription ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="SEO description for this tag"
                      />
                      {errors.metaDescription && <p className="text-red-500 text-sm mt-1">{errors.metaDescription}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingTag ? 'Update Tag' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;