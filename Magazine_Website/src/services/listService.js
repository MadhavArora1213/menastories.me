import api from './api';

class ListService {
  // Get all lists with filters and pagination
  async getAllLists(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/lists${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lists');
    }
  }

  // Get single list by ID or slug with entries
  async getList(id) {
    try {
      const response = await api.get(`/lists/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch list');
    }
  }

  // Get list entries for a specific list
  async getListEntries(listId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/lists/${listId}/entries${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch list entries');
    }
  }

  // Search lists
  async searchLists(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      };
      return this.getAllLists(params);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search lists');
    }
  }

  // Get lists by category
  async getListsByCategory(category, params = {}) {
    try {
      const queryParams = {
        category,
        ...params,
      };
      return this.getAllLists(queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lists by category');
    }
  }

  // Get lists by year
  async getListsByYear(year, params = {}) {
    try {
      const queryParams = {
        year,
        ...params,
      };
      return this.getAllLists(queryParams);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch lists by year');
    }
  }
}

export default new ListService();