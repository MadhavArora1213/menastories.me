import api from '../../services/api';

// Tag Services
export const tagService = {
  // Get all tags
  getAllTags: () => {
    return api.get('/tags');
  },

  // Get tag by ID
  getTag: (id) => {
    return api.get(`/tags/${id}`);
  },

  // Create new tag
  createTag: (data) => {
    return api.post('/tags', data);
  },

  // Update tag
  updateTag: (id, data) => {
    return api.put(`/tags/${id}`, data);
  },

  // Delete tag
  deleteTag: (id) => {
    return api.delete(`/tags/${id}`);
  },

  // Force delete tag (permanent)
  forceDeleteTag: (id) => {
    return api.delete(`/tags/${id}/force`);
  },

  // Get tags by type
  getTagsByType: (type) => {
    return api.get(`/tags/type/${type}`);
  },

  // Add tags to content
  addTagsToContent: (contentId, contentType, tagIds) => {
    return api.post('/tags/content', { contentId, contentType, tagIds });
  },

  // Remove tag from content
  removeTagFromContent: (contentId, contentType, tagId) => {
    return api.delete('/tags/content', { data: { contentId, contentType, tagId } });
  },

  // Get content by tag
  getContentByTag: (tagSlug, params = {}) => {
    return api.get(`/tags/${tagSlug}/content`, { params });
  }
};

// Export as default for backward compatibility
export default tagService;
