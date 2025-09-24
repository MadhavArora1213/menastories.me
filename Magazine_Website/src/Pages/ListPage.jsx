import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw, ChevronDown, Check } from 'lucide-react';
import listService from '../services/listService';

const ListPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);

  // Filter states
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({
    recommended: false,
    richLists: false,
    entrepreneurs: false,
    companies: false,
    leaders: false,
    entertainment: false,
    sports: false,
    lifestyle: false
  });

  // Dynamic data from API only
  const [lists, setLists] = useState([]);
  const [featuredList, setFeaturedList] = useState(null);
  const [featuredListItems, setFeaturedListItems] = useState([]);

  // List metadata
  const [listMetadata, setListMetadata] = useState({
    title: "Sustainability Leaders in Government 2025",
    category: "Lists",
    year: "2025",
    description: "The most influential sustainability leaders in government across the Middle East.",
    metaTitle: "Sustainability Leaders in Government 2025 | Forbes Middle East",
    metaDescription: "Discover the most influential sustainability leaders in government from Forbes Middle East."
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchListData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isYearDropdownOpen && !event.target.closest('.year-dropdown')) {
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isYearDropdownOpen]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build filter parameters based on selected filters
      const filterParams = {
        limit: 50,
        status: 'published'
      };

      // Add year filter if selected
      if (selectedYear) {
        filterParams.year = selectedYear;
      }

      // Add category filters if any are selected
      const activeCategories = Object.entries(selectedCategories)
        .filter(([key, value]) => value)
        .map(([key, value]) => key);

      if (activeCategories.length > 0) {
        filterParams.categories = activeCategories.join(',');
      }

      console.log('Fetching lists with filters:', filterParams);

      const response = await listService.getAllLists(filterParams);

      if (response.success && response.data.lists.length > 0) {
        const allLists = response.data.lists;
        setLists(allLists);

        // Set featured list (latest one from database based on creation date)
        const latestList = allLists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        if (latestList) {
          setFeaturedList(latestList);
        } else {
          // Fallback to first list if sorting fails
          setFeaturedList(allLists[0]);
        }

        // Update metadata from featured list data
        if (latestList) {
          setListMetadata({
            title: latestList.title || "Sustainability Leaders in Government 2025",
            category: latestList.category || "Government",
            year: latestList.created_at ? new Date(latestList.created_at).getFullYear().toString() : "2025",
            description: latestList.description || "The most influential sustainability leaders in government across the Middle East.",
            metaTitle: `${latestList.title || "Sustainability Leaders in Government 2025"} | Forbes Middle East`,
            metaDescription: latestList.meta_description || latestList.description || "Forbes Middle East curated list."
          });
        }

        // Transform entries for featured list to match the expected format
        if (latestList && latestList.entries && latestList.entries.length > 0) {
          const transformedEntries = featured.entries.map(entry => ({
            id: entry.id,
            rank: entry.rank || 0,
            name: entry.name,
            title: entry.designation || 'Leader',
            company: entry.company || 'Organization',
            industry: entry.category || 'Government',
            description: entry.description || 'No description available.',
            image: entry.image ?
              `${import.meta.env.VITE_API_URL || 'https://menastories.me/api'}/storage/images/${entry.image.split('/').pop()}` :
              null,
            verified: true
          }));

          setFeaturedListItems(transformedEntries);
        } else {
          setFeaturedListItems([]);
        }
      } else {
        setError('No published lists found matching your criteria');
        setLists([]);
        setFeaturedListItems([]);
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setError(err.message || 'Failed to load list data');
      setLists([]);
      setFeaturedListItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
  const availableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

  const handleYearChange = (year) => {
    setCurrentYear(year);
    setSelectedYear(year);
    // Refetch data for the selected year
    setTimeout(() => fetchListData(), 0);
    console.log('Year changed to:', year);
  };

  const handleYearDropdownToggle = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setCurrentYear(year);
    setIsYearDropdownOpen(false);
    handleFilterChange();
    console.log('Selected year:', year);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
    // Use setTimeout to ensure state is updated before fetching
    setTimeout(() => handleFilterChange(), 0);
    console.log('Toggled category:', category);
  };

  const handleFilterChange = () => {
    // Refetch data when filters change
    fetchListData();
  };

  const clearAllFilters = () => {
    setSelectedYear(2025);
    setCurrentYear(2025);
    setSelectedCategories({
      recommended: false,
      richLists: false,
      entrepreneurs: false,
      companies: false,
      leaders: false,
      entertainment: false,
      sports: false,
      lifestyle: false
    });
    // Refetch data after clearing filters
    setTimeout(() => fetchListData(), 0);
    console.log('Cleared all filters');
  };

  return (
    <>
      <Helmet>
        <title>{listMetadata.metaTitle}</title>
        <meta name="description" content={listMetadata.metaDescription} />
        <meta name="keywords" content="Forbes Middle East, sustainability leaders, government, rankings" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-black">FORBES</span>
                  <span className="text-sm text-gray-600 ml-2">MIDDLE EAST</span>
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
              <p className="text-gray-600 text-lg">Loading list data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
              <h3 className="text-2xl font-bold text-black mb-3">Failed to Load List</h3>
              <p className="text-gray-600 mb-8 text-center max-w-md text-lg">{error}</p>
              <button
                onClick={fetchListData}
                className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-none font-medium transition-colors duration-200 text-lg"
              >
                <RefreshCw className="w-5 h-5" />
                RETRY
              </button>
            </div>
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
                <span>Forbes Middle East</span>
                <span>/</span>
                <span>Lists</span>
              </div>

              {/* Hero Banner */}
              <div className="relative mb-16">
                <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-lg overflow-hidden h-96 relative">
                  {/* Portrait Grid */}
                  <div className="absolute inset-0 p-8">
                    <div className="grid grid-cols-5 gap-4 h-full">
                      {featuredListItems && featuredListItems.length > 0 ? featuredListItems.slice(0, 10).map((item, index) => (
                        <div key={item.id} className="relative">
                          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm">No Image</span>
                              </div>
                            )}
                          </div>
                          {/* Optional: Add name overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-5 flex items-center justify-center h-full">
                          <span className="text-white text-lg">No featured list items available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Forbes Branding */}
                  <div className="absolute top-8 right-8">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className="text-white text-sm font-medium">Forbes</span>
                        <span className="text-red-300 text-sm">Middle East</span>
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      </div>
    
                      {/* Filter Actions */}
                      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                          Clear All Filters
                        </button>
                        <div className="text-sm text-gray-500">
                          {Object.values(selectedCategories).filter(Boolean).length + (selectedYear !== 2025 ? 1 : 0)} filter{(Object.values(selectedCategories).filter(Boolean).length + (selectedYear !== 2025 ? 1 : 0)) !== 1 ? 's' : ''} applied
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
                      SUSTAINABILITY<br />
                      LEADERS IN<br />
                      GOVERNMENT
                    </h1>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-8">
                  {/* Left Arrow */}
                  <button className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>

                  {/* Year Navigation */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            currentYear === year
                              ? 'text-black border-b-2 border-black'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                    <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                      Recommended
                    </button>
                  </div>

                  {/* Right Arrow */}
                  <button className="flex items-center justify-center w-12 h-12 border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Title and Description */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-black mb-4">
                  {listMetadata.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-4xl leading-relaxed">
                  {listMetadata.description}
                </p>
              </div>

              {/* Filters Section */}
              <div className="mb-12">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Year Filter */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Year</h3>
                      <div className="relative year-dropdown">
                        <button
                          onClick={handleYearDropdownToggle}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
                        >
                          <span>Select Year</span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isYearDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                            {availableYears.map((year) => (
                              <button
                                key={year}
                                onClick={() => handleYearSelect(year)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Filters */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedCategories).map(([key, value]) => (
                          <label key={key} className="flex items-center space-x-3 cursor-pointer" onClick={() => handleCategoryToggle(key)}>
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                              value ? 'bg-black border-black' : 'border-gray-300 hover:border-gray-400'
                            }`}>
                              {value && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key === 'richLists' ? 'Rich Lists' :
                               key === 'entrepreneurs' ? 'Entrepreneurs' :
                               key === 'companies' ? 'Companies' :
                               key === 'leaders' ? 'Leaders' :
                               key === 'entertainment' ? 'Entertainment' :
                               key === 'sports' ? 'Sports' :
                               key === 'lifestyle' ? 'Lifestyle' : key}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {lists.slice(0, 6).map((list, index) => (
                  <div key={list.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      {/* List Thumbnail */}
                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-64 relative">
                        {/* Mini portrait grid for each list */}
                        <div className="absolute inset-0 p-4">
                          <div className="grid grid-cols-3 gap-2 h-full opacity-80">
                            {list.entries.slice(0, 9).map((entry, entryIndex) => (
                              <div key={entry.id} className="relative">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                                  {entry.image ? (
                                    <img
                                      src={entry.image}
                                      alt={entry.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-gray-600 text-xs">No Image</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* List Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4">
                          <h3 className="text-white text-lg font-bold leading-tight">
                            {list.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* List Info */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {new Date(list.created_at).getFullYear()} • {list.entries.length} Entries
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {list.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">FORBES MIDDLE EAST</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  The definitive source for business news, financial insights, and leadership intelligence across the Middle East region.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">SECTIONS</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Lists</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">News</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Companies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Leaders</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">COMPANY</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 mt-8">
              <p className="text-gray-400 text-center">
                © 2024 Forbes Middle East. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListPage;