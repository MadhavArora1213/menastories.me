import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TrendingTagsBar = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${base}/api/articles?status=published&sort_by=viewCount&sort_order=DESC&limit=8`);
        const json = await res.json();
        const list = (json.data?.articles || json.articles || []).slice(0, 8);
        setArticles(list);
      } catch (e) {
        setArticles([]);
      }
    };
    load();
  }, []);

  if (articles.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-sm sm:text-base font-semibold text-gray-700">Trending News</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {articles.map((article, index) => (
              <Link
                key={article.id || index}
                to={`/article/${article.slug}`}
                className="group px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <span className="text-blue-500 group-hover:text-blue-600">📈</span>
                <span className="ml-1 truncate max-w-24 sm:max-w-32 inline-block">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTagsBar;

