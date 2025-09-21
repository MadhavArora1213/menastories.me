import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  const footerSections = {
    'ABOUT': [
      { name: 'About Us', path: '/about' },
      { name: 'Our Team', path: '/our-team' },
      { name: 'Mission & Vision', path: '/mission-vision' },
      { name: 'Editorial Guidelines', path: '/editorial-guidelines' },
      { name: 'Awards & Recognition', path: '/awards' },
      { name: 'Careers', path: '/careers' },
      { name: 'Advertise With Us', path: '/advertise' }
    ],
    'CONTACT & SUPPORT': [
      { name: 'Contact Us Form', path: '/contact' },
      { name: 'Editorial Contact', path: '/editorial-contact' },
      { name: 'Advertising Enquiries', path: '/advertising' },
      { name: 'Technical Support', path: '/support' },
      { name: 'Office Locations', path: '/locations' },
      { name: 'Social Media Links', path: '/social-media' }
    ],
    'LEGAL': [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Correction Policy', path: '/correction-policy' },
      { name: 'Editorial Standards', path: '/editorial-standards' },
      { name: 'Copyright Information', path: '/copyright' },
      { name: 'Disclaimer', path: '/disclaimer' }
    ],
    'RESOURCES': [
      { name: 'Media Kit', path: '/media-kit' },
      { name: 'Press Releases', path: '/press' },
      { name: 'RSS Feeds', path: '/rss' },
      { name: 'Archive', path: '/archive' },
      { name: 'Site Search', path: '/search' },
      { name: 'Newsletter Archive', path: '/newsletter-archive' }
    ]
  };

  return (
    <>
      <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Footer Links */}
            {Object.entries(footerSections).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-white font-bold text-lg uppercase tracking-wider border-b border-blue-500/30 pb-3 mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-300 hover:text-blue-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block group"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contribute Section */}
          <div className="border-t border-gray-700/50 mt-12 pt-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
                  JOIN OUR TEAM
                </h3>
                <p className="text-gray-400 text-lg">
                  Share your voice and contribute to our growing community of writers and publishers
                </p>
              </div>
              <div className="flex justify-center items-center">
                <button
                  onClick={() => window.location.href = '/become-writer'}
                  className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-3 min-w-[280px]"
                >
                  <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Become a Writer</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </div>
              <div className="mt-6 text-gray-400 text-sm">
                Join thousands of contributors shaping the future of journalism
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 border-t border-gray-800/50 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-gray-400 text-sm text-center md:text-left">
                <p className="font-semibold text-white mb-1">© 2025 NEONPULSE Magazine. All rights reserved.</p>
                <p>© 2025 Echo Magazine. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm font-medium">Follow us</span>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-bold">f</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-bold">t</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-bold">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <span className="text-sm font-bold">▶</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
};

export default Footer;