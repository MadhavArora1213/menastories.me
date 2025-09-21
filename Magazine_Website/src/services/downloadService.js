import axios from 'axios';

// Handle environment variables for both Node.js and browser environments
const getApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For browser environments, try to get from window or use default
    return window.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // For Node.js environments, use process.env
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Default fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

class DownloadService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all downloads with filters and pagination
  async getAllDownloads(params = {}) {
    try {
      const response = await this.client.get('/downloads', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching downloads:', error);
      throw error;
    }
  }

  // Get single download by ID
  async getDownload(id) {
    try {
      const response = await this.client.get(`/downloads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching download:', error);
      throw error;
    }
  }

  // Create new download
  async createDownload(formData) {
    try {
      const response = await this.client.post('/downloads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating download:', error);
      throw error;
    }
  }

  // Update download
  async updateDownload(id, formData) {
    try {
      const response = await this.client.put(`/downloads/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating download:', error);
      throw error;
    }
  }

  // Delete download
  async deleteDownload(id) {
    try {
      const response = await this.client.delete(`/downloads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting download:', error);
      throw error;
    }
  }

  // Get downloads by category
  async getDownloadsByCategory(categoryId, params = {}) {
    try {
      const response = await this.client.get(`/downloads/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching downloads by category:', error);
      throw error;
    }
  }

  // Search downloads
  async searchDownloads(query, params = {}) {
    try {
      const response = await this.client.get('/downloads/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching downloads:', error);
      throw error;
    }
  }

  // Get download statistics
  async getDownloadStats() {
    try {
      const response = await this.client.get('/downloads/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching download stats:', error);
      throw error;
    }
  }

  // Track download
  async trackDownload(id) {
    try {
      const response = await this.client.post(`/downloads/${id}/track`);
      return response.data;
    } catch (error) {
      console.error('Error tracking download:', error);
      throw error;
    }
  }

  // Get download categories
  async getCategories() {
    try {
      const response = await this.client.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

const downloadService = new DownloadService();
export default downloadService;