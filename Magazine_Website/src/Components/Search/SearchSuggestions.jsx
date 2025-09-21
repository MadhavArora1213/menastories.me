import React from 'react';

const SearchSuggestions = ({ suggestions, onSelect, query }) => {
  if (!suggestions || Object.keys(suggestions).length === 0) {
    return null;
  }

  const getSuggestionIcon = (type) => {
    const icons = {
      article: (
        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      category: (
        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      tag: (
        <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      author: (
        <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    };
    
    return icons[type] || icons.article;
  };

  const getTypeLabel = (type) => {
    const labels = {
      article: 'Article',
      category: 'Category',
      tag: 'Tag',
      author: 'Author'
    };
    
    return labels[type] || type;
  };

  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-semibold text-blue-600 dark:text-blue-400">
          {part}
        </span>
      ) : part
    );
  };

  const allSuggestions = [];

  // Combine all suggestions into a single array with type information
  Object.entries(suggestions).forEach(([type, items]) => {
    if (items && items.length > 0) {
      items.forEach(item => {
        allSuggestions.push({
          ...item,
          type: item.type || type.slice(0, -1) // Remove 's' from plural types
        });
      });
    }
  });

  // Limit total suggestions shown
  const maxSuggestions = 8;
  const displaySuggestions = allSuggestions.slice(0, maxSuggestions);

  if (displaySuggestions.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No suggestions found
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      <div className="py-2">
        {/* Suggestions header */}
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
          Suggestions
        </div>
        
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.slug || suggestion.id || index}`}
            onClick={() => onSelect(suggestion)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {/* Main text */}
                  <span className="text-gray-900 dark:text-white">
                    {highlightMatch(suggestion.title, query)}
                  </span>
                  
                  {/* Type badge */}
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    {getTypeLabel(suggestion.type)}
                  </span>
                </div>
                
                {/* Additional info for authors */}
                {suggestion.type === 'author' && suggestion.username && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    @{suggestion.username}
                  </div>
                )}
              </div>
              
              {/* Arrow icon */}
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
        
        {/* Show more indicator */}
        {allSuggestions.length > maxSuggestions && (
          <div className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            +{allSuggestions.length - maxSuggestions} more results available
          </div>
        )}
        
        {/* Quick actions */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Press Enter to search</span>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↑</kbd>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">↓</kbd>
              <span>to navigate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;