import React, { useState } from "react";

const SiteSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Sample search data
  const sampleData = [
    { id: 1, title: "The Future of Sustainable Fashion", date: "August 10, 2025", category: "Lifestyle", excerpt: "Exploring how the fashion industry is embracing eco-friendly practices and sustainable materials for a better tomorrow." },
    { id: 2, title: "Tech Innovations Changing Our Daily Lives", date: "August 5, 2025", category: "Technology", excerpt: "How recent technological advances are reshaping our everyday experiences and making life more convenient." },
    { id: 3, title: "Rising Stars in the Art World", date: "July 28, 2025", category: "Culture", excerpt: "Meet the emerging artists making waves in galleries worldwide with their innovative approaches and unique perspectives." },
    { id: 4, title: "The Business of Social Media Influencers", date: "July 22, 2025", category: "Business", excerpt: "An inside look at the economics behind influencer marketing and how brands are leveraging social media personalities." },
    { id: 5, title: "Healthy Habits for Busy Professionals", date: "July 15, 2025", category: "Lifestyle", excerpt: "Simple wellness practices that fit into demanding schedules and help maintain work-life balance." },
    { id: 6, title: "Revolutionary Startups to Watch", date: "July 8, 2025", category: "Business", excerpt: "Innovative companies poised to disrupt their industries with groundbreaking solutions and fresh approaches to traditional problems." },
    { id: 7, title: "The Evolution of Digital Entertainment", date: "June 30, 2025", category: "Entertainment", excerpt: "How streaming platforms are changing the entertainment landscape and what it means for content creators and consumers." },
    { id: 8, title: "Urban Gardening: Green Spaces in the City", date: "June 22, 2025", category: "Lifestyle", excerpt: "Creative solutions for bringing nature into urban environments and making city living more sustainable and enjoyable." },
    { id: 9, title: "New Year, New Trends", date: "January 15, 2025", category: "Lifestyle", excerpt: "The top trends to watch in the new year across fashion, technology, and lifestyle sectors." },
    { id: 10, title: "Winter Wellness Tips", date: "February 10, 2025", category: "Lifestyle", excerpt: "Staying healthy and energized during the colder months with these essential wellness practices." },
    { id: 11, title: "Spring Fashion Preview", date: "March 20, 2025", category: "Lifestyle", excerpt: "What to expect from the upcoming spring fashion season and how to prepare your wardrobe." },
    { id: 12, title: "Earth Day Sustainability Features", date: "April 22, 2025", category: "Lifestyle", excerpt: "Special coverage on environmental initiatives and sustainable living practices for a greener future." },
    { id: 13, title: "Mother's Day Gift Guide", date: "May 10, 2025", category: "Lifestyle", excerpt: "Thoughtful gift ideas for the special mothers in your life that go beyond traditional presents." },
    { id: 14, title: "Year in Review: Top Stories of 2024", date: "December 30, 2024", category: "Editorial", excerpt: "Looking back at the most impactful stories from the past year that shaped our world and culture." },
    { id: 15, title: "Holiday Gift Guide for Tech Enthusiasts", date: "December 15, 2024", category: "Technology", excerpt: "The best gadgets and tech gifts for the holiday season that will delight any tech-savvy person." },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate search delay
    setTimeout(() => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
      } else {
        // Simple search implementation - in a real app, this would be an API call
        const results = sampleData.filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
          Site Search
        </h1>
        
        <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
          Find articles, news, and features across our entire publication.
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Search Our Content</h2>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter keywords, topics, or categories..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-lg hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg flex items-center justify-center"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-[#162048] font-bold">Popular searches:</span>
            <button 
              onClick={() => setSearchTerm("fashion")}
              className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold hover:bg-[#ffe000]"
            >
              Fashion
            </button>
            <button 
              onClick={() => setSearchTerm("technology")}
              className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold hover:bg-[#ffe000]"
            >
              Technology
            </button>
            <button 
              onClick={() => setSearchTerm("business")}
              className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold hover:bg-[#ffe000]"
            >
              Business
            </button>
            <button 
              onClick={() => setSearchTerm("lifestyle")}
              className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold hover:bg-[#ffe000]"
            >
              Lifestyle
            </button>
          </div>
        </div>
        
        {hasSearched && (
          <div>
            <h2 className="text-3xl font-extrabold text-[#162048] mb-8 text-center">
              Search Results {searchTerm && `for "${searchTerm}"`}
            </h2>
            
            {isSearching ? (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-12 text-center">
                <svg className="animate-spin w-16 h-16 text-[#162048] mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="text-2xl font-extrabold text-[#162048] mb-3">Searching...</h3>
                <p className="text-[#1a1a1a]">
                  Looking for articles that match your search terms.
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-6 mb-12">
                <p className="text-[#162048] text-center mb-4">
                  Found <span className="font-bold">{searchResults.length}</span> results
                </p>
                {searchResults.map(result => (
                  <div key={result.id} className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <span className="bg-[#162048] text-white font-extrabold px-3 py-1 rounded-full text-sm">
                        {result.category}
                      </span>
                      <span className="text-[#1a1a1a] font-semibold">{result.date}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#162048] mb-3">
                      {result.title}
                    </h3>
                    <p className="text-[#1a1a1a] mb-4">
                      {result.excerpt}
                    </p>
                    <a 
                      href={`/article/${result.id}`} 
                      className="text-[#162048] font-bold hover:underline flex items-center w-fit"
                    >
                      Read Article
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-12 text-center">
                <svg className="w-16 h-16 text-[#162048] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-2xl font-extrabold text-[#162048] mb-3">No Results Found</h3>
                <p className="text-[#1a1a1a] mb-6">
                  We couldn't find any articles matching your search for "{searchTerm}".
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
                  >
                    Clear Search
                  </button>
                  <a 
                    href="/archive" 
                    className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center"
                  >
                    Browse Archive
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!hasSearched && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-12 text-center">
            <svg className="w-16 h-16 text-[#162048] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3 className="text-2xl font-extrabold text-[#162048] mb-3">Search Our Publication</h3>
            <p className="text-[#1a1a1a] mb-6">
              Enter keywords, topics, or categories in the search box above to find articles across our entire archive.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center text-sm text-[#162048] mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Search tips: Try using specific terms like "sustainable fashion" or "tech innovations"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSearch;