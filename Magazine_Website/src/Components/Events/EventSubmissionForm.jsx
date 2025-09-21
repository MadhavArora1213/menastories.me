import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';

const EventSubmissionForm = ({ onClose, onSuccess, isAuthenticated }) => {
  const recaptchaRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'conference',
    category: 'business',
    startDate: '',
    endDate: '',
    venue: {
      name: '',
      address: '',
      city: '',
      country: 'UAE'
    },
    isVirtual: false,
    virtualDetails: {
      platform: '',
      meetingLink: '',
      accessCode: ''
    },
    capacity: '',
    price: '',
    currency: 'USD',
    tags: [],
    socialLinks: {
      website: '',
      facebook: '',
      instagram: '',
      linkedin: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      organizer: ''
    },
    acceptPrivacyPolicy: false,
    acceptEventRules: false,
    captchaToken: '',
    otpCode: '',
    submitterEmail: '', // For anonymous submissions
    submitterName: ''   // For anonymous submissions
  });

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState(''); // Store OTP when email fails
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Verification
  const [recaptchaError, setRecaptchaError] = useState('');

  const eventTypes = [
    { value: 'conference', label: 'Conference' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'networking', label: 'Networking' },
    { value: 'trade_show', label: 'Trade Show' },
    { value: 'award_show', label: 'Award Show' },
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'charity_gala', label: 'Charity Gala' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'fashion_show', label: 'Fashion Show' },
    { value: 'wellness_event', label: 'Wellness Event' },
    { value: 'food_festival', label: 'Food Festival' },
    { value: 'travel_expo', label: 'Travel Expo' },
    { value: 'cultural_event', label: 'Cultural Event' },
    { value: 'community_event', label: 'Community Event' },
    { value: 'fundraiser', label: 'Fundraiser' },
    { value: 'show', label: 'Show' }
  ];

  const categories = [
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'social', label: 'Social' },
    { value: 'educational', label: 'Educational' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'technology', label: 'Technology' },
    { value: 'health', label: 'Health' },
    { value: 'sports', label: 'Sports' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token received:', token ? 'Valid token' : 'No token');
    setFormData(prev => ({ ...prev, captchaToken: token }));
    setRecaptchaError('');
  };

  const handleRecaptchaExpired = () => {
    console.log('reCAPTCHA expired');
    setFormData(prev => ({ ...prev, captchaToken: '' }));
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleRecaptchaError = () => {
    console.log('reCAPTCHA error occurred');
    setRecaptchaError('reCAPTCHA verification failed. Please refresh the page and try again.');
    setFormData(prev => ({ ...prev, captchaToken: '' }));
    toast.error('reCAPTCHA verification failed. Please refresh the page and try again.');
  };

  const sendOTP = async () => {
    setOtpLoading(true);
    try {
      let requestData = {};

      // For anonymous users, send OTP to the provided email
      if (!isAuthenticated) {
        if (!formData.submitterEmail) {
          toast.error('Please enter your email address first');
          return;
        }
        requestData = { email: formData.submitterEmail };
      }
      // For authenticated users, don't send email in request body - backend uses req.user.email

      console.log('📧 Sending OTP request:', requestData);

      const response = await eventService.sendEventSubmissionOTP(requestData);

      console.log('📧 OTP response:', response);

      if (response.data && response.data.otp) {
        // Email failed but OTP is provided for testing
        setOtpSent(true);
        setFallbackOtp(response.data.otp);
        toast.success(response.data.message, {
          duration: 8000,
          style: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b'
          }
        });
      } else if (response.data && response.data.message) {
        setOtpSent(true);
        setFallbackOtp('');
        toast.success(response.data.message);
      } else {
        setOtpSent(true);
        setFallbackOtp('');
        toast.success('OTP sent to your email successfully!');
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);

      // If it's a network error, provide fallback option
      if (!error.response) {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Event description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (startDate < now) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    // Venue validation
    if (!formData.isVirtual && !formData.venue.name.trim()) {
      newErrors['venue.name'] = 'Venue name is required for physical events';
    }

    // Contact validation
    if (!formData.contactInfo.email.trim()) {
      newErrors['contactInfo.email'] = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Please enter a valid email address';
    }

    // Anonymous user validation
    if (!isAuthenticated) {
      if (!formData.submitterEmail.trim()) {
        newErrors.submitterEmail = 'Your email is required for verification';
      } else if (!/\S+@\S+\.\S+/.test(formData.submitterEmail)) {
        newErrors.submitterEmail = 'Please enter a valid email address';
      }

      if (!formData.submitterName.trim()) {
        newErrors.submitterName = 'Your name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.acceptPrivacyPolicy || !formData.acceptEventRules) {
      toast.error('You must accept the privacy policy and event rules');
      return;
    }

    if (!formData.captchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification');
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);
    try {
      setCurrentStep(2); // Move to verification step
      // Clear any previous fallback OTP
      setFallbackOtp('');
      // Automatically send OTP when moving to verification step
      await sendOTP();
    } catch (error) {
      toast.error('Failed to prepare submission');
      setCurrentStep(1); // Go back to form if OTP sending fails
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otpCode.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    // Additional validation before submission
    if (!formData.captchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission - convert empty strings to null for numeric fields
      const submissionData = {
        ...formData,
        capacity: formData.capacity === '' ? null : parseInt(formData.capacity) || null,
        price: formData.price === '' ? null : parseFloat(formData.price) || null,
        // Ensure arrays are properly formatted
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        eventContactNumbers: formData.contactInfo.phone ? [formData.contactInfo.phone] : [],
        eventWhatsappNumbers: [],
        eventContactEmails: [formData.contactInfo.email],
        eventTelegram: '',
        // Set default values for required fields
        eventRegistrationCharges: formData.price || 'Free',
        audience: 'Not mentioned',
        // Clean up contact info
        contactInfo: {
          ...formData.contactInfo,
          submitterEmail: formData.submitterEmail,
          submitterName: formData.submitterName
        }
      };

      console.log('Submitting event data:', submissionData);

      await eventService.submitUserEvent(submissionData);
      toast.success('🎉 Event submitted successfully! It will be reviewed by our team. Page will refresh shortly...');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal if callback provided
      if (onClose) {
        onClose();
      }

      // Reload the page after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Give user more time to see the success message

    } catch (error) {
      console.error('Event submission error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit event. Please try again.';
      toast.error(errorMessage);

      // If it's a validation error, go back to form
      if (error.response?.status === 400) {
        setCurrentStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset reCAPTCHA when component mounts
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  if (currentStep === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-[#162048] mb-4">Verify Your Submission</h2>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              An OTP has been sent to your email. Please enter it below to complete your event submission.
            </p>
            {fallbackOtp && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  📧 Email service unavailable. Use this OTP for testing:
                </p>
                <p className="text-lg font-mono font-bold text-yellow-900 mt-1">
                  {fallbackOtp}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleVerificationSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={formData.otpCode}
                onChange={(e) => setFormData(prev => ({ ...prev, otpCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#162048] text-white py-2 px-4 rounded-md hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Event...
                  </div>
                ) : (
                  'Submit Event'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={sendOTP}
              disabled={otpLoading}
              className="text-[#162048] hover:text-[#1a1a1a] text-sm underline disabled:opacity-50"
            >
              {otpLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#162048]">Submit Your Event</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Venue Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#162048] mb-4">Venue Information</h3>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVirtual"
                    checked={formData.isVirtual}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">This is a virtual event</span>
                </label>
              </div>

              {!formData.isVirtual ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      name="venue.name"
                      value={formData.venue.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                        errors['venue.name'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required={!formData.isVirtual}
                    />
                    {errors['venue.name'] && <p className="text-red-500 text-sm mt-1">{errors['venue.name']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="venue.city"
                      value={formData.venue.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <input
                      type="text"
                      name="virtualDetails.platform"
                      value={formData.virtualDetails.platform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                      placeholder="Zoom, Microsoft Teams, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      name="virtualDetails.meetingLink"
                      value={formData.virtualDetails.meetingLink}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#162048] mb-4">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048] ${
                      errors['contactInfo.email'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors['contactInfo.email'] && <p className="text-red-500 text-sm mt-1">{errors['contactInfo.email']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                  />
                </div>
              </div>
            </div>

            {/* Anonymous Submitter Information (only shown for non-authenticated users) */}
            {!isAuthenticated && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-[#162048] mb-4">Your Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Since you're not logged in, please provide your contact information for verification purposes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="submitterEmail"
                      value={formData.submitterEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                      placeholder="your-email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="submitterName"
                      value={formData.submitterName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#162048]"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#162048] mb-4">Terms and Conditions</h3>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptPrivacyPolicy"
                    checked={formData.acceptPrivacyPolicy}
                    onChange={handleInputChange}
                    className="mt-1 mr-2"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I accept the <a href="/privacy-policy" target="_blank" className="text-[#162048] underline">Privacy Policy</a> *
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptEventRules"
                    checked={formData.acceptEventRules}
                    onChange={handleInputChange}
                    className="mt-1 mr-2"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I accept the event submission rules and guidelines *
                  </span>
                </label>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-[#162048] mb-4">Verification</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please complete the reCAPTCHA verification *
                </label>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  onExpired={handleRecaptchaExpired}
                  onError={handleRecaptchaError}
                  theme="light"
                  size="normal"
                />
                {recaptchaError && <p className="text-red-500 text-sm mt-1">{recaptchaError}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#162048] text-white py-3 px-4 rounded-md hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventSubmissionForm;