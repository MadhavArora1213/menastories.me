import React from "react";

const teamMembers = [
  {
    name: "Alex Johnson",
    role: "Editor in Chief",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Alex leads the editorial team with a passion for storytelling and journalistic integrity.",
    social: {
      linkedin: "https://linkedin.com/in/alexjohnson",
      twitter: "https://twitter.com/alexjohnson",
      instagram: "https://instagram.com/alexjohnson"
    }
  },
  {
    name: "Jane Smith",
    role: "Associate General Manager",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Jane oversees operations and ensures the smooth running of all magazine projects.",
    social: {
      linkedin: "https://linkedin.com/in/janesmith",
      twitter: "https://twitter.com/janesmith",
      instagram: "https://instagram.com/janesmith"
    }
  },
  {
    name: "Mark Wilson",
    role: "Executive Director, Special Projects",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    bio: "Mark brings innovation and creativity to our special editorial initiatives.",
    social: {
      linkedin: "https://linkedin.com/in/markwilson",
      twitter: "https://twitter.com/markwilson",
      instagram: "https://instagram.com/markwilson"
    }
  },
  {
    name: "Sarah Lee",
    role: "Director of Operations and Finance",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Sarah manages finances and operations, keeping the magazine on track and thriving.",
    social: {
      linkedin: "https://linkedin.com/in/sarahlee",
      twitter: "https://twitter.com/sarahlee",
      instagram: "https://instagram.com/sarahlee"
    }
  },
  {
    name: "John Doe",
    role: "Executive Editorial Director",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    bio: "John ensures our editorial standards are met and our stories are impactful.",
    social: {
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
      instagram: "https://instagram.com/johndoe"
    }
  }
];

const iconStyle = "w-8 h-8 mx-1 text-[#162048] hover:text-blue-600 transition-colors duration-200";

const LinkedInIcon = () => (
  <svg className={iconStyle} viewBox="0 0 32 32" fill="none">
    <rect x="6" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
    <rect x="10" y="14" width="2.5" height="8" fill="currentColor"/>
    <rect x="10" y="10" width="2.5" height="2.5" fill="currentColor"/>
    <rect x="15" y="14" width="2.5" height="8" fill="currentColor"/>
    <path d="M20 14c1.5 0 2.5 1.2 2.5 2.7v5.3h-2.5v-5.3c0-.5-.4-.7-.7-.7s-.8.2-.8.7v5.3h-2.5v-8h2.5v1c.4-.7 1.2-1 2-1z" fill="currentColor"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg className={iconStyle} viewBox="0 0 32 32" fill="none">
    <rect x="6" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 10L22 22M22 10L10 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className={iconStyle} viewBox="0 0 32 32" fill="none">
    <rect x="6" y="6" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="22" cy="10" r="1.5" fill="currentColor"/>
  </svg>
);

const OurTeam = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen">
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-extrabold text-[#162048] mb-12 text-center tracking-wide drop-shadow-lg animate-fade-in">
        Meet Our Team
      </h1>
      <div className="flex flex-wrap justify-center gap-10">
        {teamMembers.map((member, idx) => (
          <div
            key={member.name}
            className="relative bg-white rounded-3xl shadow-2xl border-4 border-[#162048] flex flex-col items-center p-8 w-full sm:w-[340px] transition-transform duration-300 hover:-translate-y-2 hover:shadow-blue-200 group overflow-hidden"
            style={{ animation: `fadeInUp 0.7s ease ${idx * 0.15 + 0.2}s both` }}
          >
            {/* Decorative Side Bar */}
            <div className="absolute left-0 top-0 h-full w-8 bg-[#162048] rounded-l-2xl flex flex-col items-center justify-center z-0">
              <div className="mt-8 mb-2">
                <svg width="32" height="12"><polyline points="0,12 8,0 16,12 24,0 32,12" stroke="#e3e7f7" strokeWidth="3" fill="none"/></svg>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#e3e7f7] mb-2"></div>
              <div>
                <svg width="32" height="12"><polyline points="0,12 8,0 16,12 24,0 32,12" stroke="#e3e7f7" strokeWidth="3" fill="none"/></svg>
              </div>
            </div>
            {/* Profile Image */}
            <div className="w-32 h-32 mb-4 rounded-full border-4 border-[#162048] overflow-hidden relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <img
                src={member.image}
                alt={member.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 rounded-full border-4 border-[#e3e7f7] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Info */}
            <h2 className="text-xl font-bold text-[#162048] mb-1 z-10">{member.name}</h2>
            <h3 className="text-base font-semibold text-[#1a1a1a] mb-2 z-10">{member.role}</h3>
            <p className="text-sm text-[#1a1a1a] mb-4 text-center z-10">{member.bio}</p>
            {/* Socials */}
            <div className="flex gap-2 z-10 mt-2">
              <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" title="Twitter/X">
                <TwitterXIcon />
              </a>
              <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                <InstagramIcon />
              </a>
            </div>
            {/* Decorative Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full flex justify-end pr-8 pb-4 z-0">
              <span className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-4 h-2 rounded-full bg-[#162048] inline-block"></span>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <style>
      {`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.57,.21,.69,1.25) both;
        }
      `}
    </style>
  </div>
);

export default OurTeam;