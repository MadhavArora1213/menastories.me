import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Sample search results - replace with API call
  const sampleResults = [
    {
      id: 1,
      title: "UAE's Economic Growth Reaches New Heights",
      category: "Business & Leadership",
      type: "article",
      path: "/article/uae-economic-growth-2024"
    },
    {
      id: 2,
      title: "Bollywood Star's Exclusive Interview",
      category: "Entertainment",
      type: "article",
      path: "/article/bollywood-star-interview"
    },
    {
      id: 3,
      title: "Dubai Fashion Week 2024 Highlights",
      category: "Lifestyle",
      type: "article",
      path: "/article/dubai-fashion-week-2024"
    },
    {
      id: 4,
      title: "Tech Innovation in UAE",
      category: "Culture & Society",
      type: "article",
      path: "/article/tech-innovation-uae"
    },
    {
      id: 5,
      title: "Women Leaders in Middle East",
      category: "Special Sections",
      type: "article",
      path: "/article/women-leaders-middle-east"
    }
  ];

  // Popular searches
  const popularSearches = [
    "UAE business news",
    "Bollywood celebrities",
    "Dubai events",
    "Fashion trends",
    "Technology news",
    "Women entrepreneurs",
    "Startup stories",
    "Entertainment news"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filteredResults = sampleResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredResults);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else if (query) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
      setIsOpen(false);
    }
  };

  const handleResultClick = (result) => {
    setQuery('');
    setIsOpen(false);
    window.location.href = result.path;
  };

  const handlePopularSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    setIsOpen(false);
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button/Input */}
      <div className="flex items-center">
        {!isOpen ? (
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Open search"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search articles, categories, people..."
              className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-200"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Search Results */}
          {query.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Search Results
                </h3>
                {query.length > 2 && !isLoading && (
                  <button
                    onClick={handleSearch}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all results
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : query.length > 2 ? (
                results.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                          index === selectedIndex ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {highlightText(result.title, query)}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded-full mr-2">
                            {result.category}
                          </span>
                          <span className="capitalize">{result.type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                  </div>
                )
              ) : (
                <p className="text-sm text-gray-500 py-2">Type at least 3 characters to search</p>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Searches</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearchClick(search)}
                    className="text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors duration-200"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          {query.length === 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link to="/trending" className="hover:text-blue-600">Trending</Link>
                <span>•</span>
                <Link to="/categories" className="hover:text-blue-600">Categories</Link>
                <span>•</span>
                <Link to="/archives" className="hover:text-blue-600">Archives</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;