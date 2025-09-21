import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EditorialWorkflow = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editors, setEditors] = useState([]);
  
  const [assignmentData, setAssignmentData] = useState({
    articleId: '',
    editorId: '',
    dueDate: '',
    instructions: ''
  });

  const [commentData, setCommentData] = useState({
    articleId: '',
    content: '',
    type: 'general'
  });

  const [reviewData, setReviewData] = useState({
    articleId: '',
    action: '',
    comment: '',
    dueDate: ''
  });

  // Load workflow data
  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      const [articlesRes, assignmentsRes, editorsRes] = await Promise.all([
        // Get articles that need review or are in workflow
        fetch(`${import.meta.env.VITE_API_URL}/api/articles?status=draft,in_review,needs_revision,approved&limit=50`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        // Get active assignments
        fetch(`${import.meta.env.VITE_API_URL}/api/workflow/assignments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        // Get editors for assignment
        fetch(`${import.meta.env.VITE_API_URL}/api/users/editors`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.assignments || []);
      }

      if (editorsRes.ok) {
        const editorsData = await editorsRes.json();
        setEditors(editorsData.users || []);
      }
    } catch (error) {
      console.error('Failed to load workflow data:', error);
    }
    setLoading(false);
  };

  // Load article comments
  const loadArticleComments = async (articleId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${articleId}/history`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadWorkflowData();
  }, []);

  // Handle article submission for review
  const handleSubmitForReview = async (articleId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${articleId}/submit-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadWorkflowData();
      } else {
        alert('Failed to submit article for review');
      }
    } catch (error) {
      console.error('Submit for review error:', error);
      alert('Failed to submit article for review');
    }
  };

  // Handle editor assignment
  const handleAssignEditor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workflow/assign-editor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        setShowAssignModal(false);
        setAssignmentData({ articleId: '', editorId: '', dueDate: '', instructions: '' });
        loadWorkflowData();
      } else {
        alert('Failed to assign editor');
      }
    } catch (error) {
      console.error('Assign editor error:', error);
      alert('Failed to assign editor');
    }
  };

  // Handle article approval/rejection
  const handleReviewAction = async (articleId, action, comment = '', dueDate = null) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'request-revisions';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${articleId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment, dueDate })
      });

      if (response.ok) {
        loadWorkflowData();
      } else {
        alert(`Failed to ${action} article`);
      }
    } catch (error) {
      console.error('Review action error:', error);
      alert(`Failed to ${action} article`);
    }
  };

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workflow/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        setShowCommentModal(false);
        setCommentData({ articleId: '', content: '', type: 'general' });
        if (selectedArticle) {
          loadArticleComments(selectedArticle.id);
        }
      } else {
        alert('Failed to add comment');
      }
    } catch (error) {
      console.error('Add comment error:', error);
      alert('Failed to add comment');
    }
  };

  // Filter articles by status
  const getArticlesByStatus = (status) => {
    return articles.filter(article => {
      if (status === 'review') return ['in_review'].includes(article.status);
      if (status === 'revision') return article.status === 'needs_revision';
      if (status === 'approved') return article.status === 'approved';
      if (status === 'draft') return article.status === 'draft';
      return false;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editorial Workflow</h1>
          <p className="text-gray-600">Manage article review and approval process</p>
        </div>
        <button
          onClick={() => {
            setShowAssignModal(true);
            setAssignmentData(prev => ({ ...prev, articleId: '' }));
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Assign Editor
        </button>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {getArticlesByStatus('review').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Needs Revision</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {getArticlesByStatus('revision').length}
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
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {getArticlesByStatus('approved').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Assignments</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {assignments.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'review', label: 'Pending Review', count: getArticlesByStatus('review').length },
            { id: 'revision', label: 'Needs Revision', count: getArticlesByStatus('revision').length },
            { id: 'approved', label: 'Approved', count: getArticlesByStatus('approved').length },
            { id: 'assignments', label: 'Assignments', count: assignments.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Articles Lists */}
            {(['review', 'revision', 'approved'].includes(activeTab)) && (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getArticlesByStatus(activeTab).map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {article.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {article.subtitle}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {article.author?.firstName} {article.author?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(article.status)}`}>
                            {article.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedArticle(article);
                                loadArticleComments(article.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {activeTab === 'review' && (
                              <>
                                <button
                                  onClick={() => handleReviewAction(article.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const comment = prompt('Revision notes:');
                                    if (comment) {
                                      handleReviewAction(article.id, 'revisions', comment);
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  Request Revisions
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setShowAssignModal(true);
                                setAssignmentData(prev => ({ ...prev, articleId: article.id }));
                              }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {getArticlesByStatus(activeTab).length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No articles with {activeTab.replace('_', ' ')} status.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Editor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
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
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.article?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.editor?.firstName} {assignment.editor?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {assignment.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {assignments.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No active editor assignments found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Assign Editor</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAssignEditor} className="space-y-4">
                {!assignmentData.articleId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Article
                    </label>
                    <select
                      value={assignmentData.articleId}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, articleId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Article</option>
                      {articles.map(article => (
                        <option key={article.id} value={article.id}>
                          {article.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Editor
                  </label>
                  <select
                    value={assignmentData.editorId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, editorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Editor</option>
                    {editors.map(editor => (
                      <option key={editor.id} value={editor.id}>
                        {editor.firstName} {editor.lastName} - {editor.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Special instructions for the editor..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Assign Editor
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

export default EditorialWorkflow;