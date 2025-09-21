import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const awardShows = [
  {
    name: "Filmfare Awards 2025",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    highlight: "A night of glitz, glamour, and unforgettable performances as Bollywood's best are honored.",
    date: "August 10, 2025",
    link: "filmfare-awards-2025",
    tag: "Bollywood",
  },
  {
    name: "IIFA Awards: Global Celebration",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80",
    highlight: "The International Indian Film Academy Awards bring stars together from around the world.",
    date: "July 28, 2025",
    link: "iifa-awards-2025",
    tag: "International",
  },
  {
    name: "National Film Awards",
    image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80",
    highlight: "Recognizing excellence in Indian cinema across languages and genres.",
    date: "July 15, 2025",
    link: "national-film-awards-2025",
    tag: "India",
  },
  {
    name: "Screen Awards",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    highlight: "A star-studded evening celebrating outstanding achievements in film and television.",
    date: "June 30, 2025",
    link: "screen-awards-2025",
    tag: "TV & Film",
  },
];

const AwardShows = () => (
  <SubCategory
    title="Award Shows"
    description="Relive the most glamorous award nights, red carpet moments, and exclusive highlights from the entertainment industry's biggest events."
    tags={["#AwardShows", "#RedCarpet", "#Entertainment"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {awardShows.map((show) => (
          <div
            key={show.name}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100 relative">
              <img
                src={show.image}
                alt={show.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                {show.tag}
              </span>
              <span className="absolute bottom-3 right-3 bg-white/80 text-gray-700 text-xs px-2 py-1 rounded">
                {show.date}
              </span>
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${show.link}`}>{show.name}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{show.highlight}</p>
              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${show.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  See Highlights &rarr;
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

export default AwardShows;