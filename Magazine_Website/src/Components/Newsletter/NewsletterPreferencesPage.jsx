import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { newsletterService } from '../../services/newsletterService';
import toast from 'react-hot-toast';

const NewsletterPreferencesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useParams(); // For token-based preferences update
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subscriber, setSubscriber] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  const [preferences, setPreferences] = useState({
    frequency: 'weekly',
    categories: [],
    authors: [],
    contentTypes: ['articles', 'news'],
    language: 'en'
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      loadSubscriberData(emailParam);
    } else if (token) {
      // If token is provided, we can't load existing preferences without authentication
      // Show default preferences and allow user to enter email
    }
  }, [searchParams, token]);

  const loadSubscriberData = async (emailAddress) => {
    setLoading(true);
    try {
      // Get subscription status to load current preferences
      const status = await newsletterService.getSubscriptionStatus();
      if (status.subscribed && status.preferences) {
        setPreferences(status.preferences);
        setSubscriber({ email: emailAddress, preferences: status.preferences });
      }
    } catch (err) {
      console.error('Failed to load subscriber data:', err);
      // If not authenticated, we'll show a form to enter email
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSavePreferences = async () => {
    if (!email && !subscriber && !token) {
      setError('Please enter your email address');
      return;
    }

    if (!token && !email && !subscriber) {
      setError('Please enter your email address or log in to update preferences');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (token) {
        // Use token-based update
        await newsletterService.updatePreferencesWithToken(token, preferences);
      } else {
        // Use regular update
        await newsletterService.updatePreferences({ preferences, email: email || subscriber.email });
      }
      toast.success('Preferences updated successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update preferences. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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
    { value: 'podcasts', label: 'Podcasts' },
    { value: 'videos', label: 'Videos' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Newsletter Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize what you want to receive in your newsletter
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Email Input (if not authenticated and no token) */}
          {!subscriber && !token && (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email address"
                required
              />
            </div>
          )}

          {/* Token-based notice */}
          {token && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Secure Access:</strong> You're updating preferences using a secure token from your email.
                Your preferences will be saved automatically.
              </p>
            </div>
          )}

          {/* Frequency */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Newsletter Frequency
            </label>
            <select
              value={preferences.frequency}
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content Types
            </label>
            <div className="grid grid-cols-2 gap-3">
              {contentTypeOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.contentTypes.includes(option.value)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...preferences.contentTypes, option.value]
                        : preferences.contentTypes.filter(type => type !== option.value);
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Preferred Categories
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categoryOptions.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.categories.includes(category)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...preferences.categories, category]
                        : preferences.categories.filter(cat => cat !== category);
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSavePreferences}
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
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You can update your preferences anytime. Unsubscribe anytime from the link in our emails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPreferencesPage;