import api from '../../services/api';

// Event Services - works with dedicated Event API
export const eventService = {
  // Get all events (admin)
  getAllEvents: (params = {}) => {
    console.log('Frontend sending params to /events/admin/all:', params);
    return api.get('/events/admin/all', { params });
  },

  // Get single event
  getEvent: (id) => {
    return api.get(`/events/${id}`);
  },

  // Create event
  createEvent: (data) => {
    return api.post('/events/create', data);
  },

  // Update event
  updateEvent: (id, data) => {
    return api.put(`/events/${id}`, data);
  },

  // Delete event
  deleteEvent: (id) => {
    return api.delete(`/events/${id}`);
  },

  // Publish event
  publishEvent: (id) => {
    return api.post(`/events/${id}/publish`);
  },

  // Unpublish event
  unpublishEvent: (id) => {
    return api.post(`/events/${id}/unpublish`);
  },

  // Get event categories
  getEventCategories: () => {
    return api.get('/events/categories');
  },

  // Get event types
  getEventTypes: () => {
    return api.get('/events/types');
  },

  // Get event statistics
  getEventStats: () => {
    return api.get('/events/stats');
  },

  // Get event analytics
  getEventAnalytics: (id) => {
    return api.get(`/events/${id}/analytics`);
  },

  // Get events analytics overview
  getEventsAnalytics: () => {
    return api.get('/events/analytics/overview');
  },

  // Bulk operations
  bulkPublishEvents: (eventIds) => {
    return api.post('/events/bulk/publish', { eventIds });
  },

  bulkUnpublishEvents: (eventIds) => {
    return api.post('/events/bulk/unpublish', { eventIds });
  },

  bulkDeleteEvents: (eventIds) => {
    return api.delete('/events/bulk/delete', { data: { eventIds } });
  },

  // Admin event review functions
  approveEvent: (eventId, reviewNotes = '') => {
    return api.post(`/events/${eventId}/approve`, { reviewNotes });
  },

  rejectEvent: (eventId, reviewNotes) => {
    return api.post(`/events/${eventId}/reject`, { reviewNotes });
  },

  // User event submission methods
  sendEventSubmissionOTP: (data) => {
    return api.post('/events/user/submit/send-otp', data);
  },

  submitUserEvent: (data) => {
    return api.post('/events/user/submit', data);
  }
};

export default eventService;