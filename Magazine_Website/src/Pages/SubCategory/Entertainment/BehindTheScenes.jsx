import React from "react";
import { Link } from "react-router-dom";
import SubCategory from "../../../Components/SubCategory";

const behindTheScenes = [
  {
    title: "Lights, Camera, Action: On Set with Bollywood",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    description: "Go behind the scenes of a major Bollywood production and see how the magic is made, from set design to choreography.",
    date: "August 18, 2025",
    link: "bollywood-on-set",
    tag: "Bollywood",
  },
  {
    title: "Costume Secrets: Creating Iconic Looks",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    description: "Discover how costume designers bring characters to life with unique and memorable outfits.",
    date: "August 16, 2025",
    link: "costume-secrets",
    tag: "Fashion",
  },
  {
    title: "Director’s Diary: A Day in the Life",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    description: "Follow a director through a typical day on set, from early morning calls to late-night edits.",
    date: "August 14, 2025",
    link: "directors-diary",
    tag: "Direction",
  },
  {
    title: "Sound & Music: The Unsung Heroes",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    description: "Meet the sound engineers and music composers who create the unforgettable soundtracks of Indian cinema.",
    date: "August 12, 2025",
    link: "sound-music-heroes",
    tag: "Music",
  },
];

const BehindTheScenes = () => (
  <SubCategory
    title="Behind The Scenes"
    description="Step into the world behind the camera. Explore exclusive stories, photos, and insights from the sets of your favorite films and shows."
    tags={["#BehindTheScenes", "#Entertainment", "#FilmMaking"]}
    bgColor="#ffffff"
    textColor="#1a1a1a"
  >
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {behindTheScenes.map((item) => (
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
              <p className="text-gray-700 text-base mb-3 line-clamp-3">{item.description}</p>
              <div className="flex items-center justify-end mt-auto">
                <Link
                  to={`/${item.link}`}
                  className="inline-block text-blue-600 font-semibold hover:underline text-sm"
                >
                  Read Full Story &rarr;
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

export default BehindTheScenes;