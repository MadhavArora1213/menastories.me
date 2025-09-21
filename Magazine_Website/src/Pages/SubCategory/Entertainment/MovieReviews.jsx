import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const movieReviews = [
  {
    title: "Blockbuster Thriller: Must-Watch or Miss?",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    review: "A gripping thriller with stellar performances, but does it live up to the hype? Read our in-depth review.",
    date: "August 17, 2025",
    link: "blockbuster-thriller-review",
    rating: 4.5,
  },
  {
    title: "Romantic Comedy: Fresh Take or Formulaic?",
    image: "https://images.unsplash.com/photo-1519340333755-c892b8db7b8a?auto=format&fit=crop&w=600&q=80",
    review: "This rom-com brings laughter and heart, but does it break new ground? Find out in our review.",
    date: "August 15, 2025",
    link: "romantic-comedy-review",
    rating: 3.5,
  },
  {
    title: "Animated Adventure: Fun for All Ages",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
    review: "A visually stunning animated film that delights both kids and adults.",
    date: "August 13, 2025",
    link: "animated-adventure-review",
    rating: 4,
  },
  {
    title: "Indie Drama: A Hidden Gem",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
    review: "A powerful indie drama with moving performances and a thought-provoking story.",
    date: "August 11, 2025",
    link: "indie-drama-review",
    rating: 4.8,
  },
];

const getStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <span key={i} className="text-yellow-400">&#9733;</span>
      ))}
      {halfStar && <span className="text-yellow-400">&#189;</span>}
    </>
  );
};

const MovieReviews = () => (
  <SubCategory
    title="Movie Reviews"
    description="Read honest, insightful reviews of the latest movies from Bollywood, Hollywood, and beyond."
    tags={["#MovieReviews", "#Cinema", "#Entertainment"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {movieReviews.map((item) => (
          <div
            key={item.title}
            className="flex bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex-col"
          >
            <div className="w-full h-48 bg-gray-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1">
              <span className="text-xs text-gray-500 font-medium">{item.date}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 hover:underline">
                <Link to={`/${item.link}`}>{item.title}</Link>
              </h3>
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{item.review}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-yellow-500 font-medium">{getStars(item.rating)}</span>
                <Link
                  to={`/${item.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  Read Full Review &rarr;
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

export default MovieReviews;