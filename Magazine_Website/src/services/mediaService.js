import api from './api';

const API_BASE = '/media';

export const mediaService = {
  // Get media files with filtering and pagination
  async getMedia(params = {}) {
    try {
      const response = await api.get(`${API_BASE}`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media:', error);
      throw error;
    }
  },

  // Get single media by ID
  async getMediaById(id) {
    try {
      const response = await api.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media:', error);
      throw error;
    }
  },

  // Upload media files
  async uploadMedia(formData, onUploadProgress) {
    try {
      const response = await api.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  },

  // Update media metadata
  async updateMedia(id, data) {
    try {
      const response = await api.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update media:', error);
      throw error;
    }
  },

  // Delete media
  async deleteMedia(id) {
    try {
      const response = await api.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  },

  // Move media to folder
  async moveMedia(id, folderId) {
    try {
      const response = await api.put(`${API_BASE}/${id}/move`, { folderId });
      return response.data;
    } catch (error) {
      console.error('Failed to move media:', error);
      throw error;
    }
  },

  // Copy media to folder
  async copyMedia(id, folderId) {
    try {
      const response = await api.post(`${API_BASE}/${id}/copy`, { folderId });
      return response.data;
    } catch (error) {
      console.error('Failed to copy media:', error);
      throw error;
    }
  },

  // Get folders
  async getFolders() {
    try {
      const response = await api.get(`${API_BASE}/folders`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      throw error;
    }
  },

  // Get folder tree structure
  async getFolderTree() {
    try {
      const response = await api.get(`${API_BASE}/folders/tree`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch folder tree:', error);
      throw error;
    }
  },

  // Create folder
  async createFolder(data) {
    try {
      const response = await api.post(`${API_BASE}/folders`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  },

  // Update folder
  async updateFolder(id, data) {
    try {
      const response = await api.put(`${API_BASE}/folders/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  },

  // Delete folder
  async deleteFolder(id) {
    try {
      const response = await api.delete(`${API_BASE}/folders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  },

  // Get media usage information
  async getMediaUsage(id) {
    try {
      const response = await api.get(`${API_BASE}/${id}/usage`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media usage:', error);
      throw error;
    }
  },

  // Get media edit history
  async getMediaHistory(id) {
    try {
      const response = await api.get(`${API_BASE}/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media history:', error);
      throw error;
    }
  },

  // Optimize media
  async optimizeMedia(id, settings) {
    try {
      const response = await api.post(`${API_BASE}/${id}/optimize`, settings);
      return response.data;
    } catch (error) {
      console.error('Failed to optimize media:', error);
      throw error;
    }
  },

  // Generate thumbnail
  async generateThumbnail(id, options = {}) {
    try {
      const response = await api.post(`${API_BASE}/${id}/thumbnail`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateMedia(mediaIds, data) {
    try {
      const response = await api.put(`${API_BASE}/bulk`, {
        mediaIds,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update media:', error);
      throw error;
    }
  },

  async bulkDeleteMedia(mediaIds) {
    try {
      const response = await api.delete(`${API_BASE}/bulk`, {
        data: { mediaIds }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete media:', error);
      throw error;
    }
  },

  async bulkMoveMedia(mediaIds, folderId) {
    try {
      const response = await api.put(`${API_BASE}/bulk/move`, {
        mediaIds,
        folderId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk move media:', error);
      throw error;
    }
  },

  async downloadBulkMedia(mediaIds) {
    try {
      const response = await api.post(`${API_BASE}/bulk/download`, {
        mediaIds
      }, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to download bulk media:', error);
      throw error;
    }
  },

  // Search media
  async searchMedia(query, filters = {}) {
    try {
      const response = await api.get(`${API_BASE}/search`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search media:', error);
      throw error;
    }
  },

  // Get media statistics
  async getMediaStats() {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media statistics:', error);
      throw error;
    }
  },

  // Get recent media
  async getRecentMedia(limit = 10) {
    try {
      const response = await api.get(`${API_BASE}/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent media:', error);
      throw error;
    }
  },

  // Get media by type
  async getMediaByType(type, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/type/${type}`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media by type:', error);
      throw error;
    }
  },

  // Duplicate media
  async duplicateMedia(id) {
    try {
      const response = await api.post(`${API_BASE}/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Failed to duplicate media:', error);
      throw error;
    }
  },

  // Get media variants (different sizes/formats)
  async getMediaVariants(id) {
    try {
      const response = await api.get(`${API_BASE}/${id}/variants`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch media variants:', error);
      throw error;
    }
  },

  // Create media variant
  async createMediaVariant(id, options) {
    try {
      const response = await api.post(`${API_BASE}/${id}/variants`, options);
      return response.data;
    } catch (error) {
      console.error('Failed to create media variant:', error);
      throw error;
    }
  },

  // Replace media file (keep same metadata)
  async replaceMedia(id, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.put(`${API_BASE}/${id}/replace`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to replace media:', error);
      throw error;
    }
  },

  // Get media embed code
  async getEmbedCode(id, options = {}) {
    try {
      const response = await api.get(`${API_BASE}/${id}/embed`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Failed to get embed code:', error);
      throw error;
    }
  },

  // Track media access/view
  async trackMediaAccess(id) {
    try {
      const response = await api.post(`${API_BASE}/${id}/track`);
      return response.data;
    } catch (error) {
      console.error('Failed to track media access:', error);
      // Don't throw error for tracking failures
      return null;
    }
  },

  // Get media access logs
  async getMediaAccessLogs(id, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/${id}/access-logs`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
      throw error;
    }
  },

  // Upload from URL
  async uploadFromUrl(url, metadata = {}) {
    try {
      const response = await api.post(`${API_BASE}/upload-from-url`, {
        url,
        ...metadata
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload from URL:', error);
      throw error;
    }
  },

  // Get upload progress
  async getUploadProgress(uploadId) {
    try {
      const response = await api.get(`${API_BASE}/upload/${uploadId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Failed to get upload progress:', error);
      throw error;
    }
  },

  // Cancel upload
  async cancelUpload(uploadId) {
    try {
      const response = await api.delete(`${API_BASE}/upload/${uploadId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel upload:', error);
      throw error;
    }
  }
};

export default mediaService;