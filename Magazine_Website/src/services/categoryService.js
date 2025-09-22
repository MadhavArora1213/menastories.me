import api from './api';

// Category Services
const categoryService = {
  // Get all categories
  getCategories: () => api.get('/categories'),

  // Get single category
  getCategory: (id) => api.get(`/categories/${id}`),

  // Create category
  createCategory: (data) => api.post('/categories', data),

  // Update category
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Get category tree
  getCategoryTree: () => api.get('/categories/tree'),

  // Reorder categories
  reorderCategories: (data) => api.post('/categories/reorder', data),

  // Toggle category status
  toggleCategoryStatus: (id) => api.patch(`/categories/${id}/status`, {}),

  // Update category design
  updateCategoryDesign: (id, design) => api.patch(`/categories/${id}/design`, { design }),

  // Get all categories (alias for backward compatibility)
  getAllCategories: () => api.get('/categories'),

  // Get category by ID (alias for backward compatibility)
  getCategoryById: (id) => api.get(`/categories/${id}`),

  // Get articles by category
  getArticlesByCategory: (categoryId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/categories/${categoryId}/articles${queryString ? `?${queryString}` : ''}`);
  }
};

export default categoryService;