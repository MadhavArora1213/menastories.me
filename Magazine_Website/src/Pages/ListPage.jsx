import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import listService from '../services/listService';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const ListPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dynamic data from API
  const [lists, setLists] = useState([]);
  const [featuredList, setFeaturedList] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Debounced fetch function to prevent excessive API calls
  const debouncedFetch = useCallback(
    debounce((showLoading = true) => {
      fetchListData(showLoading);
    }, 300),
    [currentYear, selectedCategory]
  );

  // Generate dynamic categories and years based on available data
  const categories = [
    { id: 'all', label: 'All', active: selectedCategory === 'all' },
    ...availableCategories.map(category => ({
      id: category,
      label: category,
      active: selectedCategory === category
    }))
  ];

  const years = availableYears.length > 0 ? availableYears : [2025, 2024, 2023, 2022, 2021];

  // Fetch data on component mount
  useEffect(() => {
    fetchListData();
  }, []);

  const fetchListData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch all lists to get available categories and years
      const allListsResponse = await listService.getAllLists({
        limit: 1000, // Get all lists to extract metadata
        status: 'published'
      });

      if (allListsResponse.success && allListsResponse.data && allListsResponse.data.lists) {
        const allLists = allListsResponse.data.lists;

        // Extract unique categories and years from the data
        const categories = [...new Set(allLists.map(list => list.category).filter(Boolean))];
        const years = [...new Set(allLists.map(list => list.year).filter(Boolean))].sort((a, b) => b - a);

        setAvailableCategories(categories);
        setAvailableYears(years);

        // Apply current filters
        const filterParams = {
          limit: 100,
          status: 'published'
        };

        if (currentYear !== 'all') {
          filterParams.year = currentYear;
        }

        if (selectedCategory !== 'all') {
          filterParams.category = selectedCategory;
        }

        // Filter lists based on current selection
        let filteredLists = allLists;

        if (currentYear !== 'all') {
          filteredLists = filteredLists.filter(list => list.year === currentYear);
        }

        if (selectedCategory !== 'all') {
          filteredLists = filteredLists.filter(list => list.category === selectedCategory);
        }

        setLists(filteredLists);

        // Set latest list as featured if we have data
        if (filteredLists.length > 0) {
          const latestList = filteredLists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          setFeaturedList(latestList);
        } else {
          setFeaturedList(null);
        }
      } else {
        // No data available
        setLists([]);
        setFeaturedList(null);
        setAvailableCategories([]);
        setAvailableYears([]);
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setError('Failed to load lists. Please try again.');
      setLists([]);
      setFeaturedList(null);
      setAvailableCategories([]);
      setAvailableYears([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (year) => {
    // Validate that the year exists in available years
    if (year !== 'all' && !availableYears.includes(year)) {
      console.warn(`Year "${year}" not found in available years:`, availableYears);
      return;
    }
    setCurrentYear(year);
    debouncedFetch(true);
  };

  const handleCategoryChange = (category) => {
    // Validate that the category exists in available categories
    if (category !== 'all' && !availableCategories.includes(category)) {
      console.warn(`Category "${category}" not found in available categories:`, availableCategories);
      return;
    }
    setSelectedCategory(category);
    debouncedFetch(true);
  };

  const handleRefresh = () => {
    fetchListData(true);
  };

  return (
    <>
      <Helmet>
        <title>Lists | Magazine</title>
        <meta name="description" content="Discover the most influential leaders and companies." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-black">MAGAZINE</span>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">HOME</a>
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium border-b-2 border-black">LISTS</a>
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">NEWS</a>
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">COMPANIES</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mb-6"></div>
              <p className="text-gray-600 text-lg">Loading lists from database...</p>
              <button
                onClick={handleRefresh}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Now
              </button>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="bg-red-50 rounded-full p-6 mb-6">
                <AlertCircle className="h-16 w-16 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Lists</h2>
              <p className="text-gray-600 text-lg text-center max-w-md mb-6">
                {error}
              </p>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
                <span>Magazine</span>
                <span>/</span>
                <span>Lists</span>
              </div>

              {/* Featured Header Banner */}
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-lg overflow-hidden h-64">
                  <div className="absolute inset-0">
                    <img
                      src="/api/placeholder/1200/300"
                      alt="Lists Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Title Overlay */}
                    <div className="absolute bottom-8 left-8 right-8">
                      <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
                        LISTS & RANKINGS
                      </h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Lists & Rankings
                </h2>
              </div>

              {/* Navigation Menu */}
              <div className="flex items-center gap-8 mb-8 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleCategoryChange('rich-lists')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'rich-lists'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Rich Lists
                </button>
                <button
                  onClick={() => handleCategoryChange('entrepreneurs')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'entrepreneurs'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Entrepreneurs
                </button>
                <button
                  onClick={() => handleCategoryChange('companies')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'companies'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => handleCategoryChange('leaders')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'leaders'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Leaders
                </button>
                <button
                  onClick={() => handleCategoryChange('entertainment')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'entertainment'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Entertainment
                </button>
                <button
                  onClick={() => handleCategoryChange('sports')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'sports'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Sports
                </button>
                <button
                  onClick={() => handleCategoryChange('lifestyle')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'lifestyle'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Lifestyle
                </button>
              </div>

              {/* Year Navigation */}
              <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
                {[2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      currentYear === year
                        ? 'text-black border-black'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
                <button
                  onClick={() => handleCategoryChange('recommended')}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                    selectedCategory === 'recommended'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Recommended →
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      category.active
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {/* Lists Grid */}
              {lists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {lists.map((list) => (
                    <Link
                      key={list.id}
                      to={`/lists/${list.slug}`}
                      className="group cursor-pointer block"
                    >
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Featured Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                          {list.featured_image ? (
                            <img
                              src={list.featured_image}
                              alt={list.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/400/300";
                              }}
                            />
                          ) : (
                            <img
                              src="/api/placeholder/400/300"
                              alt={list.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                            {list.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {list.description || 'A comprehensive list featuring top leaders and companies.'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                              {list.category || 'General'}
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                              {list.entries_count || 0} entries
                            </span>
                          </div>
                          {list.year && (
                            <div className="mt-3">
                              <span className="inline-block bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                                {list.year}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="bg-gray-50 rounded-full p-6 mb-6">
                    <AlertCircle className="h-16 w-16 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No Lists Available</h2>
                  <p className="text-gray-600 text-lg text-center max-w-md">
                    {selectedCategory === 'all' && currentYear === 'all'
                      ? 'There are currently no lists available in the database. Please check back later for new content.'
                      : selectedCategory === 'all'
                      ? `There are currently no lists available for ${currentYear}. Please check back later for new content.`
                      : currentYear === 'all'
                      ? `There are currently no lists available in the "${selectedCategory}" category. Please try selecting a different category or check back later for new content.`
                      : `There are currently no lists available in the "${selectedCategory}" category for ${currentYear}. Please try selecting different filters or check back later for new content.`
                    }
                  </p>
                  {availableCategories.length > 0 && (
                    <div className="mt-6 text-sm text-gray-500">
                      <p className="mb-2">Available categories:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {availableCategories.slice(0, 5).map(category => (
                          <span key={category} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {category}
                          </span>
                        ))}
                        {availableCategories.length > 5 && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            +{availableCategories.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </>
  );
};

export default ListPage;