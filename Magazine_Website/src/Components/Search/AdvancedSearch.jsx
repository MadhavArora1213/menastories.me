import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import FilterSidebar from './FilterSidebar';
import SearchResults from './SearchResults';
import SearchSuggestions from './SearchSuggestions';
import { searchService } from '../../services/searchService';

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    contentType: '',
    personality: '',
    industry: '',
    demographic: '',
    geographic: '',
    occasion: '',
    category: '',
    author: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    readingTime: '',
    popularity: '',
    featured: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [searchDuration, setSearchDuration] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query, currentFilters, page = 1) => {
      if (!query.trim() && Object.values(currentFilters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchParams = {
          query: query.trim(),
          ...currentFilters,
          page,
          limit: pagination.limit,
          sortBy,
          sortOrder
        };

        const response = await searchService.globalSearch(searchParams);
        
        if (response.success) {
          setResults(response.results);
          setPagination(prev => ({
            ...prev,
            ...response.pagination
          }));
          setSearchDuration(response.searchDuration);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    [pagination.limit, sortBy, sortOrder]
  );

  // Debounced suggestions function
  const debouncedSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await searchService.getSuggestions(query);
        setSuggestions(response.suggestions);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    }, 300),
    []
  );

  // Handle search query change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
    
    if (query.length >= 2) {
      debouncedSuggestions(query);
    } else {
      setSuggestions([]);
    }
    
    debouncedSearch(query, filters, 1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    debouncedSearch(searchQuery, newFilters, 1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    debouncedSearch(searchQuery, filters, page);
    
    // Scroll to top of results
    document.getElementById('search-results')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Handle sorting change
  const handleSortChange = (newSortBy, newSortOrder = 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
    debouncedSearch(searchQuery, filters, 1);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    
    // Apply any specific filters based on suggestion type
    const newFilters = { ...filters };
    if (suggestion.type === 'category') {
      newFilters.category = suggestion.slug;
    } else if (suggestion.type === 'author') {
      newFilters.author = suggestion.id;
    } else if (suggestion.type === 'tag') {
      newFilters.tags = [...filters.tags, suggestion.slug];
    }
    
    setFilters(newFilters);
    debouncedSearch(suggestion.title, newFilters, 1);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      contentType: '',
      personality: '',
      industry: '',
      demographic: '',
      geographic: '',
      occasion: '',
      category: '',
      author: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      readingTime: '',
      popularity: '',
      featured: ''
    };
    setFilters(clearedFilters);
    debouncedSearch(searchQuery, clearedFilters, 1);
  };

  // Save current search
  const saveSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchData = {
        name: `Search: ${searchQuery}`,
        query: searchQuery,
        filters,
        isPublic: false
      };

      await searchService.saveSearch(searchData);
      alert('Search saved successfully!');
    } catch (error) {
      console.error('Failed to save search:', error);
      alert('Failed to save search. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Advanced Search
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search articles, authors, categories..."
              className="w-full px-4 py-3 pl-12 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Save Search Button */}
            {searchQuery.trim() && (
              <button
                onClick={saveSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500"
                title="Save Search"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              query={searchQuery}
            />
          )}
        </div>

        {/* Search Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
              {Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0)) && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {Object.values(filters).filter(v => v && (!Array.isArray(v) || v.length > 0)).length}
                </span>
              )}
            </button>
            
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear Filters
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="popularity">Popularity</option>
              <option value="title">Title</option>
              <option value="readingTime">Reading Time</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(sortBy, e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>

        {/* Search Stats */}
        {(results.length > 0 || searchQuery) && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {loading ? (
              'Searching...'
            ) : (
              `Found ${pagination.total} results${searchDuration ? ` in ${searchDuration}ms` : ''}`
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          isVisible={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* Search Results */}
        <div className="flex-1" id="search-results">
          <SearchResults
            results={results}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            query={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;