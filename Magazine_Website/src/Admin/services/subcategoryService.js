import { categoryService } from '../../services/cmsService';
import adminApi from '../../services/adminApi';

// SubCategory Services - works with dedicated Subcategory API
export const subcategoryService = {
  // Get all subcategories
  getSubcategories: (params = {}) => {
    console.log('Frontend sending params to /subcategories:', params);
    return adminApi.get('/subcategories', { params });
  },

  // Get subcategories for a specific parent category
  getSubcategoriesByParent: (categoryId) => {
    return adminApi.get(`/subcategories/category/${categoryId}`);
  },

  // Get single subcategory
  getSubcategory: (id) => {
    return adminApi.get(`/subcategories/${id}`);
  },

  // Create subcategory
  createSubcategory: (data) => {
    // Always use FormData for consistency
    if (data instanceof FormData) {
      return adminApi.post('/subcategories', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return adminApi.post('/subcategories', data);
  },

  // Update subcategory
  updateSubcategory: (id, data) => {
    return adminApi.put(`/subcategories/${id}`, data);
  },

  // Delete subcategory
  deleteSubcategory: (id) => {
    return adminApi.delete(`/subcategories/${id}`);
  },

  // Get subcategory tree (hierarchical structure)
  getSubcategoryTree: (params = {}) => {
    return adminApi.get('/subcategories', { params });
  },

  // Toggle subcategory status
  toggleSubcategoryStatus: (id) => {
    return adminApi.patch(`/subcategories/${id}/status`);
  },

  // Get all parent categories (for dropdown selection)
  getParentCategories: async () => {
    try {
      const response = await categoryService.getCategories();
      console.log('Parent categories raw response:', response);

      // Handle Axios response format - data is directly accessible
      if (response && response.data && response.data.data) {
        // Backend returns { data: { data: [...] } }
        console.log('Returning response.data.data:', response.data.data);
        return response.data.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Backend returns { data: [...] }
        console.log('Returning response.data:', response.data);
        return response.data;
      } else if (Array.isArray(response)) {
        // Backend returns array directly
        console.log('Returning array response:', response);
        return response;
      } else if (response) {
        console.log('Returning response directly:', response);
        return response;
      }

      console.warn('No valid parent categories data found');
      return [];
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      throw error;
    }
  }
};

export default subcategoryService;