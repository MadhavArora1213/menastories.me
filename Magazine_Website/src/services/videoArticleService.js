import api from './api';

class VideoArticleService {
  // Get all video articles with filters and pagination
  async getAllVideoArticles(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/video-articles${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video articles');
    }
  }

  // Get single video article by ID or slug
  async getVideoArticle(identifier) {
    try {
      // First try to fetch by ID
      try {
        const response = await api.get(`/video-articles/${identifier}`);
        return response.data;
      } catch (error) {
        // If ID lookup fails, try slug lookup
        if (error.response?.status === 404) {
          const response = await api.get(`/video-articles/slug/${identifier}`);
          return response.data;
        }
        throw error;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video article');
    }
  }

  // Create new video article
  async createVideoArticle(videoArticleData) {
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
        scheduledPublishDate: 'scheduled_publish_date',
        imageCaption: 'featured_image_caption',
        authorBioOverride: 'author_bio_override',
        reviewNotes: 'review_notes',
        youtubeUrl: 'youtube_url',
        videoType: 'video_type'
      };

      // Add text fields with proper field name mapping
      Object.keys(videoArticleData).forEach(key => {
        if (videoArticleData[key] !== null && videoArticleData[key] !== undefined && key !== 'featuredImage') {
          // Use mapped field name if available, otherwise use original
          const fieldName = fieldMapping[key] || key;

          if (typeof videoArticleData[key] === 'object') {
            formData.append(fieldName, JSON.stringify(videoArticleData[key]));
          } else {
            formData.append(fieldName, videoArticleData[key]);
          }
        }
      });

      // Add file if exists
      if (videoArticleData.featuredImage instanceof File) {
        formData.append('image', videoArticleData.featuredImage);
      }

      console.log('=== VIDEO ARTICLE FORM DATA DEBUG ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (type: ${typeof value})`);
      }

      const response = await api.post('/video-articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create video article');
    }
  }

  // Update video article
  async updateVideoArticle(id, videoArticleData) {
    console.log('=== SERVICE UPDATE VIDEO ARTICLE START ===');
    console.log('Video Article ID:', id);
    console.log('Input data keys:', Object.keys(videoArticleData));
    console.log('Input title:', videoArticleData.title);
    console.log('Input metaTitle:', videoArticleData.metaTitle);
    console.log('Input priority:', videoArticleData.priority);
    console.log('Input data:', JSON.stringify(videoArticleData, null, 2));

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
        scheduledPublishDate: 'scheduled_publish_date',
        imageCaption: 'featured_image_caption',
        authorBioOverride: 'author_bio_override',
        reviewNotes: 'review_notes',
        youtubeUrl: 'youtube_url',
        videoType: 'video_type'
      };

      console.log('=== BUILDING FORM DATA ===');

      // Add text fields with proper field name mapping
      Object.keys(videoArticleData).forEach(key => {
        if (videoArticleData[key] !== null && videoArticleData[key] !== undefined && key !== 'featuredImage') {
          // Use mapped field name if available, otherwise use original
          const fieldName = fieldMapping[key] || key;

          if (typeof videoArticleData[key] === 'object') {
            const jsonValue = JSON.stringify(videoArticleData[key]);
            formData.append(fieldName, jsonValue);
            console.log(`Added JSON field: ${fieldName} = ${jsonValue}`);
          } else {
            formData.append(fieldName, videoArticleData[key]);
            console.log(`Added field: ${fieldName} = ${videoArticleData[key]}`);
          }
        }
      });

      // Add file if exists
      if (videoArticleData.featuredImage instanceof File) {
        formData.append('image', videoArticleData.featuredImage);
        console.log('Added featured image file:', videoArticleData.featuredImage.name);
      } else {
        console.log('No featured image file to add');
      }

      console.log('=== FORM DATA BUILT - SENDING REQUEST ===');
      console.log('Final form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (type: ${typeof value})`);
      }
      console.log('=== CONFIRMING KEY FIELDS BEFORE API CALL ===');
      console.log('FormData title:', formData.get('title'));
      console.log('FormData metaTitle:', formData.get('metaTitle'));
      console.log('FormData priority:', formData.get('priority'));

      const response = await api.put(`/video-articles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('=== API RESPONSE RECEIVED ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.log('=== SERVICE UPDATE ERROR ===');
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Failed to update video article');
    }
  }

  // Delete video article
  async deleteVideoArticle(id) {
    try {
      const response = await api.delete(`/video-articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete video article');
    }
  }

  // Change video article status
  async changeVideoArticleStatus(id, statusData) {
    try {
      const response = await api.patch(`/video-articles/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change video article status');
    }
  }

  // Publish video article
  async publishVideoArticle(id) {
    try {
      const response = await api.post(`/video-articles/${id}/publish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish video article');
    }
  }

  // Get tags by category
  async getTagsByCategory(categoryId) {
    try {
      const response = await api.get(`/video-articles/tags/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tags');
    }
  }

  // Get all tags
  async getAllTags() {
    try {
      const response = await api.get('/video-articles/tags/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tags');
    }
  }

  // Get all authors
  async getAuthors() {
    try {
      const response = await api.get('/video-articles/authors/all');
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

      const response = await api.post('/video-articles/authors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create author');
    }
  }

  // Get single author
  async getAuthor(id) {
    try {
      const response = await api.get(`/video-articles/authors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch author');
    }
  }

  // Update author
  async updateAuthor(id, authorData) {
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

      const response = await api.put(`/video-articles/authors/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update author');
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

  // Get filtered categories
  async getFilteredCategories(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/video-articles/categories/filtered${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch filtered categories');
    }
  }

  // Get filtered authors
  async getFilteredAuthors(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/video-articles/authors/filtered${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch filtered authors');
    }
  }

  // Get comments for video article
  async getComments(videoArticleId) {
    try {
      const response = await api.get(`/video-articles/${videoArticleId}/comments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  }

  // Add comment to video article
  async addComment(videoArticleId, commentData) {
    try {
      const response = await api.post(`/video-articles/${videoArticleId}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  }

  // Track view for video article
  async trackView(videoArticleId) {
    try {
      const response = await api.post(`/video-articles/${videoArticleId}/track-view`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track view');
    }
  }

  // Get RSS feed
  async getRSSFeed() {
    try {
      const response = await api.get('/video-articles/rss');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch RSS feed');
    }
  }
}

export default new VideoArticleService();