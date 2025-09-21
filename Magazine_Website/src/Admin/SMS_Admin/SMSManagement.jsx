import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const SMSManagement = () => {
  const { theme } = useTheme();
  const [smsCampaigns, setSMSCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    recipient_type: 'all',
    schedule: 'now'
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';

  // Mock data - replace with actual API calls
  useEffect(() => {
    setSMSCampaigns([
      {
        id: 1,
        title: 'Welcome Newsletter',
        message: 'Welcome to Echo Magazine! Get the latest updates on entertainment, business, and lifestyle.',
        recipients: 1250,
        sent: 1180,
        delivered: 1120,
        status: 'completed',
        created_at: '2025-08-25T10:00:00Z'
      },
      {
        id: 2,
        title: 'Weekly Highlights',
        message: 'Check out this weeks top stories: Celebrity interviews, business leaders, and trending lifestyle content.',
        recipients: 2100,
        sent: 0,
        delivered: 0,
        status: 'scheduled',
        created_at: '2025-08-26T08:30:00Z'
      },
      {
        id: 3,
        title: 'Breaking News Alert',
        message: 'BREAKING: Major announcement from Bollywood! Read the exclusive interview on our website.',
        recipients: 3500,
        sent: 3500,
        delivered: 3420,
        status: 'completed',
        created_at: '2025-08-24T15:45:00Z'
      }
    ]);

    setSubscribers([
      { id: 1, phone: '+91 98765 43210', name: 'Rajesh Kumar', status: 'active', subscribed: '2025-08-20' },
      { id: 2, phone: '+91 87654 32109', name: 'Priya Sharma', status: 'active', subscribed: '2025-08-22' },
      { id: 3, phone: '+91 76543 21098', name: 'Amit Patel', status: 'inactive', subscribed: '2025-08-18' },
      { id: 4, phone: '+91 65432 10987', name: 'Sneha Reddy', status: 'active', subscribed: '2025-08-25' },
      { id: 5, phone: '+91 54321 09876', name: 'Vikram Singh', status: 'active', subscribed: '2025-08-21' }
    ]);
  }, []);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = Math.max(...smsCampaigns.map(c => c.id), 0) + 1;
      const campaign = {
        id: newId,
        ...newCampaign,
        recipients: subscribers.filter(s => s.status === 'active').length,
        sent: 0,
        delivered: 0,
        status: newCampaign.schedule === 'now' ? 'sending' : 'scheduled',
        created_at: new Date().toISOString()
      };
      
      setSMSCampaigns(prev => [campaign, ...prev]);
      setNewCampaign({ title: '', message: '', recipient_type: 'all', schedule: 'now' });
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textMain} mb-2`}>SMS Management</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage SMS campaigns and subscriber communications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Subscribers
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>
              {subscribers.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Messages Sent Today
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>1,280</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Delivery Rate
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>97.8%</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Active Campaigns
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>
              {smsCampaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscribers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Subscribers
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Create Campaign
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${textMain}`}>SMS Campaigns</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Campaign
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Recipients
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Sent
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Delivered
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {smsCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium ${textMain}`}>
                            {campaign.title}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate max-w-xs`}>
                            {campaign.message}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        {campaign.recipients.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        {campaign.sent.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        {campaign.delivered.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${textMain}`}>SMS Subscribers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Subscriber
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Phone Number
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textMain}`}>
                        {subscriber.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        {subscriber.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(subscriber.subscribed).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className={`rounded-lg border ${cardBg} p-6`}>
            <h2 className={`text-lg font-semibold ${textMain} mb-6`}>Create SMS Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textMain} mb-2`}>
                  Message
                </label>
                <textarea
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none`}
                  placeholder="Type your SMS message here..."
                  required
                />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {newCampaign.message.length}/160 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Recipients
                  </label>
                  <select
                    value={newCampaign.recipient_type}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, recipient_type: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">All Active Subscribers</option>
                    <option value="recent">Recent Subscribers</option>
                    <option value="custom">Custom List</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>
                    Schedule
                  </label>
                  <select
                    value={newCampaign.schedule}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, schedule: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="now">Send Now</option>
                    <option value="later">Schedule for Later</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Creating Campaign...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSManagement;