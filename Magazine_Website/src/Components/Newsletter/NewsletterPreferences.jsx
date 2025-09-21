import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';
import { useAuth } from '../../context/AuthContext';

const NewsletterPreferences = ({
  email,
  onUpdate,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [preferences, setPreferences] = useState({
    frequency: 'weekly',
    categories: [],
    authors: [],
    contentTypes: ['articles', 'news', 'events'],
    language: 'en',
    receivePromotions: false,
    receivePartnerContent: false
  });

  const [availableCategories] = useState([
    'Technology', 'Business', 'Politics', 'Sports', 'Entertainment',
    'Science', 'Health', 'Travel', 'Food', 'Fashion', 'Lifestyle',
    'Education', 'Environment', 'Arts & Culture', 'Finance'
  ]);

  const [availableAuthors] = useState([
    'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson',
    'David Brown', 'Lisa Garcia', 'Tom Anderson', 'Rachel Lee'
  ]);

  useEffect(() => {
    if (email || user?.email) {
      loadCurrentPreferences();
    }
  }, [email, user]);

  const loadCurrentPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would fetch current preferences from the API
      // For now, we'll use default preferences
      const currentEmail = email || user?.email;
      if (currentEmail) {
        // Simulate API call
        setTimeout(() => {
          setPreferences({
            frequency: 'weekly',
            categories: ['Technology', 'Business'],
            authors: ['John Smith', 'Sarah Johnson'],
            contentTypes: ['articles', 'news'],
            language: 'en',
            receivePromotions: false,
            receivePartnerContent: false
          });
          setLoading(false);
        }, 500);
      }
    } catch (err) {
      setError('Failed to load preferences');
      setLoading(false);
    }
  };

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
    setSuccess(false);
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    setSuccess(false);
  };

  const handleAuthorToggle = (author) => {
    setPreferences(prev => ({
      ...prev,
      authors: prev.authors.includes(author)
        ? prev.authors.filter(a => a !== author)
        : [...prev.authors, author]
    }));
    setSuccess(false);
  };

  const handleContentTypeToggle = (contentType) => {
    setPreferences(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(contentType)
        ? prev.contentTypes.filter(c => c !== contentType)
        : [...prev.contentTypes, contentType]
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const currentEmail = email || user?.email;
      if (!currentEmail) {
        setError('No email address available');
        return;
      }

      await newsletterService.updatePreferences(currentEmail, preferences);

      setSuccess(true);
      if (onUpdate) {
        onUpdate(preferences);
      }
    } catch (err) {
      setError('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all newsletters?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const currentEmail = email || user?.email;
      if (!currentEmail) {
        setError('No email address available');
        return;
      }

      // In a real implementation, this would call an unsubscribe API
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('You have been unsubscribed from all newsletters.');
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError('Failed to unsubscribe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Daily Digest', description: 'Get a daily summary of the latest articles' },
    { value: 'weekly', label: 'Weekly Roundup', description: 'Receive a comprehensive weekly newsletter' },
    { value: 'monthly', label: 'Monthly Summary', description: 'Get monthly highlights and top stories' },
    { value: 'none', label: 'No Regular Newsletters', description: 'Only receive breaking news and special announcements' }
  ];

  const contentTypeOptions = [
    { value: 'articles', label: 'Articles', description: 'Regular articles and features' },
    { value: 'news', label: 'Breaking News', description: 'Important news and updates' },
    { value: 'events', label: 'Events', description: 'Upcoming events and announcements' },
    { value: 'podcasts', label: 'Podcasts', description: 'New podcast episodes and shows' },
    { value: 'videos', label: 'Videos', description: 'Video content and interviews' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' }
  ];

  return (
    <div className={`newsletter-preferences max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Newsletter Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize what you receive and how often. You can change these settings anytime.
        </p>
        {email && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Managing preferences for: {email}
          </p>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your preferences have been updated successfully!
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Frequency */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Newsletter Frequency
          </h3>
          <div className="space-y-3">
            {frequencyOptions.map(option => (
              <label key={option.value} className="flex items-start">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={preferences.frequency === option.value}
                  onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Content Types
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select the types of content you want to receive:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contentTypeOptions.map(option => (
              <label key={option.value} className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.contentTypes.includes(option.value)}
                  onChange={() => handleContentTypeToggle(option.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Preferred Categories
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose your areas of interest:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableCategories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Authors */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Favorite Authors
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get notified when these authors publish new content:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableAuthors.map(author => (
              <label key={author} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.authors.includes(author)}
                  onChange={() => handleAuthorToggle(author)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {author}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Language
          </h3>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Options */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Additional Options
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.receivePromotions}
                onChange={(e) => handlePreferenceChange('receivePromotions', e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Receive promotional offers and special deals
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.receivePartnerContent}
                onChange={(e) => handlePreferenceChange('receivePartnerContent', e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Receive content from our partners and sponsors
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Preferences'
            )}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleUnsubscribe}
            disabled={saving}
            className="px-4 py-2 text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Unsubscribe from All
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="mb-2">
            <strong>Privacy Notice:</strong> We respect your privacy and will only use your email address to send you the content you've requested.
          </p>
          <p>
            You can unsubscribe or change your preferences at any time. For more information, please read our{' '}
            <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreferences;