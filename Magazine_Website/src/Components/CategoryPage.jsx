import React from "react";

const COLORS = {
  white: '#ffffff',
  blue: '#162048',
  black: '#1a1a1a',
};

const CategoryPage = ({ title, description, articles }) => {
  // Use the first article as the feature, rest as grid
  const [feature, ...rest] = articles;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
      {/* Feature Article */}
      {feature && (
        <div className="mb-12 flex flex-col md:flex-row items-center bg-white rounded-3xl shadow-2xl overflow-hidden border-2" style={{ borderColor: COLORS.blue }}>
          <div className="md:w-1/2 w-full h-64 md:h-[400px] overflow-hidden relative group">
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#162048cc] via-transparent to-transparent opacity-80 pointer-events-none" />
          </div>
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight" style={{ color: COLORS.blue }}>{feature.title}</h2>
            <p className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: COLORS.black }}>{feature.date}</p>
            <p className="text-lg mb-6" style={{ color: COLORS.black }}>{feature.summary}</p>
            <a
              href={feature.link}
              className="inline-block bg-[#162048] text-white px-7 py-2 rounded-full font-bold shadow-lg hover:bg-[#1a1a1a] transition"
            >
              Read Feature &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Grid of Other Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((article, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl shadow-xl border-2 flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            style={{ borderColor: COLORS.blue }}
          >
            <div className="overflow-hidden relative">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <span
                className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-semibold shadow-md uppercase tracking-wider"
                style={{
                  background: COLORS.blue,
                  color: COLORS.white,
                  letterSpacing: "1px"
                }}
              >
                {article.date}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3
                className="text-xl font-bold mb-2 leading-tight group-hover:text-[#1a1a1a] transition-colors duration-300"
                style={{ color: COLORS.blue }}
              >
                {article.title}
              </h3>
              <p className="mb-4 flex-1" style={{ color: COLORS.black }}>{article.summary}</p>
              <a
                href={article.link}
                className="inline-block mt-auto font-bold hover:underline transition-colors duration-200"
                style={{ color: COLORS.blue }}
              >
                Read More &rarr;
              </a>
            </div>
            {/* Animated border effect */}
            <span
              className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.black}, ${COLORS.blue})`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;