import api from './api';
import imageCompression from 'browser-image-compression';

class ImageUploadService {

  constructor() {
    this.baseURL = '/upload';
  }

  /**
   * Upload category image
   * @param {string} categoryId - Category ID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} - Upload response
   */
  async uploadCategoryImage(categoryId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`${this.baseURL}/category/${categoryId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading category image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload subcategory image
   * @param {string} subcategoryId - Subcategory ID
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} - Upload response
   */
  async uploadSubcategoryImage(subcategoryId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`${this.baseURL}/subcategory/${subcategoryId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading subcategory image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload general image (for events, articles, etc.)
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} - Upload response
   */
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`${this.baseURL}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete image
   * @param {string} filename - Image filename to delete
   * @returns {Promise<Object>} - Delete response
   */
  async deleteImage(filename) {
    try {
      const response = await api.delete(`${this.baseURL}/image/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get image metadata
   * @param {string} filename - Image filename
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageMetadata(filename) {
    try {
      const response = await api.get(`${this.baseURL}/image/${filename}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @returns {Object} - Validation result
   */
  validateImageFile(file) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be an image (JPEG, PNG, GIF, WebP)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Optimize image file (compress and convert to WebP)
   * @param {File} file - Image file to optimize
   * @returns {Promise<File>} - Optimized image file
   */
  async optimizeImage(file) {
    try {
      const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true,
        fileType: 'image/webp', // Convert to WebP
      };

      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error optimizing image:', error);
      // Return original file if optimization fails
      return file;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} - Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Upload failed';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Create preview URL for image file
   * @param {File} file - Image file
   * @returns {string} - Object URL for preview
   */
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   * @param {string} url - Object URL to revoke
   */
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }
}

export default new ImageUploadService();