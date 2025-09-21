import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const CategoryDesign1 = ({ categories = [], onEdit, onDelete, onToggleStatus }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedView, setSelectedView] = useState("grid"); // grid, list, masonry

  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-50";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  // Dummy data for demonstration
  const dummyCategory = {
    id: 1,
    name: "Technology & Innovation",
    description: "Exploring the latest trends in technology, artificial intelligence, and digital transformation that are shaping our future.",
    status: "Active",
    featureImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop",
    createdAt: "2024-01-15"
  };

  const dummyArticles = [
    {
      id: 1,
      title: "The Future of Artificial Intelligence in 2024",
      excerpt: "Discover how AI is revolutionizing industries and what to expect in the coming year. From machine learning breakthroughs to ethical considerations.",
      author: "Dr. Sarah Chen",
      publishedAt: "2024-01-20",
      status: "Published",
      views: 1247,
      featureImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
    },
    {
      id: 2,
      title: "Blockchain Technology: Beyond Cryptocurrency",
      excerpt: "Explore the diverse applications of blockchain technology in supply chain management, healthcare, and digital identity verification.",
      author: "Michael Rodriguez",
      publishedAt: "2024-01-18",
      status: "Published",
      views: 892,
      featureImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
    },
    {
      id: 3,
      title: "Sustainable Tech: Green Computing Solutions",
      excerpt: "How technology companies are embracing eco-friendly practices and developing sustainable computing solutions for a greener future.",
      author: "Emma Thompson",
      publishedAt: "2024-01-16",
      status: "Draft",
      views: 0,
      featureImage: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
    },
    {
      id: 4,
      title: "Cybersecurity Trends: Protecting Digital Assets",
      excerpt: "An overview of emerging cybersecurity threats and the latest defense strategies to protect against cyber attacks and data breaches.",
      author: "James Wilson",
      publishedAt: "2024-01-14",
      status: "Published",
      views: 1563,
      featureImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
    },
    {
      id: 5,
      title: "The Rise of Edge Computing",
      excerpt: "Understanding edge computing and how it's transforming data processing, IoT devices, and real-time applications.",
      author: "Lisa Park",
      publishedAt: "2024-01-12",
      status: "Published",
      views: 734,
      featureImage: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
    },
    {
      id: 6,
      title: "Quantum Computing: Breaking New Grounds",
      excerpt: "A deep dive into quantum computing research, its potential applications, and the race to achieve quantum supremacy.",
      author: "Dr. Robert Kim",
      publishedAt: "2024-01-10",
      status: "Published",
      views: 2101,
      featureImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
      category: "Technology & Innovation"
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

export default CategoryDesign1;
