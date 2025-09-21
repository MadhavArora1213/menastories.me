import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaEye, FaStar, FaBookmark, FaShare, FaFire, FaTrophy, FaNewspaper, FaArrowRight } from 'react-icons/fa';

// Premium magazine-style suggested reads component
const SuggestedReads = () => {
  const [items, setItems] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [featuredArticle, setFeaturedArticle] = useState(null);

  // Premium dummy content with magazine-style articles
  const dummySuggestedReads = [
    {
      id: 'suggested-1',
      title: 'The Future of Corporate Leadership: 10 Strategies That Will Define 2025',
      slug: 'future-corporate-leadership-2025',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Business',
      score: 5,
      excerpt: 'In an era of unprecedented change, corporate leaders must adapt to new paradigms. This comprehensive analysis reveals the strategies that will separate industry leaders from the rest.',
      readTime: 12,
      viewCount: 15420,
      isPremium: true,
      author: 'Sarah Mitchell',
      authorRole: 'Business Editor',
      publishedAt: '2024-09-20',
      tags: ['Leadership', 'Strategy', 'Innovation']
    },
    {
      id: 'suggested-2',
      title: 'Dubai Fashion Week 2024: Revolutionary Designs That Challenge Convention',
      slug: 'dubai-fashion-week-revolutionary-designs',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Fashion',
      score: 5,
      excerpt: 'This year\'s Dubai Fashion Week showcased groundbreaking designs that blend Middle Eastern heritage with cutting-edge technology, setting new global trends.',
      readTime: 8,
      viewCount: 8930,
      isPremium: false,
      author: 'Amira Al-Rashid',
      authorRole: 'Fashion Correspondent',
      publishedAt: '2024-09-19',
      tags: ['Fashion', 'Dubai', 'Trends']
    },
    {
      id: 'suggested-3',
      title: 'AI-Driven Healthcare: How Machine Learning is Revolutionizing Patient Care',
      slug: 'ai-driven-healthcare-machine-learning',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Technology',
      score: 4,
      excerpt: 'From predictive diagnostics to personalized treatment plans, artificial intelligence is transforming healthcare delivery across the globe.',
      readTime: 15,
      viewCount: 22150,
      isPremium: true,
      author: 'Dr. Michael Chen',
      authorRole: 'Technology Editor',
      publishedAt: '2024-09-18',
      tags: ['AI', 'Healthcare', 'Innovation']
    },
    {
      id: 'suggested-4',
      title: 'Cultural Renaissance: UAE Festivals Bridging Ancient Traditions and Modern Expression',
      slug: 'uae-cultural-renaissance-festivals',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Culture',
      score: 4,
      excerpt: 'A deep dive into how the UAE\'s cultural festivals are preserving heritage while fostering contemporary artistic expression.',
      readTime: 10,
      viewCount: 6750,
      isPremium: false,
      author: 'Fatima Al-Zahra',
      authorRole: 'Culture Writer',
      publishedAt: '2024-09-17',
      tags: ['Culture', 'UAE', 'Festivals']
    },
    {
      id: 'suggested-5',
      title: 'Exclusive Interview: Behind the Success of Regional Entertainment Mogul',
      slug: 'exclusive-interview-entertainment-mogul',
      image: 'https://images.unsplash.com/photo-1594736797933-d0d8e67b5b84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Entertainment',
      score: 5,
      excerpt: 'An intimate conversation with one of the Middle East\'s most influential entertainment executives, revealing the strategies behind their empire.',
      readTime: 18,
      viewCount: 18760,
      isPremium: true,
      author: 'Raj Patel',
      authorRole: 'Entertainment Editor',
      publishedAt: '2024-09-16',
      tags: ['Interview', 'Entertainment', 'Success']
    },
    {
      id: 'suggested-6',
      title: 'Middle East Infrastructure: Mega-Projects Reshaping Regional Development',
      slug: 'middle-east-infrastructure-mega-projects',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Development',
      score: 3,
      excerpt: 'Examining the ambitious infrastructure projects that are transforming the Middle East\'s economic and social landscape.',
      readTime: 14,
      viewCount: 4450,
      isPremium: false,
      author: 'Ahmed Hassan',
      authorRole: 'Economic Reporter',
      publishedAt: '2024-09-15',
      tags: ['Infrastructure', 'Development', 'Economy']
    }
  ];

  const interest = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('reader_interest') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/public/homepage`);
        const json = await res.json();
        const pool = [ ...(json.featured || []), ...Object.values(json.sections || {}).flat() ];
        const scored = pool.map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          image: a.featuredImage || '',
          category: a.category?.name || '',
          score: (interest[a.category?.name] || 0) + (a.tags || []).reduce((s,t)=> s + (interest[`tag:${t.name}`]||0), 0),
          excerpt: a.excerpt || a.content?.substring(0, 150) + '...' || '',
          readTime: Math.ceil((a.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 400) / 200),
          viewCount: a.viewCount || Math.floor(Math.random() * 25000) + 1000,
          isPremium: Math.random() > 0.6,
          author: a.author?.name || 'Editorial Team',
          authorRole: 'Staff Writer',
          publishedAt: a.publishedAt || a.createdAt,
          tags: a.tags?.slice(0, 3) || []
        }))
        .sort((a,b) => b.score - a.score)
        .slice(0, 6);

        // Use dummy data if no articles found
        const articles = scored.length > 0 ? scored : dummySuggestedReads;
        setItems(articles);
        setFeaturedArticle(articles[0]);
      } catch (e) {
        // Use dummy data on error
        setItems(dummySuggestedReads);
        setFeaturedArticle(dummySuggestedReads[0]);
      }
    };
    load();
  }, [interest]);

  const getCategoryStyle = (category) => {
    const styles = {
      'Business': {
        bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
        light: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      'Technology': {
        bg: 'bg-gradient-to-r from-green-600 to-green-700',
        light: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      'Fashion': {
        bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
        light: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      'Entertainment': {
        bg: 'bg-gradient-to-r from-pink-600 to-pink-700',
        light: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200'
      },
      'Culture': {
        bg: 'bg-gradient-to-r from-orange-600 to-orange-700',
        light: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200'
      },
      'Development': {
        bg: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
        light: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200'
      },
      'default': {
        bg: 'bg-gradient-to-r from-gray-600 to-gray-700',
        light: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      }
    };
    return styles[category] || styles.default;
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FaNewspaper className="text-xs" />
            Curated For You
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Suggested
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Reads</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover compelling stories and insights tailored to your interests,
            curated by our expert editorial team
          </p>
        </div>

        {/* Featured Article - Large Hero Card */}
        {featuredArticle && (
          <div className="mb-16">
            <Link
              to={`/article/${featuredArticle.slug}`}
              className="group relative block overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3"
            >
              <div className="relative aspect-[21/9] lg:aspect-[21/8] overflow-hidden">
                {featuredArticle.image ? (
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center">
                    <FaNewspaper className="text-8xl text-gray-600" />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-end">
                  <div className="p-8 lg:p-12 w-full">
                    <div className="max-w-4xl">
                      {/* Category & Premium Badge */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`${getCategoryStyle(featuredArticle.category).bg} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                          {featuredArticle.category}
                        </span>
                        {featuredArticle.isPremium && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                            <FaTrophy className="text-xs" />
                            Premium
                          </span>
                        )}
                        {featuredArticle.score >= 4 && (
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                            <FaStar className="text-yellow-400 text-sm" />
                            <span className="text-white font-bold text-sm">{featuredArticle.score}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                        {featuredArticle.title}
                      </h1>

                      {/* Excerpt */}
                      <p className="text-lg lg:text-xl text-gray-200 mb-6 leading-relaxed max-w-3xl">
                        {featuredArticle.excerpt}
                      </p>

                      {/* Meta Information */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {featuredArticle.author.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{featuredArticle.author}</p>
                              <p className="text-gray-300 text-xs">{featuredArticle.authorRole}</p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {featuredArticle.readTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-xs" />
                            {formatViewCount(featuredArticle.viewCount)} views
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-white">
                          <span className="text-sm font-medium">{formatDate(featuredArticle.publishedAt)}</span>
                          <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {items.slice(1).map((article, index) => {
            const categoryStyle = getCategoryStyle(article.category);
            return (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
                onMouseEnter={() => setHoveredCard(article.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center">
                        <FaNewspaper className="text-4xl text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${categoryStyle.bg} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Premium Badge */}
                  {article.isPremium && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        <FaTrophy className="text-xs" />
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {article.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye className="text-xs" />
                            {formatViewCount(article.viewCount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <FaBookmark className="text-sm" />
                          </button>
                          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <FaShare className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={`inline-block ${categoryStyle.light} ${categoryStyle.text} px-2 py-1 rounded-md text-xs font-medium`}
                        >
                          #{tag}
                        </span>
                      ))}
                      {article.tags.length > 2 && (
                        <span className="text-gray-400 text-xs">
                          +{article.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-xs">
                            {article.author.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{article.author}</span>
                      </div>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-medium">Trending</span>
                    </div>
                  </div>

                  {/* Progress Bar for Hovered Card */}
                  {hoveredCard === article.id && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Interest Match</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-transparent transform rotate-12 translate-x-12 -translate-y-12"></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <FaFire className="text-3xl text-orange-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Want More Content?</h3>
              <p className="text-gray-600 mb-4">Explore thousands of articles tailored to your interests</p>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse All Categories
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestedReads;

