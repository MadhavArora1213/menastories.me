import React from "react";

const OfficeLocations = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Our Office Locations
      </h1>
      
      <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
        Visit our offices or get in touch with our teams across different locations around the world.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* New York Office */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center text-white font-bold text-xl mr-4">
              NY
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048]">New York</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Address:</span> 123 Media Avenue, Suite 1000<br />
                New York, NY 10001, USA
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Phone:</span> +1 212 555 1234
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Hours:</span> Mon-Fri 9:00 AM - 6:00 PM EST
              </p>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Departments:</h3>
            <ul className="flex flex-wrap gap-2">
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Editorial</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Sales</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Marketing</li>
            </ul>
          </div>
        </div>
        
        {/* London Office */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center text-white font-bold text-xl mr-4">
              LD
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048]">London</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Address:</span> 456 Creative Street, Floor 5<br />
                London EC2A 456, UK
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Phone:</span> +44 20 7123 4567
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Hours:</span> Mon-Fri 9:00 AM - 5:30 PM GMT
              </p>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Departments:</h3>
            <ul className="flex flex-wrap gap-2">
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">International</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Editorial</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Design</li>
            </ul>
          </div>
        </div>
        
        {/* Dubai Office */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center text-white font-bold text-xl mr-4">
              DB
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048]">Dubai</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Address:</span> 789 Innovation Boulevard<br />
                Dubai Media City, UAE
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Phone:</span> +971 4 123 4567
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Hours:</span> Sun-Thu 8:00 AM - 5:00 PM GST
              </p>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Departments:</h3>
            <ul className="flex flex-wrap gap-2">
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Regional</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Business</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Events</li>
            </ul>
          </div>
        </div>
        
        {/* Los Angeles Office */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center text-white font-bold text-xl mr-4">
              LA
            </div>
            <h2 className="text-2xl font-extrabold text-[#162048]">Los Angeles</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Address:</span> 321 Entertainment Plaza, Suite 200<br />
                Los Angeles, CA 90028, USA
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Phone:</span> +1 310 555 9876
              </p>
            </div>
            
            <div className="flex">
              <svg className="w-6 h-6 text-[#162048] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-[#1a1a1a]">
                <span className="font-bold">Hours:</span> Mon-Fri 9:00 AM - 6:00 PM PST
              </p>
            </div>
          </div>
          
          <div className="border-t-2 border-[#162048]/20 pt-4">
            <h3 className="font-bold text-[#162048] mb-2">Departments:</h3>
            <ul className="flex flex-wrap gap-2">
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Entertainment</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Lifestyle</li>
              <li className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Digital</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Virtual Office Hours</h2>
        <p className="text-[#1a1a1a] mb-4 text-center">
          Can't visit our offices? Connect with our teams during virtual office hours.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <a href="mailto:info@neonpulse.com" className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg text-center">
            Email Us
          </a>
          <a href="tel:+18005551234" className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center">
            Call Us
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default OfficeLocations;