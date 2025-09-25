import api from './api';

const API_BASE = '/flipbook';

// Flipbook Magazine Services
export const flipbookService = {

  // Get magazines with filtering and pagination
  async getFlipbookMagazines(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/magazines`, { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      console.error('Failed to fetch flipbook magazines:', errorMessage);
      throw error;
    }
  },

  // Get single magazine by ID
  async getFlipbookMagazineById(id) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch flipbook magazine:', error);
      throw error;
    }
  },

  // Create new magazine
  async createFlipbookMagazine(magazineData) {
    try {
      const response = await api.post(`${API_BASE}/magazines`, magazineData);
      return response.data;
    } catch (error) {
      console.error('Failed to create flipbook magazine:', error);
      throw error;
    }
  },

  // Update magazine
  async updateFlipbookMagazine(id, updateData, file = null) {
    try {
      let response;
      if (file) {
        // Create FormData for file upload
        const formData = new FormData();

        // Add all update data to FormData
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== null && updateData[key] !== undefined) {
            formData.append(key, updateData[key]);
          }
        });

        // Add file
        formData.append('flipbook', file);

        response = await api.put(`${API_BASE}/magazines/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.put(`${API_BASE}/magazines/${id}`, updateData);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update flipbook magazine:', error);
      throw error;
    }
  },

  // Delete magazine
  async deleteFlipbookMagazine(id) {
    try {
      const response = await api.delete(`${API_BASE}/magazines/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete flipbook magazine:', error);
      throw error;
    }
  },

  // Upload magazine PDF
  async uploadFlipbook(formData, onUploadProgress) {
    try {
      const response = await api.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload flipbook:', error);
      throw error;
    }
  },

  // Get magazine pages
  async getFlipbookPages(id, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${id}/pages`, { params });
      const data = response.data;

      // Convert file paths to URLs for all pages
      if (data.pages) {
        data.pages = data.pages.map(page => ({
          ...page,
          imageUrl: page.imagePath ? `${API_BASE}/magazines/${id}/pages/${page.pageNumber}/image` : null,
          thumbnailUrl: page.thumbnailPath ? `${API_BASE}/magazines/${id}/pages/${page.pageNumber}/thumbnail` : null
        }));
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch flipbook pages:', error);
      throw error;
    }
  },

  // Get single page
  async getFlipbookPage(id, pageNumber) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${id}/pages/${pageNumber}`);
      const page = response.data.page;

      // Convert file paths to URLs
      if (page) {
        page.imageUrl = page.imagePath ? `${API_BASE}/magazines/${id}/pages/${pageNumber}/image` : null;
        page.thumbnailUrl = page.thumbnailPath ? `${API_BASE}/magazines/${id}/pages/${pageNumber}/thumbnail` : null;
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch flipbook page:', error);
      throw error;
    }
  },

  // Get table of contents
  async getTableOfContents(id) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${id}/toc`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch table of contents:', error);
      throw error;
    }
  },

  // Update table of contents
  async updateTableOfContents(id, tocData) {
    try {
      const response = await api.put(`${API_BASE}/magazines/${id}/toc`, tocData);
      return response.data;
    } catch (error) {
      console.error('Failed to update table of contents:', error);
      throw error;
    }
  },

  // Search within magazine
  async searchInMagazine(id, query, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/search`, {
        params: { id, q: query, ...params }
      });
      const data = response.data;

      // Convert file paths to URLs for search results
      if (data.searchResults) {
        data.searchResults = data.searchResults.map(page => ({
          ...page,
          imageUrl: page.imagePath ? `${API_BASE}/magazines/${id}/pages/${page.pageNumber}/image` : null,
          thumbnailUrl: page.thumbnailPath ? `${API_BASE}/magazines/${id}/pages/${page.pageNumber}/thumbnail` : null
        }));
      }

      return data;
    } catch (error) {
      console.error('Failed to search in magazine:', error);
      throw error;
    }
  },

  // Analytics
  async getFlipbookAnalytics(id, params = {}) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${id}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch flipbook analytics:', error);
      throw error;
    }
  },

  // Bookmarks
  async addBookmark(magazineId, pageNumber) {
    try {
      const response = await api.post(`${API_BASE}/magazines/${magazineId}/bookmark`, {
        pageNumber
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },

  async removeBookmark(magazineId, pageNumber) {
    try {
      const response = await api.delete(`${API_BASE}/magazines/${magazineId}/bookmark`, {
        data: { pageNumber }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  },

  async getBookmarks(magazineId) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${magazineId}/bookmarks`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      throw error;
    }
  },

  // Reading Progress
  async updateReadingProgress(magazineId, progressData) {
    try {
      const response = await api.post(`${API_BASE}/magazines/${magazineId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Failed to update reading progress:', error);
      throw error;
    }
  },

  async getReadingProgress(magazineId) {
    try {
      const response = await api.get(`${API_BASE}/magazines/${magazineId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reading progress:', error);
      throw error;
    }
  },

  // Annotations
  async addAnnotation(magazineId, pageNumber, annotationData) {
    try {
      const response = await api.post(
        `${API_BASE}/magazines/${magazineId}/pages/${pageNumber}/annotations`,
        annotationData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add annotation:', error);
      throw error;
    }
  },

  async getAnnotations(magazineId, pageNumber) {
    try {
      const response = await api.get(
        `${API_BASE}/magazines/${magazineId}/pages/${pageNumber}/annotations`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      throw error;
    }
  },

  async deleteAnnotation(annotationId) {
    try {
      const response = await api.delete(`${API_BASE}/annotations/${annotationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      throw error;
    }
  },

  // Sharing
  async shareMagazine(magazineId, shareData) {
    try {
      const response = await api.post(`${API_BASE}/magazines/${magazineId}/share`, shareData);
      return response.data;
    } catch (error) {
      console.error('Failed to share magazine:', error);
      throw error;
    }
  },

  // Downloads
  async downloadMagazine(magazineId) {
    try {
      const response = await api.get(`${API_BASE}/download/${magazineId}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Failed to download magazine:', error);
      throw error;
    }
  },

  async downloadPage(magazineId, pageNumber) {
    try {
      const response = await api.get(
        `${API_BASE}/magazines/${magazineId}/pages/${pageNumber}/download`,
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('Failed to download page:', error);
      throw error;
    }
  },

  // Download helper with automatic filename
  async downloadMagazineWithFilename(magazineId, magazineTitle) {
    try {
      const response = await this.downloadMagazine(magazineId);
      const filename = `${magazineTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      this.downloadBlob(response.data, filename);
      return true;
    } catch (error) {
      console.error('Failed to download magazine with filename:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateMagazines(updateData) {
    try {
      const response = await api.put(`${API_BASE}/bulk`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update magazines:', error);
      throw error;
    }
  },

  async bulkDeleteMagazines(magazineIds) {
    try {
      const response = await api.delete(`${API_BASE}/bulk`, {
        data: { magazineIds }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete magazines:', error);
      throw error;
    }
  },

  // Statistics and reports
  async getFlipbookStats(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/stats`, { params });
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      console.error('Failed to fetch flipbook statistics:', errorMessage);
      throw error;
    }
  },

  async getPopularMagazines(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/reports/popular`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch popular magazines:', error);
      throw error;
    }
  },

  async getEngagementReports(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/reports/engagement`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch engagement reports:', error);
      throw error;
    }
  },

  // Categories and tags
  async getCategories() {
    try {
      const response = await api.get(`${API_BASE}/categories`);
      return response.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      console.error('Failed to fetch categories:', errorMessage);
      throw error;
    }
  },

  async getTags() {
    try {
      const response = await api.get(`${API_BASE}/tags`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      throw error;
    }
  },

  // Archive and collections
  async getArchive(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/archive`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch archive:', error);
      throw error;
    }
  },

  async getCollections(params = {}) {
    try {
      const response = await api.get(`${API_BASE}/collections`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      throw error;
    }
  },

  // Reprocess magazines with 0 pages
  async reprocessZeroPageMagazines() {
    try {
      const response = await api.post(`${API_BASE}/reprocess-zero-pages`);
      return response.data;
    } catch (error) {
      console.error('Failed to reprocess zero page magazines:', error);
      throw error;
    }
  },

  // Identify corrupted PDFs
  async identifyCorruptedPDFs() {
    try {
      const response = await api.get(`${API_BASE}/identify-corrupted`);
      return response.data;
    } catch (error) {
      console.error('Failed to identify corrupted PDFs:', error);
      throw error;
    }
  },

  // Fix file paths for all magazines
  async fixFilePaths() {
    try {
      const response = await api.post(`${API_BASE}/fix-file-paths`);
      return response.data;
    } catch (error) {
      console.error('Failed to fix file paths:', error);
      throw error;
    }
  },

  // Regenerate corrupted PDFs
  async regeneratePDFs() {
    try {
      const response = await api.post(`${API_BASE}/regenerate-pdfs`);
      return response.data;
    } catch (error) {
      console.error('Failed to regenerate PDFs:', error);
      throw error;
    }
  },

  // Utility functions
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getMagazineTypeInfo(type) {
    const typeInfo = {
      monthly: {
        label: 'Monthly',
        description: 'Regular monthly publications',
        icon: '📅',
        color: 'bg-blue-100 text-blue-800'
      },
      special: {
        label: 'Special Edition',
        description: 'Special edition magazines',
        icon: '⭐',
        color: 'bg-purple-100 text-purple-800'
      },
      annual: {
        label: 'Annual',
        description: 'Annual publications and yearbooks',
        icon: '📚',
        color: 'bg-green-100 text-green-800'
      },
      digital_only: {
        label: 'Digital Only',
        description: 'Digital-exclusive content',
        icon: '💻',
        color: 'bg-indigo-100 text-indigo-800'
      },
      print_digital: {
        label: 'Print + Digital',
        description: 'Available in both print and digital',
        icon: '📖',
        color: 'bg-orange-100 text-orange-800'
      },
      interactive: {
        label: 'Interactive',
        description: 'Interactive digital magazines',
        icon: '🎮',
        color: 'bg-pink-100 text-pink-800'
      }
    };

    return typeInfo[type] || {
      label: 'General',
      description: 'General magazine content',
      icon: '📄',
      color: 'bg-gray-100 text-gray-800'
    };
  },

  getAccessTypeInfo(type) {
    const accessInfo = {
      free: {
        label: 'Free Access',
        description: 'Available to all users',
        icon: '🆓',
        color: 'bg-green-100 text-green-800'
      },
      subscriber: {
        label: 'Subscriber Only',
        description: 'Requires active subscription',
        icon: '💳',
        color: 'bg-blue-100 text-blue-800'
      },
      premium: {
        label: 'Premium',
        description: 'Premium content access',
        icon: '💎',
        color: 'bg-purple-100 text-purple-800'
      },
      paid: {
        label: 'Paid',
        description: 'One-time purchase required',
        icon: '💰',
        color: 'bg-yellow-100 text-yellow-800'
      }
    };

    return accessInfo[type] || accessInfo.free;
  },

  getCategoryInfo(category) {
    const categoryInfo = {
      people_profiles: {
        label: 'People & Profiles',
        description: 'Celebrity interviews, biographies, profiles',
        icon: '👥',
        color: 'bg-pink-100 text-pink-800'
      },
      entertainment: {
        label: 'Entertainment',
        description: 'Movies, music, TV, pop culture',
        icon: '🎬',
        color: 'bg-purple-100 text-purple-800'
      },
      lifestyle: {
        label: 'Lifestyle',
        description: 'Fashion, beauty, health, wellness',
        icon: '💄',
        color: 'bg-red-100 text-red-800'
      },
      business: {
        label: 'Business',
        description: 'Business news, finance, entrepreneurship',
        icon: '💼',
        color: 'bg-blue-100 text-blue-800'
      },
      technology: {
        label: 'Technology',
        description: 'Tech news, gadgets, innovation',
        icon: '💻',
        color: 'bg-indigo-100 text-indigo-800'
      },
      health: {
        label: 'Health',
        description: 'Health, fitness, medical news',
        icon: '🏥',
        color: 'bg-green-100 text-green-800'
      },
      travel: {
        label: 'Travel',
        description: 'Travel guides, destinations, culture',
        icon: '✈️',
        color: 'bg-teal-100 text-teal-800'
      },
      food: {
        label: 'Food',
        description: 'Recipes, restaurants, culinary arts',
        icon: '🍽️',
        color: 'bg-orange-100 text-orange-800'
      },
      fashion: {
        label: 'Fashion',
        description: 'Fashion trends, designers, style',
        icon: '👗',
        color: 'bg-pink-100 text-pink-800'
      },
      sports: {
        label: 'Sports',
        description: 'Sports news, athletes, events',
        icon: '⚽',
        color: 'bg-yellow-100 text-yellow-800'
      }
    };

    return categoryInfo[category] || {
      label: 'General',
      description: 'General magazine content',
      icon: '📄',
      color: 'bg-gray-100 text-gray-800'
    };
  },

  // Download helper
  async downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Share helpers
  async shareViaWebShare(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Web Share API failed:', error);
        return false;
      }
    }
    return false;
  },

  getShareUrl(magazineId, pageNumber = null) {
    const baseUrl = `${window.location.origin}/flipbook/${magazineId}`;
    return pageNumber ? `${baseUrl}?page=${pageNumber}` : baseUrl;
  },

  getEmbedCode(magazineId, options = {}) {
    const {
      width = '100%',
      height = '600px',
      showControls = true,
      startPage = 1
    } = options;

    return `<iframe
      src="${this.getShareUrl(magazineId, startPage)}?embed=true"
      width="${width}"
      height="${height}"
      frameborder="0"
      allowfullscreen
      ${showControls ? '' : 'data-hide-controls="true"'}
    ></iframe>`;
  }
};

export default flipbookService;