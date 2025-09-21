import React from "react";

const PressReleases = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Press Releases
      </h1>
      
      <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
        Stay up to date with the latest news and announcements from NEONPULSE Magazine.
      </p>
      
      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
        <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Media Contact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="border-2 border-[#162048] rounded-xl p-6">
            <h3 className="font-bold text-[#162048] text-lg mb-4">Press Inquiries</h3>
            <p className="text-[#1a1a1a] mb-4">
              For media requests, interview arrangements, and press kit information:
            </p>
            <ul className="space-y-2">
              <li>
                <span className="font-bold text-[#162048]">Email:</span>{" "}
                <a href="mailto:press@neonpulse.com" className="underline text-blue-700">press@neonpulse.com</a>
              </li>
              <li>
                <span className="font-bold text-[#162048]">Phone:</span>{" "}
                <a href="tel:+1234567892" className="underline text-blue-700">+1 234 567 892</a>
              </li>
            </ul>
          </div>
          
          <div className="border-2 border-[#162048] rounded-xl p-6">
            <h3 className="font-bold text-[#162048] text-lg mb-4">Press Kit</h3>
            <p className="text-[#1a1a1a] mb-4">
              Download our complete press kit with brand assets, executive bios, and company information.
            </p>
            <a 
              href="/downloads/neonpulse-press-kit.zip" 
              download
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center w-fit"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Press Kit
            </a>
          </div>
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-[#162048] mb-8 text-center">Latest Press Releases</h2>
      
      <div className="space-y-8 mb-12">
        {/* Press Release 1 */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="bg-[#ffe000] text-[#162048] font-extrabold px-3 py-1 rounded-full text-sm">
              Announcement
            </span>
            <span className="text-[#1a1a1a] font-semibold">August 10, 2025</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#162048] mb-3">
            NEONPULSE Magazine Announces Partnership with Leading Tech Innovators
          </h3>
          <p className="text-[#1a1a1a] mb-4">
            New collaboration will bring cutting-edge technology insights to our readers through exclusive content and expert interviews.
          </p>
          <a 
            href="/press/2025/08/neonpulse-tech-partnership" 
            className="text-[#162048] font-bold hover:underline flex items-center"
          >
            Read Full Release
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
        
        {/* Press Release 2 */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="bg-[#162048] text-white font-extrabold px-3 py-1 rounded-full text-sm">
              Editorial
            </span>
            <span className="text-[#1a1a1a] font-semibold">July 28, 2025</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#162048] mb-3">
            NEONPULSE Magazine Expands Editorial Team with Industry Veterans
          </h3>
          <p className="text-[#1a1a1a] mb-4">
            Three new senior editors join our team, bringing decades of experience in lifestyle, technology, and business journalism.
          </p>
          <a 
            href="/press/2025/07/neonpulse-editorial-expansion" 
            className="text-[#162048] font-bold hover:underline flex items-center"
          >
            Read Full Release
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
        
        {/* Press Release 3 */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="bg-[#ffe000] text-[#162048] font-extrabold px-3 py-1 rounded-full text-sm">
              Awards
            </span>
            <span className="text-[#1a1a1a] font-semibold">July 15, 2025</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#162048] mb-3">
            NEONPULSE Magazine Wins Three Prestigious Media Awards
          </h3>
          <p className="text-[#1a1a1a] mb-4">
            Recognition for excellence in digital journalism, design innovation, and audience engagement at the 2025 Media Excellence Awards.
          </p>
          <a 
            href="/press/2025/07/neonpulse-awards-winner" 
            className="text-[#162048] font-bold hover:underline flex items-center"
          >
            Read Full Release
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
        
        {/* Press Release 4 */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 hover:shadow-xl transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="bg-[#162048] text-white font-extrabold px-3 py-1 rounded-full text-sm">
              Editorial
            </span>
            <span className="text-[#1a1a1a] font-semibold">June 30, 2025</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#162048] mb-3">
            NEONPULSE Magazine Launches New Sustainability Initiative
          </h3>
          <p className="text-[#1a1a1a] mb-4">
            Commitment to carbon-neutral operations and sustainable content creation practices starting July 2025.
          </p>
          <a 
            href="/press/2025/06/neonpulse-sustainability-initiative" 
            className="text-[#162048] font-bold hover:underline flex items-center"
          >
            Read Full Release
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Subscribe to Press Releases</h2>
        <p className="text-[#1a1a1a] mb-6 text-center">
          Get our press releases delivered directly to your inbox.
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

export default PressReleases;