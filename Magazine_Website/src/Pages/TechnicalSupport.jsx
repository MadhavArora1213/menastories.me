import React from "react";

const TechnicalSupport = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Technical Support
      </h1>
      
      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-8">
        <p className="text-lg text-[#162048] mb-6 font-semibold">
          Having trouble with our website or digital services? Our technical team is here to help you resolve any issues quickly.
        </p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#162048] mb-4">Common Issues & Solutions</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">1</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Website not loading:</span> Try clearing your browser cache or using a different browser.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">2</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Newsletter not receiving:</span> Check your spam folder and ensure you've confirmed your subscription.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#ffe000] text-[#162048] font-extrabold rounded-full mr-3 mt-1">3</span>
              <span className="text-[#1a1a1a]"><span className="font-bold">Video not playing:</span> Ensure you have the latest version of your browser and have enabled cookies.</span>
            </li>
          </ul>
        </div>
        
        <div className="border-t-2 border-[#162048]/20 pt-6">
          <h2 className="text-2xl font-bold text-[#162048] mb-4">Contact Our Support Team</h2>
          <p className="text-[#1a1a1a] mb-4">
            If you're still experiencing issues, please reach out to our technical support team:
          </p>
          <ul className="mb-6 space-y-2">
            <li>
              <span className="font-bold text-[#162048]">Email:</span>{" "}
              <a href="mailto:support@neonpulse.com" className="underline text-blue-700">support@neonpulse.com</a>
            </li>
            <li>
              <span className="font-bold text-[#162048]">Phone:</span>{" "}
              <a href="tel:+1234567891" className="underline text-blue-700">+1 234 567 891</a>
            </li>
            <li>
              <span className="font-bold text-[#162048]">Hours:</span>{" "}
              <span className="text-[#1a1a1a]">Monday-Friday, 9:00 AM - 6:00 PM EST</span>
            </li>
          </ul>
        </div>
      </div>
      
      <form className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-[#162048] mb-2">Submit a Support Request</h2>
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
        <input
          type="text"
          placeholder="Subject"
          className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
          required
        />
        <textarea
          placeholder="Describe your technical issue..."
          className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
          rows={5}
          required
        />
        <button
          type="submit"
          className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
        >
          Submit Request
        </button>
      </form>
    </div>
  </div>
);

export default TechnicalSupport;