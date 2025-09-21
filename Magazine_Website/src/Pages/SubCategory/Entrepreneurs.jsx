import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const entrepreneurs = [
  {
    name: "Byju Raveendran",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Byju Raveendran: EdTech Pioneer",
    summary: "Byju Raveendran transformed education in India with his innovative learning platform, BYJU'S.",
    date: "August 18, 2025",
    link: "byju-raveendran-edtech",
  },
  {
    name: "Vineeta Singh",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Vineeta Singh: Building Sugar Cosmetics",
    summary: "Vineeta Singh's entrepreneurial journey has made Sugar Cosmetics a household name in India.",
    date: "August 17, 2025",
    link: "vineeta-singh-sugar-cosmetics",
  },
  {
    name: "Peyush Bansal",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Peyush Bansal: Vision for Lenskart",
    summary: "Peyush Bansal's vision and leadership have revolutionized the eyewear industry in India.",
    date: "August 16, 2025",
    link: "peyush-bansal-lenskart",
  },
  {
    name: "Ritesh Agarwal",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ritesh Agarwal: OYO's Hospitality Disruptor",
    summary: "Ritesh Agarwal's OYO Rooms has disrupted the hospitality sector with affordable and quality stays.",
    date: "August 15, 2025",
    link: "ritesh-agarwal-oyo",
  },
  {
    name: "Falguni Nayar",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Falguni Nayar: Nykaa's Success Story",
    summary: "Falguni Nayar's Nykaa has become a leading beauty retailer, inspiring women entrepreneurs.",
    date: "August 14, 2025",
    link: "falguni-nayar-nykaa",
  },
  {
    name: "Naveen Tewari",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Naveen Tewari: InMobi's Global Impact",
    summary: "Naveen Tewari's InMobi is India's first unicorn, making waves in the global ad-tech industry.",
    date: "August 13, 2025",
    link: "naveen-tewari-inmobi",
  },
];

const Entrepreneurs = () => (
  <SubCategory
    title="Entrepreneurs"
    description="Dive into the journeys of India's most dynamic entrepreneurs. Discover their innovations, challenges, and the impact they've made on the business world."
    tags={["#Entrepreneurs", "#Startups", "#Innovation", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {entrepreneurs.map((entrepreneur) => (
          <div
            key={entrepreneur.name + entrepreneur.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={entrepreneur.image}
                alt={entrepreneur.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{entrepreneur.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${entrepreneur.link}`}>{entrepreneur.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{entrepreneur.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{entrepreneur.name}</span>
                <Link
                  to={`/${entrepreneur.link}`}
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

export default Entrepreneurs;