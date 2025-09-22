import adminApi from './adminApi';

// Category Services
const categoryService = {
  // Get all categories
  getCategories: () => adminApi.get('/categories'),

  // Get single category
  getCategory: (id) => adminApi.get(`/categories/${id}`),

  // Create category
  createCategory: (data) => adminApi.post('/categories', data),

  // Update category
  updateCategory: (id, data) => adminApi.put(`/categories/${id}`, data),

  // Delete category
  deleteCategory: (id) => adminApi.delete(`/categories/${id}`),

  // Get category tree
  getCategoryTree: () => adminApi.get('/categories/tree'),

  // Reorder categories
  reorderCategories: (data) => adminApi.post('/categories/reorder', data),

  // Toggle category status
  toggleCategoryStatus: (id) => adminApi.patch(`/categories/${id}/status`, {}),

  // Update category design
  updateCategoryDesign: (id, design) => adminApi.patch(`/categories/${id}/design`, { design }),

  // Get all categories (alias for backward compatibility)
  getAllCategories: () => adminApi.get('/categories'),

  // Get category by ID (alias for backward compatibility)
  getCategoryById: (id) => adminApi.get(`/categories/${id}`),

  // Get articles by category
  getArticlesByCategory: (categoryId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApi.get(`/categories/${categoryId}/articles${queryString ? `?${queryString}` : ''}`);
  }
};

export default categoryService;