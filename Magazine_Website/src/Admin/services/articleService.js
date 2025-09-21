const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';

class ArticleService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/articles`;
  }

  getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  }

  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async request(url, options = {}) {
    const config = {
      headers: this.getHeaders(),
      credentials: 'include',
      ...options
    };

    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  }

  // Basic CRUD operations
  async list(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.baseURL}?${queryString}` : this.baseURL;
    return this.request(url);
  }

  async getById(id) {
    return this.request(`${this.baseURL}/${id}`);
  }

  async getBySlug(slug) {
    return this.request(`${this.baseURL}/slug/${slug}`);
  }

  async create(payload) {
    return this.request(this.baseURL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async update(id, payload) {
    return this.request(`${this.baseURL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async remove(id) {
    return this.request(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
  }

  // Status management
  async changeStatus(id, status, comment = '') {
    return this.request(`${this.baseURL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment })
    });
  }

  async updateStatus(id, status, tags = []) {
    return this.request(`${this.baseURL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tags })
    });
  }

  // Workflow operations
  async submitForReview(id) {
    return this.request(`${this.baseURL}/${id}/submit`, {
      method: 'POST'
    });
  }

  async approveArticle(id, comment = '') {
    return this.request(`${this.baseURL}/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  async requestRevisions(id, comment) {
    return this.request(`${this.baseURL}/${id}/request-revisions`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  async addComment(id, content, type = 'general') {
    return this.request(`${this.baseURL}/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, type })
    });
  }

  async getHistory(id) {
    return this.request(`${this.baseURL}/${id}/history`);
  }

  // Fact-checking operations
  async requestFactCheck(id, priority = 'normal', notes = '') {
    return this.request(`${this.baseURL}/${id}/fact-check`, {
      method: 'POST',
      body: JSON.stringify({ priority, notes })
    });
  }

  async completeFactCheck(id, status, findings = '', corrections = '') {
    return this.request(`${this.baseURL}/${id}/fact-check/complete`, {
      method: 'POST',
      body: JSON.stringify({ status, findings, corrections })
    });
  }

  // Copy-editing operations
  async startCopyEdit(id, notes = '') {
    return this.request(`${this.baseURL}/${id}/copy-edit/start`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  async completeCopyEdit(id, changes = '', readyForApproval = false) {
    return this.request(`${this.baseURL}/${id}/copy-edit/complete`, {
      method: 'POST',
      body: JSON.stringify({ changes, readyForApproval })
    });
  }

  // Final approval
  async finalApproval(id, publicationDate = null, promotionLevel = 0) {
    return this.request(`${this.baseURL}/${id}/final-approval`, {
      method: 'POST',
      body: JSON.stringify({ publicationDate, promotionLevel })
    });
  }

  // Publication planning
  async planPublication(id, publishDate, promotionLevel = 0, targetAudience = '', socialMediaPlan = '') {
    return this.request(`${this.baseURL}/${id}/plan-publication`, {
      method: 'POST',
      body: JSON.stringify({ publishDate, promotionLevel, targetAudience, socialMediaPlan })
    });
  }

  async getPublicationAnalytics(id) {
    return this.request(`${this.baseURL}/${id}/analytics`);
  }

  // Tag operations
  async getTagsByCategory(categoryId) {
    return this.request(`${this.baseURL}/tags/category/${categoryId}`);
  }

  // Author operations
  async getAllAuthors() {
    return this.request(`${this.baseURL}/authors/all`);
  }

  async getAuthorById(id) {
    return this.request(`${this.baseURL}/authors/${id}`);
  }

  async createAuthor(authorData) {
    return this.request(`${this.baseURL}/authors`, {
      method: 'POST',
      body: JSON.stringify(authorData)
    });
  }

  async updateAuthor(id, authorData) {
    return this.request(`${this.baseURL}/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(authorData)
    });
  }

  async deleteAuthor(id) {
    return this.request(`${this.baseURL}/authors/${id}`, {
      method: 'DELETE'
    });
  }

  // Media operations
  async getMediaForArticle(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.baseURL}/media?${queryString}` : `${this.baseURL}/media`;
    return this.request(url);
  }

  // Auto-publishing
  async publishScheduledArticles() {
    return this.request(`${this.baseURL}/publish-scheduled`, {
      method: 'POST'
    });
  }

  // Bulk upload
  async bulkUpload(data) {
    return this.request(`${this.baseURL}/bulk-upload`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new ArticleService();

