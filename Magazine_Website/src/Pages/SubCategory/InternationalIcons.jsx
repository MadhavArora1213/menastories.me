import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const internationalIcons = [
  {
    name: "Oprah Winfrey",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Oprah Winfrey: Media Mogul & Philanthropist",
    summary: "Oprah Winfrey's journey from humble beginnings to global influence is a story of resilience and inspiration.",
    date: "August 18, 2025",
    link: "oprah-winfrey-story",
  },
  {
    name: "Elon Musk",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Elon Musk: Innovating the Future",
    summary: "Elon Musk is redefining technology and transportation with companies like Tesla and SpaceX.",
    date: "August 17, 2025",
    link: "elon-musk-innovation",
  },
  {
    name: "Malala Yousafzai",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Malala: Voice for Education",
    summary: "Nobel laureate Malala Yousafzai continues to champion girls' education worldwide.",
    date: "August 16, 2025",
    link: "malala-education",
  },
  {
    name: "Barack Obama",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Barack Obama: Leadership & Legacy",
    summary: "Former US President Barack Obama inspires with his leadership, vision, and global impact.",
    date: "August 15, 2025",
    link: "barack-obama-legacy",
  },
  {
    name: "Greta Thunberg",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Greta Thunberg: Climate Crusader",
    summary: "Greta Thunberg's activism has sparked a global movement for climate action.",
    date: "August 14, 2025",
    link: "greta-thunberg-climate",
  },
  {
    name: "Cristiano Ronaldo",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Cristiano Ronaldo: Sporting Legend",
    summary: "Cristiano Ronaldo's dedication and talent have made him one of the greatest athletes of all time.",
    date: "August 13, 2025",
    link: "cristiano-ronaldo-legend",
  },
];

const InternationalIcons = () => (
  <SubCategory
    title="International Icons"
    description="Explore the stories of global icons who have made a mark across borders. Discover their journeys, achievements, and worldwide influence."
    tags={["#International", "#Icons", "#Global", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {internationalIcons.map((icon) => (
          <div
            key={icon.name + icon.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={icon.image}
                alt={icon.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{icon.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${icon.link}`}>{icon.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{icon.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{icon.name}</span>
                <Link
                  to={`/${icon.link}`}
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

export default InternationalIcons;