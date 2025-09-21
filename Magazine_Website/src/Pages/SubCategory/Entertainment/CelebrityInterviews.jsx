import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const celebrityInterviews = [
  {
    name: "Alia Bhatt",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    headline: "Alia Bhatt on Her Latest Role",
    excerpt: "Alia Bhatt opens up about her challenging new role and what it means for her career.",
    date: "August 18, 2025",
    link: "alia-bhatt-interview",
    tag: "Exclusive",
  },
  {
    name: "Ranveer Singh",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    headline: "Ranveer Singh: Energy Unmatched",
    excerpt: "Ranveer shares his secrets to staying energetic and his thoughts on the evolving film industry.",
    date: "August 16, 2025",
    link: "ranveer-singh-interview",
    tag: "Interview",
  },
  {
    name: "Priyanka Chopra",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    headline: "Priyanka Chopra: Global Icon",
    excerpt: "Priyanka discusses her international projects and balancing life between continents.",
    date: "August 14, 2025",
    link: "priyanka-chopra-interview",
    tag: "Global",
  },
  {
    name: "Ayushmann Khurrana",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    headline: "Ayushmann Khurrana: Breaking Stereotypes",
    excerpt: "Ayushmann talks about choosing unconventional roles and his journey in Bollywood.",
    date: "August 12, 2025",
    link: "ayushmann-khurrana-interview",
    tag: "Inspiration",
  },
];

const CelebrityInterviews = () => (
  <SubCategory
    title="Celebrity Interviews"
    description="Get up close and personal with your favorite stars. Read in-depth interviews and discover what drives Bollywood's brightest talents."
    tags={["#Celebrity", "#Interviews", "#Bollywood", "#Exclusive"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {celebrityInterviews.map((item) => (
          <div
            key={item.name}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100 relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                {item.tag}
              </span>
              <span className="absolute bottom-3 right-3 bg-white/80 text-gray-700 text-xs px-2 py-1 rounded">
                {item.date}
              </span>
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${item.link}`}>{item.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{item.excerpt}</p>
              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${item.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  Read Interview &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <style>
      {`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}
    </style>
  </SubCategory>
);

export default CelebrityInterviews;