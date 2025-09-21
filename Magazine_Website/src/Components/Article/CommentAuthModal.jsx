import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const CommentAuthModal = ({ isOpen, onClose, onAuthSuccess, articleSlug }) => {
  const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    console.log('Sending OTP for comment auth:', { 
      name: formData.name, 
      email: formData.email, 
      articleSlug 
    });

    try {
      // Use the public comment OTP endpoint
      const response = await api.post(`/public/comments/send-otp`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        articleSlug: articleSlug
      });

      console.log('OTP response:', response.data);

      if (response.data.success) {
        setOtpSent(true);
        setStep('otp');
        toast.success('OTP sent to your email address');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Failed to send OTP:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });

      let errorMessage = 'Failed to send OTP';
      if (err.response?.data?.message) {
        errorMessage = typeof err.response.data.message === 'string'
          ? err.response.data.message
          : JSON.stringify(err.response.data.message);
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    console.log('Verifying OTP for comment auth:', { 
      email: formData.email, 
      otp: otp.trim(),
      articleSlug 
    });

    try {
      const response = await api.post(`/public/comments/verify-otp`, {
        email: formData.email,
        otp: otp.trim(),
        articleSlug: articleSlug
      });

      console.log('OTP verification response:', response.data);

      if (response.data.success) {
        const userData = {
          name: formData.name,
          email: formData.email,
          verified: true,
          temporary: true // Mark as temporary auth for comments
        };
        
        setStep('success');
        toast.success('Email verified successfully!');
        
        // Call the success callback with user data
        setTimeout(() => {
          onAuthSuccess(userData);
          handleClose();
        }, 1000);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Failed to verify OTP:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });

      let errorMessage = 'Failed to verify OTP';
      if (err.response?.data?.message) {
        errorMessage = typeof err.response.data.message === 'string'
          ? err.response.data.message
          : JSON.stringify(err.response.data.message);
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ name: '', email: '' });
    setOtp('');
    setOtpSent(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verify Your Email to Comment
          </h3>
          <p className="text-gray-600 text-sm">
            We need to verify your email before you can post comments
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Check your email for the 6-digit verification code
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Verified!
            </h3>
            <p className="text-gray-600">
              You can now post comments as {formData.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentAuthModal;