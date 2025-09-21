import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaCheck, FaSpinner, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { newsletterService } from '../../services/newsletterService';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

const NewsletterSubscriptionPopup = ({ onClose, onSubscribe }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Phone, 3: OTP Email, 4: OTP Phone, 5: Details, 6: Success
  const [formData, setFormData] = useState({
    email: '',
    countryCode: '+91', // Default to India
    phoneNumber: '',
    whatsappConsent: true, // Required for WhatsApp OTP
    termsAccepted: false,
    marketingConsent: false,
    emailOtp: '',
    phoneOtp: '',
    preferences: {
      dailyDigest: true,
      weeklySummary: true,
      breakingNews: true,
      featuredArticles: true,
      specialOffers: false,
      whatsappUpdates: true // Required for WhatsApp
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState({ email: false, phone: false });
  const [otpVerified, setOtpVerified] = useState({ email: false, phone: false });
  const [resendTimer, setResendTimer] = useState({ email: 0, phone: 0 });



  // Country codes for dropdown
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return false; // Required
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid phone number (7-15 digits)
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    return formData.countryCode + formData.phoneNumber.replace(/\D/g, '');
  };

  // Auto-detect and separate country code from phone number
  const handlePhoneNumberChange = (value) => {
    // Remove all non-numeric characters except +
    const cleanValue = value.replace(/[^\d+]/g, '');

    // Check if the input starts with + followed by country code
    if (cleanValue.startsWith('+')) {
      // Try to match country codes from our list
      for (const country of countryCodes) {
        if (cleanValue.startsWith(country.code)) {
          // Found matching country code
          const countryCode = country.code;
          const phoneNumber = cleanValue.substring(country.code.length);

          // Update both country code and phone number
          setFormData(prev => ({
            ...prev,
            countryCode: countryCode,
            phoneNumber: phoneNumber
          }));

          // Clear any existing errors
          if (errors.phoneNumber) {
            setErrors(prev => ({
              ...prev,
              phoneNumber: ''
            }));
          }
          return;
        }
      }
    }

    // No country code detected, just update phone number
    handleInputChange('phoneNumber', cleanValue.replace(/\D/g, ''));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpStep = (type) => {
    const newErrors = {};
    const otpField = type === 'email' ? 'emailOtp' : 'phoneOtp';

    if (!formData[otpField] || formData[otpField].length !== 6) {
      newErrors[otpField] = `Please enter a valid 6-digit ${type} OTP`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      // Send email OTP
      try {
        setIsLoading(true);
        await newsletterService.sendEmailOtp({ email: formData.email });
        setOtpSent(prev => ({ ...prev, email: true }));
        setStep(3); // Go to email OTP step
      } catch (error) {
        toast.error('Failed to send email OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2 && validateStep2()) {
      // Send phone OTP
      try {
        setIsLoading(true);
        const fullPhoneNumber = getFullPhoneNumber();
        await newsletterService.sendPhoneOtp({ phoneNumber: fullPhoneNumber });
        setOtpSent(prev => ({ ...prev, phone: true }));
        setStep(4); // Go to phone OTP step
      } catch (error) {
        toast.error('Failed to send phone OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 3 && validateOtpStep('email')) {
      // Verify email OTP
      try {
        setIsLoading(true);
        await newsletterService.verifyEmailOtp({
          email: formData.email,
          otp: formData.emailOtp
        });
        setOtpVerified(prev => ({ ...prev, email: true }));
        setStep(2); // Go to phone step
      } catch (error) {
        toast.error('Invalid email OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 4 && validateOtpStep('phone')) {
      // Verify phone OTP
      try {
        setIsLoading(true);
        const fullPhoneNumber = getFullPhoneNumber();
        await newsletterService.verifyPhoneOtp({
          phoneNumber: fullPhoneNumber,
          otp: formData.phoneOtp
        });
        setOtpVerified(prev => ({ ...prev, phone: true }));
        setStep(5); // Go to preferences step
      } catch (error) {
        toast.error('Invalid phone OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (step === 5) {
      // Final step - submit subscription
      await handleSubscribe();
    }
  };

  const handleSubscribe = async () => {
    if (!captchaValue) {
      toast.error('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = getFullPhoneNumber();
      const subscriptionData = {
        ...formData,
        phoneNumber: fullPhoneNumber,
        source: 'website_popup',
        recaptchaToken: captchaValue
      };

      const response = await newsletterService.subscribe(subscriptionData);

      setIsSubscribed(true);
      setStep(6); // Success step
      toast.success('Successfully subscribed to newsletter!');

      if (onSubscribe) {
        onSubscribe(response);
      }

      // Auto close after 5 seconds to give user time to see success message
      setTimeout(() => {
        onClose();
      }, 5000);

    } catch (error) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaEnvelope className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSubscribed ? 'Welcome to Our Newsletter!' : 'Stay Updated'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        {!isSubscribed && (
          <div className="px-6 pt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 5 && (
                    <div className={`flex-1 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Email</span>
              <span>Phone</span>
              <span>Email OTP</span>
              <span>Phone OTP</span>
              <span>Complete</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {isSubscribed ? (
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                You're All Set!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for subscribing! You're now part of our newsletter community and will receive our latest updates and articles directly in your inbox.
                {formData.whatsappConsent && " We'll also send you WhatsApp updates!"}
              </p>
              <p className="text-sm text-gray-500">
                Your subscription is active immediately. Closing automatically in a few seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              {step === 1 && (
                // Step 1: Email Input
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enter Your Email
                    </h3>
                    <p className="text-gray-600">
                      We'll send you a verification code to confirm your email address.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2 h-4 w-4" />
                        Send Email OTP
                      </>
                    )}
                  </button>
                </>
              )}

              {step === 2 && (
                // Step 2: Phone Input
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enter Your Phone Number
                    </h3>
                    <p className="text-gray-600">
                      We'll send you a WhatsApp verification code to confirm your phone number.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="flex">
                      {/* Country Code Dropdown */}
                      <div className="relative">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => handleInputChange('countryCode', e.target.value)}
                          className="appearance-none bg-white border border-gray-300 rounded-l-md px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px]"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Phone Number Input */}
                      <div className="relative flex-1">
                        <FaPhone className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="tel"
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => handlePhoneNumberChange(e.target.value)}
                          placeholder="9876543210 or +919876543210"
                          className={`w-full pl-10 pr-3 py-2 border-l-0 border rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          maxLength="15"
                          required
                        />
                      </div>
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 <strong>Smart Input:</strong> You can paste full numbers like +919876543210 and we'll auto-detect the country code!
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Or enter just the number (e.g., 9876543210) after selecting your country
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      📱 Full number: {getFullPhoneNumber() || 'Select country code and enter number'}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <FaPhone className="mr-2 h-4 w-4" />
                          Send WhatsApp OTP
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                // Step 3: Email OTP Verification
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-gray-600">
                      We've sent a 6-digit code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Email OTP *
                    </label>
                    <input
                      type="text"
                      id="emailOtp"
                      value={formData.emailOtp}
                      onChange={(e) => handleInputChange('emailOtp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest ${
                        errors.emailOtp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength="6"
                      required
                    />
                    {errors.emailOtp && <p className="text-red-500 text-xs mt-1">{errors.emailOtp}</p>}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                // Step 4: Phone OTP Verification
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verify Your Phone
                    </h3>
                    <p className="text-gray-600">
                      We've sent a 6-digit code to <strong>{getFullPhoneNumber()}</strong> via WhatsApp
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phoneOtp" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter WhatsApp OTP *
                    </label>
                    <input
                      type="text"
                      id="phoneOtp"
                      value={formData.phoneOtp}
                      onChange={(e) => handleInputChange('phoneOtp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest ${
                        errors.phoneOtp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength="6"
                      required
                    />
                    {errors.phoneOtp && <p className="text-red-500 text-xs mt-1">{errors.phoneOtp}</p>}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Phone'
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 5 && (
                // Step 5: Preferences and Terms
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Customize Your Experience
                    </h3>
                    <p className="text-gray-600">
                      Choose what you'd like to receive and accept our terms.
                    </p>
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What would you like to receive?
                    </label>
                    <div className="space-y-3">
                      {Object.entries(formData.preferences).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePreferenceChange(key)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {key === 'dailyDigest' && '📧 Daily Digest'}
                            {key === 'weeklySummary' && '📝 Weekly Summary'}
                            {key === 'breakingNews' && '🚨 Breaking News'}
                            {key === 'featuredArticles' && '⭐ Featured Articles'}
                            {key === 'specialOffers' && '🎁 Special Offers & Promotions'}
                            {key === 'whatsappUpdates' && '💬 WhatsApp Updates'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        className={`mt-1 h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                          errors.termsAccepted ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                        I accept the{' '}
                        <a href="/terms-and-conditions" target="_blank" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>
                        {' '}and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                        *
                      </label>
                    </div>
                    {errors.termsAccepted && <p className="text-red-500 text-xs ml-7">{errors.termsAccepted}</p>}

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="marketingConsent"
                        checked={formData.marketingConsent}
                        onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                        I agree to receive marketing communications and newsletters
                      </label>
                    </div>
                  </div>

                  {/* Google reCAPTCHA */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaShieldAlt className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Security Verification</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Complete the reCAPTCHA to verify you're not a robot
                    </p>
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={setCaptchaValue}
                        onExpired={() => setCaptchaValue(null)}
                      />
                    </div>
                    {captchaValue && (
                      <div className="mt-2 text-xs text-green-600 flex items-center">
                        <FaCheck className="mr-1" />
                        Verification completed
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="mr-2 h-4 w-4" />
                          Subscribe Now
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterSubscriptionPopup;