import api from './api';

const API_BASE = '/api/videos';

// Video Article Services
export const videoService = {
  // Get video articles with filtering and pagination
  async getVideoArticles(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/articles`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video articles:', error);
      throw error;
    }
  },

  // Get single video article by ID
  async getVideoArticleById(id) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video article:', error);
      throw error;
    }
  },

  // Get single video article by slug (for public access)
  async getVideoArticleBySlug(slug) {
    try {
      const response = await api.get(`/public/videos/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video article by slug:', error);
      throw error;
    }
  },

  // Create new video article
  async createVideoArticle(videoData) {
    try {
      const response = await api.post(`${API_BASE}/articles`, videoData);
      return response.data;
    } catch (error) {
      console.error('Failed to create video article:', error);
      throw error;
    }
  },

  // Update video article
  async updateVideoArticle(id, updateData) {
    try {
      const response = await api.put(`${API_BASE}/articles/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update video article:', error);
      throw error;
    }
  },

  // Delete video article
  async deleteVideoArticle(id) {
    try {
      const response = await api.delete(`${API_BASE}/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete video article:', error);
      throw error;
    }
  },

  // Upload video file
  async uploadVideo(formData, onUploadProgress) {
    try {
      const response = await api.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    }
  },

  // Get related videos
  async getRelatedVideos(id, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/related`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch related videos:', error);
      throw error;
    }
  },

  // Generate video transcript
  async generateTranscript(id) {
    try {
      const response = await api.post(`${API_BASE}/articles/${id}/transcribe`);
      return response.data;
    } catch (error) {
      console.error('Failed to generate transcript:', error);
      throw error;
    }
  },

  // Track video analytics event
  async trackVideoEvent(id, eventData) {
    try {
      const response = await api.post(`${API_BASE}/articles/${id}/analytics`, eventData);
      return response.data;
    } catch (error) {
      console.error('Failed to track video event:', error);
      // Don't throw error for analytics tracking failures
      return null;
    }
  },

  // Get video analytics
  async getVideoAnalytics(id, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video analytics:', error);
      throw error;
    }
  },

  // Video Comments
  async getVideoComments(slug, params = {}) {
    try {
      const response = await api.get(`/public/videos/${slug}/comments`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video comments:', error);
      throw error;
    }
  },

  async createVideoComment(slug, commentData) {
    try {
      const response = await api.post(`/public/videos/${slug}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create video comment:', error);
      throw error;
    }
  },

  async updateVideoComment(commentId, updateData) {
    try {
      const response = await api.put(`/api/comments/${commentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update video comment:', error);
      throw error;
    }
  },

  async deleteVideoComment(commentId) {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete video comment:', error);
      throw error;
    }
  },

  // Video Playlists
  async getVideoPlaylists(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/playlists`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video playlists:', error);
      throw error;
    }
  },

  async getVideoPlaylistById(id) {
    try {
      const response = await api.get(`${API_BASE}/playlists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video playlist:', error);
      throw error;
    }
  },

  async createVideoPlaylist(playlistData) {
    try {
      const response = await api.post(`${API_BASE}/playlists`, playlistData);
      return response.data;
    } catch (error) {
      console.error('Failed to create video playlist:', error);
      throw error;
    }
  },

  async updateVideoPlaylist(id, updateData) {
    try {
      const response = await api.put(`${API_BASE}/playlists/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update video playlist:', error);
      throw error;
    }
  },

  async deleteVideoPlaylist(id) {
    try {
      const response = await api.delete(`${API_BASE}/playlists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete video playlist:', error);
      throw error;
    }
  },

  // Video Search
  async searchVideos(query, filters = {}) {
    try {
      const response = await api.get(`${API_BASE}/search`, {
        params: { search: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search videos:', error);
      throw error;
    }
  },

  // Video Categories and Tags
  async getVideoCategories() {
    try {
      const response = await api.get(`${API_BASE}/categories`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video categories:', error);
      throw error;
    }
  },

  async getVideoTags() {
    try {
      const response = await api.get(`${API_BASE}/tags`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video tags:', error);
      throw error;
    }
  },

  // Video Statistics
  async getVideoStats() {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video statistics:', error);
      throw error;
    }
  },

  // Video Recommendations
  async getVideoRecommendations(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/recommendations`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video recommendations:', error);
      throw error;
    }
  },

  // Video Quality and Streaming
  async getVideoQualities(id) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/qualities`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video qualities:', error);
      throw error;
    }
  },

  async getVideoStream(id, quality) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/stream/${quality}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video stream:', error);
      throw error;
    }
  },

  // Video Thumbnails
  async getVideoThumbnail(id) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/thumbnail`);
      return response.data;
    } catch (error) {
      console.error('Failed to get video thumbnail:', error);
      throw error;
    }
  },

  // Video Chapters
  async getVideoChapters(id) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/chapters`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video chapters:', error);
      throw error;
    }
  },

  async createVideoChapters(id, chapters) {
    try {
      const response = await api.post(`${API_BASE}/articles/${id}/chapters`, { chapters });
      return response.data;
    } catch (error) {
      console.error('Failed to create video chapters:', error);
      throw error;
    }
  },

  // Video Sharing
  async shareVideo(id, shareData) {
    try {
      const response = await api.post(`${API_BASE}/articles/${id}/share`, shareData);
      return response.data;
    } catch (error) {
      console.error('Failed to share video:', error);
      throw error;
    }
  },

  // Video Embedding
  async getVideoEmbedCode(id, options = {}) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/embed`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Failed to get embed code:', error);
      throw error;
    }
  },

  // Video Downloads (Premium)
  async downloadVideo(id) {
    try {
      const response = await api.get(`${API_BASE}/articles/${id}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to download video:', error);
      throw error;
    }
  },

  // Bulk Operations
  async bulkUpdateVideos(videoIds, updateData) {
    try {
      const response = await api.post(`${API_BASE}/bulk`, {
        videoIds,
        updateData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update videos:', error);
      throw error;
    }
  },

  async bulkDeleteVideos(videoIds) {
    try {
      const response = await api.delete(`${API_BASE}/bulk`, {
        data: { videoIds }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete videos:', error);
      throw error;
    }
  },

  // Video Reports (Admin)
  async getVideoViewReports(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/reports/views`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video view reports:', error);
      throw error;
    }
  },

  async getVideoEngagementReports(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/reports/engagement`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch video engagement reports:', error);
      throw error;
    }
  },

  // Utility functions
  formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getVideoTypeInfo(type) {
    const typeInfo = {
      interviews: {
        label: 'Interviews',
        description: 'Celebrity interviews, business leader talks, expert opinions',
        icon: '🎤',
        color: 'bg-blue-100 text-blue-800'
      },
      documentaries: {
        label: 'Documentaries',
        description: 'Feature documentaries, mini docs, investigations',
        icon: '🎬',
        color: 'bg-green-100 text-green-800'
      },
      news: {
        label: 'News',
        description: 'Breaking news, news analysis, live coverage',
        icon: '📰',
        color: 'bg-red-100 text-red-800'
      },
      entertainment: {
        label: 'Entertainment',
        description: 'Movie reviews, music videos, red carpet coverage',
        icon: '🎭',
        color: 'bg-purple-100 text-purple-800'
      },
      lifestyle: {
        label: 'Lifestyle',
        description: 'Tutorial videos, how-to guides, product reviews',
        icon: '💄',
        color: 'bg-pink-100 text-pink-800'
      },
      events: {
        label: 'Events',
        description: 'Event highlights, conference coverage, behind the scenes',
        icon: '📅',
        color: 'bg-orange-100 text-orange-800'
      },
      original: {
        label: 'Original',
        description: 'Original series, web shows, video podcasts',
        icon: '🎪',
        color: 'bg-indigo-100 text-indigo-800'
      },
      tutorials: {
        label: 'Tutorials',
        description: 'Educational content, step-by-step guides',
        icon: '📚',
        color: 'bg-teal-100 text-teal-800'
      },
      reviews: {
        label: 'Reviews',
        description: 'Product reviews, service evaluations',
        icon: '⭐',
        color: 'bg-yellow-100 text-yellow-800'
      }
    };

    return typeInfo[type] || {
      label: 'General',
      description: 'General video content',
      icon: '🎥',
      color: 'bg-gray-100 text-gray-800'
    };
  },

  getQualityOptions() {
    return [
      { value: '240p', label: '240p', description: 'Low quality, fast loading' },
      { value: '360p', label: '360p', description: 'Standard quality' },
      { value: '480p', label: '480p', description: 'Good quality' },
      { value: '720p', label: '720p HD', description: 'High definition' },
      { value: '1080p', label: '1080p Full HD', description: 'Full high definition' },
      { value: '1440p', label: '1440p 2K', description: '2K resolution' },
      { value: '2160p', label: '2160p 4K', description: '4K ultra high definition' }
    ];
  },

  getPlaybackRates() {
    return [
      { value: 0.25, label: '0.25x' },
      { value: 0.5, label: '0.5x' },
      { value: 0.75, label: '0.75x' },
      { value: 1, label: 'Normal' },
      { value: 1.25, label: '1.25x' },
      { value: 1.5, label: '1.5x' },
      { value: 1.75, label: '1.75x' },
      { value: 2, label: '2x' }
    ];
  },

  // Helper method to determine if content is a video article
  isVideoArticle(contentType, url) {
    return contentType === 'video' || url?.includes('/videos/');
  },

  // Universal comment methods that work for both articles and videos
  async getComments(slug, isVideo = false, params = {}) {
    try {
      const endpoint = isVideo ? `/public/videos/${slug}/comments` : `/public/articles/${slug}/comments`;
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw error;
    }
  },

  async createComment(slug, commentData, isVideo = false) {
    try {
      const endpoint = isVideo ? `/public/videos/${slug}/comments` : `/public/articles/${slug}/comments`;
      const response = await api.post(endpoint, commentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  },
};

export default videoService;