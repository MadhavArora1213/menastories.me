import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, ChevronDown, Calendar, Users, Building2, Star, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import listService from '../services/listService';

const ListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Dynamic data from API only
  const [listData, setListData] = useState(null);
  const [listItems, setListItems] = useState([]);

  // List metadata
  const [listMetadata, setListMetadata] = useState({
    title: "Loading...",
    category: "Lists",
    year: "2024",
    description: "Loading list data...",
    metaTitle: "Forbes Middle East Lists",
    metaDescription: "Discover the most influential lists from Forbes Middle East."
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchListData();
  }, []);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await listService.getAllLists({ limit: 50, status: 'published' });

      if (response.success && response.data.lists.length > 0) {
        const list = response.data.lists[0];
        setListData(list);

        // Update metadata from actual list data
        setListMetadata({
          title: list.title || "Forbes Middle East List",
          category: list.category || "Business",
          year: new Date(list.created_at).getFullYear().toString(),
          description: list.description || "A curated list of influential figures and organizations.",
          metaTitle: `${list.title} | Forbes Middle East`,
          metaDescription: list.meta_description || list.description || "Forbes Middle East curated list."
        });

        // Transform entries to match the expected format
        const transformedEntries = list.entries.map(entry => ({
          id: entry.id,
          rank: entry.rank || 0,
          name: entry.name,
          title: entry.designation || 'Professional',
          company: entry.company || 'Organization',
          industry: entry.category || 'Business',
          description: entry.description || 'No description available.',
          image: entry.image ? 
            `${import.meta.env.VITE_API_URL || 'https://menastories.me/api'}/storage/images/${entry.image.split('/').pop()}` : 
            null,
          verified: true
        }));

        setListItems(transformedEntries);
      } else {
        setError('No published lists found');
        setListItems([]);
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setError(err.message || 'Failed to load list data');
      setListItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'finance', name: 'Finance' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'energy', name: 'Energy' }
  ];

  const filteredItems = listItems
    .filter(item =>
      selectedCategory === 'all' || item.industry.toLowerCase().includes(selectedCategory.toLowerCase())
    )
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <Helmet>
        <title>{listMetadata.metaTitle}</title>
        <meta name="description" content={listMetadata.metaDescription} />
        <meta name="keywords" content="Forbes Middle East, business lists, rankings, leaders" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {/* Title Section */}
              <div className="mb-12">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>LISTS</span>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  <span className="text-black font-medium">{listMetadata.category.toUpperCase()}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                  {listMetadata.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-4xl leading-relaxed">
                  {listMetadata.description}
                </p>
                <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{listMetadata.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{filteredItems.length} Entries</span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 p-6 mb-12">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:border-black bg-white"
                    >
                      <option value="rank">Rank</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} results
                </p>
              </div>

              {/* List Items */}
              {paginatedItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-500">No entries found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {paginatedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                    >
                      <div className="p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold">
                              {item.rank}
                            </div>
                          </div>

                          {/* Image */}
                          {item.image && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 lg:w-24 lg:h-24 object-cover border border-gray-200"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-black mb-2 group-hover:underline">
                                  {item.name}
                                </h3>
                                <p className="text-lg text-gray-700 mb-2 font-medium">
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{item.company}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    <span>{item.industry}</span>
                                  </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              <div className="lg:ml-6 mt-4 lg:mt-0">
                                <button className="flex items-center gap-2 text-black hover:text-gray-700 font-medium">
                                  <span>VIEW PROFILE</span>
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 ${
                        currentPage === i + 1
                          ? 'bg-black text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
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