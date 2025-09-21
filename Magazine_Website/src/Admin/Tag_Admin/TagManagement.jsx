import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { tagService } from '../services/tagService';

const TagManagement = () => {
  const { theme } = useTheme();
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    category: 'general'
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';
  const modalBg = isDark ? 'bg-gray-900' : 'bg-white';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await tagService.getAllTags();
        const apiTags = (data.tags || data || []).map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description || '',
          color: t.color || '#3b82f6',
          category: t.category || 'general',
          article_count: t.article_count || 0,
          created_at: t.createdAt || new Date().toISOString(),
          updated_at: t.updatedAt || new Date().toISOString()
        }));
        setTags(apiTags);
      } catch (e) {
        console.error('Failed to load tags', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { name: newTag.name, description: newTag.description, color: newTag.color };
      const created = await tagService.create(payload);
      setTags(prev => [{
        id: created.tag?.id || created.id,
        name: created.tag?.name || created.name,
        slug: created.tag?.slug || created.slug,
        description: created.tag?.description || created.description || '',
        color: created.tag?.color || created.color || '#3b82f6',
        category: 'general',
        article_count: 0,
        created_at: created.tag?.createdAt || created.createdAt || new Date().toISOString(),
        updated_at: created.tag?.updatedAt || created.updatedAt || new Date().toISOString()
      }, ...prev]);
      setNewTag({ name: '', description: '', color: '#3b82f6', category: 'general' });
      setShowCreateModal(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag) => {
    setEditingTag({ ...tag });
    setShowEditModal(true);
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await tagService.update(editingTag.id, { name: editingTag.name, description: editingTag.description, color: editingTag.color });
      setTags(prev => prev.map(tag => tag.id === editingTag.id ? { ...editingTag, updated_at: new Date().toISOString() } : tag));
      setShowEditModal(false);
      setEditingTag(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    try {
      await tagService.remove(tagId);
      setTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTags.length === 0) {
      alert('Please select tags first');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedTags.length} tags?`)) {
      setTags(prev => prev.filter(tag => !selectedTags.includes(tag.id)));
      setSelectedTags([]);
    }
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const selectAllTags = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(filteredTags.map(tag => tag.id));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      entertainment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      lifestyle: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      business: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      culture: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      regional: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
    };
    return colors[category] || colors.general;
  };

  const tagCategories = ['general', 'entertainment', 'lifestyle', 'business', 'culture', 'regional'];
  const colorPresets = ['#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${textMain} mb-2`}>Tags Management</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Organize your content with tags and categories
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create New Tag
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Tags
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{tags.length}</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Most Used Tag
            </h3>
            <p className={`text-lg font-semibold ${textMain}`}>
              {tags.length > 0 ? tags.reduce((a, b) => a.article_count > b.article_count ? a : b).name : 'N/A'}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Categories
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>
              {[...new Set(tags.map(t => t.category))].length}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Tagged Articles
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>
              {tags.reduce((sum, tag) => sum + tag.article_count, 0)}
            </p>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className={`rounded-lg border ${cardBg} p-6 mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`}
            />
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-4">
                <span className={`text-sm ${textMain}`}>
                  {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
                </span>
                <button 
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTags.map((tag) => (
            <div key={tag.id} className={`rounded-lg border ${cardBg} p-6 relative`}>
              <div className="flex items-start justify-between mb-4">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => toggleTagSelection(tag.id)}
                  className="rounded"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditTag(tag)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <h3 className={`text-lg font-semibold ${textMain}`}>{tag.name}</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  {tag.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(tag.category)}`}>
                    {tag.category.charAt(0).toUpperCase() + tag.category.slice(1)}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {tag.article_count} articles
                  </span>
                </div>
              </div>

              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Created: {new Date(tag.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Create Tag Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${modalBg} p-6 rounded-lg w-full max-w-md mx-4`}>
              <h2 className={`text-xl font-bold ${textMain} mb-4`}>Create New Tag</h2>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Tag Name</label>
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Description</label>
                  <textarea
                    value={newTag.description}
                    onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Category</label>
                  <select
                    value={newTag.category}
                    onChange={(e) => setNewTag(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {tagCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Color</label>
                  <div className="flex gap-2 mb-2">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTag(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${newTag.color === color ? 'border-gray-400' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded border"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? 'Creating...' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Tag Modal */}
        {showEditModal && editingTag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${modalBg} p-6 rounded-lg w-full max-w-md mx-4`}>
              <h2 className={`text-xl font-bold ${textMain} mb-4`}>Edit Tag</h2>
              <form onSubmit={handleUpdateTag} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Tag Name</label>
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Description</label>
                  <textarea
                    value={editingTag.description}
                    onChange={(e) => setEditingTag(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Category</label>
                  <select
                    value={editingTag.category}
                    onChange={(e) => setEditingTag(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {tagCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Color</label>
                  <div className="flex gap-2 mb-2">
                    {colorPresets.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingTag(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${editingTag.color === color ? 'border-gray-400' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={editingTag.color}
                    onChange={(e) => setEditingTag(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 rounded border"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTag(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? 'Updating...' : 'Update Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManagement;