// Services Index - Export all services
export { default as api } from './api';
export { default as authService } from './authService';
export { default as cmsService } from './cmsService';
export { default as mediaService } from './mediaService';
export { default as newsletterService } from './newsletterService';
export { default as searchService } from './searchService';

// Re-export for convenience
export { api, authService, cmsService, mediaService, newsletterService, searchService } from './';

// Export individual services
import api from './api';
import authService from './authService';
import cmsService from './cmsService';
import mediaService from './mediaService';
import newsletterService from './newsletterService';
import searchService from './searchService';

export default {
  api,
  authService,
  cmsService,
  mediaService,
  newsletterService,
  searchService
};