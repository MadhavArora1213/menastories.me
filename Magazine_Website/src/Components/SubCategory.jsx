import React from "react";

const SubCategory = ({
  title,
  description,
  tags = [],
  children,
  bgColor = "#ffffff",
  textColor = "#162048",
}) => (
  <div className="relative flex flex-col items-center justify-center py-20 mb-16" style={{ background: bgColor }}>
    <div className="text-center max-w-5xl mx-auto px-4">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center tracking-tight mb-6 leading-tight"
        style={{
          color: textColor,
        }}
      >
        <span className="bg-gradient-to-r from-[#162048] via-[#162048] to-[#162048]/90 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>

      {description && (
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          {description}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex gap-3 flex-wrap justify-center mb-8">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center bg-[#162048]/10 text-[#162048] px-4 py-2 rounded-full font-medium text-sm hover:bg-[#162048]/20 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {children}
    </div>
  </div>
);

export default SubCategory;