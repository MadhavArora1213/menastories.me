import api from './api';

const eventService = {
  // Get all events with filtering and pagination
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get single event by ID or slug
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get event calendar data
  getEventCalendar: async (params = {}) => {
    try {
      const response = await api.get('/events/calendar', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching event calendar:', error);
      throw error;
    }
  },

  // Get featured events
  getFeaturedEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/featured', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/upcoming', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get event categories
  getEventCategories: async () => {
    try {
      const response = await api.get('/events/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching event categories:', error);
      throw error;
    }
  },

  // Get event types
  getEventTypes: async () => {
    try {
      const response = await api.get('/events/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching event types:', error);
      throw error;
    }
  },
  
  // Get event locations
  getEventLocations: async () => {
    try {
      const response = await api.get('/events/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching event locations:', error);
      throw error;
    }
  },

  // Get event statistics
  getEventStats: async () => {
    try {
      const response = await api.get('/events/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  },

  // Search events
  searchEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },

  // Get event gallery
  getEventGallery: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/events/${eventId}/gallery`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching event gallery:', error);
      throw error;
    }
  },

  // Get event attendees
  getEventAttendees: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/attendees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      throw error;
    }
  },

  // Get event updates
  getEventUpdates: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/updates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event updates:', error);
      throw error;
    }
  },

  // Get event schedule
  getEventSchedule: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event schedule:', error);
      throw error;
    }
  },

  // Get event speakers
  getEventSpeakers: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/speakers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event speakers:', error);
      throw error;
    }
  },

  // Register for event
  registerForEvent: async (registrationData) => {
    try {
      const response = await api.post('/events/register', registrationData);
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  // Get registration details
  getRegistrationDetails: async (registrationId) => {
    try {
      const response = await api.get(`/events/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching registration details:', error);
      throw error;
    }
  },

  // Update registration
  updateRegistration: async (registrationId, updateData) => {
    try {
      const response = await api.put(`/events/registration/${registrationId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  },

  // Cancel registration
  cancelRegistration: async (registrationId) => {
    try {
      const response = await api.delete(`/events/registration/${registrationId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  },

  // Check in attendee
  checkInAttendee: async (registrationId) => {
    try {
      const response = await api.post(`/events/registration/${registrationId}/checkin`);
      return response.data;
    } catch (error) {
      console.error('Error checking in attendee:', error);
      throw error;
    }
  },

  // Get user registrations
  getUserRegistrations: async () => {
    try {
      const response = await api.get('/events/registrations');
      return response.data;
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw error;
    }
  },

  // Get user upcoming events
  getUserUpcomingEvents: async () => {
    try {
      const response = await api.get('/events/my-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching user upcoming events:', error);
      throw error;
    }
  },

  // Publish event (admin)
  publishEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  },

  // Unpublish event (admin)
  unpublishEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/unpublish`);
      return response.data;
    } catch (error) {
      console.error('Error unpublishing event:', error);
      throw error;
    }
  },

  // Get all events (admin)
  getAllEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/admin/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Get event registrations (admin)
  getEventRegistrations: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/registrations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  },

  // Create event update
  createEventUpdate: async (eventId, updateData) => {
    try {
      const response = await api.post(`/events/${eventId}/updates`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error creating event update:', error);
      throw error;
    }
  },

  // Update event update
  updateEventUpdate: async (updateId, updateData) => {
    try {
      const response = await api.put(`/events/updates/${updateId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating event update:', error);
      throw error;
    }
  },

  // Delete event update
  deleteEventUpdate: async (updateId) => {
    try {
      const response = await api.delete(`/events/updates/${updateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event update:', error);
      throw error;
    }
  },

  // Bulk operations (admin)
  bulkPublishEvents: async (eventIds) => {
    try {
      const response = await api.post('/events/bulk/publish', { eventIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk publishing events:', error);
      throw error;
    }
  },

  bulkUnpublishEvents: async (eventIds) => {
    try {
      const response = await api.post('/events/bulk/unpublish', { eventIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk unpublishing events:', error);
      throw error;
    }
  },

  bulkDeleteEvents: async (eventIds) => {
    try {
      const response = await api.post('/events/bulk/delete', { eventIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting events:', error);
      throw error;
    }
  },

  // Analytics
  getEventAnalytics: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      throw error;
    }
  },

  getEventsAnalytics: async () => {
    try {
      const response = await api.get('/events/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching events analytics:', error);
      throw error;
    }
  },

  // QR Code generation
  generateQRCode: async (registrationId) => {
    try {
      const response = await api.get(`/events/registration/${registrationId}/qrcode`);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  // Export functions
  exportAttendees: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/export/attendees`);
      return response.data;
    } catch (error) {
      console.error('Error exporting attendees:', error);
      throw error;
    }
  },

  exportRegistrations: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/export/registrations`);
      return response.data;
    } catch (error) {
      console.error('Error exporting registrations:', error);
      throw error;
    }
  },

  // Feedback functions
  submitEventFeedback: async (eventId, feedbackData) => {
    try {
      const response = await api.post(`/events/${eventId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  getEventFeedback: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/feedback`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event feedback:', error);
      throw error;
    }
  },

  // Networking functions
  getNetworkingMatches: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/networking`);
      return response.data;
    } catch (error) {
      console.error('Error fetching networking matches:', error);
      throw error;
    }
  },

  connectWithAttendee: async (eventId, attendeeId) => {
    try {
      const response = await api.post(`/events/${eventId}/networking/connect`, { attendeeId });
      return response.data;
    } catch (error) {
      console.error('Error connecting with attendee:', error);
      throw error;
    }
  },

  // Live stream functions
  getStreamStatus: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/stream`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream status:', error);
      throw error;
    }
  },

  startLiveStream: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/stream/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting live stream:', error);
      throw error;
    }
  },

  endLiveStream: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/stream/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending live stream:', error);
      throw error;
    }
  },

  // Exhibition functions
  createExhibition: async (eventId, exhibitionData) => {
    try {
      const response = await api.post(`/events/${eventId}/exhibition`, exhibitionData);
      return response.data;
    } catch (error) {
      console.error('Error creating exhibition:', error);
      throw error;
    }
  },

  updateExhibition: async (exhibitionId, exhibitionData) => {
    try {
      const response = await api.put(`/events/exhibition/${exhibitionId}`, exhibitionData);
      return response.data;
    } catch (error) {
      console.error('Error updating exhibition:', error);
      throw error;
    }
  },

  deleteExhibition: async (exhibitionId) => {
    try {
      const response = await api.delete(`/events/exhibition/${exhibitionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      throw error;
    }
  },

  // Virtual tour functions
  getVirtualTourData: async (exhibitionId) => {
    try {
      const response = await api.get(`/events/exhibition/${exhibitionId}/tour`);
      return response.data;
    } catch (error) {
      console.error('Error fetching virtual tour data:', error);
      throw error;
    }
  },

  trackVirtualTourInteraction: async (exhibitionId, interactionData) => {
    try {
      const response = await api.post(`/events/exhibition/${exhibitionId}/tour/track`, interactionData);
      return response.data;
    } catch (error) {
      console.error('Error tracking virtual tour interaction:', error);
      throw error;
    }
  },

  // Additional exhibition functions
  getVirtualTours: async () => {
    try {
      const response = await api.get('/events/exhibitions/virtual-tours');
      return response.data;
    } catch (error) {
      console.error('Error fetching virtual tours:', error);
      throw error;
    }
  },

  getExhibitionById: async (exhibitionId) => {
    try {
      const response = await api.get(`/events/exhibition/${exhibitionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exhibition:', error);
      throw error;
    }
  },

  getExhibitionArtworks: async (exhibitionId) => {
    try {
      const response = await api.get(`/events/exhibition/${exhibitionId}/artworks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exhibition artworks:', error);
      throw error;
    }
  },

  // User event submission functions
  sendEventSubmissionOTP: async (data = {}) => {
    try {
      console.log('📧 Frontend: Sending OTP request with data:', data);
      const response = await api.post('/events/user/submit/send-otp', data);
      console.log('📧 Frontend: OTP response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error sending event submission OTP:', error);
      throw error;
    }
  },

  submitUserEvent: async (eventData) => {
    try {
      console.log('📝 Frontend: Submitting event data:', eventData);
      const response = await api.post('/events/user/submit', eventData);
      console.log('📝 Frontend: Event submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error submitting user event:', error);
      throw error;
    }
  },

  // Admin event review functions
  getPendingEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/admin/pending', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending events:', error);
      throw error;
    }
  },

  approveEvent: async (eventId, reviewNotes = '') => {
    try {
      const response = await api.post(`/events/${eventId}/approve`, { reviewNotes });
      return response.data;
    } catch (error) {
      console.error('Error approving event:', error);
      throw error;
    }
  },

  rejectEvent: async (eventId, reviewNotes) => {
    try {
      const response = await api.post(`/events/${eventId}/reject`, { reviewNotes });
      return response.data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error;
    }
  },
};

export default eventService;