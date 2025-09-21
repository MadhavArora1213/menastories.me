import React from "react";

const SocialMediaLinks = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Connect With Us
      </h1>
      
      <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
        Follow us across our social media platforms for the latest updates, behind-the-scenes content, and exclusive stories.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Instagram */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">Instagram</h2>
            <p className="text-[#1a1a1a] mb-4">
              Visual stories, behind-the-scenes content, and lifestyle inspiration.
            </p>
            <a 
              href="https://instagram.com/neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Follow @neonpulse
            </a>
          </div>
        </div>
        
        {/* Facebook */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#1877f2] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">Facebook</h2>
            <p className="text-[#1a1a1a] mb-4">
              Community discussions, event announcements, and daily updates.
            </p>
            <a 
              href="https://facebook.com/neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#1877f2] text-white font-extrabold px-6 py-3 rounded-full hover:bg-blue-600 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Like Our Page
            </a>
          </div>
        </div>
        
        {/* Twitter */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">Twitter</h2>
            <p className="text-[#1a1a1a] mb-4">
              Breaking news, quick updates, and real-time conversations.
            </p>
            <a 
              href="https://twitter.com/neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black text-white font-extrabold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Follow @neonpulse
            </a>
          </div>
        </div>
        
        {/* LinkedIn */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#0077b5] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">LinkedIn</h2>
            <p className="text-[#1a1a1a] mb-4">
              Professional insights, industry news, and career opportunities.
            </p>
            <a 
              href="https://linkedin.com/company/neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#0077b5] text-white font-extrabold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Connect With Us
            </a>
          </div>
        </div>
        
        {/* YouTube */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#ff0000] flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">YouTube</h2>
            <p className="text-[#1a1a1a] mb-4">
              Video interviews, documentaries, and exclusive behind-the-scenes content.
            </p>
            <a 
              href="https://youtube.com/neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#ff0000] text-white font-extrabold px-6 py-3 rounded-full hover:bg-red-700 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Subscribe Now
            </a>
          </div>
        </div>
        
        {/* TikTok */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden transform transition-transform hover:scale-105">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048] mb-3">TikTok</h2>
            <p className="text-[#1a1a1a] mb-4">
              Short-form videos, trending content, and quick lifestyle tips.
            </p>
            <a 
              href="https://tiktok.com/@neonpulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black text-white font-extrabold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors border-2 border-[#162048] shadow-lg w-full max-w-xs"
            >
              Follow @neonpulse
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Stay Connected</h2>
        <p className="text-[#1a1a1a] mb-6 text-center">
          For media inquiries and partnership opportunities on our social platforms, please contact our social media team.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="mailto:social@neonpulse.com" className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg text-center">
            Email Social Team
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default SocialMediaLinks;