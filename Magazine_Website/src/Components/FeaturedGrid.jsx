import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FeaturedGrid = () => {
  const [items, setItems] = useState([]);

  // Dummy articles for when database is empty
  const dummyArticles = [
    {
      id: 'dummy-1',
      title: 'The Future of Technology: AI and Innovation',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Technology',
      slug: 'future-technology-ai-innovation'
    },
    {
      id: 'dummy-2',
      title: 'Business Leaders Share Their Success Stories',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Business',
      slug: 'business-leaders-success-stories'
    },
    {
      id: 'dummy-3',
      title: 'Lifestyle Trends That Are Changing the World',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Lifestyle',
      slug: 'lifestyle-trends-changing-world'
    },
    {
      id: 'dummy-4',
      title: 'Cultural Movements and Social Impact',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Culture & Society',
      slug: 'cultural-movements-social-impact'
    },
    {
      id: 'dummy-5',
      title: 'Entertainment Industry: Behind the Scenes',
      image: 'https://images.unsplash.com/photo-1489599511714-7b1be02e3e42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Entertainment',
      slug: 'entertainment-industry-behind-scenes'
    },
    {
      id: 'dummy-6',
      title: 'Regional Focus: Dubai and UAE Development',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Regional Focus',
      slug: 'dubai-uae-development'
    },
    {
      id: 'dummy-7',
      title: 'Health and Wellness: Modern Approaches',
      image: 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Lifestyle',
      slug: 'health-wellness-modern-approaches'
    },
    {
      id: 'dummy-8',
      title: 'Special Features: Innovation Awards 2025',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Special Sections',
      slug: 'innovation-awards-2025'
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/public/homepage`);
        const json = await res.json();
        const list = (json.featured || []).slice(0, 8).map(a => ({
          id: a.id,
          title: a.title,
          image: a.featuredImage || '',
          category: a.category?.name || '',
          slug: a.slug,
          description: a.description || a.excerpt || a.subtitle || '',
          author: a.primaryAuthor?.name || a.author?.name || 'Editorial Team',
          publishedAt: a.publishedAt || a.publishDate || a.createdAt,
          readTime: a.readTime || '5 min read'
        }));

        // Use dummy data if no featured articles found
        setItems(list.length > 0 ? list : dummyArticles);
      } catch (e) {
        // Use dummy data on error
        setItems(dummyArticles);
      }
    };
    load();
  }, []);

  // Helper function to truncate description to specific word count
  const truncateDescription = (text, wordLimit = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 relative">
          Featured Articles
          <div
            className="absolute bottom-0 left-0 w-12 h-1 rounded-full"
            style={{ backgroundColor: '#162048' }}
          ></div>
        </h2>
        <Link
          to="/featured"
          className="font-medium flex items-center gap-2 transition-colors duration-200"
          style={{ color: '#162048' }}
          onMouseOver={(e) => e.target.style.color = '#162048'}
          onMouseOut={(e) => e.target.style.color = '#162048'}
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(a => (
          <article key={a.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300">
            <Link to={`/article/${a.slug}`} className="block">
              <div className="relative overflow-hidden">
                <img
                  src={a.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={a.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {a.category && (
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-white px-3 py-1.5 text-xs font-medium rounded-full shadow-lg"
                      style={{ backgroundColor: '#162048' }}
                    >
                      {a.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3
                  className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 transition-colors duration-200"
                  style={{ color: 'inherit' }}
                  onMouseOver={(e) => e.target.style.color = '#162048'}
                  onMouseOut={(e) => e.target.style.color = 'inherit'}
                >
                  {a.title}
                </h3>

                {a.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {truncateDescription(a.description, 15)}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{a.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{a.readTime}</span>
                    </div>
                  </div>
                  {a.publishedAt && (
                    <span>{formatDate(a.publishedAt)}</span>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedGrid;

