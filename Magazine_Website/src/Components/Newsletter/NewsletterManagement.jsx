import React, { useState, useEffect } from 'react';
import { newsletterService } from '../../services/newsletterService';
import NewsletterBuilder from './NewsletterBuilder';
import EmailTemplateEditor from './EmailTemplateEditor';
import WhatsAppIntegration from './WhatsAppIntegration';
import SubscriberManagement from './SubscriberManagement';
import CommunicationLog from './CommunicationLog';

const NewsletterManagement = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showWhatsAppEditor, setShowWhatsAppEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSubscribers: 0,
    totalTemplates: 0,
    sentThisMonth: 0,
    openRate: 0,
    clickRate: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load campaigns, templates, and statistics concurrently
      const [campaignsResponse, templatesResponse, statsResponse] = await Promise.all([
        newsletterService.getCampaigns({ limit: 20 }),
        newsletterService.getTemplates({ limit: 20 }),
        newsletterService.getAnalyticsOverview()
      ]);

      setCampaigns(campaignsResponse.campaigns || []);
      setTemplates(templatesResponse.templates || []);

      // Calculate statistics
      if (statsResponse) {
        setStats({
          totalCampaigns: campaignsResponse.totalCount || 0,
          totalTemplates: templatesResponse.totalCount || 0,
          totalSubscribers: statsResponse.totalSubscribers || 0,
          sentThisMonth: statsResponse.sentThisMonth || 0,
          openRate: statsResponse.openRate || 0,
          clickRate: statsResponse.clickRate || 0
        });
      }
    } catch (err) {
      console.error('Failed to load newsletter management data:', err);
      setError('Failed to load newsletter management data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingItem(null);
    setShowCampaignBuilder(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingItem(campaign);
    setShowCampaignBuilder(true);
  };

  const handleCreateTemplate = () => {
    setEditingItem(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template) => {
    setEditingItem(template);
    setShowTemplateEditor(true);
  };

  const handleCreateWhatsApp = () => {
    setEditingItem(null);
    setShowWhatsAppEditor(true);
  };

  const handleCampaignSave = async (campaignData) => {
    try {
      if (editingItem) {
        await newsletterService.updateCampaign(editingItem.id, campaignData);
      } else {
        await newsletterService.createCampaign(campaignData);
      }

      await loadInitialData(); // Refresh data
      setShowCampaignBuilder(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save campaign:', err);
      throw err;
    }
  };

  const handleTemplateSave = async (templateData) => {
    try {
      if (editingItem) {
        await newsletterService.updateTemplate(editingItem.id, templateData);
      } else {
        await newsletterService.createTemplate(templateData);
      }

      await loadInitialData(); // Refresh data
      setShowTemplateEditor(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save template:', err);
      throw err;
    }
  };

  const handleWhatsAppSave = async (whatsappData) => {
    try {
      if (editingItem) {
        await newsletterService.updateWhatsAppCampaign(editingItem.id, whatsappData);
      } else {
        await newsletterService.createWhatsAppCampaign(whatsappData);
      }

      await loadInitialData(); // Refresh data
      setShowWhatsAppEditor(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save WhatsApp campaign:', err);
      throw err;
    }
  };

  const handleSendCampaign = async (campaignId) => {
    try {
      await newsletterService.sendCampaign(campaignId);
      await loadInitialData(); // Refresh data
    } catch (err) {
      console.error('Failed to send campaign:', err);
      throw err;
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await newsletterService.deleteCampaign(campaignId);
      await loadInitialData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      throw err;
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await newsletterService.deleteTemplate(templateId);
      await loadInitialData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete template:', err);
      throw err;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20',
      scheduled: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
      sending: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
      sent: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
      paused: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
      cancelled: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
      failed: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      sending: 'Sending',
      sent: 'Sent',
      paused: 'Paused',
      cancelled: 'Cancelled',
      failed: 'Failed'
    };
    return labels[status] || status;
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: '📧' },
    { id: 'templates', label: 'Templates', icon: '🎨' },
    { id: 'subscribers', label: 'Subscribers', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`newsletter-management bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Newsletter Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and analyze your newsletter campaigns
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateCampaign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Campaign
          </button>
          <button
            onClick={handleCreateTemplate}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            New Template
          </button>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
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

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Campaigns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSubscribers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalTemplates}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.sentThisMonth}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sent This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.openRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.clickRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Click Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Email Campaigns
              </h3>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No campaigns yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create your first newsletter campaign to get started.
                </p>
                <button
                  onClick={handleCreateCampaign}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {campaign.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {campaign.description}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recipients:</span>
                        <span>{campaign.totalRecipients || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          >
                            Send
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Email Templates
              </h3>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Template
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create your first email template to get started.
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                      {template.isDefault && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/20 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{template.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="capitalize">{template.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {/* Handle preview */}}
                          className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                        >
                          Preview
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <SubscriberManagement
            selectable={true}
            onSubscriberSelect={(subscriber, selected) => {
              // Handle subscriber selection
              console.log('Selected subscriber:', subscriber, selected);
            }}
            onBulkAction={(action, subscribers) => {
              // Handle bulk actions
              console.log('Bulk action:', action, 'on subscribers:', subscribers);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <CommunicationLog />
        )}

        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                WhatsApp Campaigns
              </h3>
              <button
                onClick={handleCreateWhatsApp}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create WhatsApp Campaign
              </button>
            </div>

            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">WhatsApp campaigns coming soon</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                WhatsApp integration is under development.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCampaignBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <NewsletterBuilder
              campaign={editingItem}
              onSave={handleCampaignSave}
              onCancel={() => {
                setShowCampaignBuilder(false);
                setEditingItem(null);
              }}
              onPreview={(campaignData, previewData) => {
                // Handle preview
                console.log('Preview campaign:', campaignData, previewData);
              }}
            />
          </div>
        </div>
      )}

      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <EmailTemplateEditor
              template={editingItem}
              onSave={handleTemplateSave}
              onCancel={() => {
                setShowTemplateEditor(false);
                setEditingItem(null);
              }}
              onPreview={(templateData, previewData) => {
                // Handle preview
                console.log('Preview template:', templateData, previewData);
              }}
            />
          </div>
        </div>
      )}

      {showWhatsAppEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <WhatsAppIntegration
              campaign={editingItem}
              onSave={handleWhatsAppSave}
              onTest={(testData) => {
                // Handle test
                console.log('Test WhatsApp campaign:', testData);
              }}
              onSend={(campaignData) => {
                // Handle send
                console.log('Send WhatsApp campaign:', campaignData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;