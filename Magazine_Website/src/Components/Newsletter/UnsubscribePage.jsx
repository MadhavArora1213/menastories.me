import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { newsletterService } from '../../services/newsletterService';
import toast from 'react-hot-toast';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useParams(); // For token-based unsubscribe
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // If token is provided in URL, attempt automatic unsubscribe
    if (token) {
      handleTokenUnsubscribe(token);
    }
  }, [searchParams, token]);

  const handleTokenUnsubscribe = async (unsubscribeToken) => {
    setLoading(true);
    setError(null);

    try {
      await newsletterService.unsubscribeWithToken(unsubscribeToken);
      setUnsubscribed(true);
      toast.success('Successfully unsubscribed from newsletter');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unsubscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await newsletterService.unsubscribe(email);
      setUnsubscribed(true);
      toast.success('Successfully unsubscribed from newsletter');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to unsubscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = () => {
    // Redirect to newsletter signup page
    navigate('/newsletter/subscribe');
  };

  if (unsubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unsubscribed Successfully
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have been successfully unsubscribed from our newsletter.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              You will no longer receive newsletter emails from us.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResubscribe}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Subscribe Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If token is provided and we're still loading, show loading state
  if (token && loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Unsubscribe Request
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your unsubscribe request...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unsubscribe from Newsletter
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry to see you go. Please confirm your email address to unsubscribe.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            <div>
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

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <button
              onClick={handleUnsubscribe}
              disabled={loading || !email}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Unsubscribing...
                </div>
              ) : (
                'Unsubscribe from Newsletter'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Changed your mind?{' '}
                <button
                  onClick={handleResubscribe}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Subscribe again
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You can always resubscribe later if you change your mind.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;