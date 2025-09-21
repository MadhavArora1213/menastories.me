import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const NewsletterManagement = () => {
  const { theme } = useTheme();
  const [newsletters, setNewsletters] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    subject: '',
    template: 'default',
    content: '',
    recipient_type: 'all',
    schedule: 'now',
    scheduled_date: ''
  });

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-black' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';
  const inputBg = isDark ? 'bg-gray-800 border-white/20 text-white' : 'bg-white border-gray-300 text-black';
  const modalBg = isDark ? 'bg-gray-900' : 'bg-white';

  // Mock data - replace with actual API calls
  useEffect(() => {
    setNewsletters([
      {
        id: 1,
        title: 'Weekly Highlights - Jan 26',
        subject: '🌟 This Week in Entertainment & Business',
        template: 'weekly_digest',
        content: 'Our top stories this week including Bollywood updates, business innovations, and lifestyle trends...',
        recipients: 12500,
        sent: 12350,
        delivered: 12180,
        opened: 8925,
        clicked: 1847,
        status: 'sent',
        open_rate: 73.2,
        click_rate: 15.1,
        created_at: '2025-01-26T09:00:00Z',
        sent_at: '2025-01-26T10:00:00Z'
      },
      {
        id: 2,
        title: 'Breaking News Alert',
        subject: '🚨 Major Bollywood Announcement - Exclusive Interview',
        template: 'breaking_news',
        content: 'Breaking news from the entertainment industry with exclusive interviews and behind-the-scenes content...',
        recipients: 15000,
        sent: 14950,
        delivered: 14720,
        opened: 10850,
        clicked: 2456,
        status: 'sent',
        open_rate: 73.7,
        click_rate: 16.7,
        created_at: '2025-01-25T14:30:00Z',
        sent_at: '2025-01-25T15:00:00Z'
      },
      {
        id: 3,
        title: 'Monthly Business Review',
        subject: '📈 January Business Insights & Success Stories',
        template: 'business_monthly',
        content: 'Comprehensive review of business trends, startup success stories, and market insights for January...',
        recipients: 8500,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        status: 'scheduled',
        open_rate: 0,
        click_rate: 0,
        created_at: '2025-01-24T11:15:00Z',
        sent_at: null,
        scheduled_for: '2025-01-31T10:00:00Z'
      },
      {
        id: 4,
        title: 'Lifestyle Trends February',
        subject: '✨ February Fashion & Lifestyle Trends',
        template: 'lifestyle',
        content: 'Discover the latest fashion trends, lifestyle tips, and cultural highlights for February...',
        recipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        status: 'draft',
        open_rate: 0,
        click_rate: 0,
        created_at: '2025-01-23T16:45:00Z',
        sent_at: null
      }
    ]);

    setSubscribers([
      {
        id: 1,
        email: 'rajesh.kumar@gmail.com',
        name: 'Rajesh Kumar',
        status: 'active',
        subscribed_date: '2025-01-15T10:30:00Z',
        preferences: ['business', 'technology'],
        location: 'Mumbai, India'
      },
      {
        id: 2,
        email: 'priya.sharma@yahoo.com',
        name: 'Priya Sharma',
        status: 'active',
        subscribed_date: '2025-01-12T14:20:00Z',
        preferences: ['entertainment', 'lifestyle'],
        location: 'Delhi, India'
      },
      {
        id: 3,
        email: 'ahmed.hassan@outlook.com',
        name: 'Ahmed Hassan',
        status: 'active',
        subscribed_date: '2025-01-08T09:15:00Z',
        preferences: ['business', 'regional'],
        location: 'Dubai, UAE'
      },
      {
        id: 4,
        email: 'sarah.johnson@gmail.com',
        name: 'Sarah Johnson',
        status: 'unsubscribed',
        subscribed_date: '2024-12-20T11:00:00Z',
        unsubscribed_date: '2025-01-20T16:30:00Z',
        preferences: ['entertainment'],
        location: 'New York, USA'
      }
    ]);

    setTemplates([
      { id: 1, name: 'default', display_name: 'Default Newsletter', description: 'Standard newsletter template' },
      { id: 2, name: 'weekly_digest', display_name: 'Weekly Digest', description: 'Weekly summary format' },
      { id: 3, name: 'breaking_news', display_name: 'Breaking News', description: 'Urgent news alert format' },
      { id: 4, name: 'business_monthly', display_name: 'Business Monthly', description: 'Monthly business review' },
      { id: 5, name: 'lifestyle', display_name: 'Lifestyle & Fashion', description: 'Lifestyle content template' }
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'sending': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateNewsletter = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const newId = Math.max(...newsletters.map(n => n.id), 0) + 1;
      const newsletter = {
        id: newId,
        ...newNewsletter,
        recipients: subscribers.filter(s => s.status === 'active').length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        status: newNewsletter.schedule === 'now' ? 'sending' : 'scheduled',
        open_rate: 0,
        click_rate: 0,
        created_at: new Date().toISOString(),
        sent_at: newNewsletter.schedule === 'now' ? new Date().toISOString() : null,
        scheduled_for: newNewsletter.schedule === 'later' ? newNewsletter.scheduled_date : null
      };
      
      setNewsletters(prev => [newsletter, ...prev]);
      setNewNewsletter({
        title: '',
        subject: '',
        template: 'default',
        content: '',
        recipient_type: 'all',
        schedule: 'now',
        scheduled_date: ''
      });
      setShowCreateModal(false);
      setLoading(false);
    }, 1500);
  };

  const activeSubscribers = subscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;
  const totalSent = newsletters.reduce((sum, n) => sum + n.sent, 0);
  const avgOpenRate = newsletters.length > 0 
    ? newsletters.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.open_rate, 0) / newsletters.filter(n => n.status === 'sent').length
    : 0;

  return (
    <div className={`min-h-screen ${bgMain} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${textMain} mb-2`}>Newsletter Management</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Create and manage email newsletters and subscriber communications
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Newsletter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Active Subscribers
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{activeSubscribers.toLocaleString()}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {unsubscribedCount} unsubscribed
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Total Sent
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{totalSent.toLocaleString()}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              This month
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Avg. Open Rate
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{avgOpenRate.toFixed(1)}%</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Industry avg: 21.3%
            </p>
          </div>
          <div className={`p-6 rounded-lg border ${cardBg}`}>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Campaigns
            </h3>
            <p className={`text-3xl font-bold ${textMain}`}>{newsletters.length}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {newsletters.filter(n => n.status === 'scheduled').length} scheduled
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
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Templates
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className={`rounded-lg border ${cardBg} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold ${textMain}`}>Newsletter Campaigns</h2>
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
                      Open Rate
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Click Rate
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`text-sm font-medium ${textMain}`}>
                            {newsletter.title}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate max-w-xs`}>
                            {newsletter.subject}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        <div>
                          <div>{newsletter.sent.toLocaleString()} sent</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {newsletter.delivered.toLocaleString()} delivered
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        <div>
                          <div>{newsletter.open_rate.toFixed(1)}%</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {newsletter.opened.toLocaleString()} opens
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${textMain}`}>
                        <div>
                          <div>{newsletter.click_rate.toFixed(1)}%</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {newsletter.clicked.toLocaleString()} clicks
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newsletter.status)}`}>
                          {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {newsletter.sent_at 
                          ? new Date(newsletter.sent_at).toLocaleDateString()
                          : newsletter.scheduled_for
                            ? `Scheduled: ${new Date(newsletter.scheduled_for).toLocaleDateString()}`
                            : new Date(newsletter.created_at).toLocaleDateString()
                        }
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
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-semibold ${textMain}`}>Subscribers</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Export
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Import
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Subscriber
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Preferences
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Location
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
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {subscriber.preferences.map((pref, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {subscriber.location}
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
                        {new Date(subscriber.subscribed_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className={`rounded-lg border ${cardBg} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${textMain}`}>{template.display_name}</h3>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button className="text-green-600 hover:text-green-800 text-sm">Preview</button>
                  </div>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {template.description}
                </p>
                <div className={`h-32 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Template Preview
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Newsletter Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${modalBg} p-6 rounded-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto`}>
              <h2 className={`text-xl font-bold ${textMain} mb-4`}>Create Newsletter Campaign</h2>
              <form onSubmit={handleCreateNewsletter} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Campaign Title</label>
                    <input
                      type="text"
                      value={newNewsletter.title}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Template</label>
                    <select
                      value={newNewsletter.template}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, template: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {templates.map(template => (
                        <option key={template.name} value={template.name}>{template.display_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Email Subject</label>
                  <input
                    type="text"
                    value={newNewsletter.subject}
                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="📰 Your engaging subject line here"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textMain} mb-2`}>Content</label>
                  <textarea
                    value={newNewsletter.content}
                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none`}
                    placeholder="Write your newsletter content here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Recipients</label>
                    <select
                      value={newNewsletter.recipient_type}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, recipient_type: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Active Subscribers</option>
                      <option value="business">Business Subscribers</option>
                      <option value="entertainment">Entertainment Subscribers</option>
                      <option value="lifestyle">Lifestyle Subscribers</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Schedule</label>
                    <select
                      value={newNewsletter.schedule}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, schedule: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="now">Send Now</option>
                      <option value="later">Schedule for Later</option>
                    </select>
                  </div>
                </div>

                {newNewsletter.schedule === 'later' && (
                  <div>
                    <label className={`block text-sm font-medium ${textMain} mb-2`}>Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newNewsletter.scheduled_date}
                      onChange={(e) => setNewNewsletter(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required={newNewsletter.schedule === 'later'}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? 'Creating...' : newNewsletter.schedule === 'now' ? 'Send Newsletter' : 'Schedule Newsletter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;