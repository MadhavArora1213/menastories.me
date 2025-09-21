import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TrendingPage = () => {
  const [trendingNews, setTrendingNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  useEffect(() => {
    // Expanded dummy trending news data
    const dummyData = [
      {
        id: 1,
        title: 'Breaking: Major Tech Company Announces Revolutionary AI Breakthrough',
        category: 'Technology',
        urgency: 'breaking',
        path: '/article/tech-ai-breakthrough',
        timestamp: '2 hours ago',
        excerpt: 'A groundbreaking AI development promises to revolutionize multiple industries with unprecedented capabilities.',
        readTime: '5 min read',
        author: 'Tech Reporter',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'
      },
      {
        id: 2,
        title: 'Celebrity Couple Announces Surprise Engagement After Secret Romance',
        category: 'Entertainment',
        urgency: 'hot',
        path: '/article/celebrity-engagement',
        timestamp: '4 hours ago',
        excerpt: 'Hollywood\'s most talked-about couple finally goes public with their relationship status.',
        readTime: '3 min read',
        author: 'Entertainment Editor',
        image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=400&fit=crop'
      },
      {
        id: 3,
        title: 'Global Climate Summit Reaches Historic Agreement on Carbon Reduction',
        category: 'Environment',
        urgency: 'trending',
        path: '/article/climate-summit-agreement',
        timestamp: '6 hours ago',
        excerpt: 'World leaders unite on ambitious climate goals that could reshape global environmental policy.',
        readTime: '8 min read',
        author: 'Environment Correspondent',
        image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop'
      },
      {
        id: 4,
        title: 'Stock Market Hits All-Time High as Economic Recovery Accelerates',
        category: 'Business',
        urgency: 'new',
        path: '/article/stock-market-high',
        timestamp: '8 hours ago',
        excerpt: 'Markets surge to new records as economic indicators show strong recovery momentum.',
        readTime: '6 min read',
        author: 'Business Analyst',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop'
      },
      {
        id: 5,
        title: 'New Study Reveals Surprising Benefits of Mediterranean Diet',
        category: 'Health',
        urgency: 'trending',
        path: '/article/mediterranean-diet-study',
        timestamp: '10 hours ago',
        excerpt: 'Research shows Mediterranean diet may have additional health benefits previously unknown.',
        readTime: '4 min read',
        author: 'Health Writer',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop'
      },
      {
        id: 6,
        title: 'Space Mission Successfully Lands on Mars After 7-Month Journey',
        category: 'Science',
        urgency: 'breaking',
        path: '/article/mars-landing',
        timestamp: '12 hours ago',
        excerpt: 'Historic achievement marks a new era in space exploration and scientific discovery.',
        readTime: '7 min read',
        author: 'Science Editor',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop'
      },
      {
        id: 7,
        title: 'Fashion Week Features Sustainable Collections from Top Designers',
        category: 'Fashion',
        urgency: 'trending',
        path: '/article/fashion-week-sustainable',
        timestamp: '14 hours ago',
        excerpt: 'Leading designers showcase eco-friendly collections that blend style with sustainability.',
        readTime: '5 min read',
        author: 'Fashion Critic',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop'
      },
      {
        id: 8,
        title: 'Olympic Champion Announces Retirement After Record-Breaking Career',
        category: 'Sports',
        urgency: 'hot',
        path: '/article/olympic-retirement',
        timestamp: '16 hours ago',
        excerpt: 'Legendary athlete bids farewell after decades of dominating their sport.',
        readTime: '6 min read',
        author: 'Sports Reporter',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop'
      },
      {
        id: 9,
        title: 'New Archaeological Discovery Rewrites Ancient History',
        category: 'History',
        urgency: 'new',
        path: '/article/archaeological-discovery',
        timestamp: '18 hours ago',
        excerpt: 'Excavation reveals artifacts that challenge our understanding of ancient civilizations.',
        readTime: '9 min read',
        author: 'History Expert',
        image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800&h=400&fit=crop'
      },
      {
        id: 10,
        title: 'Education Reform Bill Passes with Bipartisan Support',
        category: 'Politics',
        urgency: 'trending',
        path: '/article/education-reform',
        timestamp: '20 hours ago',
        excerpt: 'Major legislative change aims to transform the education system for future generations.',
        readTime: '8 min read',
        author: 'Political Analyst',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop'
      }
    ];

    setTrendingNews(dummyData);
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'breaking':
        return 'bg-[#1a1a1a] text-[#ffffff]';
      case 'hot':
        return 'bg-[#162048] text-[#ffffff]';
      case 'trending':
        return 'bg-[#162048] text-[#ffffff]';
      case 'new':
        return 'bg-[#1a1a1a] text-[#ffffff]';
      default:
        return 'bg-[#1a1a1a] text-[#ffffff]';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'breaking':
        return (
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        );
      case 'hot':
        return (
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" clipRule="evenodd" />
          </svg>
        );
      case 'trending':
        return (
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" clipRule="evenodd" />
          </svg>
        );
      case 'new':
        return (
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredNews = trendingNews.filter(news => {
    const categoryMatch = selectedCategory === 'all' || news.category.toLowerCase() === selectedCategory.toLowerCase();
    const urgencyMatch = selectedUrgency === 'all' || news.urgency === selectedUrgency;
    return categoryMatch && urgencyMatch;
  });

  const categories = ['all', ...new Set(trendingNews.map(news => news.category))];
  const urgencies = ['all', 'breaking', 'hot', 'trending', 'new'];

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Hero Section */}
      <div className="bg-[#162048] text-[#ffffff] py-12 md:py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#ffffff] rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-[#ffffff] rounded-lg rotate-45"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-[#ffffff] rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 bg-[#ffffff] rounded-full opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center bg-[#ffffff]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">Live Updates</span>
            </div>

            <h1 className="mt-8 text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Trending
              <span className="block text-[#ffffff]/80">News Hub</span>
            </h1>

            <p className="text-lg md:text-xl text-[#ffffff]/70 mb-8 max-w-2xl mx-auto">
              Discover the stories shaping our world. Stay ahead with real-time updates and breaking news.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-[#ffffff]/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{filteredNews.length}</div>
                <div className="text-xs text-[#ffffff]/70">Stories</div>
              </div>
              <div className="bg-[#ffffff]/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{urgencies.length - 1}</div>
                <div className="text-xs text-[#ffffff]/70">Categories</div>
              </div>
              <div className="bg-[#ffffff]/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-[#ffffff]/70">Updates</div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="bg-[#ffffff] text-[#162048] px-8 py-3 rounded-full font-semibold hover:bg-[#1a1a1a] hover:text-[#ffffff] transition-all duration-300 transform hover:scale-105 shadow-lg">
              Explore Latest News
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#1a1a1a] py-6 border-b border-[#ffffff]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#162048] rounded-full"></div>
                <span className="text-sm font-semibold text-[#ffffff]">Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-[#162048] text-[#ffffff] shadow-lg ring-2 ring-[#ffffff]/20'
                        : 'bg-[#ffffff]/10 text-[#ffffff] border border-[#ffffff]/20 hover:bg-[#ffffff]/20'
                    }`}
                  >
                    {category === 'all' ? '🎯 All' : `📂 ${category}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#162048] rounded-full"></div>
                <span className="text-sm font-semibold text-[#ffffff]">Priority Level:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {urgencies.map(urgency => (
                  <button
                    key={urgency}
                    onClick={() => setSelectedUrgency(urgency)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedUrgency === urgency
                        ? 'bg-[#162048] text-[#ffffff] shadow-lg ring-2 ring-[#ffffff]/20'
                        : 'bg-[#ffffff]/10 text-[#ffffff] border border-[#ffffff]/20 hover:bg-[#ffffff]/20'
                    }`}
                  >
                    {urgency === 'all' ? '⭐ All' :
                     urgency === 'breaking' ? '🚨 Breaking' :
                     urgency === 'hot' ? '🔥 Hot' :
                     urgency === 'trending' ? '📈 Trending' :
                     '🆕 New'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-4">
            Latest Stories
          </h2>
          <div className="w-24 h-1 bg-[#162048] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredNews.map((news, index) => (
            <article
              key={news.id}
              className={`bg-[#ffffff] rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-[#1a1a1a]/10 ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${index === 0 ? 'h-64 md:h-80' : 'h-48'}`}>
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/50 to-transparent"></div>

                {/* Urgency Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center backdrop-blur-sm ${getUrgencyColor(news.urgency)} shadow-lg`}>
                    {getUrgencyIcon(news.urgency)}
                    {news.urgency.toUpperCase()}
                  </span>
                </div>

                {/* Bookmark Button */}
                <button className="absolute top-4 right-4 w-8 h-8 bg-[#1a1a1a]/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#1a1a1a]/30 transition-colors">
                  <svg className="w-4 h-4 text-[#ffffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-[#1a1a1a]/10 text-[#1a1a1a] text-xs font-semibold rounded-full">
                    📂 {news.category}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-[#1a1a1a]/60">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{news.timestamp}</span>
                  </div>
                </div>

                <h2 className="text-lg md:text-xl font-bold text-[#1a1a1a] mb-3 line-clamp-2 hover:text-[#162048] transition-colors duration-300">
                  <Link to={news.path} className="hover:underline decoration-[#162048] decoration-2 underline-offset-4">
                    {news.title}
                  </Link>
                </h2>

                <p className="text-[#1a1a1a]/70 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {news.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-[#ffffff] text-sm font-bold">
                        {news.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{news.author}</p>
                      <p className="text-xs text-[#1a1a1a]/60">{news.readTime}</p>
                    </div>
                  </div>

                  <Link
                    to={news.path}
                    className="inline-flex items-center space-x-1 text-[#1a1a1a] hover:text-[#162048] font-semibold text-sm transition-all duration-300 group"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#1a1a1a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">No Stories Found</h3>
            <p className="text-[#1a1a1a]/60 mb-6">Try adjusting your filters to discover more content.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedUrgency('all');
              }}
              className="bg-[#1a1a1a] text-[#ffffff] px-6 py-3 rounded-full font-semibold hover:bg-[#162048] transition-colors duration-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Signup Section */}
      <div className="bg-[#1a1a1a] text-[#ffffff] py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 border border-[#ffffff] rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-[#1a1a1a] rounded-lg rotate-45"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center bg-[#1a1a1a] rounded-full px-4 py-2 mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm font-medium">Newsletter</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Never Miss a Story
          </h2>
          <p className="text-lg text-[#ffffff]/70 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who stay ahead with our daily digest of trending news and exclusive insights.
          </p>

          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full bg-[#ffffff] text-[#1a1a1a] placeholder-[#1a1a1a]/60 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] transition-all duration-300"
              />
              <button className="bg-[#1a1a1a] hover:bg-[#162048] hover:text-[#ffffff] px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe Now
              </button>
            </div>

            <p className="text-xs text-[#ffffff]/50 mt-4">
              📧 Get daily updates • 🔔 Breaking news alerts • 📊 Weekly insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;