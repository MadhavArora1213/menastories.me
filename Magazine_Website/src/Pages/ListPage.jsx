import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Award, TrendingUp, Users, Building2, Star, ChevronRight } from 'lucide-react';

const ListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - in a real app, this would come from an API
  const [listItems, setListItems] = useState([
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
  ]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Award },
    { id: 'technology', name: 'Technology', icon: TrendingUp },
    { id: 'finance', name: 'Finance', icon: Building2 },
    { id: 'healthcare', name: 'Healthcare', icon: Users },
    { id: 'energy', name: 'Energy', icon: Star }
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

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <>
      <Helmet>
        <title>Top Business Leaders 2024 | Middle East's Most Influential Executives</title>
        <meta name="description" content="Discover the most influential business leaders and executives shaping the Middle East's economic landscape in 2024." />
        <meta name="keywords" content="business leaders, executives, Middle East, top CEOs, influential people" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-4">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">2024 EDITION</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Middle East's Most
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Influential Leaders
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Celebrating the visionaries, innovators, and trailblazers who are shaping the future of business across the Middle East region.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-blue-200">Leaders Featured</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-3xl font-bold text-yellow-400">25+</div>
                <div className="text-blue-200">Industries</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-3xl font-bold text-yellow-400">12</div>
                <div className="text-blue-200">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 px-4 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search leaders, companies, or titles..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategory === 'all' ? 'All Leaders' : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-600">
                    Showing {filteredItems.length} of {listItems.length} leaders
                  </p>
                </div>

                {/* List Items */}
                <div className="space-y-6">
                  {filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Rank and Image */}
                        <div className="lg:w-48 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold mb-2">#{item.rank}</div>
                            <div className="flex items-center justify-center gap-1">
                              {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-300" />}
                              {item.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-300 rotate-180" />}
                              {item.trend === 'stable' && <div className="w-4 h-4 rounded-full bg-yellow-300"></div>}
                            </div>
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
                                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                {item.verified && (
                                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                                  <p className="text-blue-600 font-medium">{item.title}</p>
                                  <p className="text-gray-600">{item.company}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              </div>

                              <p className="text-gray-700 mb-4 leading-relaxed">{item.description}</p>

                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">Industry:</span>
                                  <span className="font-medium text-gray-900">{item.industry}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">Revenue:</span>
                                  <span className="font-medium text-gray-900">{item.revenue}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">Employees:</span>
                                  <span className="font-medium text-gray-900">{item.employees}</span>
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
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
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
      </div>
    </>
  );
};

export default ListPage;