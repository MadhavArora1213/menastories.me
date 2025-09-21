import React from "react";
import SubCategory from "../../Components/SubCategory";
import { Link } from "react-router-dom";

const celebrityNews = [
  {
    name: "Deepika Padukone",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Deepika Padukone to Star in International Thriller",
    summary: "Bollywood superstar Deepika Padukone lands a lead role in a major Hollywood thriller, expanding her global presence.",
    date: "August 18, 2025",
    link: "deepika-padukone-international-thriller",
  },
  {
    name: "Virat Kohli",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Virat Kohli Launches Youth Sports Foundation",
    summary: "Cricket legend Virat Kohli launches a foundation to support young athletes across India.",
    date: "August 17, 2025",
    link: "virat-kohli-sports-foundation",
  },
  {
    name: "Priyanka Chopra",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Priyanka Chopra Wins Global Humanitarian Award",
    summary: "Priyanka Chopra is honored for her humanitarian work at a global awards ceremony in New York.",
    date: "August 16, 2025",
    link: "priyanka-chopra-humanitarian-award",
  },
  {
    name: "Ranveer Singh",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ranveer Singh Sets Fashion Week Ablaze",
    summary: "Ranveer Singh steals the show at Paris Fashion Week with his bold and unique style.",
    date: "August 15, 2025",
    link: "ranveer-singh-fashion-week",
  },
  {
    name: "Alia Bhatt",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Alia Bhatt Announces Debut Music Album",
    summary: "Award-winning actress Alia Bhatt surprises fans with the announcement of her debut music album.",
    date: "August 14, 2025",
    link: "alia-bhatt-music-album",
  },
  {
    name: "Amitabh Bachchan",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Amitabh Bachchan Receives Lifetime Achievement Award",
    summary: "Legendary actor Amitabh Bachchan is honored with a lifetime achievement award for his contribution to Indian cinema.",
    date: "August 13, 2025",
    link: "amitabh-bachchan-lifetime-award",
  },
  {
    name: "Kareena Kapoor",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Kareena Kapoor Hosts Charity Gala",
    summary: "Kareena Kapoor brings together stars for a charity gala supporting children's education.",
    date: "August 12, 2025",
    link: "kareena-kapoor-charity-gala",
  },
  {
    name: "Hrithik Roshan",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Hrithik Roshan Signs New Action Movie",
    summary: "Hrithik Roshan is set to star in a high-octane action film, thrilling fans worldwide.",
    date: "August 11, 2025",
    link: "hrithik-roshan-action-movie",
  },
  {
    name: "Shah Rukh Khan",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Shah Rukh Khan Announces Global Tour",
    summary: "Superstar Shah Rukh Khan announces a global tour, performing in major cities across the world.",
    date: "August 10, 2025",
    link: "shah-rukh-khan-global-tour",
  },
  {
    name: "Anushka Sharma",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Anushka Sharma Launches Eco-Friendly Brand",
    summary: "Anushka Sharma launches a new eco-friendly fashion brand, promoting sustainability.",
    date: "August 9, 2025",
    link: "anushka-sharma-eco-brand",
  },
  {
    name: "Ayushmann Khurrana",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Ayushmann Khurrana Wins Best Actor",
    summary: "Ayushmann Khurrana wins Best Actor at the National Film Awards for his stellar performance.",
    date: "August 8, 2025",
    link: "ayushmann-khurrana-best-actor",
  },
  {
    name: "Katrina Kaif",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&h=400&facepad=2&q=80",
    headline: "Katrina Kaif Opens Dance Academy",
    summary: "Katrina Kaif opens a dance academy to nurture young talent in India.",
    date: "August 7, 2025",
    link: "katrina-kaif-dance-academy",
  },
];

const CelebritySpotlight = () => (
  <SubCategory
    title="Celebrity Spotlight"
    description="Step into the limelight with India's most influential celebrities. Explore exclusive news, creative highlights, and their unique journeys—presented in a modern news style."
    tags={["#Celebrities", "#Spotlight", "#News", "#Inspiration"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {celebrityNews.map((celeb) => (
          <div
            key={celeb.name + celeb.date}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={celeb.image}
                alt={celeb.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{celeb.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${celeb.link}`}>{celeb.headline}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{celeb.summary}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500 font-medium">{celeb.name}</span>
                <Link
                  to={`/${celeb.link}`}
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

export default CelebritySpotlight;