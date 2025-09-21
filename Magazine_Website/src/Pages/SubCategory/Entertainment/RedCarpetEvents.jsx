import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const redCarpetEvents = [
  {
    event: "Filmfare Red Carpet 2025",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    highlight: "Bollywood's biggest stars dazzle in designer outfits at the Filmfare Red Carpet.",
    date: "August 10, 2025",
    link: "filmfare-red-carpet-2025",
    tag: "Filmfare",
  },
  {
    event: "IIFA Green Carpet",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    highlight: "A global celebration of style and glamour at the IIFA Green Carpet.",
    date: "July 28, 2025",
    link: "iifa-green-carpet-2025",
    tag: "IIFA",
  },
  {
    event: "National Awards Night",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    highlight: "A night of elegance and recognition for the best in Indian cinema.",
    date: "July 15, 2025",
    link: "national-awards-night-2025",
    tag: "National",
  },
  {
    event: "Screen Awards Red Carpet",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    highlight: "Television and film stars shine at the Screen Awards Red Carpet event.",
    date: "June 30, 2025",
    link: "screen-awards-red-carpet-2025",
    tag: "Screen",
  },
];

const RedCarpetEvents = () => (
  <SubCategory
    title="Red Carpet Events"
    description="Relive the glitz, glamour, and unforgettable moments from the most spectacular red carpet events."
    tags={["#RedCarpet", "#Events", "#Fashion", "#Bollywood"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {redCarpetEvents.map((item) => (
          <div
            key={item.event}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100 relative">
              <img
                src={item.image}
                alt={item.event}
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
                <Link to={`/${item.link}`}>{item.event}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{item.highlight}</p>
              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${item.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  See Gallery &rarr;
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

export default RedCarpetEvents;