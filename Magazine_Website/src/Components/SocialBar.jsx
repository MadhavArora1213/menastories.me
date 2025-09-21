import React from 'react';

const SocialBar = () => (
  <div className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
      <div className="text-sm text-gray-600">Follow us</div>
      <div className="flex gap-3">
        <a href="#" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">f</a>
        <a href="#" className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center">t</a>
        <a href="#" className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center">in</a>
        <a href="#" className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center">▶</a>
      </div>
    </div>
  </div>
);

export default SocialBar;

