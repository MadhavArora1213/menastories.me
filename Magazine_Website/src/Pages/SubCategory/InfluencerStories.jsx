import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const influencerStories = [
  {
    name: "Komal Pandey",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Komal Pandey's Fashion Revolution",
    summary: "Komal Pandey shares her journey from a fashion enthusiast to one of India's top influencers, inspiring millions with her unique style.",
    date: "August 18, 2025",
    link: "komal-pandey-fashion-revolution",
  },
  {
    name: "Bhuvan Bam",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Bhuvan Bam: From YouTube to Stardom",
    summary: "Bhuvan Bam talks about his creative process and how he became a household name through digital storytelling.",
    date: "August 17, 2025",
    link: "bhuvan-bam-youtube-stardom",
  },
  {
    name: "Kusha Kapila",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Kusha Kapila's Comedy Chronicles",
    summary: "Kusha Kapila opens up about breaking stereotypes and making India laugh with her relatable content.",
    date: "August 16, 2025",
    link: "kusha-kapila-comedy-chronicles",
  },
  {
    name: "Sejal Kumar",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Sejal Kumar: Music, Vlogs & More",
    summary: "Sejal Kumar discusses her multi-faceted career as a musician, vlogger, and influencer.",
    date: "August 15, 2025",
    link: "sejal-kumar-music-vlogs",
  },
  {
    name: "Dolly Singh",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Dolly Singh's Rise to Fame",
    summary: "Dolly Singh shares her story of perseverance and how she built a loyal fanbase online.",
    date: "August 14, 2025",
    link: "dolly-singh-rise-to-fame",
  },
  {
    name: "CarryMinati",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "CarryMinati: Roasting to the Top",
    summary: "CarryMinati reveals the secrets behind his viral videos and his journey to becoming India's top roaster.",
    date: "August 13, 2025",
    link: "carryminati-roasting-to-the-top",
  },
];

const InfluencerStories = () => (
  <SubCategory
    title="Influencer Stories"
    description="Discover the journeys of India's most inspiring influencers. Read exclusive stories, creative highlights, and personal insights from the digital stars shaping today's trends."
    tags={["#Influencers", "#Stories", "#DigitalStars", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {influencerStories.map((influencer) => (
          <div
            key={influencer.name + influencer.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={influencer.image}
                alt={influencer.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{influencer.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${influencer.link}`}>{influencer.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{influencer.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{influencer.name}</span>
                <Link
                  to={`/${influencer.link}`}
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

export default InfluencerStories;