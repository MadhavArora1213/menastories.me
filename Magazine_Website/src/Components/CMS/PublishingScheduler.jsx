import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PublishingScheduler = () => {
  const { user } = useAuth();
  const [scheduledArticles, setScheduledArticles] = useState([]);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [scheduleData, setScheduleData] = useState({
    articleId: '',
    publishDate: '',
    publishTime: '09:00',
    socialPosts: {
      facebook: true,
      twitter: true,
      linkedin: false,
      instagram: false
    },
    emailNewsletter: false,
    pushNotification: false,
    priority: 'medium',
    notes: ''
  });

  // Load scheduled articles
  const loadScheduledArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles?status=approved&hasSchedule=true`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setScheduledArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled articles:', error);
    }
    setLoading(false);
  };

  // Load available articles for scheduling
  const loadAvailableArticles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles?status=approved&hasSchedule=false&limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to load available articles:', error);
    }
  };

  useEffect(() => {
    loadScheduledArticles();
    loadAvailableArticles();
  }, []);

  // Handle schedule submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const publishDateTime = new Date(`${scheduleData.publishDate}T${scheduleData.publishTime}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${scheduleData.articleId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          publishDate: publishDateTime.toISOString(),
          socialPosts: scheduleData.socialPosts,
          emailNewsletter: scheduleData.emailNewsletter,
          pushNotification: scheduleData.pushNotification,
          priority: scheduleData.priority,
          notes: scheduleData.notes
        })
      });

      if (response.ok) {
        setShowScheduleModal(false);
        setScheduleData({
          articleId: '',
          publishDate: '',
          publishTime: '09:00',
          socialPosts: { facebook: true, twitter: true, linkedin: false, instagram: false },
          emailNewsletter: false,
          pushNotification: false,
          priority: 'medium',
          notes: ''
        });
        loadScheduledArticles();
        loadAvailableArticles();
      } else {
        alert('Failed to schedule article');
      }
    } catch (error) {
      console.error('Schedule article error:', error);
      alert('Failed to schedule article');
    }
  };

  // Handle schedule cancellation
  const handleCancelSchedule = async (articleId) => {
    if (!confirm('Are you sure you want to cancel this scheduled publication?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${articleId}/cancel-schedule`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        loadScheduledArticles();
        loadAvailableArticles();
      } else {
        alert('Failed to cancel schedule');
      }
    } catch (error) {
      console.error('Cancel schedule error:', error);
      alert('Failed to cancel schedule');
    }
  };

  // Handle immediate publish
  const handlePublishNow = async (articleId) => {
    if (!confirm('Are you sure you want to publish this article immediately?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${articleId}/publish-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        loadScheduledArticles();
        loadAvailableArticles();
      } else {
        alert('Failed to publish article');
      }
    } catch (error) {
      console.error('Publish now error:', error);
      alert('Failed to publish article');
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getArticlesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledArticles.filter(article => {
      const publishDate = new Date(article.publishDate).toISOString().split('T')[0];
      return publishDate === dateStr;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (publishDate) => {
    const now = new Date();
    const publish = new Date(publishDate);
    
    if (publish < now) return 'text-green-600'; // Past due (should be published)
    if (publish - now < 24 * 60 * 60 * 1000) return 'text-orange-600'; // Within 24 hours
    return 'text-blue-600'; // Future
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publishing Scheduler</h1>
          <p className="text-gray-600">Schedule and manage article publications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCalendarView(calendarView === 'month' ? 'list' : 'month')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {calendarView === 'month' ? 'List View' : 'Calendar View'}
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Schedule Article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                <dd className="text-lg font-medium text-gray-900">{scheduledArticles.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Today</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {getArticlesForDate(new Date()).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {scheduledArticles.filter(article => {
                    const publishDate = new Date(article.publishDate);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return publishDate >= weekStart && publishDate <= weekEnd;
                  }).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1-2H8l-1 2H5V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                <dd className="text-lg font-medium text-gray-900">{availableArticles.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar/List View */}
      <div className="bg-white rounded-lg shadow">
        {calendarView === 'month' ? (
          <>
            {/* Calendar Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-gray-200 mb-1">
                {dayNames.map(day => (
                  <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {generateCalendarDays().map((dayObj, index) => {
                  const articlesForDay = getArticlesForDate(dayObj.date);
                  return (
                    <div
                      key={index}
                      className={`bg-white p-2 h-32 ${dayObj.isCurrentMonth ? '' : 'opacity-50'}`}
                    >
                      <div className={`text-sm ${dayObj.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dayObj.date.getDate()}
                      </div>
                      <div className="mt-1 space-y-1">
                        {articlesForDay.slice(0, 3).map(article => (
                          <div
                            key={article.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${getPriorityColor(article.priority)} text-white`}
                            title={article.title}
                            onClick={() => setSelectedDate(article)}
                          >
                            {article.title.substring(0, 20)}...
                          </div>
                        ))}
                        {articlesForDay.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{articlesForDay.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* List View */
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publish Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : scheduledArticles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No scheduled articles found
                    </td>
                  </tr>
                ) : (
                  scheduledArticles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {article.author?.firstName} {article.author?.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${getStatusColor(article.publishDate)}`}>
                          {new Date(article.publishDate).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          article.priority === 'high' ? 'bg-red-100 text-red-800' :
                          article.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {article.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-1">
                          {article.socialPosts?.facebook && <span className="text-blue-600">FB</span>}
                          {article.socialPosts?.twitter && <span className="text-blue-400">TW</span>}
                          {article.socialPosts?.linkedin && <span className="text-blue-800">LI</span>}
                          {article.emailNewsletter && <span className="text-green-600">EMAIL</span>}
                          {article.pushNotification && <span className="text-purple-600">PUSH</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Scheduled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePublishNow(article.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Publish Now
                          </button>
                          <button
                            onClick={() => handleCancelSchedule(article.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Schedule Article</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                {/* Article Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Article *
                  </label>
                  <select
                    value={scheduleData.articleId}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, articleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose an approved article...</option>
                    {availableArticles.map(article => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      value={scheduleData.publishDate}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Time *
                    </label>
                    <input
                      type="time"
                      value={scheduleData.publishTime}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, publishTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={scheduleData.priority}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Social Media Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Posts
                  </label>
                  <div className="space-y-2">
                    {Object.entries(scheduleData.socialPosts).map(([platform, enabled]) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setScheduleData(prev => ({
                            ...prev,
                            socialPosts: { ...prev.socialPosts, [platform]: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleData.emailNewsletter}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, emailNewsletter: e.target.checked }))}
                      className="mr-2"
                    />
                    Include in email newsletter
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleData.pushNotification}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, pushNotification: e.target.checked }))}
                      className="mr-2"
                    />
                    Send push notification
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special notes for this publication..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishingScheduler;