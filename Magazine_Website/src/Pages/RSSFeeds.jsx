import React from "react";

const RSSFeeds = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        RSS Feeds
      </h1>
      
      <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
        Subscribe to our RSS feeds to get the latest content from NEONPULSE Magazine delivered directly to your feed reader.
      </p>
      
      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
        <h2 className="text-2xl font-extrabold text-[#162048] mb-6">What is RSS?</h2>
        
        <p className="text-[#1a1a1a] mb-6">
          RSS (Really Simple Syndication) is a web feed that allows users to access updates from their favorite websites 
          in a standardized, computer-readable format. This enables you to receive automatic updates from NEONPULSE 
          Magazine without having to visit our website directly.
        </p>
        
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0 mt-1 mr-4">
            <div className="w-10 h-10 rounded-full bg-[#ffe000] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[#162048] text-lg mb-2">How to Use RSS Feeds</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#1a1a1a]">
              <li>Copy the RSS feed URL for the content you want to follow</li>
              <li>Paste the URL into your preferred RSS reader or feed aggregator</li>
              <li>Subscribe to start receiving updates automatically</li>
            </ol>
          </div>
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-[#162048] mb-8 text-center">Available RSS Feeds</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Main Feed */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#162048]">Main Feed</h3>
          </div>
          <p className="text-[#1a1a1a] mb-4">
            All articles and content from NEONPULSE Magazine in one convenient feed.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a 
              href="/rss/main.xml" 
              className="text-blue-700 underline font-semibold break-all text-sm"
            >
              https://neonpulse.com/rss/main.xml
            </a>
            <a 
              href="/rss/main.xml" 
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Subscribe
            </a>
          </div>
        </div>
        
        {/* News Feed */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#162048]">News Feed</h3>
          </div>
          <p className="text-[#1a1a1a] mb-4">
            Breaking news and important announcements from our editorial team.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a 
              href="/rss/news.xml" 
              className="text-blue-700 underline font-semibold break-all text-sm"
            >
              https://neonpulse.com/rss/news.xml
            </a>
            <a 
              href="/rss/news.xml" 
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Subscribe
            </a>
          </div>
        </div>
        
        {/* Lifestyle Feed */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#162048]">Lifestyle Feed</h3>
          </div>
          <p className="text-[#1a1a1a] mb-4">
            Articles about fashion, beauty, health, and lifestyle trends.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a 
              href="/rss/lifestyle.xml" 
              className="text-blue-700 underline font-semibold break-all text-sm"
            >
              https://neonpulse.com/rss/lifestyle.xml
            </a>
            <a 
              href="/rss/lifestyle.xml" 
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Subscribe
            </a>
          </div>
        </div>
        
        {/* Technology Feed */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-[#162048]">Technology Feed</h3>
          </div>
          <p className="text-[#1a1a1a] mb-4">
            Latest updates on tech trends, gadgets, and digital innovations.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a 
              href="/rss/technology.xml" 
              className="text-blue-700 underline font-semibold break-all text-sm"
            >
              https://neonpulse.com/rss/technology.xml
            </a>
            <a 
              href="/rss/technology.xml" 
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Subscribe
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Popular RSS Readers</h2>
        <p className="text-[#1a1a1a] mb-6 text-center">
          If you don't have an RSS reader yet, here are some popular options:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a 
            href="https://feedly.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#2bb24c] text-white font-extrabold px-4 py-3 rounded-full hover:bg-green-600 transition-colors text-center"
          >
            Feedly
          </a>
          <a 
            href="https://www.inoreader.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#0099df] text-white font-extrabold px-4 py-3 rounded-full hover:bg-blue-600 transition-colors text-center"
          >
            Inoreader
          </a>
          <a 
            href="https://theoldreader.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#f60] text-white font-extrabold px-4 py-3 rounded-full hover:bg-orange-600 transition-colors text-center"
          >
            The Old Reader
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default RSSFeeds;