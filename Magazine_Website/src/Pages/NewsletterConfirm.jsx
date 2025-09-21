import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { newsletterService } from '../services/newsletterService';
import toast from 'react-hot-toast';

const NewsletterConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. No token provided.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await newsletterService.confirmSubscription(token);
        setStatus('success');
        setMessage(response.message || 'Your email has been confirmed successfully!');
        toast.success('Newsletter subscription confirmed!');

        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate('/newsletter/success');
        }, 3000);

      } catch (error) {
        console.error('Confirmation error:', error);

        if (error.message?.includes('Invalid or expired')) {
          setStatus('expired');
          setMessage('This confirmation link has expired or is invalid. Please try subscribing again.');
        } else {
          setStatus('error');
          setMessage(error.message || 'Failed to confirm your subscription. Please try again.');
        }

        toast.error(error.message || 'Failed to confirm subscription');
      }
    };

    confirmSubscription();
  }, [token, navigate]);

  const handleResubscribe = () => {
    navigate('/'); // Redirect to home page where they can subscribe again
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            {status === 'loading' && <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />}
            {status === 'success' && <FaCheck className="h-8 w-8 text-green-600" />}
            {status === 'error' && <FaTimes className="h-8 w-8 text-red-600" />}
            {status === 'expired' && <FaEnvelope className="h-8 w-8 text-yellow-600" />}
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Confirming Subscription...'}
            {status === 'success' && 'Subscription Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
            {status === 'expired' && 'Link Expired'}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Welcome to our newsletter!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>You'll start receiving our latest updates and articles in your inbox.</p>
                    <p className="mt-1 text-xs">Redirecting to success page...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaEnvelope className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Need to subscribe again?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Confirmation links expire after 24 hours for security reasons.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleResubscribe}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Subscribe Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaTimes className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Something went wrong
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Please try subscribing again or contact support if the problem persists.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleResubscribe}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaSpinner className="h-5 w-5 text-blue-400 animate-spin" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Processing your confirmation...
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Please wait while we confirm your subscription.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterConfirm;