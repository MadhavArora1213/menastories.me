import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const base = import.meta?.env?.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      if (!res.ok) throw new Error('Subscribe failed');
      setStatus('Subscribed!');
      setEmail(''); setPhone('');
    } catch (e) {
      setStatus('Please try again later');
    }
  };

  return (
    <section className="bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Stay Updated</h2>
          <p className="text-sm sm:text-base text-gray-600">Subscribe via Email or WhatsApp for the latest news and updates.</p>
        </div>
        <form onSubmit={submit} className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              type="tel"
              placeholder="WhatsApp number"
              className="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors font-medium sm:col-span-1"
            >
              Subscribe
            </button>
          </div>
        </form>
        {status && (
          <div className={`text-center text-sm mt-4 ${status.includes('Subscribed') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterSignup;

