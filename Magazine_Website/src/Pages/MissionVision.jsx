import React from "react";

const missionImage = "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80";
const visionImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

const cardStyle = "bg-white rounded-2xl shadow-xl border-4 border-black flex flex-col md:flex-row items-center p-0 overflow-hidden transition-transform duration-300 hover:scale-[1.02]";
const sideStyle = "bg-black text-white flex flex-col items-center justify-center w-24 md:w-32 h-full py-8";
const imageStyle = "object-cover w-full h-64 md:h-[350px] rounded-none";
const contentStyle = "flex-1 px-6 py-6 flex flex-col justify-center";

const MissionVision = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen">
    <div className="container mx-auto px-2 md:px-4 py-12">
      <h1 className="text-5xl font-extrabold text-[#162048] mb-12 text-center tracking-wide drop-shadow-lg">
        Our Mission & Vision
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Mission Card */}
        <div className={cardStyle}>
          <div className={sideStyle}>
            <span className="text-5xl font-extrabold mb-4">1</span>
            <div className="flex flex-col items-center gap-2">
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
              <span className="w-2 h-2 rounded-full bg-[white]"></span>
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
              <span className="w-2 h-2 rounded-full bg-[white]"></span>
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full">
              <img src={missionImage} alt="Mission" className={imageStyle} />
            </div>
            <div className={contentStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-2 border-2 border-black rounded-xl font-bold text-black bg-white text-lg">MISSION</span>
              </div>
              <h2 className="text-2xl font-bold text-[#162048] mb-3 tracking-wide">
                Our Mission
              </h2>
              <p className="text-base md:text-lg text-[#1a1a1a] leading-relaxed">
                MAGAZINE’s mission is to inform, inspire, and empower our readers by sharing stories that matter.
                We are dedicated to delivering accurate, engaging, and diverse content that reflects the world we live in.
                Our team strives to elevate voices, foster understanding, and spark positive change in our communities.
              </p>
              <div className="flex justify-end mt-4">
                <span className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="w-4 h-2 rounded-full bg-black inline-block"></span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Vision Card */}
        <div className={cardStyle}>
          <div className={sideStyle}>
            <span className="text-5xl font-extrabold mb-4">2</span>
            <div className="flex flex-col items-center gap-2">
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
              <span className="w-2 h-2 rounded-full bg-[white]"></span>
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
              <span className="w-2 h-2 rounded-full bg-[rgb(246,246,246)]"></span>
              <svg width="60" height="20"><polyline points="0,20 20,0 40,20 60,0" stroke="#ffffff" strokeWidth="4" fill="none"/></svg>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full">
              <img src={visionImage} alt="Vision" className={imageStyle} />
            </div>
            <div className={contentStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-2 border-2 border-black rounded-xl font-bold text-black bg-white text-lg">VISION</span>
              </div>
              <h2 className="text-2xl font-bold text-[#162048] mb-3 tracking-wide">
                Our Vision
              </h2>
              <p className="text-base md:text-lg text-[#1a1a1a] leading-relaxed">
                MAGAZINE envisions a world where diverse voices are heard, and stories that matter are shared.
                We aim to be a catalyst for change, inspiring our readers to engage with the world around them
                and contribute to meaningful conversations. Through our content, we strive to create a more informed,
                empathetic, and connected society.
              </p>
              <div className="flex justify-end mt-4">
                <span className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="w-4 h-2 rounded-full bg-black inline-block"></span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MissionVision;