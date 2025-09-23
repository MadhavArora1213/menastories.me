import api from './api';

class ArticleService {
  // Get all articles with filters and pagination
  async getAllArticles(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/articles${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch articles');
    }
  }

  // Get single article by ID or slug
  async getArticle(id) {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch article');
    }
  }

  // Create new article
  async createArticle(articleData) {
    try {
      const formData = new FormData();

      // Field mapping from camelCase to snake_case for specific fields
      const fieldMapping = {
        categoryId: 'category_id',
        subcategoryId: 'subcategory_id',
        authorId: 'primary_author_id',
        coAuthors: 'co_authors',
        featured: 'is_featured',
        heroSlider: 'is_hero_slider',
        trending: 'is_trending',
        pinned: 'is_pinned',
        allowComments: 'allow_comments',
        metaTitle: 'meta_title',
        metaDescription: 'meta_description',
        publishDate: 'scheduled_publish_date',
        imageCaption: 'featured_image_caption',
        authorBioOverride: 'author_bio_override',
        reviewNotes: 'review_notes'
      };

      // Add text fields with proper field name mapping
      Object.keys(articleData).forEach(key => {
        if (articleData[key] !== null && articleData[key] !== undefined && key !== 'featuredImage') {
          // Use mapped field name if available, otherwise use original
          const fieldName = fieldMapping[key] || key;

          if (typeof articleData[key] === 'object') {
            formData.append(fieldName, JSON.stringify(articleData[key]));
          } else {
            formData.append(fieldName, articleData[key]);
          }
        }
      });

      // Add file if exists
      if (articleData.featuredImage instanceof File) {
        formData.append('featured_image', articleData.featuredImage);
      }

      console.log('=== FORM DATA DEBUG ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (type: ${typeof value})`);
      }

      // Debug the submitData object
      console.log('=== SUBMIT DATA DEBUG ===');
      console.log('submitData object:', articleData);
      console.log('submitData keys:', Object.keys(articleData));

      const response = await api.post('/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create article');
    }
  }

  // Update article
  async updateArticle(id, articleData) {
    try {
      // Check if this is a simple status update (no files)
      const hasFile = articleData.featuredImage instanceof File;
      const isStatusOnly = !hasFile && Object.keys(articleData).length === 2 &&
                          articleData.status && articleData.review_notes !== undefined;

      if (isStatusOnly) {
        // Use JSON for simple status updates
        const response = await api.put(`/articles/${id}`, articleData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      }

      // Use FormData for updates with files or complex data
      const formData = new FormData();

      // Field mapping from camelCase to snake_case for specific fields
      const fieldMapping = {
        categoryId: 'category_id',
        subcategoryId: 'subcategory_id',
        authorId: 'primary_author_id',
        coAuthors: 'co_authors',
        featured: 'is_featured',
        heroSlider: 'is_hero_slider',
        trending: 'is_trending',
        pinned: 'is_pinned',
        allowComments: 'allow_comments',
        metaTitle: 'meta_title',
        metaDescription: 'meta_description',
        keywords: 'seo_keywords',
        publishDate: 'scheduled_publish_date',
        imageCaption: 'featured_image_caption',
        authorBioOverride: 'author_bio_override',
        reviewNotes: 'review_notes',
        // Additional fields that need mapping
        imageDisplayMode: 'image_display_mode',
        externalLinkFollow: 'external_link_follow',
        captchaVerified: 'captcha_verified',
        guidelinesAccepted: 'guidelines_accepted'
      };

      // Add text fields with proper field name mapping
      Object.keys(articleData).forEach(key => {
        if (articleData[key] !== null && articleData[key] !== undefined && key !== 'featuredImage') {
          // Use mapped field name if available, otherwise use original
          const fieldName = fieldMapping[key] || key;

          // Handle different data types
          if (Array.isArray(articleData[key]) || (typeof articleData[key] === 'object' && articleData[key] !== null)) {
            formData.append(fieldName, JSON.stringify(articleData[key]));
          } else if (typeof articleData[key] === 'boolean') {
            // Ensure boolean values are sent as strings
            formData.append(fieldName, articleData[key].toString());
          } else {
            formData.append(fieldName, articleData[key]);
          }
        }
      });

      // Add file if exists
      if (articleData.featuredImage instanceof File) {
        formData.append('featured_image', articleData.featuredImage);
      }

      const response = await api.put(`/articles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update article');
    }
  }

  // Delete article
  async deleteArticle(id) {
    try {
      const response = await api.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete article');
    }
  }

  // Get tags by category
  async getTagsByCategory(categoryId) {
    try {
      const response = await api.get(`/articles/category/${categoryId}/tags`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tags');
    }
  }

  // Get all authors
  async getAuthors() {
    try {
      const response = await api.get('/articles/authors/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch authors');
    }
  }

  // Create new author
  async createAuthor(authorData) {
    try {
      const formData = new FormData();
      
      Object.keys(authorData).forEach(key => {
        if (authorData[key] !== null && authorData[key] !== undefined && key !== 'profileImage') {
          if (typeof authorData[key] === 'object') {
            formData.append(key, JSON.stringify(authorData[key]));
          } else {
            formData.append(key, authorData[key]);
          }
        }
      });

      if (authorData.profileImage instanceof File) {
        formData.append('profile_image', authorData.profileImage);
      }

      const response = await api.post('/articles/authors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create author');
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  // Get subcategories by category
  async getSubcategories(categoryId) {
    try {
      const response = await api.get(`/subcategories/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  }

  // Get trending articles for trending bar
  async getTrendingArticles(limit = 10) {
    try {
      const response = await api.get('/public/homepage');
      return response.data.trending || [];
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Get suggested articles based on shared tags
  async getSuggestedArticles(articleId, limit = 8) {
    try {
      const response = await api.get(`/articles/${articleId}/suggested?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch suggested articles:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Upload file (generic file upload method)
  async uploadFile(endpoint, formData) {
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  }
}

export default new ArticleService();