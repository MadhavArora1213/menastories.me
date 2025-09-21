import React from "react";
import { Link } from "react-router-dom";

const COLORS = {
    white: "#ffffff",
    blue: "#162048",
    black: "#1a1a1a",
};

const specialSectionArticles = [
    {
        title: "Taylor Swift Drops Surprise Album",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        date: "August 16, 2025",
        summary:
            "Taylor Swift surprises fans with a brand new album, featuring collaborations with top artists.",
        link: "taylor-swift-surprise-album",
    },
    {
        title: "Oscars 2025: The Biggest Winners",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
        date: "August 15, 2025",
        summary:
            "A full recap of the 2025 Oscars, including all the major winners and memorable moments.",
        link: "oscars-2025-winners",
    },
    {
        title: "Marvel Announces New Superhero Movie",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        date: "August 14, 2025",
        summary:
            "Marvel Studios teases fans with a new superhero movie set to release next summer.",
        link: "marvel-new-superhero-movie",
    },
    {
        title: "Adele Announces World Tour",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
        date: "August 13, 2025",
        summary: "Adele is back on the road with a highly anticipated world tour.",
        link: "adele-world-tour",
    },
    {
        title: "Blockbuster Movie Breaks Box Office Records",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
        date: "August 12, 2025",
        summary:
            "The latest blockbuster movie has shattered box office records worldwide.",
        link: "blockbuster-movie-records",
    },
    {
        title: "Grammy Awards: Top Performances",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fdc?auto=format&fit=crop&w=800&q=80",
        date: "August 11, 2025",
        summary:
            "A look at the most memorable performances from this year's Grammy Awards.",
        link: "grammy-awards-performances",
    },
    {
        title: "New Streaming Series Gains Popularity",
        image: "https://images.unsplash.com/photo-1468071174046-657d9d351a40?auto=format&fit=crop&w=800&q=80",
        date: "August 10, 2025",
        summary: "A new streaming series is quickly becoming a fan favorite.",
        link: "new-streaming-series",
    },
    {
        title: "Celebrity Couple Announces Engagement",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
        date: "August 9, 2025",
        summary: "A beloved celebrity couple has announced their engagement.",
        link: "celebrity-couple-engagement",
    },
    {
        title: "Music Festival Lineup Revealed",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
        date: "August 8, 2025",
        summary:
            "The lineup for this year's biggest music festival has been revealed.",
        link: "music-festival-lineup",
    },
    {
        title: "Award-Winning Director Teases New Project",
        image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fdc?auto=format&fit=crop&w=800&q=80",
        date: "August 7, 2025",
        summary:
            "An award-winning director is teasing details about their next big project.",
        link: "director-new-project",
    },
    {
        title: "Broadway Show Receives Rave Reviews",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
        date: "August 6, 2025",
        summary:
            "A new Broadway show is receiving rave reviews from critics and audiences alike.",
        link: "broadway-show-reviews",
    },
    {
        title: "Pop Star Releases New Single",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
        date: "August 5, 2025",
        summary: "A popular pop star has just released a brand new single.",
        link: "pop-star-new-single",
    },
];

const rest = specialSectionArticles.slice(3);

const getCardBg = (idx) =>
    idx % 2 === 0
        ? "bg-gradient-to-br from-[#162048]/[.07] to-white"
        : "bg-gradient-to-tr from-[#162048]/[.03] to-white";

const SpecialSection = () => (
    <div className="min-h-screen pb-10 bg-white relative overflow-x-hidden">
        {/* Unique Category Showcase */}
        <div className="relative flex flex-col items-center justify-center py-16 mb-10">
            {/* Animated floating shapes */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute left-10 top-0 w-32 h-32 rounded-full bg-[#162048]/10 animate-bounce-slow" />
                <div className="absolute right-10 top-10 w-24 h-24 rounded-full bg-[#162048]/20 animate-pulse" />
                <div className="absolute left-1/2 bottom-0 w-40 h-16 bg-[#162048]/10 rounded-full blur-2xl -translate-x-1/2" />
            </div>
            <span className="relative z-10 text-xs uppercase tracking-widest font-bold text-[#162048] bg-white px-4 py-1 rounded-full shadow border border-[#162048] mb-3">
                Welcome to
            </span>
            <h1
                className="relative z-10 text-6xl md:text-7xl font-black text-center tracking-tight mb-4"
                style={{
                    color: COLORS.blue,
                    letterSpacing: "0.02em",
                    textShadow: "0 6px 24px #16204822",
                }}
            >
                Special Section
            </h1>
            <p className="relative z-10 text-lg md:text-2xl text-[#1a1a1a] font-medium max-w-2xl text-center mb-2">
                Where pop culture meets style. Discover the latest in music, movies, and
                celebrity buzz—curated for the bold and curious.
            </p>
            <div className="relative z-10 mt-4 flex gap-3">
                <span className="inline-block bg-[#162048] text-white px-4 py-1 rounded-full font-semibold text-xs shadow">
                    #Trending
                </span>
                <span className="inline-block bg-[#162048] text-white px-4 py-1 rounded-full font-semibold text-xs shadow">
                    #Exclusive
                </span>
                <span className="inline-block bg-[#162048] text-white px-4 py-1 rounded-full font-semibold text-xs shadow">
                    #PopCulture
                </span>
            </div>
        </div>

        {/* Spotlight Section with Proper Text Overlay */}
        <section className="relative max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#162048] mb-10 text-center tracking-tight">
                Spotlight Stories
            </h2>
            <div className="relative w-full flex flex-wrap justify-center gap-8 z-10">
                {specialSectionArticles.slice(0, 3).map((article, idx) => (
                    <div
                        key={article.title}
                        className={`relative group w-80 md:w-96 rounded-[2.5rem] shadow-2xl border-4 overflow-hidden transition-all duration-500 hover:scale-105 hover:z-20 ${getCardBg(
                            idx
                        )}`}
                        style={{
                            borderColor: COLORS.blue,
                            marginTop: idx === 1 ? "40px" : "0",
                            marginBottom: idx === 1 ? "40px" : "0",
                            boxShadow: idx === 1 ? "0 12px 48px #16204833" : undefined,
                            transform: idx === 1 ? "scale(1.08)" : undefined,
                        }}
                    >
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                        {/* Stronger overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#162048ee] via-[#162048cc] to-[#16204888]" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                            <span className="bg-white text-[#162048] font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow mb-4 self-start">
                                {article.date}
                            </span>
                            <h2 className="text-2xl md:text-2xl font-extrabold text-white drop-shadow-lg leading-tight mb-2 line-clamp-2" style={{ wordBreak: "break-word" }}>
                                {article.title}
                            </h2>
                            <p className="text-white/90 font-medium max-w-lg mb-6 line-clamp-2" style={{ wordBreak: "break-word" }}>
                                {article.summary}
                            </p>
                            <Link
                                to={`/${article.link}`}
                                className="inline-block bg-[#162048] text-white px-6 py-2 rounded-full font-bold shadow hover:bg-[#1a1a1a] transition"
                            >
                                Read Feature &rarr;
                            </Link>
                        </div>
                        {/* Decorative floating star */}
                        <svg
                            className="absolute top-6 right-6 w-8 h-8 text-[#162048] opacity-50 animate-spin-slow"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <polygon points="10,1 12,7 19,7 13.5,11 15.5,18 10,14 4.5,18 6.5,11 1,7 8,7" />
                        </svg>
                    </div>
                ))}
            </div>
            <div className="absolute left-1/2 top-1/2 w-[600px] h-[200px] -translate-x-1/2 -translate-y-1/2 bg-[#162048]/[.04] rounded-full blur-2xl z-0" />
        </section>

        {/* --- UNIQUE MODERN "MAGAZINE STACK" CARDS --- */}
        <section className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#162048] mb-10 text-center tracking-tight">
                All Entertainment News
            </h2>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                {rest.map((article, idx) => (
                    <Link
                        to={`/${article.link}`}
                        key={article.title}
                        className="group relative block focus:outline-none"
                        tabIndex={0}
                        style={{ minHeight: "420px" }}
                    >
                        {/* Card shadow layers for "stacked" effect */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute inset-0 rounded-[2.5rem] bg-[#162048]/[.10] blur-[6px] scale-95 translate-y-4" />
                            <div className="absolute inset-0 rounded-[2.5rem] bg-[#162048]/[.06] blur-[2px] scale-98 translate-y-2" />
                        </div>
                        {/* Main Card */}
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#162048] bg-white group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
                            {/* Top image with magazine cut and floating badge */}
                            <div className="relative">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-48 object-cover"
                                    style={{
                                        borderTopLeftRadius: "2.5rem",
                                        borderTopRightRadius: "2.5rem",
                                        clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
                                    }}
                                    loading="lazy"
                                />
                                <span className="absolute top-4 left-4 bg-[#162048] text-white text-xs px-4 py-1 rounded-full font-semibold shadow uppercase tracking-wider z-10">
                                    {article.date}
                                </span>
                                {/* Decorative floating icon */}
                                <svg
                                    className="absolute top-4 right-4 w-7 h-7 text-[#162048] opacity-20"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <rect x="3" y="3" width="14" height="14" rx="4" />
                                </svg>
                            </div>
                            {/* Card content */}
                            <div className="flex-1 flex flex-col justify-between p-7 bg-gradient-to-br from-white via-[#f8fafc] to-[#16204808]">
                                <div>
                                    <h3 className="text-xl font-extrabold mb-2 text-[#162048] leading-tight group-hover:underline transition-colors duration-300 line-clamp-2" style={{ wordBreak: "break-word" }}>
                                        {article.title}
                                    </h3>
                                    <p className="text-[#1a1a1a] mb-4 line-clamp-3" style={{ wordBreak: "break-word" }}>
                                        {article.summary}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="inline-block bg-[#162048] text-white px-5 py-2 rounded-full font-bold shadow transition group-hover:bg-[#1a1a1a]">
                                        Read More &rarr;
                                    </span>
                                    {/* Decorative bottom right dot grid */}
                                    <svg
                                        className="w-8 h-8 text-[#162048] opacity-10 ml-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <circle cx="4" cy="4" r="2" />
                                        <circle cx="16" cy="4" r="2" />
                                        <circle cx="4" cy="16" r="2" />
                                        <circle cx="16" cy="16" r="2" />
                                    </svg>
                                </div>
                            </div>
                            {/* Floating magazine sticker */}
                            <span className="absolute -top-6 right-8 bg-gradient-to-r from-[#162048] to-[#1a1a1a] text-white text-xs px-4 py-1 rounded-full font-bold shadow-lg rotate-6 z-20">
                                FEATURED
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
        <style>
            {`
        /* Hide scroll bar for trending */
        .overflow-x-auto::-webkit-scrollbar { display: none; }
        .overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite alternate;
        }
        @keyframes bounce-slow {
          0% { transform: translateY(0);}
          100% { transform: translateY(30px);}
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg);}
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}
        </style>
    </div>
);

export default SpecialSection;