import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaCheck, FaTimes, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://menastories.me'}/api/auth/verify-email`, {
        email: email,
        otp: otp
      });

      toast.success(response.data.message || 'Email verified successfully!');

      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://menastories.me'}/api/auth/resend-otp`, {
        email: email
      });

      toast.success(response.data.message || 'Verification code sent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <FaEnvelope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
            {email || 'your email address'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-4 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend Code
                  </button>
                </p>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;