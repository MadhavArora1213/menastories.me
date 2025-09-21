const { body } = require('express-validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

// Email validator with exactly one @ symbol
const validateEmail = body('email')
  .notEmpty().withMessage('Email is required')
  .matches(/^[^@]+@[^@]+\.[^@]+$/).withMessage('Email must contain exactly one @ symbol')
  .isEmail().withMessage('Please provide a valid email address');

// Phone number validator with country code requirement
const validatePhone = body('whatsappNumber')
  .notEmpty().withMessage('Phone number is required')
  .custom((value) => {
    // Must start with + followed by country code
    if (!value.startsWith('+')) {
      throw new Error('Phone number must include country code starting with +');
    }
    
    // Use libphonenumber-js to validate the number
    const phoneNumber = parsePhoneNumberFromString(value);
    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new Error('Please provide a valid phone number');
    }
    
    return true;
  });

// Category validation
exports.validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('design')
    .optional()
    .isIn(['design1', 'design2', 'design3'])
    .withMessage('Design must be one of: design1, design2, design3'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('parentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow null, undefined, or empty string for root categories
      if (!value || value === '') {
        return true;
      }
      // If value is provided, it must be a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error('Parent ID must be a valid UUID');
      }
      return true;
    }),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('featureImage')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value, { req }) => {
      // If no value provided, allow it (will be set by file upload)
      if (!value || value === '') {
        return true;
      }

      // If a file is being uploaded, allow any URL (including blob URLs for preview)
      if (req.file || req.files) {
        return true;
      }

      // Otherwise, validate as URL
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(value)) {
        throw new Error('Feature image must be a valid URL');
      }

      return true;
    })
];

// Admin login validation
exports.validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Admin registration validation
exports.validateAdminRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('roleId')
    .optional()
    .isUUID()
    .withMessage('Role ID must be a valid UUID')
];

// Profile update validation
exports.validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

// Password change validation
exports.validatePasswordChange = [
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters long'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Event validation
exports.validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location must be less than 500 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('eventType')
    .isIn(['conference', 'seminar', 'workshop', 'networking', 'trade_show', 'award_show', 'concert', 'festival', 'exhibition', 'charity_gala', 'masterclass', 'fashion_show', 'wellness_event', 'food_festival', 'travel_expo', 'cultural_event', 'community_event', 'fundraiser'])
    .withMessage('Invalid event type'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('agenda')
    .optional()
    .isArray()
    .withMessage('Agenda must be an array'),
  body('speakers')
    .optional()
    .isArray()
    .withMessage('Speakers must be an array')
];

// Event registration validation
exports.validateRegistration = [
  body('ticketType')
    .optional()
    .isIn(['standard', 'vip', 'premium'])
    .withMessage('Ticket type must be standard, vip, or premium'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests must be less than 1000 characters'),
  body('dietaryRestrictions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Dietary restrictions must be less than 500 characters')
];

// Event update validation
exports.validateUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'important', 'urgent', 'reminder'])
    .withMessage('Type must be general, important, urgent, or reminder'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
];

module.exports.validateEmail = validateEmail;
module.exports.validatePhone = validatePhone;

// Subcategory validation
exports.validateSubcategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subcategory name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('categoryId')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('type')
    .optional()
    .isIn(['regular', 'featured', 'special'])
    .withMessage('Type must be regular, featured, or special'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('featureImage')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value, { req }) => {
      // If no value provided, allow it (will be set by file upload)
      if (!value || value === '') {
        return true;
      }

      // If a file is being uploaded, allow any URL (including blob URLs for preview)
      if (req.file || req.files) {
        return true;
      }

      // Otherwise, validate as URL
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(value)) {
        throw new Error('Feature image must be a valid URL');
      }

      return true;
    }),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title must be less than 60 characters'),
  body('metaDescription')
   .optional()
   .trim()
   .isLength({ max: 160 })
   .withMessage('Meta description must be less than 160 characters')
];

// Tag validation
exports.validateTag = [
 body('name')
   .trim()
   .isLength({ min: 2, max: 50 })
   .withMessage('Tag name must be between 2 and 50 characters'),
 body('type')
   .optional()
   .isIn(['regular', 'special_feature', 'trending', 'multimedia', 'interactive', 'event'])
   .withMessage('Type must be one of: regular, special_feature, trending, multimedia, interactive, event'),
 body('description')
   .optional()
   .trim()
   .isLength({ max: 200 })
   .withMessage('Description must be less than 200 characters'),
 body('categoryId')
   .optional({ nullable: true, checkFalsy: true })
   .custom((value) => {
     // Allow null, undefined, or empty string
     if (!value || value === '') {
       return true;
     }
     // If value is provided, it must be a valid UUID
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     if (!uuidRegex.test(value)) {
       throw new Error('Category ID must be a valid UUID');
     }
     return true;
   }),
 body('parentId')
   .optional({ nullable: true, checkFalsy: true })
   .custom((value) => {
     // Allow null, undefined, or empty string
     if (!value || value === '') {
       return true;
     }
     // If value is provided, it must be a valid UUID
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     if (!uuidRegex.test(value)) {
       throw new Error('Parent ID must be a valid UUID');
     }
     return true;
   })
];