import React, { useState } from 'react';

const SEOSuggestions = ({ contentType, contentId, suggestions, onGenerate, onApply, loading }) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  const handleApplySuggestion = async (suggestion) => {
    try {
      await onApply(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'title':
        return '🏷️';
      case 'description':
        return '📝';
      case 'keywords':
        return '🔍';
      case 'structure':
        return '🏗️';
      case 'performance':
        return '⚡';
      default:
        return '💡';
    }
  };

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="seo-suggestions space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            AI SEO Suggestions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get AI-powered recommendations to improve your SEO
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Suggestions'}
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className={`p-4 border-l-4 rounded-lg ${getSuggestionColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        suggestion.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {suggestion.description}
                    </p>

                    {suggestion.recommendedValue && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recommended:</p>
                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                          {suggestion.recommendedValue}
                        </p>
                      </div>
                    )}

                    {suggestion.impact && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Expected Impact:</strong> {suggestion.impact}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleApplySuggestion(suggestion)}
                  disabled={appliedSuggestions.has(suggestion.id)}
                  className={`ml-4 px-3 py-1 text-xs font-medium rounded ${
                    appliedSuggestions.has(suggestion.id)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {appliedSuggestions.has(suggestion.id) ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No suggestions yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Click "Generate Suggestions" to get AI-powered SEO recommendations for your content.
          </p>

          {/* Sample suggestions preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              What you can expect:
            </h5>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span>Title optimization suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📋</span>
                <span>Meta description improvements</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Keyword optimization recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Content structure enhancements</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Apply high-priority suggestions first for maximum impact</li>
          <li>• Test changes in Google Search Console to measure improvements</li>
          <li>• Focus on user intent when implementing suggestions</li>
          <li>• Re-generate suggestions after making significant changes</li>
        </ul>
      </div>
    </div>
  );
};

export default SEOSuggestions;