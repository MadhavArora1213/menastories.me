import React from "react";

const EditorialContact = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4 max-w-xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
        Editorial Contact
      </h1>
      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-6">
        <p className="text-lg text-[#162048] mb-4 font-semibold">
          For editorial inquiries, submissions, or feedback, please reach out to our editorial team.
        </p>
        <ul className="mb-4 space-y-2">
          <li>
            <span className="font-bold text-[#162048]">Email:</span>{" "}
            <a href="mailto:editor@neonpulse.com" className="underline text-blue-700">editor@neonpulse.com</a>
          </li>
          <li>
            <span className="font-bold text-[#162048]">Phone:</span>{" "}
            <a href="tel:+1234567890" className="underline text-blue-700">+1 234 567 890</a>
          </li>
        </ul>
        <p className="text-base text-[#1a1a1a]">
          You can also use the form below for editorial messages.
        </p>
      </div>
      <form className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-6 flex flex-col gap-5">
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
        <textarea
          placeholder="Editorial Message"
          className="px-4 py-3 rounded-lg border-2 border-[#162048] focus:outline-none focus:border-[#ffe000] font-semibold"
          rows={4}
          required
        />
        <button
          type="submit"
          className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg"
        >
          Send to Editorial Team
        </button>
      </form>
    </div>
  </div>
);

export default EditorialContact;