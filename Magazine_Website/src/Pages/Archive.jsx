import React, { useState } from "react";

const Archive = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sample archive data
  const archiveData = {
    "2025": {
      "All": [
        { id: 1, title: "The Future of Sustainable Fashion", date: "August 10, 2025", category: "Lifestyle", excerpt: "Exploring how the fashion industry is embracing eco-friendly practices." },
        { id: 2, title: "Tech Innovations Changing Our Daily Lives", date: "August 5, 2025", category: "Technology", excerpt: "How recent technological advances are reshaping our everyday experiences." },
        { id: 3, title: "Rising Stars in the Art World", date: "July 28, 2025", category: "Culture", excerpt: "Meet the emerging artists making waves in galleries worldwide." },
        { id: 4, title: "The Business of Social Media Influencers", date: "July 22, 2025", category: "Business", excerpt: "An inside look at the economics behind influencer marketing." },
        { id: 5, title: "Healthy Habits for Busy Professionals", date: "July 15, 2025", category: "Lifestyle", excerpt: "Simple wellness practices that fit into demanding schedules." },
        { id: 6, title: "Revolutionary Startups to Watch", date: "July 8, 2025", category: "Business", excerpt: "Innovative companies poised to disrupt their industries." },
        { id: 7, title: "The Evolution of Digital Entertainment", date: "June 30, 2025", category: "Entertainment", excerpt: "How streaming platforms are changing the entertainment landscape." },
        { id: 8, title: "Urban Gardening: Green Spaces in the City", date: "June 22, 2025", category: "Lifestyle", excerpt: "Creative solutions for bringing nature into urban environments." },
      ],
      "January": [
        { id: 9, title: "New Year, New Trends", date: "January 15, 2025", category: "Lifestyle", excerpt: "The top trends to watch in the new year." },
      ],
      "February": [
        { id: 10, title: "Winter Wellness Tips", date: "February 10, 2025", category: "Lifestyle", excerpt: "Staying healthy and energized during the colder months." },
      ],
      "March": [
        { id: 11, title: "Spring Fashion Preview", date: "March 20, 2025", category: "Lifestyle", excerpt: "What to expect from the upcoming spring fashion season." },
      ],
      "April": [
        { id: 12, title: "Earth Day Sustainability Features", date: "April 22, 2025", category: "Lifestyle", excerpt: "Special coverage on environmental initiatives and sustainable living." },
      ],
      "May": [
        { id: 13, title: "Mother's Day Gift Guide", date: "May 10, 2025", category: "Lifestyle", excerpt: "Thoughtful gift ideas for the special mothers in your life." },
      ],
      "June": [
        { id: 7, title: "The Evolution of Digital Entertainment", date: "June 30, 2025", category: "Entertainment", excerpt: "How streaming platforms are changing the entertainment landscape." },
        { id: 8, title: "Urban Gardening: Green Spaces in the City", date: "June 22, 2025", category: "Lifestyle", excerpt: "Creative solutions for bringing nature into urban environments." },
      ],
      "July": [
        { id: 3, title: "Rising Stars in the Art World", date: "July 28, 2025", category: "Culture", excerpt: "Meet the emerging artists making waves in galleries worldwide." },
        { id: 4, title: "The Business of Social Media Influencers", date: "July 22, 2025", category: "Business", excerpt: "An inside look at the economics behind influencer marketing." },
        { id: 5, title: "Healthy Habits for Busy Professionals", date: "July 15, 2025", category: "Lifestyle", excerpt: "Simple wellness practices that fit into demanding schedules." },
        { id: 6, title: "Revolutionary Startups to Watch", date: "July 8, 2025", category: "Business", excerpt: "Innovative companies poised to disrupt their industries." },
      ],
      "August": [
        { id: 1, title: "The Future of Sustainable Fashion", date: "August 10, 2025", category: "Lifestyle", excerpt: "Exploring how the fashion industry is embracing eco-friendly practices." },
        { id: 2, title: "Tech Innovations Changing Our Daily Lives", date: "August 5, 2025", category: "Technology", excerpt: "How recent technological advances are reshaping our everyday experiences." },
      ]
    },
    "2024": {
      "All": [
        { id: 14, title: "Year in Review: Top Stories of 2024", date: "December 30, 2024", category: "Editorial", excerpt: "Looking back at the most impactful stories from the past year." },
        { id: 15, title: "Holiday Gift Guide for Tech Enthusiasts", date: "December 15, 2024", category: "Technology", excerpt: "The best gadgets and tech gifts for the holiday season." },
        { id: 16, title: "Winter Fashion Trends", date: "December 5, 2024", category: "Lifestyle", excerpt: "Staying stylish during the colder months with these seasonal trends." },
        { id: 17, title: "Innovations in Renewable Energy", date: "November 22, 2024", category: "Technology", excerpt: "Breakthrough technologies in solar, wind, and other renewable energy sources." },
        { id: 18, title: "Celebrating Cultural Diversity", date: "November 10, 2024", category: "Culture", excerpt: "How our magazine is committed to representing diverse voices and perspectives." },
        { id: 19, title: "Entrepreneur Spotlight: Young Founders", date: "October 28, 2024", category: "Business", excerpt: "Profiles of successful entrepreneurs under the age of 30." },
        { id: 20, title: "The Psychology of Color in Design", date: "October 15, 2024", category: "Culture", excerpt: "How color choices impact user experience and brand perception." },
        { id: 21, title: "Fitness Trends for the Modern Professional", date: "October 5, 2024", category: "Lifestyle", excerpt: "Workout routines that fit into busy schedules and small spaces." },
      ]
    },
    "2023": {
      "All": [
        { id: 22, title: "A Look Back at 2023", date: "December 28, 2023", category: "Editorial", excerpt: "Reflecting on the major events and stories that shaped the year." },
        { id: 23, title: "Holiday Entertaining Tips", date: "December 12, 2023", category: "Lifestyle", excerpt: "Ideas for hosting memorable gatherings during the festive season." },
        { id: 24, title: "The Rise of AI in Creative Industries", date: "November 20, 2023", category: "Technology", excerpt: "How artificial intelligence is transforming art, music, and content creation." },
        { id: 25, title: "Sustainable Travel Destinations", date: "November 5, 2023", category: "Lifestyle", excerpt: "Eco-friendly vacation spots that prioritize environmental conservation." },
        { id: 26, title: "Women in Leadership", date: "October 18, 2023", category: "Business", excerpt: "Profiles of inspiring female executives breaking barriers in their fields." },
        { id: 27, title: "The Art of Minimalist Living", date: "October 3, 2023", category: "Lifestyle", excerpt: "How simplifying your possessions can lead to a richer life experience." },
        { id: 28, title: "Cybersecurity in the Modern Age", date: "September 22, 2023", category: "Technology", excerpt: "Essential tips for protecting your digital identity and data." },
        { id: 29, title: "Urban Architecture Trends", date: "September 10, 2023", category: "Culture", excerpt: "Innovative building designs shaping the skylines of major cities." },
      ]
    }
  };

  const years = Object.keys(archiveData);
  const months = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const categories = ["All", "Lifestyle", "Technology", "Business", "Culture", "Entertainment", "Editorial"];

  // Get filtered articles
  const filteredArticles = selectedMonth === "All" 
    ? archiveData[selectedYear]?.All || [] 
    : archiveData[selectedYear]?.[selectedMonth] || [];

  const categoryFilteredArticles = selectedCategory === "All" 
    ? filteredArticles 
    : filteredArticles.filter(article => article.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
          Article Archive
        </h1>
        
        <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
          Browse our collection of past articles, organized by year, month, and category.
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Filter Archive</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-[#162048] font-bold mb-2">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[#162048] font-bold mb-2">Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[#162048] font-bold mb-2">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-6">
            <p className="text-[#1a1a1a]">
              Showing <span className="font-bold">{categoryFilteredArticles.length}</span> articles from {selectedYear}
              {selectedMonth !== "All" ? ` - ${selectedMonth}` : ""}
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            </p>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#162048] mb-8 text-center">Archived Articles</h2>
        
        <div className="space-y-6 mb-12">
          {categoryFilteredArticles.length > 0 ? (
            categoryFilteredArticles.map(article => (
              <div key={article.id} className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <span className="bg-[#162048] text-white font-extrabold px-3 py-1 rounded-full text-sm">
                    {article.category}
                  </span>
                  <span className="text-[#1a1a1a] font-semibold">{article.date}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#162048] mb-3">
                  {article.title}
                </h3>
                <p className="text-[#1a1a1a] mb-4">
                  {article.excerpt}
                </p>
                <a 
                  href={`/archive/${selectedYear}/${article.id}`} 
                  className="text-[#162048] font-bold hover:underline flex items-center w-fit"
                >
                  Read Article
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-12 text-center">
              <svg className="w-16 h-16 text-[#162048] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-2xl font-extrabold text-[#162048] mb-3">No Articles Found</h3>
              <p className="text-[#1a1a1a] mb-6">
                Try adjusting your filters to see more articles.
              </p>
              <button 
                onClick={() => {
                  setSelectedYear("2025");
                  setSelectedMonth("All");
                  setSelectedCategory("All");
                }}
                className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Looking for Something Specific?</h2>
          <p className="text-[#1a1a1a] mb-6 text-center">
            Use our site search to find articles by keyword or topic.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/search" 
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Site Search
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;