import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaEnvelope, FaLink, FaShare } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ShareButtons = ({ article, shareCount, onShare }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const shareUrl = `${window.location.origin}/articles/${article.slug || article.id}`;
  const shareText = `Check out this article: ${article.title}`;

  const handleShare = async (platform) => {
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`);
          break;
      }

      // Call the onShare callback if provided
      if (onShare) {
        onShare(platform);
      }

      setShowShareModal(false);
    } catch (err) {
      console.error('Failed to share:', err);
      toast.error('Failed to share article');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFacebook />
            <span>Share</span>
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            <FaTwitter />
            <span>Tweet</span>
          </button>

          <button
            onClick={() => handleShare('linkedin')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <FaLinkedin />
            <span>Share</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaWhatsapp />
            <span>Share</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaShare />
            <span>More</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {shareCount} shares
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Share Article
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaLink className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Copy Link</span>
                </button>

                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaEnvelope className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaFacebook className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaTwitter className="h-6 w-6 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FaLinkedin className="h-6 w-6 text-blue-700 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FaWhatsapp className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButtons;