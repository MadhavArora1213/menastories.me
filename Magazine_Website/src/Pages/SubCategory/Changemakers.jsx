import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const changemakers = [
  {
    name: "Arunima Sinha",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Scaling New Heights: Arunima Sinha's Journey",
    summary: "The first female amputee to climb Mount Everest, Arunima Sinha inspires millions with her courage and determination.",
    date: "August 18, 2025",
    link: "arunima-sinha-everest-journey",
  },
  {
    name: "Sonam Wangchuk",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Sonam Wangchuk: Innovating for Ladakh",
    summary: "Engineer and innovator Sonam Wangchuk is transforming education and sustainability in the Himalayas.",
    date: "August 17, 2025",
    link: "sonam-wangchuk-innovation",
  },
  {
    name: "Laxmi Agarwal",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Laxmi Agarwal: Voice Against Acid Attacks",
    summary: "Laxmi Agarwal's activism and resilience have brought hope and justice to acid attack survivors across India.",
    date: "August 16, 2025",
    link: "laxmi-agarwal-activism",
  },
  {
    name: "Anand Kumar",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Super 30: Anand Kumar's Education Revolution",
    summary: "Mathematician Anand Kumar empowers underprivileged students to crack the IIT entrance exam through his Super 30 program.",
    date: "August 15, 2025",
    link: "anand-kumar-super30",
  },
  {
    name: "Medha Patkar",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Medha Patkar: Championing Social Justice",
    summary: "Medha Patkar continues her fight for the rights of marginalized communities and environmental protection.",
    date: "August 14, 2025",
    link: "medha-patkar-social-justice",
  },
  {
    name: "Dr. Devi Shetty",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Affordable Healthcare: Dr. Devi Shetty's Mission",
    summary: "Cardiac surgeon Dr. Devi Shetty is revolutionizing healthcare access for millions of Indians.",
    date: "August 13, 2025",
    link: "devi-shetty-healthcare",
  },
];

const Changemakers = () => (
  <SubCategory
    title="Changemakers"
    description="Meet the visionaries and trailblazers who are driving positive change in India. Explore their inspiring stories, achievements, and impact on society."
    tags={["#Changemakers", "#Inspiration", "#Impact", "#Leaders"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {changemakers.map((person) => (
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

export default Changemakers;