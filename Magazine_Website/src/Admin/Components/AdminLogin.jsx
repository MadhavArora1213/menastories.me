import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, error } = useAdminAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    // Check for message parameter in URL
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      switch (urlMessage) {
        case 'access_denied':
          setMessage('Access denied. You do not have permission to perform this action.');
          break;
        case 'session_expired':
          setMessage('Your session has expired. Please log in again.');
          break;
        default:
          setMessage('Please log in to continue.');
      }
    }
  }, [searchParams]);

  const bgMain = isDark ? "bg-black" : "bg-white";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const cardBg = isDark ? "bg-gray-900/50 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm";
  const borderColor = isDark ? "border-white/10" : "border-black/10";
  const inputBg = isDark ? "bg-black border-white/20" : "bg-white border-black/20";
  const inputText = isDark ? "text-white placeholder-gray-400" : "text-black placeholder-gray-500";
  const btnBg = isDark ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-900 text-white";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // Redirect to admin dashboard after successful login
      navigate('/admin');
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      <div className={`max-w-md w-full space-y-8 ${cardBg} rounded-2xl p-8 border ${borderColor} shadow-2xl`}>
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto h-20 w-20 ${isDark ? "bg-white" : "bg-black"} rounded-full flex items-center justify-center mb-6`}>
            <svg className="h-12 w-12 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className={`text-3xl font-extrabold ${textMain}`}>
            Admin Login
          </h2>
          <p className={`mt-2 text-sm ${subText}`}>
            Sign in to your admin account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-500 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${textMain} mb-2`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg ${inputBg} ${inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${textMain} mb-2`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 border rounded-lg ${inputBg} ${inputText} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg ${btnBg} disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign in
                </div>
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className={`text-sm font-medium ${isDark ? "text-blue-200" : "text-blue-800"} mb-2`}>
              Admin Credentials (1 Account Per Role)
            </h4>
            <div className="space-y-1 text-xs">
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Master Admin:</strong> masteradmin1@magazine.com / MasterAdmin@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Webmaster:</strong> webmaster1@magazine.com / Webmaster@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Content Admin:</strong> contentadmin1@magazine.com / ContentAdmin@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Editor-in-Chief:</strong> editor-in-chief1@magazine.com / Editor-in-Chief@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Section Editors:</strong> sectioneditors1@magazine.com / SectionEditors@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Senior Writers:</strong> seniorwriters1@magazine.com / SeniorWriters@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Staff Writers:</strong> staffwriters1@magazine.com / StaffWriters@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Contributors:</strong> contributors1@magazine.com / Contributors@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Reviewers:</strong> reviewers1@magazine.com / Reviewers@123
              </p>
              <p className={isDark ? "text-blue-300" : "text-blue-700"}>
                <strong>Social Media Manager:</strong> socialmediamanager1@magazine.com / SocialMediaManager@123
              </p>
            </div>
            <p className={`text-xs mt-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              ✅ Total: 10 admin accounts created (1 per role)
            </p>
          </div> */}

          {/* Role System Info */}
          {/* <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className={`text-sm font-medium ${isDark ? "text-green-200" : "text-green-800"} mb-2`}>
              Role-Based Access System
            </h4>
            <div className="space-y-1 text-xs">
              <p className={isDark ? "text-green-300" : "text-green-700"}>
                <strong>10 Roles:</strong> Master Admin, Content Admin, Editor-in-Chief, Section Editors, Senior Writers, Staff Writers, Contributors, Reviewers, Social Media Manager, Webmaster
              </p>
              <p className={isDark ? "text-green-300" : "text-green-700"}>
                Each role has specific permissions for content management, user access, and system functions.
              </p>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
