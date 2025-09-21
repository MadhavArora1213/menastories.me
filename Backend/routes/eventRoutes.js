const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { adminAuthMiddleware, requireAdminRole } = require('../middleware/adminAuth');
const { userAuthMiddleware, requireUserAuth, optionalUserAuth } = require('../middleware/userAuth');
const { validateEvent, validateRegistration, validateUpdate } = require('../middleware/validators');

// Public routes
router.get('/', eventController.getEvents);
router.get('/categories', eventController.getEventCategories);
router.get('/types', eventController.getEventTypes);
router.get('/locations', eventController.getEventLocations);
router.get('/stats', eventController.getEventStats);
router.get('/calendar', eventController.getEventCalendar);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/search', eventController.searchEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/gallery', eventController.getEventGallery);
router.get('/:id/attendees', eventController.getEventAttendees);
router.get('/:id/updates', eventController.getEventUpdates);
router.get('/:id/schedule', eventController.getEventSchedule);
router.get('/:id/speakers', eventController.getEventSpeakers);

// Exhibition routes
router.get('/exhibitions/virtual-tours', eventController.getVirtualTours);
router.get('/exhibitions/:id', eventController.getExhibitionById);
router.get('/exhibitions/:id/artworks', eventController.getExhibitionArtworks);

// Registration routes (require authentication)
router.post('/:id/register', adminAuthMiddleware, validateRegistration, eventController.registerForEvent);
router.get('/registration/:registrationId', adminAuthMiddleware, eventController.getRegistrationDetails);
router.put('/registration/:registrationId', adminAuthMiddleware, eventController.updateRegistration);
router.delete('/registration/:registrationId', adminAuthMiddleware, eventController.cancelRegistration);
router.post('/registration/:registrationId/checkin', adminAuthMiddleware, eventController.checkInAttendee);

// User-specific routes
router.get('/user/registrations', adminAuthMiddleware, eventController.getUserRegistrations);
router.get('/user/upcoming', adminAuthMiddleware, eventController.getUserUpcomingEvents);

// User event submission routes (allow anonymous or authenticated users)
router.post('/user/submit/send-otp', userAuthMiddleware, eventController.sendEventSubmissionOTP);
router.post('/user/submit', userAuthMiddleware, eventController.submitUserEvent);

// Admin routes (require admin role)
router.post('/create', adminAuthMiddleware, requireAdminRole('Master Admin'), validateEvent, eventController.createEvent);
router.put('/:id', adminAuthMiddleware, requireAdminRole('Master Admin'), validateEvent, eventController.updateEvent);
router.delete('/:id', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.deleteEvent);
router.post('/:id/publish', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.publishEvent);
router.post('/:id/unpublish', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.unpublishEvent);

// Event review routes (Master Admin only)
router.get('/admin/pending', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getPendingEvents);
router.post('/:id/approve', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.approveEvent);
router.post('/:id/reject', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.rejectEvent);

// Event management (admin)
router.get('/admin/all', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getAllEvents);
router.get('/:id/registrations', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getEventRegistrations);
router.post('/:id/updates', adminAuthMiddleware, requireAdminRole('Master Admin'), validateUpdate, eventController.createEventUpdate);
router.put('/:id/updates/:updateId', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.updateEventUpdate);
router.delete('/:id/updates/:updateId', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.deleteEventUpdate);

// Bulk operations (admin)
router.post('/bulk/publish', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.bulkPublishEvents);
router.post('/bulk/unpublish', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.bulkUnpublishEvents);
router.delete('/bulk/delete', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.bulkDeleteEvents);

// Analytics (admin)
router.get('/:id/analytics', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getEventAnalytics);
router.get('/analytics/overview', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getEventsAnalytics);

// QR Code routes
router.get('/registration/:registrationId/qrcode', eventController.generateQRCode);

// Export routes
router.get('/:id/export/attendees', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.exportAttendees);
router.get('/:id/export/registrations', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.exportRegistrations);

// Feedback routes
router.post('/:id/feedback', adminAuthMiddleware, eventController.submitEventFeedback);
router.get('/:id/feedback', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.getEventFeedback);

// Networking routes
router.get('/:id/networking/matches', adminAuthMiddleware, eventController.getNetworkingMatches);
router.post('/:id/networking/connect', adminAuthMiddleware, eventController.connectWithAttendee);

// Live stream routes
router.get('/:id/stream/status', eventController.getStreamStatus);
router.post('/:id/stream/start', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.startLiveStream);
router.post('/:id/stream/end', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.endLiveStream);

// Exhibition management (admin)
router.post('/:id/exhibitions', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.createExhibition);
router.put('/:id/exhibitions/:exhibitionId', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.updateExhibition);
router.delete('/:id/exhibitions/:exhibitionId', adminAuthMiddleware, requireAdminRole('Master Admin'), eventController.deleteExhibition);

// Virtual tour routes
router.get('/exhibitions/:id/virtual-tour', eventController.getVirtualTourData);
router.post('/exhibitions/:id/virtual-tour/analytics', eventController.trackVirtualTourInteraction);

module.exports = router;