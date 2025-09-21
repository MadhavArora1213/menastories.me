import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';

const SystemSettings = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Echo Magazine',
      siteDescription: 'Your premier source for news and insights',
      siteUrl: 'https://echomagazine.com',
      adminEmail: 'admin@echomagazine.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      sessionTimeout: 15,
      passwordMinLength: 8,
      twoFactorAuth: true,
      loginAttempts: 5,
      ipWhitelist: '',
      bruteForceProtection: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@echomagazine.com',
      fromName: 'Echo Magazine'
    },
    performance: {
      cacheEnabled: true,
      cacheTimeout: 3600,
      compressionEnabled: true,
      minifyAssets: true,
      cdnEnabled: false,
      cdnUrl: ''
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: '/backups',
      includeDatabase: true,
      includeFiles: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';
  const modalBg = isDark ? 'bg-gray-900' : 'bg-white';

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'performance', label: 'Performance', icon: 'speed' },
    { id: 'backup', label: 'Backup', icon: 'backup' }
  ];

  const handleSave = async (section) => {
    setLoading(true);
    setSaveStatus('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Site Name</label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows="3"
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Site URL</label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Admin Email</label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Dubai">Dubai</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => updateSetting('general', 'language', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="maintenanceMode" className={`text-sm ${textMain}`}>
          Enable Maintenance Mode
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Password Min Length</label>
          <input
            type="number"
            min="6"
            max="32"
            value={settings.security.passwordMinLength}
            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="20"
            value={settings.security.loginAttempts}
            onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div></div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>IP Whitelist (one per line)</label>
        <textarea
          value={settings.security.ipWhitelist}
          onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
          rows="4"
          placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="twoFactorAuth" className={`text-sm ${textMain}`}>
            Require Two-Factor Authentication
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="bruteForceProtection"
            checked={settings.security.bruteForceProtection}
            onChange={(e) => updateSetting('security', 'bruteForceProtection', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="bruteForceProtection" className={`text-sm ${textMain}`}>
            Enable Brute Force Protection
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>SMTP Host</label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>SMTP Port</label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>SMTP Username</label>
          <input
            type="text"
            value={settings.email.smtpUser}
            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>SMTP Password</label>
          <input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>From Email</label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>From Name</label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Test Email Configuration
        </button>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Cache Timeout (seconds)</label>
          <input
            type="number"
            min="300"
            max="86400"
            value={settings.performance.cacheTimeout}
            onChange={(e) => updateSetting('performance', 'cacheTimeout', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>CDN URL</label>
          <input
            type="url"
            value={settings.performance.cdnUrl}
            onChange={(e) => updateSetting('performance', 'cdnUrl', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={!settings.performance.cdnEnabled}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="cacheEnabled"
            checked={settings.performance.cacheEnabled}
            onChange={(e) => updateSetting('performance', 'cacheEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="cacheEnabled" className={`text-sm ${textMain}`}>
            Enable Caching
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="compressionEnabled"
            checked={settings.performance.compressionEnabled}
            onChange={(e) => updateSetting('performance', 'compressionEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="compressionEnabled" className={`text-sm ${textMain}`}>
            Enable Compression (GZIP)
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="minifyAssets"
            checked={settings.performance.minifyAssets}
            onChange={(e) => updateSetting('performance', 'minifyAssets', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="minifyAssets" className={`text-sm ${textMain}`}>
            Minify CSS/JavaScript Assets
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="cdnEnabled"
            checked={settings.performance.cdnEnabled}
            onChange={(e) => updateSetting('performance', 'cdnEnabled', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="cdnEnabled" className={`text-sm ${textMain}`}>
            Enable CDN
          </label>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Backup Frequency</label>
          <select
            value={settings.backup.backupFrequency}
            onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${textMain} mb-2`}>Retention Period (days)</label>
          <input
            type="number"
            min="1"
            max="365"
            value={settings.backup.backupRetention}
            onChange={(e) => updateSetting('backup', 'backupRetention', parseInt(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textMain} mb-2`}>Backup Location</label>
        <input
          type="text"
          value={settings.backup.backupLocation}
          onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
          className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoBackup"
            checked={settings.backup.autoBackup}
            onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="autoBackup" className={`text-sm ${textMain}`}>
            Enable Automatic Backups
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeDatabase"
            checked={settings.backup.includeDatabase}
            onChange={(e) => updateSetting('backup', 'includeDatabase', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="includeDatabase" className={`text-sm ${textMain}`}>
            Include Database in Backup
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeFiles"
            checked={settings.backup.includeFiles}
            onChange={(e) => updateSetting('backup', 'includeFiles', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="includeFiles" className={`text-sm ${textMain}`}>
            Include Files in Backup
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Run Backup Now
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          View Backup History
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${textMain} mb-2`}>System Settings</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSave(activeTab)}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition`}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveStatus.includes('Error')
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

export default SystemSettings;