import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const risingStars = [
  {
    name: "Aarav Mehta",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Aarav Mehta: Young Tech Prodigy",
    summary: "Aarav, a coding whiz at 15, is already developing apps that solve real-world problems.",
    date: "August 18, 2025",
    link: "aarav-mehta-tech-prodigy",
  },
  {
    name: "Sneha Reddy",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Sneha Reddy: The Next Tennis Sensation",
    summary: "Sneha is making waves in junior tennis circuits with her powerful serve and determination.",
    date: "August 17, 2025",
    link: "sneha-reddy-tennis-star",
  },
  {
    name: "Kabir Singh",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Kabir Singh: Voice of a New Generation",
    summary: "Kabir's poetry and spoken word performances are inspiring youth across the country.",
    date: "August 16, 2025",
    link: "kabir-singh-poetry",
  },
  {
    name: "Isha Malhotra",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Isha Malhotra: Science Fair Winner",
    summary: "Isha's innovative science projects have won her national recognition and awards.",
    date: "August 15, 2025",
    link: "isha-malhotra-science-fair",
  },
  {
    name: "Rahul Deshmukh",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Rahul Deshmukh: Budding Filmmaker",
    summary: "Rahul's short films are being screened at youth film festivals across India.",
    date: "August 14, 2025",
    link: "rahul-deshmukh-filmmaker",
  },
  {
    name: "Tanya Verma",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Tanya Verma: Social Media Star",
    summary: "Tanya's creative content and positive messages have earned her a huge following online.",
    date: "August 13, 2025",
    link: "tanya-verma-social-media",
  },
];

const RisingStars = () => (
  <SubCategory
    title="Rising Stars"
    description="Meet the next generation of talent making their mark in diverse fields. Discover the journeys of India's most promising rising stars."
    tags={["#RisingStars", "#Youth", "#Talent", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {risingStars.map((star) => (
          <div
            key={star.name + star.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={star.image}
                alt={star.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{star.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${star.link}`}>{star.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{star.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{star.name}</span>
                <Link
                  to={`/${star.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  Read More &rarr;
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

export default RisingStars;