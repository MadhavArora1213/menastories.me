import React from "react";

const jobs = [
  {
    title: "Staff Writer",
    location: "Remote / Onsite",
    type: "Full-Time",
    description: "Create engaging stories and features for our readers. Strong writing and research skills required.",
    apply: "#"
  },
  {
    title: "Social Media Manager",
    location: "Remote",
    type: "Part-Time",
    description: "Grow our audience and engage with our community across all major platforms.",
    apply: "#"
  },
  {
    title: "Graphic Designer",
    location: "Onsite",
    type: "Contract",
    description: "Design visuals for articles, campaigns, and magazine layouts. Proficiency in Adobe Creative Suite required.",
    apply: "#"
  }
];

const perks = [
  "Flexible work options",
  "Creative, collaborative team",
  "Growth & learning opportunities",
  "Competitive compensation",
  "Inclusive culture"
];

const Careers = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-4">
      <h1 className="text-5xl font-extrabold text-[#162048] mb-6 text-center tracking-wide drop-shadow-lg">
        Careers at NeonPulse
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-[#162048] text-center mb-10">
        Shape the future of digital media with us. We value creativity, collaboration, and a passion for storytelling.
      </p>
      <div className="flex flex-col md:flex-row gap-10 mb-12 items-center">
        <div className="md:w-1/2 bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8">
          <h2 className="text-3xl font-bold text-[#162048] mb-6">Why Join Us?</h2>
          <ul className="space-y-6">
            {perks.map((perk, idx) => (
              <li key={idx} className="flex items-center gap-4 text-[#1a1a1a] text-xl font-semibold">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#ffe000] text-[#162048] font-bold rounded-full shadow text-2xl">
                  {idx + 1}
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 flex items-center justify-center">
          <div className="relative w-full max-w-xs flex flex-col items-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlhdND-Ptf0bODHwf6qIHV935hLwsykjbzkA&s"
              alt="Team working together"
              className="rounded-2xl shadow-lg w-full h-48 object-cover mb-4"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#ffe000] text-[#162048] px-6 py-2 rounded-full font-bold shadow-lg text-center text-lg">
              We’re hiring!
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-[#162048] mb-6 text-center">Open Positions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {jobs.map((job, idx) => (
          <div key={idx} className="relative bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-2 hover:shadow-blue-200">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#ffe000] text-[#162048] px-5 py-2 rounded-full font-bold shadow text-base">
              {job.type}
            </div>
            <h3 className="text-xl font-bold text-[#162048] mb-1 mt-6">{job.title}</h3>
            <span className="text-sm font-semibold text-[#162048] mb-2">{job.location}</span>
            <p className="text-base text-[#1a1a1a] mb-6">{job.description}</p>
            <a
              href={job.apply}
              className="bg-[#162048] text-white px-6 py-2 rounded-full font-bold hover:bg-blue-900 transition-colors self-end"
            >
              Apply Now
            </a>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-[#162048] text-lg font-semibold">
          Don’t see a role that fits? <a href="mailto:careers@neonpulse.com" className="underline text-blue-700">Email us</a> and tell us why you’d be a great addition!
        </p>
      </div>
    </div>
  </div>
);

export default Careers;