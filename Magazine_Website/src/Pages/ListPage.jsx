import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import listService from '../services/listService';

const ListPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dynamic data from API
  const [lists, setLists] = useState([]);
  const [featuredList, setFeaturedList] = useState(null);

  // Static sample data for consistent design
  const sampleLists = [
    {
      id: 1,
      title: "Sustainability Leaders in Government 2025",
      category: "Leaders",
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "grid"
    },
    {
      id: 2,
      title: "The Middle East's Sustainability Leaders 2025",
      category: "Leaders", 
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "group"
    },
    {
      id: 3,
      title: "Top 100 Travel and Tourism Leaders 2025",
      category: "Leaders",
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "group"
    },
    {
      id: 4,
      title: "Global Meets Local 2025",
      category: "Companies",
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "group"
    },
    {
      id: 5,
      title: "Egypt's Top 50 Listed Companies 2025",
      category: "Companies",
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "group"
    },
    {
      id: 6,
      title: "Top 100 Listed Companies 2025",
      category: "Companies",
      year: 2025,
      image: "/api/placeholder/400/300",
      type: "group"
    }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchListData();
  }, []);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filterParams = {
        limit: 50,
        status: 'published'
      };

      if (currentYear !== 'all') {
        filterParams.year = currentYear;
      }

      const response = await listService.getAllLists(filterParams);

      if (response.success && response.data && response.data.lists && response.data.lists.length > 0) {
        const allLists = response.data.lists;
        setLists(allLists);
        
        // Set latest list as featured
        const latestList = allLists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setFeaturedList(latestList);
      } else {
        setFeaturedList(sampleLists[0]); // Fallback to sample data
        setLists(sampleLists);
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setFeaturedList(sampleLists[0]); // Fallback to sample data
      setLists(sampleLists);
    } finally {
      setIsLoading(false);
    }
  };

  const years = [2026, 2025, 2024, 2023, 2022, 2021];
  const categories = [
    { id: 'all', label: 'All', active: selectedCategory === 'all' },
    { id: 'recommended', label: 'Recommended', active: selectedCategory === 'recommended' },
    { id: 'rich-lists', label: 'Rich Lists', active: selectedCategory === 'rich-lists' },
    { id: 'entrepreneurs', label: 'Entrepreneurs', active: selectedCategory === 'entrepreneurs' },
    { id: 'companies', label: 'Companies', active: selectedCategory === 'companies' },
    { id: 'leaders', label: 'Leaders', active: selectedCategory === 'leaders' },
    { id: 'entertainment', label: 'Entertainment', active: selectedCategory === 'entertainment' },
    { id: 'sports', label: 'Sports', active: selectedCategory === 'sports' },
    { id: 'lifestyle', label: 'Lifestyle', active: selectedCategory === 'lifestyle' }
  ];

  const handleYearChange = (year) => {
    setCurrentYear(year);
    fetchListData();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Helmet>
        <title>Lists | Forbes Middle East</title>
        <meta name="description" content="Discover the most influential leaders and companies from Forbes Middle East." />
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
          ) : (
            <>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
                <span>Forbes Middle East</span>
                <span>/</span>
                <span>Lists</span>
              </div>

              {/* Featured Header Banner */}
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-8">
                    {/* Portrait Grid - First 2 rows */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-5 gap-3 mb-4">
                        {/* Top row */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 1" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 2" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 3" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 4" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 5" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-3">
                        {/* Bottom row */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 6" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 7" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 8" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 9" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                          <img src="/api/placeholder/64/64" alt="Leader 10" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    {/* Forbes Branding & Title */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <div className="text-right mb-8">
                        <div className="flex items-center justify-end gap-2 mb-4">
                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                          <span className="text-white text-xl font-bold">Forbes</span>
                          <span className="text-red-300 text-sm">Middle East</span>
                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        </div>
                        
                        <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                          SUSTAINABILITY<br />
                          LEADERS IN<br />
                          GOVERNMENT
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {featuredList?.title || "Sustainability Leaders in Government 2025"}
                </h2>
              </div>

              {/* Year Navigation */}
              <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
                {years.map((year) => (
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
              <div className="flex flex-wrap gap-4 mb-12">
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
              </div>

              {/* Lists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {sampleLists.map((list) => (
                  <div key={list.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-64 relative">
                        {list.type === 'grid' ? (
                          // Grid layout for sustainability leaders
                          <div className="absolute inset-0 p-4">
                            <div className="grid grid-cols-5 gap-2 h-full">
                              {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="relative">
                                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                                    <img
                                      src="/api/placeholder/80/80"
                                      alt={`Person ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Forbes Badge */}
                            <div className="absolute top-4 right-4">
                              <div className="flex items-center gap-1">
                                <span className="text-white text-xs font-bold">Forbes</span>
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              </div>
                            </div>
                            
                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-800 to-transparent p-4">
                              <p className="text-white text-xs font-medium uppercase tracking-wide mb-1">
                                SUSTAINABILITY LEADERS IN GOVERNMENT
                              </p>
                            </div>
                          </div>
                        ) : (
                          // Group photo layout for other lists
                          <div className="absolute inset-0">
                            <img
                              src="/api/placeholder/400/300"
                              alt={list.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Forbes Badge */}
                            <div className="absolute top-4 right-4">
                              <div className="flex items-center gap-1">
                                <span className="text-white text-xs font-bold">Forbes</span>
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              </div>
                            </div>
                            
                            {/* Title Overlay */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-sm font-bold uppercase tracking-wide">
                                {list.title.replace(' 2025', '').replace('Top 100 ', '').replace("The Middle East's ", '')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* List Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {list.title}
                    </h3>
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