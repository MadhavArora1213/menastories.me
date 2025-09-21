import React, { useState } from 'react';
import { newsletterService } from '../../services/newsletterService';

const NewsletterSignup = ({
  variant = 'default', // 'default', 'inline', 'popup', 'footer'
  showPreferences = true,
  showWhatsApp = true,
  customTitle,
  customDescription,
  onSubscribe,
  onError,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    whatsappEnabled: false,
    preferences: {
      frequency: 'weekly',
      categories: [],
      authors: [],
      contentTypes: ['articles', 'news']
    }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreferenceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterService.validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.whatsappEnabled && formData.phoneNumber && !newsletterService.validatePhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await newsletterService.subscribe(formData);
      setSuccess(true);

      if (onSubscribe) {
        onSubscribe(response);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to subscribe. Please try again.';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Roundup' },
    { value: 'monthly', label: 'Monthly Summary' }
  ];

  const categoryOptions = [
    'Technology', 'Business', 'Politics', 'Sports', 'Entertainment',
    'Science', 'Health', 'Travel', 'Food', 'Fashion'
  ];

  const contentTypeOptions = [
    { value: 'articles', label: 'Articles' },
    { value: 'news', label: 'Breaking News' },
    { value: 'events', label: 'Events' },
    { value: 'podcasts', label: 'Podcasts' }
  ];

  if (success) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for subscribing to our newsletter. You'll receive updates at {formData.email}
        </p>
      </div>
    );
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="john@example.com"
        />
      </div>

      {/* WhatsApp */}
      {showWhatsApp && (
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="whatsappEnabled"
              name="whatsappEnabled"
              checked={formData.whatsappEnabled}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="whatsappEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Also subscribe to WhatsApp newsletters
            </label>
          </div>

          {formData.whatsappEnabled && (
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required={formData.whatsappEnabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+1234567890"
              />
            </div>
          )}
        </div>
      )}

      {/* Preferences */}
      {showPreferences && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowPreferencesForm(!showPreferencesForm)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {showPreferencesForm ? 'Hide' : 'Show'} Preferences
          </button>

          {showPreferencesForm && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Newsletter Frequency
                </label>
                <select
                  value={formData.preferences.frequency}
                  onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.contentTypes.includes(option.value)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.preferences.contentTypes, option.value]
                            : formData.preferences.contentTypes.filter(type => type !== option.value);
                          handlePreferenceChange('contentTypes', updated);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.categories.includes(category)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.preferences.categories, category]
                            : formData.preferences.categories.filter(cat => cat !== category);
                          handlePreferenceChange('categories', updated);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Subscribing...
          </div>
        ) : (
          'Subscribe to Newsletter'
        )}
      </button>

      {/* Privacy Notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By subscribing, you agree to our{' '}
        <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
          Privacy Policy
        </a>{' '}
        and consent to receive newsletters. You can unsubscribe at any time.
      </p>
    </form>
  );

  // Different variants
  if (variant === 'inline') {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {customTitle || 'Stay Updated'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {customDescription || 'Get the latest articles and news delivered to your inbox.'}
          </p>
        </div>
        {renderForm()}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`max-w-sm ${className}`}>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {customTitle || 'Newsletter'}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          {customDescription || 'Subscribe for weekly updates'}
        </p>
        {renderForm()}
      </div>
    );
  }

  if (variant === 'popup') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {customTitle || 'Subscribe to Our Newsletter'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {customDescription || 'Get exclusive content and stay updated with our latest articles.'}
              </p>
            </div>
            {renderForm()}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {customTitle || 'Subscribe to Our Newsletter'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {customDescription || 'Get the latest articles, news, and exclusive content delivered to your inbox.'}
        </p>
      </div>
      {renderForm()}
    </div>
  );
};

export default NewsletterSignup;