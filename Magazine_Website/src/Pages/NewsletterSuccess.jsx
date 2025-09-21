import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCheck, FaEnvelope, FaHome, FaNewspaper } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NewsletterSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show success toast
    toast.success('Welcome to our newsletter! 🎉');

    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <FaCheck className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Aboard! 🎉
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Your newsletter subscription has been confirmed successfully!
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <FaEnvelope className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-medium text-gray-900">What happens next?</span>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  You'll receive our latest articles and updates directly in your inbox
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Get exclusive access to behind-the-scenes content and special features
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p className="ml-3 text-sm text-gray-600">
                  Be the first to know about upcoming events and breaking news
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaHome className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>

              <Link
                to="/newsletter-archive"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaNewspaper className="mr-2 h-4 w-4" />
                Browse Archives
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to homepage in 5 seconds...
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 mb-2">
              Didn't receive our emails? Check your spam folder or contact support.
            </p>
            <Link
              to="/contact"
              className="text-xs text-blue-600 hover:text-blue-500 font-medium"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSuccess;