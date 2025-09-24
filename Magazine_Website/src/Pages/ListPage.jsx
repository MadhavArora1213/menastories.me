import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Award, TrendingUp, Users, Building2, Star, ChevronRight, AlertCircle, RefreshCw, Calendar, Tag, FileText, Image, Settings } from 'lucide-react';
import listService from '../services/listService';

const ListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListType, setSelectedListType] = useState('recommended');
  const [sortBy, setSortBy] = useState('rank');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic data from API
  const [listData, setListData] = useState(null);
  const [listItems, setListItems] = useState([]);

  // List metadata from form structure
  const [listMetadata, setListMetadata] = useState({
    title: "Middle East's Most Influential Business Leaders 2024",
    slug: "middle-east-most-influential-business-leaders-2024",
    category: "Business",
    year: "2024",
    description: "A comprehensive ranking of the most influential business leaders shaping the Middle East's economic landscape.",
    content: "This list recognizes leaders who have demonstrated exceptional vision, innovation, and impact in their respective industries. Our methodology includes factors such as company performance, industry influence, leadership achievements, and community impact.",
    methodology: "Compiled through extensive research, industry analysis, and expert consultations. Rankings are based on quantitative metrics including revenue growth, market impact, and qualitative assessments of leadership excellence.",
    metaTitle: "Middle East's Most Influential Business Leaders 2024 | Forbes Rankings",
    metaDescription: "Discover the most influential business leaders and executives shaping the Middle East's economic landscape in 2024.",
    featuredImageCaption: "Top business leaders from across the Middle East region"
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchListData();
  }, []);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll fetch all lists and use the first one as an example
      // In a real implementation, you might want to fetch a specific list by slug or ID
      const response = await listService.getAllLists({ limit: 1, status: 'published' });

      if (response.success && response.data.lists.length > 0) {
        const list = response.data.lists[0];
        setListData(list);

        // Transform entries to match the expected format
        const transformedEntries = list.entries.map(entry => ({
          id: entry.id,
          rank: entry.rank || 0,
          name: entry.name,
          title: entry.designation || 'Professional',
          company: entry.company || 'Company',
          industry: entry.category || 'Business',
          revenue: 'N/A', // You might want to add revenue field to the model
          employees: 'N/A', // You might want to add employees field to the model
          description: entry.description || 'No description available.',
          image: entry.image ? `${import.meta.env.VITE_API_URL || 'https://menastories.me/api'}/storage/images/${entry.image.split('/').pop()}` : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
          verified: true,
          trend: "stable"
        }));

        setListItems(transformedEntries);
      } else {
        // If no lists found, use sample data as fallback
        setListItems(getSampleData());
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setError(err.message);
      // Use sample data as fallback
      setListItems(getSampleData());
    } finally {
      setIsLoading(false);
    }
  };

  // Sample data fallback
  const getSampleData = () => [
    {
      id: 1,
      rank: 1,
      name: "Ahmed Al-Rashid",
      title: "CEO, TechVision Group",
      company: "TechVision Group",
      industry: "Technology",
      revenue: "$2.4B",
      employees: "15,000",
      description: "Leading digital transformation across MENA region with innovative cloud solutions and AI integration.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      verified: true,
      trend: "up"
    },
    {
      id: 2,
      rank: 2,
      name: "Fatima Al-Zahra",
      title: "Founder & CEO, GreenTech Solutions",
      company: "GreenTech Solutions",
      industry: "Renewable Energy",
      revenue: "$1.8B",
      employees: "8,500",
      description: "Pioneering sustainable energy solutions with breakthrough solar panel technology.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      verified: true,
      trend: "up"
    },
    {
      id: 3,
      rank: 3,
      name: "Mohammed Al-Fahad",
      title: "Chairman, Gulf Financial Holdings",
      company: "Gulf Financial Holdings",
      industry: "Finance",
      revenue: "$3.2B",
      employees: "12,000",
      description: "Revolutionizing Islamic finance with digital banking platforms and fintech innovations.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      verified: true,
      trend: "stable"
    },
    {
      id: 4,
      rank: 4,
      name: "Sarah Al-Mansouri",
      title: "CEO, Healthcare Innovations",
      company: "Healthcare Innovations",
      industry: "Healthcare",
      revenue: "$950M",
      employees: "6,200",
      description: "Transforming healthcare delivery through telemedicine and AI-powered diagnostics.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      verified: true,
      trend: "up"
    },
    {
      id: 5,
      rank: 5,
      name: "Omar Al-Dosari",
      title: "Founder, E-Commerce Empire",
      company: "E-Commerce Empire",
      industry: "E-Commerce",
      revenue: "$1.5B",
      employees: "9,800",
      description: "Building the largest e-commerce platform in the Middle East with seamless logistics.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      verified: true,
      trend: "up"
    }
  ];

  const listTypes = [
    { id: 'recommended', name: 'Recommended', icon: Award },
    { id: 'rich-lists', name: 'Rich Lists', icon: TrendingUp },
    { id: 'entrepreneurs', name: 'Entrepreneurs', icon: Users },
    { id: 'companies', name: 'Companies', icon: Building2 },
    { id: 'leaders', name: 'Leaders', icon: Star },
    { id: 'entertainment', name: 'Entertainment', icon: Star },
    { id: 'sports', name: 'Sports', icon: Award },
    { id: 'lifestyle', name: 'Lifestyle', icon: Users }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Award },
    { id: 'technology', name: 'Technology', icon: TrendingUp },
    { id: 'finance', name: 'Finance', icon: Building2 },
    { id: 'healthcare', name: 'Healthcare', icon: Users },
    { id: 'energy', name: 'Energy', icon: Star },
    { id: 'business', name: 'Business', icon: Building2 }
  ];

  const filteredItems = listItems
    .filter(item =>
      selectedCategory === 'all' || item.industry.toLowerCase() === selectedCategory
    )
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'revenue') return parseFloat(b.revenue.replace(/[^0-9.]/g, '')) - parseFloat(a.revenue.replace(/[^0-9.]/g, ''));
      return 0;
    });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const handleListTypeChange = (listType) => {
    setSelectedListType(listType);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <>
      <Helmet>
        <title>{listMetadata.metaTitle}</title>
        <meta name="description" content={listMetadata.metaDescription} />
        <meta name="keywords" content="business leaders, executives, Middle East, top CEOs, influential people" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Clean Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Forbes Middle East</h1>
                  <p className="text-sm text-gray-600">Business Intelligence</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Lists</a>
                <a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Companies</a>
                <a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Leaders</a>
                <a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">Innovation</a>
                <a href="#" className="text-black hover:text-blue-600 font-medium transition-colors">About</a>
              </nav>
            </div>
          </div>
        </header>

        {/* List Metadata Section */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Title and Slug */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-black">List Information</h3>
                </div>
                <h2 className="text-xl font-bold text-black mb-2">{listMetadata.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Slug:</span> {listMetadata.slug}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {listMetadata.category}
                </p>
              </div>

              {/* Year and List Type */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-black">Publication Details</h3>
                </div>
                <p className="text-lg font-bold text-blue-600 mb-2">{listMetadata.year}</p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">List Type:</span> {listTypes.find(t => t.id === selectedListType)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> Published
                </p>
              </div>

              {/* Featured Image */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Image className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-black">Featured Image</h3>
                </div>
                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 text-center">{listMetadata.featuredImageCaption}</p>
              </div>

              {/* SEO Settings */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-black">SEO Settings</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Meta Title:</span> {listMetadata.metaTitle}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Meta Description:</span> {listMetadata.metaDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* List Types Selection */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h3 className="text-lg font-semibold text-black mb-4">List Categories</h3>
            <div className="flex flex-wrap gap-3">
              {listTypes.map((listType) => {
                const Icon = listType.icon;
                return (
                  <button
                    key={listType.id}
                    onClick={() => handleListTypeChange(listType.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedListType === listType.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {listType.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Description and Content */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{listMetadata.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Content & Methodology</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{listMetadata.content}</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Methodology</h4>
                  <p className="text-blue-800 text-sm">{listMetadata.methodology}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search leaders, companies, or titles..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="rank">Sort by Rank</option>
                  <option value="name">Sort by Name</option>
                  <option value="revenue">Sort by Revenue</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* List Content */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading leaders...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">Failed to Load Data</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
                <button
                  onClick={fetchListData}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {selectedCategory === 'all' ? 'All Leaders' : categories.find(c => c.id === selectedCategory)?.name}
                    {listData && (
                      <span className="text-lg font-normal text-gray-600 ml-2">
                        - {listData.title}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600">
                    Showing {filteredItems.length} of {listItems.length} leaders
                  </p>
                </div>

                {/* List Items */}
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Rank */}
                        <div className="lg:w-20 flex-shrink-0 bg-blue-600 text-white p-4 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">#{item.rank}</div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              <div className="relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                />
                                {item.verified && (
                                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-bold text-black mb-1">{item.name}</h3>
                                  <p className="text-blue-600 font-medium text-sm">{item.title}</p>
                                  <p className="text-gray-600 text-sm">{item.company}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              </div>

                              <p className="text-gray-700 mb-4 leading-relaxed text-sm">{item.description}</p>

                              <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Industry:</span>
                                  <span className="font-medium text-black">{item.industry}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Revenue:</span>
                                  <span className="font-medium text-black">{item.revenue}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-600">Employees:</span>
                                  <span className="font-medium text-black">{item.employees}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredItems.length >= 5 && (
                  <div className="text-center mt-12">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                      Load More Leaders
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Know a Leader Who Should Be Featured?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Nominate exceptional business leaders who are making a significant impact in their industries.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
              Submit Nomination
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Forbes Middle East</h3>
                    <p className="text-gray-400">Business Intelligence</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed max-w-md">
                  Your trusted source for business news, financial insights, and leadership intelligence across the Middle East region.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Lists</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">Top Companies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Richest Individuals</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Most Powerful CEOs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Innovation Leaders</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2024 Forbes Middle East. All rights reserved.
                </p>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListPage;