import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const localPersonalities = [
  {
    name: "Ramesh Sharma",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ramesh Sharma: The Village Innovator",
    summary: "Ramesh Sharma's simple inventions have improved the lives of hundreds in his rural community.",
    date: "August 18, 2025",
    link: "ramesh-sharma-village-innovator",
  },
  {
    name: "Sunita Devi",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Sunita Devi: Champion for Girls' Education",
    summary: "Sunita Devi has dedicated her life to ensuring every girl in her town gets a quality education.",
    date: "August 17, 2025",
    link: "sunita-devi-girls-education",
  },
  {
    name: "Mohammed Irfan",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Mohammed Irfan: Local Sports Hero",
    summary: "From humble beginnings, Irfan has inspired youth through his achievements in athletics.",
    date: "August 16, 2025",
    link: "mohammed-irfan-sports-hero",
  },
  {
    name: "Priya Patel",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Priya Patel: Art for Change",
    summary: "Priya uses art to bring awareness to social issues in her city, making a difference one mural at a time.",
    date: "August 15, 2025",
    link: "priya-patel-art-change",
  },
  {
    name: "Ajay Kumar",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ajay Kumar: The Green Crusader",
    summary: "Ajay's tree-planting drives have transformed his neighborhood into a green haven.",
    date: "August 14, 2025",
    link: "ajay-kumar-green-crusader",
  },
  {
    name: "Meena Joshi",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Meena Joshi: Preserving Local Heritage",
    summary: "Meena works tirelessly to document and preserve the unique traditions of her region.",
    date: "August 13, 2025",
    link: "meena-joshi-heritage",
  },
];

const LocalPersonalities = () => (
  <SubCategory
    title="Local Personalities"
    description="Celebrate the unsung heroes and inspiring individuals making a difference in their local communities across India."
    tags={["#Local", "#Community", "#Inspiration", "#Personalities"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {localPersonalities.map((person) => (
          <div
            key={person.name + person.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={person.image}
                alt={person.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{person.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${person.link}`}>{person.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{person.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{person.name}</span>
                <Link
                  to={`/${person.link}`}
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

export default LocalPersonalities;