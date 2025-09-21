import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';

const ImageGallery = ({ images, articleTitle }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openModal = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentIndex(0);
    setIsFullscreen(false);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadImage = async (imageUrl, filename = 'image.jpg') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            onClick={() => openModal(image, index)}
          >
            <img
              src={image}
              alt={`${articleTitle} - Image ${index + 1}`}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {index + 1}/{images.length}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isFullscreen ? 'bg-black' : 'bg-black bg-opacity-90'
          }`}
          onClick={closeModal}
        >
          <div
            className={`relative max-w-5xl max-h-full ${isFullscreen ? 'w-full h-full' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <FaChevronLeft className="text-xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <FaChevronRight className="text-xl" />
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
              <button
                onClick={toggleFullscreen}
                className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                onClick={() => downloadImage(selectedImage, `${articleTitle}-image-${currentIndex + 1}.jpg`)}
                className="bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors"
                title="Download Image"
              >
                <FaDownload />
              </button>
            </div>

            {/* Main Image */}
            <img
              src={selectedImage}
              alt={`${articleTitle} - Image ${currentIndex + 1}`}
              className={`w-full h-auto max-h-full object-contain ${isFullscreen ? 'cursor-zoom-out' : ''}`}
              onClick={isFullscreen ? toggleFullscreen : undefined}
            />

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && !isFullscreen && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2 max-w-full overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(image);
                      setCurrentIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      index === currentIndex
                        ? 'border-white'
                        : 'border-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;