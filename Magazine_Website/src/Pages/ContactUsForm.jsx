import React from "react";

const ContactUsForm = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Contact Us
      </h1>
      <form className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 flex flex-col gap-6">
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
        />
        <textarea
          placeholder="Your Message"
          className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
          rows={5}
          required
        />
        <button
          type="submit"
          className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
        >
          Send Message
        </button>
      </form>
      <p className="text-center text-[#162048] mt-6 font-semibold">
        Or email us at <a href="mailto:info@neonpulse.com" className="underline text-blue-700">info@neonpulse.com</a>
      </p>
    </div>
  </div>
);

export default ContactUsForm;