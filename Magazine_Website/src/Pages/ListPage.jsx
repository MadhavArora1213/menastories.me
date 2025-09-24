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

      // Fetch all lists with proper parameters
      const allListsResponse = await listService.getAllLists({
        limit: 100,
        status: 'published',
        sort: 'created_at',
        order: 'desc'
      });

      console.log('API Response:', allListsResponse); // Debug log

      if (allListsResponse.success && allListsResponse.data) {
        let allLists = [];
        
        // Handle different response structures
        if (allListsResponse.data.lists) {
          allLists = allListsResponse.data.lists;
        } else if (Array.isArray(allListsResponse.data)) {
          allLists = allListsResponse.data;
        }

        console.log('All Lists:', allLists); // Debug log

        // Extract unique categories and years from the data
        const categories = [...new Set(allLists.map(list => list.category).filter(Boolean))];
        const years = [...new Set(allLists.map(list => list.year).filter(Boolean))].sort((a, b) => b - a);

        setAvailableCategories(categories);
        setAvailableYears(years);

        // Filter lists based on current selection
        let filteredLists = allLists;

        if (currentYear !== 'all' && currentYear !== 'recommended') {
          filteredLists = filteredLists.filter(list => list.year === currentYear);
        }

        if (selectedCategory !== 'all' && selectedCategory !== 'recommended') {
          filteredLists = filteredLists.filter(list => 
            list.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        setLists(filteredLists);

        // Set the most recent list as featured
        if (allLists.length > 0) {
          const latestList = allLists.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))[0];
          setFeaturedList(latestList);
        } else {
          setFeaturedList(null);
        }
      } else {
        console.error('No data in response:', allListsResponse);
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
    setCurrentYear(year);
    debouncedFetch(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    debouncedFetch(true);
  };

  const handleRefresh = () => {
    fetchListData(true);
  };

  return (
    <>
      <Helmet>
        <title>Lists | Forbes Middle East</title>
        <meta name="description" content="Discover the most influential leaders and companies." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold">Forbes</span>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">HOME</a>
                  <a href="/list" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium border-b-2 border-white">LISTS</a>
                  <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">NEWS</a>
                  <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">COMPANIES</a>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mb-6"></div>
              <p className="text-gray-600 text-lg">Loading lists...</p>
              <button
                onClick={handleRefresh}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="bg-red-50 rounded-full p-6 mb-6">
                <AlertCircle className="h-16 w-16 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Lists</h2>
              <p className="text-gray-600 text-lg text-center max-w-md mb-6">{error}</p>
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
              {/* Title Section */}
              <div className="py-12">
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">LISTS</h1>
                <p className="text-lg text-gray-600">Discover the most influential leaders and companies</p>
              </div>

              {/* Featured Latest List Section */}
              {featuredList && (
                <div className="mb-12">
                  <Link to={`/lists/${featuredList.slug}`} className="block group">
                    <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                      {featuredList.featuredImage || featuredList.featured_image ? (
                        <img
                          src={featuredList.featuredImage || featuredList.featured_image}
                          alt={featuredList.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/1200/400";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold opacity-50">
                            {featuredList.title}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Featured Content Overlay */}
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">LATEST</span>
                          <span className="text-white text-sm opacity-90">Forbes Middle East</span>
                        </div>
                        <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
                          {featuredList.title}
                        </h2>
                        {featuredList.description && (
                          <p className="text-white text-lg opacity-90 max-w-2xl line-clamp-2">
                            {featuredList.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="bg-white/20 text-white px-3 py-1 rounded text-sm">
                            {featuredList.category || 'General'}
                          </span>
                          <span className="text-white text-sm opacity-75">
                            {featuredList.entries?.length || featuredList.entries_count || 0} entries
                          </span>
                          {featuredList.year && (
                            <span className="text-white text-sm opacity-75">
                              {featuredList.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Year Navigation */}
              <div className="flex items-center gap-8 mb-8 border-b border-gray-200 overflow-x-auto">
                {[2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                      currentYear === year
                        ? 'text-black border-black'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedCategory('recommended');
                    setCurrentYear('all');
                  }}
                  className={`pb-4 px-2 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === 'recommended'
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Recommended →
                </button>
              </div>

              {/* Category Navigation */}
              <div className="flex items-center gap-8 mb-12 border-b border-gray-200 overflow-x-auto">
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

              {/* Lists Grid */}
              {lists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {lists.map((list) => (
                    <Link
                      key={list.id}
                      to={`/lists/${list.slug}`}
                      className="group cursor-pointer block"
                    >
                      <div className="bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        {/* Featured Image */}
                        <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                          {list.featuredImage || list.featured_image || list.image ? (
                            <img
                              src={list.featuredImage || list.featured_image || list.image}
                              alt={list.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/400/300";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <span className="text-white text-lg font-bold opacity-50">
                                {list.title?.split(' ').slice(0, 2).join(' ')}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Title Overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white text-sm font-bold uppercase tracking-wide">
                              Forbes Middle East
                            </p>
                            <h3 className="text-white text-lg font-bold leading-tight mt-1 line-clamp-2">
                              {list.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-white">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                              {list.category || 'General'}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span>{list.entries?.length || list.entries_count || 0} entries</span>
                              {list.year && <span>• {list.year}</span>}
                            </div>
                          </div>
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
                  <p className="text-gray-600 text-lg text-center max-w-md mb-4">
                    {selectedCategory === 'all' && currentYear === 'all'
                      ? 'No lists found in the database.'
                      : `No lists found for ${selectedCategory !== 'all' ? selectedCategory : ''} ${currentYear !== 'all' ? currentYear : ''}`}
                  </p>
                  <div className="text-sm text-gray-500 mb-6">
                    <p>Available categories: {availableCategories.join(', ') || 'None'}</p>
                    <p>Available years: {availableYears.join(', ') || 'None'}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Lists
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400">© 2025 Forbes Middle East</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListPage;