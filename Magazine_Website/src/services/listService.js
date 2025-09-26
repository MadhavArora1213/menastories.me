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

  // Create a new list
  async createList(formData) {
    try {
      const response = await api.post('/lists', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create list');
    }
  }

  // Update an existing list
  async updateList(listId, formData) {
    try {
      const response = await api.put(`/lists/${listId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update list');
    }
  }

  // Delete a list
  async deleteList(listId) {
    try {
      const response = await api.delete(`/lists/${listId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete list');
    }
  }

  // Delete a list entry
  async deleteListEntry(entryId) {
    try {
      const response = await api.delete(`/lists/entries/${entryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete list entry');
    }
  }
}

export default new ListService();