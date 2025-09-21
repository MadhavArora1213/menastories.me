import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';

const WhatsAppIntegration = ({
  campaign,
  onSave,
  onTest,
  onSend,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // WhatsApp configuration
  const [config, setConfig] = useState({
    businessAccountId: campaign?.whatsappBusinessAccountId || '',
    accessToken: campaign?.whatsappAccessToken || '',
    phoneNumberId: campaign?.whatsappPhoneNumberId || '',
    templateName: campaign?.whatsappTemplateName || '',
    templateLanguage: campaign?.whatsappTemplateLanguage || 'en'
  });

  // Test data
  const [testData, setTestData] = useState({
    phoneNumber: '',
    subscriberId: '',
    customData: {}
  });

  // Campaign data
  const [campaignData, setCampaignData] = useState({
    name: campaign?.name || '',
    message: campaign?.message || '',
    mediaUrl: campaign?.mediaUrl || '',
    mediaType: campaign?.mediaType || '',
    mediaCaption: campaign?.mediaCaption || '',
    quickReplies: campaign?.quickReplies || [],
    ctaType: campaign?.ctaType || 'none',
    ctaUrl: campaign?.ctaUrl || '',
    ctaPhone: campaign?.ctaPhone || '',
    ctaText: campaign?.ctaText || ''
  });

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCampaignChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestDataChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuickReply = () => {
    setCampaignData(prev => ({
      ...prev,
      quickReplies: [...prev.quickReplies, { title: '', payload: '' }]
    }));
  };

  const updateQuickReply = (index, field, value) => {
    setCampaignData(prev => ({
      ...prev,
      quickReplies: prev.quickReplies.map((reply, i) =>
        i === index ? { ...reply, [field]: value } : reply
      )
    }));
  };

  const removeQuickReply = (index) => {
    setCampaignData(prev => ({
      ...prev,
      quickReplies: prev.quickReplies.filter((_, i) => i !== index)
    }));
  };

  const validateConfig = () => {
    const errors = [];

    if (!config.businessAccountId) {
      errors.push('Business Account ID is required');
    }

    if (!config.accessToken) {
      errors.push('Access Token is required');
    }

    if (!config.phoneNumberId) {
      errors.push('Phone Number ID is required');
    }

    if (!config.templateName) {
      errors.push('Template Name is required');
    }

    return errors;
  };

  const validateCampaign = () => {
    const errors = [];

    if (!campaignData.name.trim()) {
      errors.push('Campaign name is required');
    }

    if (!campaignData.message.trim()) {
      errors.push('Message is required');
    }

    if (campaignData.message.length > 4096) {
      errors.push('Message cannot exceed 4096 characters');
    }

    if (campaignData.mediaUrl && !campaignData.mediaType) {
      errors.push('Media type is required when media URL is provided');
    }

    if (campaignData.ctaType === 'url' && !campaignData.ctaUrl) {
      errors.push('CTA URL is required when CTA type is URL');
    }

    if (campaignData.ctaType === 'phone' && !campaignData.ctaPhone) {
      errors.push('CTA phone number is required when CTA type is phone');
    }

    if (campaignData.quickReplies.length > 3) {
      errors.push('Maximum 3 quick replies allowed');
    }

    return errors;
  };

  const handleSave = async () => {
    const configErrors = validateConfig();
    const campaignErrors = validateCampaign();

    const allErrors = [...configErrors, ...campaignErrors];

    if (allErrors.length > 0) {
      setError(allErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const saveData = {
        ...campaignData,
        ...config
      };

      if (onSave) {
        await onSave(saveData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save WhatsApp campaign:', err);
      setError('Failed to save WhatsApp campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testData.phoneNumber && !testData.subscriberId) {
      setError('Please provide either a phone number or subscriber ID for testing');
      return;
    }

    try {
      setTesting(true);
      setError(null);

      const testPayload = {
        ...campaignData,
        ...config,
        testPhoneNumber: testData.phoneNumber,
        testSubscriberId: testData.subscriberId,
        testCustomData: testData.customData
      };

      if (onTest) {
        await onTest(testPayload);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to test WhatsApp campaign:', err);
      setError('Failed to test WhatsApp campaign');
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async () => {
    const errors = validateCampaign();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSending(true);
      setError(null);

      if (onSend) {
        await onSend(campaignData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send WhatsApp campaign:', err);
      setError('Failed to send WhatsApp campaign');
    } finally {
      setSending(false);
    }
  };

  const mediaTypes = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio' }
  ];

  const ctaTypes = [
    { value: 'none', label: 'None' },
    { value: 'url', label: 'URL' },
    { value: 'phone', label: 'Phone Number' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hi', label: 'Hindi' }
  ];

  return (
    <div className={`whatsapp-integration bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            WhatsApp Campaign
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure and send WhatsApp messages to your subscribers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {testing ? 'Testing...' : 'Test Send'}
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Sending...' : 'Send Campaign'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">
              Operation completed successfully!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* WhatsApp Configuration */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            WhatsApp Business API Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Account ID *
              </label>
              <input
                type="text"
                value={config.businessAccountId}
                onChange={(e) => handleConfigChange('businessAccountId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your WhatsApp Business Account ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                value={config.phoneNumberId}
                onChange={(e) => handleConfigChange('phoneNumberId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your WhatsApp Phone Number ID"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Token *
              </label>
              <input
                type="password"
                value={config.accessToken}
                onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your WhatsApp Access Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={config.templateName}
                onChange={(e) => handleConfigChange('templateName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="marketing_campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Language
              </label>
              <select
                value={config.templateLanguage}
                onChange={(e) => handleConfigChange('templateLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Campaign Details
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignData.name}
                onChange={(e) => handleCampaignChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                value={campaignData.message}
                onChange={(e) => handleCampaignChange('message', e.target.value)}
                rows={6}
                maxLength={4096}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your WhatsApp message here..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {campaignData.message.length}/4096 characters
              </p>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Media (Optional)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={campaignData.mediaUrl}
                    onChange={(e) => handleCampaignChange('mediaUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media Type
                  </label>
                  <select
                    value={campaignData.mediaType}
                    onChange={(e) => handleCampaignChange('mediaType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select media type</option>
                    {mediaTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {campaignData.mediaUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media Caption
                  </label>
                  <input
                    type="text"
                    value={campaignData.mediaCaption}
                    onChange={(e) => handleCampaignChange('mediaCaption', e.target.value)}
                    maxLength={1024}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Caption for the media"
                  />
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Replies (Optional)
                </h4>
                <button
                  onClick={addQuickReply}
                  disabled={campaignData.quickReplies.length >= 3}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Reply
                </button>
              </div>

              {campaignData.quickReplies.map((reply, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={reply.title}
                    onChange={(e) => updateQuickReply(index, 'title', e.target.value)}
                    placeholder="Reply text"
                    maxLength={20}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={reply.payload}
                    onChange={(e) => updateQuickReply(index, 'payload', e.target.value)}
                    placeholder="Payload"
                    maxLength={256}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => removeQuickReply(index)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {campaignData.quickReplies.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Quick replies allow users to respond with predefined options
                </p>
              )}
            </div>

            {/* Call-to-Action */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Call-to-Action (Optional)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CTA Type
                  </label>
                  <select
                    value={campaignData.ctaType}
                    onChange={(e) => handleCampaignChange('ctaType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {ctaTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {campaignData.ctaType === 'url' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CTA URL
                    </label>
                    <input
                      type="url"
                      value={campaignData.ctaUrl}
                      onChange={(e) => handleCampaignChange('ctaUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {campaignData.ctaType === 'phone' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CTA Phone Number
                    </label>
                    <input
                      type="tel"
                      value={campaignData.ctaPhone}
                      onChange={(e) => handleCampaignChange('ctaPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+1234567890"
                    />
                  </div>
                )}

                {(campaignData.ctaType === 'url' || campaignData.ctaType === 'phone') && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      value={campaignData.ctaText}
                      onChange={(e) => handleCampaignChange('ctaText', e.target.value)}
                      maxLength={25}
                      className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Click here"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Test Campaign
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Phone Number
              </label>
              <input
                type="tel"
                value={testData.phoneNumber}
                onChange={(e) => handleTestDataChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or Test Subscriber ID
              </label>
              <input
                type="text"
                value={testData.subscriberId}
                onChange={(e) => handleTestDataChange('subscriberId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="subscriber-uuid"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Test your campaign with a specific phone number or subscriber before sending to all recipients.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;