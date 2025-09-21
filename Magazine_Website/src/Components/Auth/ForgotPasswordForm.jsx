import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FaSpinner, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ForgotPasswordForm = () => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const watchedEmail = watch('email');

  const onSubmit = async (data) => {
    if (!captchaValue) {
      toast.error('Please complete the captcha verification');
      return;
    }

    try {
      clearError();
      await forgotPassword(data.email);
      setEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  const handleResendEmail = async () => {
    if (!captchaValue) {
      toast.error('Please complete the captcha verification');
      return;
    }

    try {
      await forgotPassword(email);
      toast.success('Password reset email sent again!');
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FaEnvelope className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to:
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {email}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="text-sm text-blue-800">
                <h3 className="font-medium">What's next?</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Check your email (including spam folder)</li>
                  <li>Click the reset password link</li>
                  <li>Create a new strong password</li>
                  <li>Sign in with your new password</li>
                </ul>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email?
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={setCaptchaValue}
                    onExpired={() => setCaptchaValue(null)}
                  />
                </div>
                
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading || !captchaValue}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading && <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  Resend email
                </button>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                type="email"
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={setCaptchaValue}
              onExpired={() => setCaptchaValue(null)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !captchaValue}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />}
              Send reset email
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;