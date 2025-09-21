import React from "react";

const certificates = [
  {
    img: "https://images.pexels.com/photos/3768913/pexels-photo-3768913.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 1"
  },
  {
    img: "https://images.pexels.com/photos/461077/pexels-photo-461077.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 2"
  },
  {
    img: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 3"
  },
  {
    img: "https://images.pexels.com/photos/209698/pexels-photo-209698.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 4"
  },
  {
    img: "https://images.pexels.com/photos/325962/pexels-photo-325962.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 5"
  },
  {
    img: "https://images.pexels.com/photos/461077/pexels-photo-461077.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 6"
  },
  {
    img: "https://images.pexels.com/photos/3768913/pexels-photo-3768913.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 7"
  },
  {
    img: "https://images.pexels.com/photos/209698/pexels-photo-209698.jpeg?auto=compress&w=800&q=80",
    alt: "Certificate 8"
  }
];

const AwardsRecognition = () => (
  <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
    <div className="container mx-auto px-2 md:px-8">
      <h1 className="text-5xl font-extrabold text-[#162048] mb-10 text-center tracking-wide drop-shadow-lg">
        Awards & Recognition
      </h1>

      <div className="rounded-3xl border-4 border-[#162048] bg-white shadow-2xl p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {certificates.map((cert, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center rounded-xl border border-gray-300 bg-white shadow-md p-2 hover:scale-105 transition-transform duration-300"
              style={{
                width: "100%",
                height: "200px"
              }}
            >
              <img
                src={cert.img}
                alt={cert.alt}
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AwardsRecognition;
