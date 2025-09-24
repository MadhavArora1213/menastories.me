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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
            <span>Forbes Middle East</span>
            <span>/</span>
            <span>Lists</span>
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