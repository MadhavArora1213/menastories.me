// Handle environment variables for both Node.js and browser environments
const getApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For browser environments, try to get from window or use default
    return window.REACT_APP_API_URL || 'http://localhost:5000';
  }

  // For Node.js environments, use process.env
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Default fallback
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl();

class MediaKitService {
  async getAllMediaKits(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/media-kits?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching media kits:', error);
      throw error;
    }
  }

  async getMediaKit(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching media kit:', error);
      throw error;
    }
  }

  async createMediaKit(mediaKitData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(mediaKitData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating media kit:', error);
      throw error;
    }
  }

  async updateMediaKit(id, mediaKitData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(mediaKitData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating media kit:', error);
      throw error;
    }
  }

  async deleteMediaKit(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting media kit:', error);
      throw error;
    }
  }

  async trackView(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking view:', error);
      throw error;
    }
  }

  async trackDownload(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media-kits/${id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking download:', error);
      throw error;
    }
  }
}

export const mediaKitService = new MediaKitService();