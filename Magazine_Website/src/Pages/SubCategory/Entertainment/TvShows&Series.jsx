import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const tvShows = [
  {
    title: "Family Drama: New Season Premiere",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    summary: "The much-awaited new season of the hit family drama is finally here, promising more twists and turns.",
    date: "August 18, 2025",
    link: "family-drama-premiere",
    tag: "Drama",
  },
  {
    title: "Reality Show: Behind the Scenes",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    summary: "Get an exclusive look at what goes on behind the scenes of your favorite reality show.",
    date: "August 16, 2025",
    link: "reality-show-bts",
    tag: "Reality",
  },
  {
    title: "Comedy Series: Laugh Out Loud",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    summary: "This comedy series is winning hearts with its witty humor and lovable characters.",
    date: "August 14, 2025",
    link: "comedy-series",
    tag: "Comedy",
  },
  {
    title: "Thriller Series: Edge of Your Seat",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    summary: "A new thriller series keeps viewers hooked with suspenseful storytelling and unexpected twists.",
    date: "August 12, 2025",
    link: "thriller-series",
    tag: "Thriller",
  },
];

const TvShowsSeries = () => (
  <SubCategory
    title="TV Shows & Series"
    description="Stay updated on the latest TV shows and web series, from drama and comedy to reality and thrillers."
    tags={["#TVShows", "#WebSeries", "#Drama", "#Comedy", "#Reality"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tvShows.map((item) => (
          <div
            key={item.title}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100 relative">
              <img
                src={item.image}
                alt={item.title}
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
                <Link to={`/${item.link}`}>{item.title}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{item.summary}</p>
              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${item.link}`}
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

export default TvShowsSeries;