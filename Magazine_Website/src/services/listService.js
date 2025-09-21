import api from './api';

class ListService {

  async getAllLists(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/lists?${queryString}` : '/lists';

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching lists:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch lists');
    }
  }

  async getList(id) {
    try {
      const response = await api.get(`/lists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching list:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch list');
    }
  }

  async createList(listData) {
    try {
      let formData;

      // Check if listData is already a FormData instance
      if (listData instanceof FormData) {
        formData = listData;
      } else {
        // Create new FormData and add fields
        formData = new FormData();

        // Add basic fields
        Object.keys(listData).forEach(key => {
          if (listData[key] !== null && listData[key] !== undefined) {
            if (typeof listData[key] === 'boolean') {
              formData.append(key, listData[key].toString());
            } else {
              formData.append(key, listData[key]);
            }
          }
        });
      }

      const response = await api.post('/lists', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating list:', error);
      throw new Error(error.response?.data?.message || 'Failed to create list');
    }
  }

  async updateList(id, listData) {
    try {
      let formData;

      // Check if listData is already a FormData instance
      if (listData instanceof FormData) {
        formData = listData;
      } else {
        // Create new FormData and add fields
        formData = new FormData();

        // Add basic fields
        Object.keys(listData).forEach(key => {
          if (listData[key] !== null && listData[key] !== undefined) {
            if (typeof listData[key] === 'boolean') {
              formData.append(key, listData[key].toString());
            } else {
              formData.append(key, listData[key]);
            }
          }
        });
      }

      const response = await api.put(`/lists/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating list:', error);
      throw new Error(error.response?.data?.message || 'Failed to update list');
    }
  }

  async deleteList(id) {
    try {
      const response = await api.delete(`/lists/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting list:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete list');
    }
  }

  async getListEntries(listId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/lists/${listId}/entries?${queryString}`
        : `/lists/${listId}/entries`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching list entries:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch list entries');
    }
  }

  async getListEntry(id) {
    try {
      const response = await api.get(`/lists/entries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching list entry:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch list entry');
    }
  }

  async createListEntry(listId, entryData) {
    try {
      let formData;

      // Check if entryData is already a FormData instance
      if (entryData instanceof FormData) {
        formData = entryData;
      } else {
        // Create new FormData and add fields
        formData = new FormData();

        // Add basic fields
        Object.keys(entryData).forEach(key => {
          if (entryData[key] !== null && entryData[key] !== undefined) {
            formData.append(key, entryData[key]);
          }
        });
      }

      const response = await api.post(`/lists/${listId}/entries`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating list entry:', error);
      throw new Error(error.response?.data?.message || 'Failed to create list entry');
    }
  }

  async updateListEntry(id, entryData) {
    try {
      let formData;

      // Check if entryData is already a FormData instance
      if (entryData instanceof FormData) {
        formData = entryData;
      } else {
        // Create new FormData and add fields
        formData = new FormData();

        // Add basic fields
        Object.keys(entryData).forEach(key => {
          if (entryData[key] !== null && entryData[key] !== undefined) {
            formData.append(key, entryData[key]);
          }
        });
      }

      const response = await api.put(`/lists/entries/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating list entry:', error);
      throw new Error(error.response?.data?.message || 'Failed to update list entry');
    }
  }

  async deleteListEntry(id) {
    try {
      const response = await api.delete(`/lists/entries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting list entry:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete list entry');
    }
  }

  async parseDocxFile(listId, file) {
    try {
      const formData = new FormData();
      formData.append('docx_file', file);

      const response = await api.post(`/lists/${listId}/parse-docx`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error parsing DOCX file:', error);
      throw new Error(error.response?.data?.message || 'Failed to parse DOCX file');
    }
  }
}

export default new ListService();