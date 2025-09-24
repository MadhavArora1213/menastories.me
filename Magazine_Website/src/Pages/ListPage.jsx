import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle } from 'lucide-react';

const ListPage = () => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Helmet>
        <title>Lists | Magazine</title>
        <meta name="description" content="Discover the most influential leaders and companies." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-black">MAGAZINE</span>
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
            <span>Magazine</span>
            <span>/</span>
            <span>Lists</span>
          </div>

          {/* Featured Header Banner */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-lg overflow-hidden h-64">
              <div className="absolute inset-0">
                <img
                  src="/api/placeholder/1200/300"
                  alt="Lists Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-8 left-8 right-8">
                  <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
                    LISTS & RANKINGS
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Lists & Rankings
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

          {/* Empty State */}
          <div className="flex flex-col justify-center items-center py-20">
            <div className="bg-gray-50 rounded-full p-6 mb-6">
              <AlertCircle className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Lists Available</h2>
            <p className="text-gray-600 text-lg text-center max-w-md">
              There are currently no lists available in the {selectedCategory === 'all' ? 'selected' : selectedCategory} category for {currentYear}.
              Please check back later for new content.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">MAGAZINE</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  The definitive source for business news, financial insights, and leadership intelligence.
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
                © 2024 Magazine. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListPage;