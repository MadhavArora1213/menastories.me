const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SEOService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/seo`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SEO API request failed:', error);
      throw error;
    }
  }

  // Get SEO data for a specific content item
  async getSEOData(contentType, id) {
    return this.request(`/${contentType}/${id}`);
  }

  // Update SEO data for a specific content item
  async updateSEOData(contentType, id, seoData) {
    return this.request(`/${contentType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(seoData),
    });
  }

  // Get bulk SEO data for content type
  async getBulkSEOData(contentType, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/bulk/${contentType}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Bulk update SEO data
  async bulkUpdateSEOData(contentType, updates) {
    return this.request(`/bulk/${contentType}`, {
      method: 'PUT',
      body: JSON.stringify({ contentType, updates }),
    });
  }

  // Get SEO analytics for content type
  async getSEOAnalytics(contentType) {
    return this.request(`/analytics/${contentType}`);
  }

  // Generate SEO suggestions for content item
  async generateSEOSuggestions(contentType, id) {
    return this.request(`/suggestions/${contentType}/${id}`);
  }

  // Get supported content types
  async getContentTypes() {
    return this.request('/content-types');
  }

  // Content type mappings for display
  getContentTypeDisplayName(contentType) {
    const displayNames = {
      articles: 'Articles',
      videoArticles: 'Video Articles',
      subcategories: 'Subcategories',
      events: 'Events',
      lists: 'Lists',
      powerListEntries: 'Power List Entries',
      mediaKits: 'Media Kits',
      flipbooks: 'Flipbooks'
    };
    return displayNames[contentType] || contentType;
  }

  // Get SEO field configuration for content type
  getSEOFieldsForContentType(contentType) {
    const fieldConfigs = {
      articles: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false },
        { key: 'keywords', label: 'Keywords', type: 'array', required: false }
      ],
      videoArticles: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false },
        { key: 'keywords', label: 'Keywords', type: 'array', required: false }
      ],
      subcategories: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false }
      ],
      events: [
        { key: 'seoTitle', label: 'SEO Title', maxLength: 60, required: false },
        { key: 'seoDescription', label: 'SEO Description', maxLength: 160, required: false },
        { key: 'canonicalUrl', label: 'Canonical URL', type: 'url', required: false }
      ],
      lists: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false }
      ],
      powerListEntries: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false }
      ],
      mediaKits: [
        { key: 'metaTitle', label: 'Meta Title', maxLength: 60, required: false },
        { key: 'metaDescription', label: 'Meta Description', maxLength: 160, required: false },
        { key: 'keywords', label: 'Keywords', type: 'array', required: false }
      ],
      flipbooks: [
        { key: 'seoTitle', label: 'SEO Title', maxLength: 60, required: false },
        { key: 'seoDescription', label: 'SEO Description', maxLength: 160, required: false },
        { key: 'canonicalUrl', label: 'Canonical URL', type: 'url', required: false }
      ]
    };
    return fieldConfigs[contentType] || [];
  }

  // Validate SEO field value
  validateSEOField(fieldConfig, value) {
    if (!fieldConfig.required && (!value || value === '')) {
      return { isValid: true };
    }

    if (fieldConfig.required && (!value || value === '')) {
      return { isValid: false, error: `${fieldConfig.label} is required` };
    }

    if (fieldConfig.maxLength && value && value.length > fieldConfig.maxLength) {
      return {
        isValid: false,
        error: `${fieldConfig.label} must be ${fieldConfig.maxLength} characters or less`
      };
    }

    if (fieldConfig.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return { isValid: false, error: `${fieldConfig.label} must be a valid URL` };
      }
    }

    if (fieldConfig.type === 'array' && value) {
      if (!Array.isArray(value)) {
        return { isValid: false, error: `${fieldConfig.label} must be an array` };
      }
    }

    return { isValid: true };
  }

  // Generate SEO preview
  generateSEOPreview(seoData, contentTitle, contentUrl) {
    const title = seoData.metaTitle || seoData.seoTitle || contentTitle || '';
    const description = seoData.metaDescription || seoData.seoDescription || '';
    const url = contentUrl || window.location.href;

    return {
      title: title.length > 60 ? title.substring(0, 57) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      url: url.length > 60 ? url.substring(0, 57) + '...' : url
    };
  }
}

export default new SEOService();