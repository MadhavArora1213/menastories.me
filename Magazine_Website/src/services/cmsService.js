import api from './api';

// Use the existing api instance instead of creating a new one
const cmsAPI = api;

// Article Services
export const articleService = {
  // Get all articles with filters
  getArticles: (params = {}) => cmsAPI.get('/articles', { params }),

  // Get single article
  getArticle: (id) => cmsAPI.get(`/articles/${id}`),

  // Create article
  createArticle: (data) => cmsAPI.post('/articles', data),

  // Update article
  updateArticle: (id, data) => cmsAPI.put(`/articles/${id}`, data),

  // Delete article
  deleteArticle: (id) => cmsAPI.delete(`/articles/${id}`),

  // Change article status
  changeStatus: (id, status) => cmsAPI.patch(`/articles/${id}/status`, { status }),

  // Submit for review
  submitForReview: (id) => cmsAPI.post(`/articles/${id}/submit-review`),

  // Approve article
  approveArticle: (id, comment) => cmsAPI.post(`/articles/${id}/approve`, { comment }),

  // Request revisions
  requestRevisions: (id, comment, dueDate) => cmsAPI.post(`/articles/${id}/request-revisions`, { comment, dueDate }),

  // Get article history
  getHistory: (id) => cmsAPI.get(`/articles/${id}/history`),

  // Schedule article
  scheduleArticle: (id, data) => cmsAPI.post(`/articles/${id}/schedule`, data),

  // Cancel schedule
  cancelSchedule: (id) => cmsAPI.post(`/articles/${id}/cancel-schedule`),

  // Publish now
  publishNow: (id) => cmsAPI.post(`/articles/${id}/publish-now`)
};

