import React from "react";

const benefits = [
  "Reach a highly engaged, diverse audience",
  "Custom advertising solutions for your brand",
  "Sponsored content, banners, and newsletter placements",
  "Performance tracking and detailed analytics",
  "Collaborate with our creative team"
];

const AdvertiseWithUs = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-[#ffe000]/10 to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4">
      <h1 className="text-6xl font-extrabold text-[#162048] mb-6 text-center tracking-wide drop-shadow-lg neon-title">
        Advertise With Us
      </h1>
      <p className="max-w-2xl mx-auto text-xl text-[#162048] text-center mb-10 font-semibold">
        Connect your brand with Gen Z and Millennial readers. <span className="bg-[#ffe000] px-2 py-1 rounded-full font-bold text-[#162048]">Stand out</span> with creative, interactive, and data-driven campaigns.
      </p>
      <div className="flex flex-col md:flex-row gap-10 mb-16 items-center justify-center">
        <div className="md:w-1/2 bg-white rounded-3xl shadow-2xl border-4 border-[#162048] p-10 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-3xl font-extrabold text-[#162048] mb-6">Why Choose Us?</h2>
          <ul className="space-y-6">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-4 text-[#1a1a1a] text-lg font-semibold">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#ffe000] text-[#162048] font-extrabold rounded-full shadow text-2xl border-2 border-[#162048]">
                  {idx + 1}
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-4 left-4 text-xs text-[#162048]/50 font-bold">GenZ Ready</div>
        </div>
        <div className="md:w-1/2 flex items-center justify-center">
          <div className="relative w-full max-w-xs flex flex-col items-center">
            <img
              src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
              alt="Advertise with us"
              className="rounded-2xl shadow-2xl w-full h-56 object-cover border-4 border-[#ffe000] neon-img"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#ffe000] text-[#162048] px-6 py-2 rounded-full font-extrabold shadow-lg text-center text-lg border-2 border-[#162048] animate-bounce">
              Let's Collab!
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-[#162048] p-10 mt-8 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
        <h2 className="text-2xl font-extrabold text-[#162048] mb-4 text-center">Get In Touch</h2>
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            className="px-4 py-3 rounded-xl border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="px-4 py-3 rounded-xl border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
            required
          />
          <textarea
            placeholder="Tell us about your advertising needs..."
            className="px-4 py-3 rounded-xl border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
          >
            🚀 Send Inquiry
          </button>
        </form>
        <p className="text-center text-[#162048] mt-4 font-semibold">
          Or email us directly at <a href="mailto:ads@neonpulse.com" className="underline text-blue-700">ads@neonpulse.com</a>
        </p>
      </div>
    </div>
    <style>
      {`
        .neon-title {
          text-shadow: 0 2px 16px #ffe000, 0 1px 0 #162048;
        }
        .neon-img {
          box-shadow: 0 0 24px #ffe00088, 0 2px 8px #16204844;
        }
        @media (max-width: 768px) {
          .neon-title { font-size: 2rem !important; }
        }
      `}
    </style>
  </div>
);

export default AdvertiseWithUs;