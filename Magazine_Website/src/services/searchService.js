import api from './api';

export const searchService = {
  // Global search with advanced filtering
  async globalSearch(params) {
    try {
      const response = await api.get('/search/global', { params });
      return response.data;
    } catch (error) {
      console.error('Global search failed:', error);
      throw error;
    }
  },

  // Get search suggestions
  async getSuggestions(query) {
    try {
      const response = await api.get('/search/suggestions', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      throw error;
    }
  },

  // Get available filters
  async getFilters() {
    try {
      const response = await api.get('/search/filters');
      return response.data;
    } catch (error) {
      console.error('Failed to get filters:', error);
      throw error;
    }
  },

  // Save search
  async saveSearch(searchData) {
    try {
      const response = await api.post('/search/save', searchData);
      return response.data;
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  },

  // Get saved searches
  async getSavedSearches(params = {}) {
    try {
      const response = await api.get('/search/saved', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get saved searches:', error);
      throw error;
    }
  },

  // Delete saved search
  async deleteSavedSearch(searchId) {
    try {
      const response = await api.delete(`/search/saved/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      throw error;
    }
  },

  // Get search analytics (Admin only)
  async getSearchAnalytics(params = {}) {
    try {
      const response = await api.get('/search/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      throw error;
    }
  },

  // Category-specific search
  async categorySearch(categorySlug, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          category: categorySlug
        }
      });
      return response.data;
    } catch (error) {
      console.error('Category search failed:', error);
      throw error;
    }
  },

  // Author-specific search
  async authorSearch(authorId, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          author: authorId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Author search failed:', error);
      throw error;
    }
  },

  // Tag-based search
  async tagSearch(tagSlug, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          tags: tagSlug
        }
      });
      return response.data;
    } catch (error) {
      console.error('Tag search failed:', error);
      throw error;
    }
  },

  // Advanced Boolean search
  async booleanSearch(query, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          query,
          searchType: 'boolean'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Boolean search failed:', error);
      throw error;
    }
  },

  // Quick search (simplified version for header search)
  async quickSearch(query, limit = 5) {
    try {
      const response = await api.get('/search/global', {
        params: {
          query,
          limit,
          sortBy: 'relevance'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Quick search failed:', error);
      throw error;
    }
  },

  // Popular searches
  async getPopularSearches(limit = 10) {
    try {
      const response = await api.get('/search/analytics', {
        params: {
          limit,
          sortBy: 'popularity'
        }
      });
      
      // Extract popular queries from analytics
      return {
        success: true,
        popularSearches: response.data.summary?.topQueries || []
      };
    } catch (error) {
      console.error('Failed to get popular searches:', error);
      throw error;
    }
  },

  // Search with geographic filtering
  async geographicSearch(location, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          geographic: location
        }
      });
      return response.data;
    } catch (error) {
      console.error('Geographic search failed:', error);
      throw error;
    }
  },

  // Search by reading time
  async readingTimeSearch(timeRange, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          readingTime: timeRange
        }
      });
      return response.data;
    } catch (error) {
      console.error('Reading time search failed:', error);
      throw error;
    }
  },

  // Featured content search
  async getFeaturedContent(params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          featured: 'true'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Featured content search failed:', error);
      throw error;
    }
  },

  // Search by content type
  async contentTypeSearch(contentType, params = {}) {
    try {
      const response = await api.get('/search/global', {
        params: {
          ...params,
          contentType
        }
      });
      return response.data;
    } catch (error) {
      console.error('Content type search failed:', error);
      throw error;
    }
  },

  // Recent searches (from analytics)
  async getRecentSearches(limit = 10) {
    try {
      const response = await api.get('/search/analytics', {
        params: {
          limit,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        }
      });
      
      return {
        success: true,
        recentSearches: response.data.analytics || []
      };
    } catch (error) {
      console.error('Failed to get recent searches:', error);
      throw error;
    }
  },

  // Trending searches
  async getTrendingSearches(days = 7, limit = 10) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      
      const response = await api.get('/search/analytics', {
        params: {
          dateFrom: dateFrom.toISOString(),
          limit,
          sortBy: 'popularity'
        }
      });
      
      return {
        success: true,
        trendingSearches: response.data.summary?.topQueries || []
      };
    } catch (error) {
      console.error('Failed to get trending searches:', error);
      throw error;
    }
  }
};

export default searchService;