// Category Services
export const categoryService = {
  // Get all categories
  getCategories: (params = {}) => cmsAPI.get('/categories', { params }),

  // Get single category
  getCategory: (id) => cmsAPI.get(`/categories/${id}`),

  // Create category
  createCategory: (data) => {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return cmsAPI.post('/categories', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return cmsAPI.post('/categories', data);
  },

  // Update category
  updateCategory: (id, data) => cmsAPI.put(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id) => cmsAPI.delete(`/categories/${id}`),

  // Get category tree
  getCategoryTree: () => cmsAPI.get('/categories/tree'),

  // Reorder categories
  reorderCategories: (data) => cmsAPI.post('/categories/reorder', data),

  // Toggle category status
  toggleCategoryStatus: (id) => cmsAPI.patch(`/categories/${id}/status`, {}),

  // Update category design
  updateCategoryDesign: (id, design) => cmsAPI.patch(`/categories/${id}/design`, { design }),

  // Get all categories (alias for backward compatibility)
  getAllCategories: () => cmsAPI.get('/categories'),

  // Get category by ID (alias for backward compatibility)
  getCategoryById: (id) => cmsAPI.get(`/categories/${id}`)
};

// Tag Services
export const tagService = {
  // Get all tags
  getTags: (params = {}) => {
    return cmsAPI.get('/tags', { params }).then(response => {
      // Handle different response formats
      if (response && response.tags) {
        // Backend returns { tags: [...] }
        return { ...response, data: response.tags };
      } else if (response && response.data) {
        // Backend returns { data: [...] }
        return response;
      } else if (Array.isArray(response)) {
        // Backend returns array directly
        return { data: response };
      }
      return response;
    }).catch(error => {
      console.error('Error in getTags:', error);
      throw error;
    });
  },

  // Get single tag
  getTag: (id) => {
    return cmsAPI.get(`/tags/${id}`).then(response => {
      // Handle different response formats
      if (response && response.tag) {
        return { ...response, data: response.tag };
      } else if (response && response.data) {
        return response;
      }
      return response;
    }).catch(error => {
      console.error('Error in getTag:', error);
      throw error;
    });
  },

  // Create tag
  createTag: (data) => {
    return cmsAPI.post('/tags', data).then(response => {
      // Handle different response formats
      if (response && response.tag) {
        return { ...response, data: response.tag };
      } else if (response && response.data) {
        return response;
      }
      return response;
    }).catch(error => {
      console.error('Error in createTag:', error);
      throw error;
    });
  },

  // Update tag
  updateTag: (id, data) => {
    return cmsAPI.put(`/tags/${id}`, data).then(response => {
      // Handle different response formats
      if (response && response.tag) {
        return { ...response, data: response.tag };
      } else if (response && response.data) {
        return response;
      }
      return response;
    }).catch(error => {
      console.error('Error in updateTag:', error);
      throw error;
    });
  },

  // Delete tag
  deleteTag: (id) => cmsAPI.delete(`/tags/${id}`),

  // Get popular tags
  getPopularTags: () => cmsAPI.get('/tags/popular'),

  // Search tags
  searchTags: (query) => cmsAPI.get(`/tags/search?q=${encodeURIComponent(query)}`)
};

// Media Services
export const mediaService = {
  // Get media files
  getMedia: (params = {}) => cmsAPI.get('/media', { params }),

  // Upload media
  uploadMedia: (formData, onProgress) => {
    return cmsAPI.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  },

  // Delete media
  deleteMedia: (id) => cmsAPI.delete(`/media/${id}`),

  // Update media info
  updateMedia: (id, data) => cmsAPI.put(`/media/${id}`, data),

  // Create folder
  createFolder: (data) => cmsAPI.post('/media/folders', data),

  // Get folders
  getFolders: () => cmsAPI.get('/media/folders')
};

// Workflow Services
export const workflowService = {
  // Get assignments
  getAssignments: () => cmsAPI.get('/workflow/assignments'),

  // Assign editor
  assignEditor: (data) => cmsAPI.post('/workflow/assign-editor', data),

  // Add comment
  addComment: (data) => cmsAPI.post('/workflow/comment', data),

  // Get workflow stats
  getStats: () => cmsAPI.get('/workflow/stats'),

  // Get editorial calendar
  getEditorialCalendar: (params = {}) => cmsAPI.get('/workflow/calendar', { params })
};

// Dashboard Services
export const dashboardService = {
  // Get dashboard stats
  getStats: () => cmsAPI.get('/cms/dashboard/stats'),

  // Get recent activity
  getRecentActivity: (limit = 10) => cmsAPI.get(`/cms/dashboard/activity?limit=${limit}`),

  // Get analytics data
  getAnalytics: (params = {}) => cmsAPI.get('/cms/dashboard/analytics', { params }),

  // Get content performance
  getContentPerformance: (params = {}) => cmsAPI.get('/cms/dashboard/performance', { params })
};

// Search Services
export const searchService = {
  // Global search
  globalSearch: (query, filters = {}) => cmsAPI.get('/search', {
    params: { q: query, ...filters }
  }),

  // Search articles
  searchArticles: (query, filters = {}) => cmsAPI.get('/search/articles', {
    params: { q: query, ...filters }
  }),

  // Search suggestions
  getSuggestions: (query) => cmsAPI.get(`/search/suggestions?q=${encodeURIComponent(query)}`)
};

// Export Services
export const exportService = {
  // Export articles
  exportArticles: (format, filters = {}) => cmsAPI.get('/export/articles', {
    params: { format, ...filters },
    responseType: 'blob'
  }),

  // Export analytics
  exportAnalytics: (format, params = {}) => cmsAPI.get('/export/analytics', {
    params: { format, ...params },
    responseType: 'blob'
  })
};

// Backup Services
export const backupService = {
  // Create backup
  createBackup: () => cmsAPI.post('/backup/create'),

  // Get backup list
  getBackups: () => cmsAPI.get('/backup/list'),

  // Restore backup
  restoreBackup: (backupId) => cmsAPI.post(`/backup/restore/${backupId}`),

  // Delete backup
  deleteBackup: (backupId) => cmsAPI.delete(`/backup/${backupId}`)
};

// Event Services
export const eventService = {
  // Get all events with filters
  getEvents: (params = {}) => cmsAPI.get('/events', { params }),

  // Get single event
  getEvent: (id) => cmsAPI.get(`/events/${id}`),

  // Create event
  createEvent: (data) => cmsAPI.post('/events/create', data),

  // Update event
  updateEvent: (id, data) => cmsAPI.put(`/events/${id}`, data),

  // Delete event
  deleteEvent: (id) => cmsAPI.delete(`/events/${id}`),

  // Get upcoming events
  getUpcomingEvents: (params = {}) => cmsAPI.get('/events/upcoming', { params }),

  // Get featured events
  getFeaturedEvents: (params = {}) => cmsAPI.get('/events/featured', { params }),

  // Search events
  searchEvents: (query, params = {}) => cmsAPI.get('/events/search', {
    params: { q: query, ...params }
  }),

  // Get event calendar
  getEventCalendar: (params = {}) => cmsAPI.get('/events/calendar', { params }),

  // Get event categories
  getEventCategories: () => cmsAPI.get('/events/categories'),

  // Get event types
  getEventTypes: () => cmsAPI.get('/events/types'),

  // Get event stats
  getEventStats: () => cmsAPI.get('/events/stats'),

  // Publish event
  publishEvent: (id) => cmsAPI.post(`/events/${id}/publish`),

  // Unpublish event
  unpublishEvent: (id) => cmsAPI.post(`/events/${id}/unpublish`),

  // Get all events (admin)
  getAllEvents: (params = {}) => cmsAPI.get('/events/admin/all', { params }),

  // Bulk operations
  bulkPublishEvents: (eventIds) => cmsAPI.post('/events/bulk/publish', { eventIds }),
  bulkUnpublishEvents: (eventIds) => cmsAPI.post('/events/bulk/unpublish', { eventIds }),
  bulkDeleteEvents: (eventIds) => cmsAPI.delete('/events/bulk/delete', { data: { eventIds } }),

  // Analytics
  getEventAnalytics: (id) => cmsAPI.get(`/events/${id}/analytics`),
  getEventsAnalytics: () => cmsAPI.get('/events/analytics/overview')
};

// Settings Services
export const settingsService = {
  // Get CMS settings
  getSettings: () => cmsAPI.get('/cms/settings'),

  // Update settings
  updateSettings: (data) => cmsAPI.put('/cms/settings', data),

  // Get SEO settings
  getSEOSettings: () => cmsAPI.get('/cms/settings/seo'),

  // Update SEO settings
  updateSEOSettings: (data) => cmsAPI.put('/cms/settings/seo', data)
};

// Helper functions for common operations
export const cmsHelpers = {
  // Format date for display
  formatDate: (date, options = {}) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  },
  
  // Format date and time
  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Generate slug from title
  generateSlug: (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Truncate text
  truncateText: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  },
  
  // Calculate reading time
  calculateReadingTime: (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },
  
  // Get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },
  
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Validate image file
  isImageFile: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },
  
  // Validate video file
  isVideoFile: (file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type);
  }
};

export default {
  article: articleService,
  category: categoryService,
  tag: tagService,
  media: mediaService,
  event: eventService,
  workflow: workflowService,
  dashboard: dashboardService,
  search: searchService,
  export: exportService,
  backup: backupService,
  settings: settingsService,
  helpers: cmsHelpers
};