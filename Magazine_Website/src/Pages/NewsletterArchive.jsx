import React, { useState } from "react";

const NewsletterArchive = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sample newsletter data
  const newsletterData = {
    "2025": {
      "All": [
        { id: 1, title: "Weekly Digest - August 10, 2025", date: "August 10, 2025", category: "Weekly", excerpt: "This week's top stories in fashion, technology, and lifestyle." },
        { id: 2, title: "Editor's Choice - August 5, 2025", date: "August 5, 2025", category: "Editorial", excerpt: "Handpicked articles and insights from our editorial team." },
        { id: 3, title: "Industry Insights - July 28, 2025", date: "July 28, 2025", category: "Business", excerpt: "In-depth analysis of market trends and business developments." },
        { id: 4, title: "Lifestyle Weekly - July 22, 2025", date: "July 22, 2025", category: "Lifestyle", excerpt: "Weekly roundup of lifestyle tips, trends, and inspiration." },
        { id: 5, title: "Tech Trends - July 15, 2025", date: "July 15, 2025", category: "Technology", excerpt: "Latest developments in technology and digital innovation." },
        { id: 6, title: "Weekly Digest - July 8, 2025", date: "July 8, 2025", category: "Weekly", excerpt: "Your weekly dose of the most important stories." },
        { id: 7, title: "Culture Corner - June 30, 2025", date: "June 30, 2025", category: "Culture", excerpt: "Exploring arts, entertainment, and cultural events." },
        { id: 8, title: "Wellness Weekly - June 22, 2025", date: "June 22, 2025", category: "Lifestyle", excerpt: "Health and wellness tips for a balanced lifestyle." },
      ],
      "Weekly": [
        { id: 1, title: "Weekly Digest - August 10, 2025", date: "August 10, 2025", category: "Weekly", excerpt: "This week's top stories in fashion, technology, and lifestyle." },
        { id: 6, title: "Weekly Digest - July 8, 2025", date: "July 8, 2025", category: "Weekly", excerpt: "Your weekly dose of the most important stories." },
      ],
      "Editorial": [
        { id: 2, title: "Editor's Choice - August 5, 2025", date: "August 5, 2025", category: "Editorial", excerpt: "Handpicked articles and insights from our editorial team." },
      ],
      "Business": [
        { id: 3, title: "Industry Insights - July 28, 2025", date: "July 28, 2025", category: "Business", excerpt: "In-depth analysis of market trends and business developments." },
      ],
      "Lifestyle": [
        { id: 4, title: "Lifestyle Weekly - July 22, 2025", date: "July 22, 2025", category: "Lifestyle", excerpt: "Weekly roundup of lifestyle tips, trends, and inspiration." },
        { id: 8, title: "Wellness Weekly - June 22, 2025", date: "June 22, 2025", category: "Lifestyle", excerpt: "Health and wellness tips for a balanced lifestyle." },
      ],
      "Technology": [
        { id: 5, title: "Tech Trends - July 15, 2025", date: "July 15, 2025", category: "Technology", excerpt: "Latest developments in technology and digital innovation." },
      ],
      "Culture": [
        { id: 7, title: "Culture Corner - June 30, 2025", date: "June 30, 2025", category: "Culture", excerpt: "Exploring arts, entertainment, and cultural events." },
      ]
    },
    "2024": {
      "All": [
        { id: 9, title: "Year-End Review - December 30, 2024", date: "December 30, 2024", category: "Editorial", excerpt: "Looking back at the most significant stories of 2024." },
        { id: 10, title: "Holiday Special - December 15, 2024", date: "December 15, 2024", category: "Lifestyle", excerpt: "Holiday gift guides and seasonal lifestyle tips." },
        { id: 11, title: "Tech Wrap-Up - December 5, 2024", date: "December 5, 2024", category: "Technology", excerpt: "Recap of the year's biggest tech developments." },
        { id: 12, title: "Business Insights - November 22, 2024", date: "November 22, 2024", category: "Business", excerpt: "Analysis of economic trends and market shifts." },
        { id: 13, title: "Cultural Highlights - November 10, 2024", date: "November 10, 2024", category: "Culture", excerpt: "Notable cultural events and artistic achievements." },
        { id: 14, title: "Wellness Monthly - October 28, 2024", date: "October 28, 2024", category: "Lifestyle", excerpt: "Monthly wellness trends and health advice." },
        { id: 15, title: "Innovation Watch - October 15, 2024", date: "October 15, 2024", category: "Technology", excerpt: "Spotlight on emerging technologies and startups." },
        { id: 16, title: "Weekly Digest - October 5, 2024", date: "October 5, 2024", category: "Weekly", excerpt: "Weekly summary of essential stories and updates." },
      ]
    },
    "2023": {
      "All": [
        { id: 17, title: "Annual Review - December 28, 2023", date: "December 28, 2023", category: "Editorial", excerpt: "Comprehensive review of the year's most impactful stories." },
        { id: 18, title: "Holiday Newsletter - December 12, 2023", date: "December 12, 2023", category: "Lifestyle", excerpt: "Festive lifestyle content and gift recommendations." },
        { id: 19, title: "Tech Year in Review - November 20, 2023", date: "November 20, 2023", category: "Technology", excerpt: "Major tech milestones and breakthroughs of the year." },
        { id: 20, title: "Business Outlook - November 5, 2023", date: "November 5, 2023", category: "Business", excerpt: "Forecasting business trends for the coming year." },
        { id: 21, title: "Creative Spotlight - October 18, 2023", date: "October 18, 2023", category: "Culture", excerpt: "Celebrating creativity and artistic achievements." },
        { id: 22, title: "Wellness Guide - October 3, 2023", date: "October 3, 2023", category: "Lifestyle", excerpt: "Comprehensive wellness advice and lifestyle tips." },
        { id: 23, title: "Innovation Monthly - September 22, 2023", date: "September 22, 2023", category: "Technology", excerpt: "Monthly update on technological innovations and trends." },
        { id: 24, title: "Weekly Wrap-Up - September 10, 2023", date: "September 10, 2023", category: "Weekly", excerpt: "Weekly compilation of key stories and developments." },
      ]
    }
  };

  const years = Object.keys(newsletterData);
  const categories = ["All", "Weekly", "Editorial", "Business", "Lifestyle", "Technology", "Culture"];

  // Get filtered newsletters
  const filteredNewsletters = selectedCategory === "All" 
    ? newsletterData[selectedYear]?.All || [] 
    : newsletterData[selectedYear]?.[selectedCategory] || [];

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
          Newsletter Archive
        </h1>
        
        <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
          Browse our collection of past newsletters, organized by year and category.
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Filter Archive</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              Showing <span className="font-bold">{filteredNewsletters.length}</span> newsletters from {selectedYear}
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            </p>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#162048] mb-8 text-center">Archived Newsletters</h2>
        
        <div className="space-y-6 mb-12">
          {filteredNewsletters.length > 0 ? (
            filteredNewsletters.map(newsletter => (
              <div key={newsletter.id} className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <span className="bg-[#162048] text-white font-extrabold px-3 py-1 rounded-full text-sm">
                    {newsletter.category}
                  </span>
                  <span className="text-[#1a1a1a] font-semibold">{newsletter.date}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#162048] mb-3">
                  {newsletter.title}
                </h3>
                <p className="text-[#1a1a1a] mb-4">
                  {newsletter.excerpt}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href={`/newsletter/${selectedYear}/${newsletter.id}`} 
                    className="text-[#162048] font-bold hover:underline flex items-center"
                  >
                    Read Newsletter
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                  <a 
                    href={`/downloads/newsletter-${selectedYear}-${newsletter.id}.pdf`} 
                    download
                    className="text-[#162048] font-bold hover:underline flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-12 text-center">
              <svg className="w-16 h-16 text-[#162048] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-2xl font-extrabold text-[#162048] mb-3">No Newsletters Found</h3>
              <p className="text-[#1a1a1a] mb-6">
                Try adjusting your filters to see more newsletters.
              </p>
              <button 
                onClick={() => {
                  setSelectedYear("2025");
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
          <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Never Miss an Issue</h2>
          <p className="text-[#1a1a1a] mb-6 text-center">
            Subscribe to our newsletter to receive the latest issues directly in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your Email"
              className="flex-1 px-4 py-3 rounded-full border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              required
            />
            <button
              type="submit"
              className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterArchive;