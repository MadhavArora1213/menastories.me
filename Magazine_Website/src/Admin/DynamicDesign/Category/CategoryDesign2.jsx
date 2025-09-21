import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const CategoryDesign2 = ({ categories = [], onEdit, onDelete, onToggleStatus }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedView, setSelectedView] = useState("grid"); // grid, list, masonry

  const bgMain = isDark ? "bg-black" : "bg-gray-50";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  // Dummy data for demonstration
  const dummyCategory = {
    id: 1,
    name: "Business & Leadership",
    description: "Insights into modern business strategies, leadership development, and entrepreneurial success stories that drive organizational growth.",
    status: "Active",
    featureImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=400&fit=crop",
    createdAt: "2024-01-15"
  };

  const dummyArticles = [
    {
      id: 1,
      title: "Transformational Leadership in the Digital Age",
      excerpt: "How modern leaders are adapting to digital transformation and fostering innovation within their organizations.",
      author: "Dr. Amanda Foster",
      publishedAt: "2024-01-20",
      status: "Published",
      views: 2156,
      featureImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    },
    {
      id: 2,
      title: "Strategic Planning for Startup Success",
      excerpt: "Essential strategies and frameworks that startup founders need to build sustainable and scalable businesses.",
      author: "Marcus Chen",
      publishedAt: "2024-01-18",
      status: "Published",
      views: 1347,
      featureImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    },
    {
      id: 3,
      title: "Corporate Culture: Building High-Performance Teams",
      excerpt: "The role of organizational culture in employee engagement, productivity, and long-term business success.",
      author: "Sarah Johnson",
      publishedAt: "2024-01-16",
      status: "Draft",
      views: 0,
      featureImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    },
    {
      id: 4,
      title: "Financial Management for Entrepreneurs",
      excerpt: "Key financial principles and tools that every entrepreneur should understand to ensure business sustainability.",
      author: "David Rodriguez",
      publishedAt: "2024-01-14",
      status: "Published",
      views: 1892,
      featureImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    },
    {
      id: 5,
      title: "Innovation Management: From Idea to Market",
      excerpt: "Systematic approaches to managing innovation processes and bringing breakthrough ideas to market successfully.",
      author: "Lisa Park",
      publishedAt: "2024-01-12",
      status: "Published",
      views: 987,
      featureImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    },
    {
      id: 6,
      title: "Global Business Expansion Strategies",
      excerpt: "Comprehensive guide to expanding business operations internationally and navigating cross-cultural challenges.",
      author: "Robert Kim",
      publishedAt: "2024-01-10",
      status: "Published",
      views: 1678,
      featureImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      category: "Business & Leadership"
    }
  ];

  return (
    <div className={`${bgMain} min-h-screen`}>
      {/* Hero Section with Featured Image */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${dummyCategory.featureImage})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-6">
            <div className="mb-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                dummyCategory.status === "Active"
                  ? "bg-green-500/20 text-green-300 border border-green-400/30"
                  : "bg-red-500/20 text-red-300 border border-red-400/30"
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  dummyCategory.status === "Active" ? "bg-green-400" : "bg-red-400"
                }`}></span>
                {dummyCategory.status}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
              {dummyCategory.name}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6">
              {dummyCategory.description}
            </p>
            
            {/* Category Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onEdit && onEdit(dummyCategory)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Edit Category
              </button>
              <button
                onClick={() => onToggleStatus && onToggleStatus(dummyCategory)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg ${
                  dummyCategory.status === "Active"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {dummyCategory.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => onDelete && onDelete(dummyCategory.id)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${textMain} mb-2`}>Articles in {dummyCategory.name}</h2>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {dummyArticles.length} article{dummyArticles.length !== 1 ? 's' : ''} found
          </p>
        </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>View:</span>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: "grid", icon: "⊞", label: "Grid" },
                { key: "list", icon: "☰", label: "List" },
                { key: "masonry", icon: "▤", label: "Masonry" }
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedView === view.key
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="mr-1">{view.icon}</span>
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          </div>
          
        {/* Articles Display */}
        <div className={`
          ${selectedView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : ""}
          ${selectedView === "list" ? "space-y-4" : ""}
          ${selectedView === "masonry" ? "columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6" : ""}
        `}>
          {dummyArticles.map((article) => (
            <div
              key={article.id}
              className={`
                ${cardBg} ${borderColor} border rounded-2xl overflow-hidden backdrop-blur-sm
                ${selectedView === "grid" ? "break-inside-avoid" : ""}
                ${selectedView === "list" ? "flex items-center p-6" : "p-6"}
                hover:shadow-xl transition-all duration-300 hover:-translate-y-1
              `}
            >
              {/* Article Image */}
              {selectedView !== "list" && (
                <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
                  <img
                    src={article.featureImage}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      article.status === "Published"
                        ? "bg-green-500/90 text-white"
                        : "bg-yellow-500/90 text-white"
                    }`}>
                      {article.status}
                            </span>
                          </div>
                        </div>
              )}

              {/* Article Content */}
              <div className={selectedView === "list" ? "flex-1 ml-4" : ""}>
                <h3 className={`text-lg font-bold ${textMain} mb-2 line-clamp-2`}>
                  {article.title}
                </h3>
                
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-3 line-clamp-3`}>
                  {article.excerpt}
                </p>
                
                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-3">
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                          </div>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {article.views}
                  </span>
                        </div>

                {/* Article Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200">
                          Edit
                        </button>
                  <button className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 ${
                    article.status === "Published"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}>
                    {article.status === "Published" ? "Unpublish" : "Publish"}
                        </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200">
                          Delete
                        </button>
                      </div>
          </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDesign2;