import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { useAdminAuth } from './context/AdminAuthContext';

const ProfileSettings = () => {
  const { theme, admin, updateProfile, changePassword } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phoneNumber: admin?.phoneNumber || '',
    department: admin?.department || '',
    profileImage: admin?.profileImage || ''
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'user' },
    { id: 'password', label: 'Change Password', icon: 'lock' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus('');

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setSaveStatus('Profile updated successfully!');
      } else {
        setSaveStatus(result.error || 'Error updating profile');
      }
    } catch (error) {
      setSaveStatus('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveStatus('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setSaveStatus('');

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setSaveStatus('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setSaveStatus(result.error || 'Error changing password');
      }
    } catch (error) {
      setSaveStatus('Error changing password. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const renderProfileTab = () => (
    <form onSubmit={handleProfileUpdate} className="space-y-6">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-200">
          {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div>
          <h3 className={`text-lg font-medium ${textMain}`}>{admin?.name}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{admin?.email}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{admin?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Full Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Phone Number</label>
          <input
            type="tel"
            value={profileData.phoneNumber}
            onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Department</label>
          <input
            type="text"
            value={profileData.department}
            onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Profile Image URL</label>
        <input
          type="url"
          value={profileData.profileImage}
          onChange={(e) => setProfileData(prev => ({ ...prev, profileImage: e.target.value }))}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition`}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );

  const renderPasswordTab = () => (
    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Current Password</label>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>New Password</label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required
          minLength="8"
        />
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Confirm New Password</label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition`}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${cardBg}`}>
        <h3 className={`text-lg font-medium ${textMain} mb-4`}>Theme Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={textMain}>Current Theme</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
            }`}>
              {isDark ? 'Dark' : 'Light'}
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Theme is automatically applied based on your system preference or can be changed in the theme context.
          </p>
        </div>
      </div>

      <div className={`p-6 rounded-lg border ${cardBg}`}>
        <h3 className={`text-lg font-medium ${textMain} mb-4`}>Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={textMain}>Email Notifications</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={textMain}>System Notifications</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={textMain}>Security Alerts</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Enabled
            </span>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg border ${cardBg}`}>
        <h3 className={`text-lg font-medium ${textMain} mb-4`}>Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={textMain}>Last Login</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={textMain}>Account Status</span>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={textMain}>Two-Factor Auth</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {admin?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'password':
        return renderPasswordTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textMain} mb-2`}>Profile Settings</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveStatus.includes('Error') || saveStatus.includes('not match') || saveStatus.includes('must be')
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* Settings Tabs */}
        <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition ${
                  activeTab === tab.id
                    ? `${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`
                    : `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;