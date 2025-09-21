import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const businessLeaders = [
  {
    name: "Mukesh Ambani",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Mukesh Ambani: Transforming Indian Industry",
    summary: "Reliance Industries chairman Mukesh Ambani leads India's digital revolution and business innovation.",
    date: "August 18, 2025",
    link: "mukesh-ambani-industry",
  },
  {
    name: "Natarajan Chandrasekaran",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Chandrasekaran: Tata Group's Visionary",
    summary: "N. Chandrasekaran steers Tata Group into a new era of growth and global leadership.",
    date: "August 17, 2025",
    link: "chandrasekaran-tata-group",
  },
  {
    name: "Falguni Nayar",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Falguni Nayar: Building Nykaa's Beauty Empire",
    summary: "Entrepreneur Falguni Nayar has redefined beauty retail in India with the success of Nykaa.",
    date: "August 16, 2025",
    link: "falguni-nayar-nykaa",
  },
  {
    name: "Ratan Tata",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ratan Tata: Philanthropy & Leadership",
    summary: "Ratan Tata's legacy is marked by visionary leadership and a commitment to social good.",
    date: "August 15, 2025",
    link: "ratan-tata-leadership",
  },
  {
    name: "Kiran Mazumdar-Shaw",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Kiran Mazumdar-Shaw: Biotech Pioneer",
    summary: "Biocon founder Kiran Mazumdar-Shaw is a trailblazer in India's biotechnology sector.",
    date: "August 14, 2025",
    link: "kiran-mazumdar-shaw-biotech",
  },
  {
    name: "Sundar Pichai",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Sundar Pichai: Leading Google Globally",
    summary: "Sundar Pichai's journey from Chennai to CEO of Google inspires aspiring leaders worldwide.",
    date: "August 13, 2025",
    link: "sundar-pichai-google",
  },
];

const BusinessLeaders = () => (
  <SubCategory
    title="Business Leaders"
    description="Explore the stories of India's most influential business leaders. Learn about their journeys, leadership philosophies, and impact on the global economy."
    tags={["#Business", "#Leaders", "#Entrepreneurs", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {businessLeaders.map((leader) => (
          <div
            key={leader.name + leader.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={leader.image}
                alt={leader.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{leader.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${leader.link}`}>{leader.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{leader.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{leader.name}</span>
                <Link
                  to={`/${leader.link}`}
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
export default BusinessLeaders;