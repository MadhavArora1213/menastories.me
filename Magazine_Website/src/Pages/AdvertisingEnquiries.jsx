import React from "react";

const AdvertisingEnquiries = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Advertising Enquiries
      </h1>
      
      <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
        Have questions about advertising with us? Get in touch with our advertising team for detailed information about our packages, rates, and opportunities.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Advertising Information */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Advertising Options</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">1</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Display Advertising:</span> Banner ads across our digital platforms</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">2</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Sponsored Content:</span> Branded articles and native advertising</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">3</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Newsletter Ads:</span> Reach our engaged subscriber base</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">4</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Event Sponsorships:</span> Brand visibility at our events</span>
            </li>
          </ul>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Download Our Media Kit</h3>
            <p className="text-[#1a1a1a] mb-4">
              Get detailed information about our audience demographics, advertising rates, and brand guidelines.
            </p>
            <a 
              href="/downloads/neonpulse-media-kit.pdf" 
              download
              className="bg-[#162048] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[#0f183a] transition-colors border border-[#162048] text-sm flex items-center w-fit"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Media Kit
            </a>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Contact Our Team</h2>
          
          <div className="space-y-6 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <div>
                <p className="font-bold text-[#162048]">Phone</p>
                <p className="text-[#1a1a1a]">
                  <a href="tel:+1234567893" className="underline text-blue-700">+1 234 567 893</a>
                </p>
              </div>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p className="font-bold text-[#162048]">Email</p>
                <p className="text-[#1a1a1a]">
                  <a href="mailto:advertising@neonpulse.com" className="underline text-blue-700">advertising@neonpulse.com</a>
                </p>
              </div>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p className="font-bold text-[#162048]">Office Hours</p>
                <p className="text-[#1a1a1a]">
                  Monday-Friday: 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Quick Response</h3>
            <p className="text-[#1a1a1a]">
              We typically respond to advertising enquiries within 1 business day.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Send Us Your Enquiry</h2>
        <p className="text-[#1a1a1a] mb-6 text-center">
          Fill out the form below and our advertising team will get back to you shortly.
        </p>
        <form className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="Your Name"
              className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Company Name"
            className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
            required
          />
          <input
            type="text"
            placeholder="Advertising Budget (Optional)"
            className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
          />
          <textarea
            placeholder="Tell us about your advertising needs..."
            className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
            rows={5}
            required
          />
          <button
            type="submit"
            className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
          >
            Send Enquiry
          </button>
        </form>
      </div>
    </div>
  </div>
);

export default AdvertisingEnquiries;