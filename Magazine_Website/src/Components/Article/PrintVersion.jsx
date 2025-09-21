import React, { useEffect } from 'react';
import { FaTimes, FaPrint, FaDownload } from 'react-icons/fa';

const PrintVersion = ({ article, onClose }) => {
  useEffect(() => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-after: always; }
        .print-avoid-break { page-break-inside: avoid; }
        body { font-size: 12pt; line-height: 1.4; }
        h1 { font-size: 24pt; margin-bottom: 20pt; }
        h2 { font-size: 18pt; margin-bottom: 15pt; }
        h3 { font-size: 14pt; margin-bottom: 10pt; }
        p { margin-bottom: 10pt; text-align: justify; }
        .article-content img { max-width: 100%; height: auto; margin: 20pt 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/articles/${article.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.slug || article.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 no-print">
          <h2 className="text-xl font-bold text-gray-900">Print Preview</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPrint />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-8">
          <div className="max-w-3xl mx-auto">
            {/* Article Header */}
            <header className="text-center mb-8 print-break">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="text-xl text-gray-600 mb-6 italic">
                  {article.subtitle}
                </p>
              )}

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                <span>By {article.author?.name || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                <span>•</span>
                <span>{article.category?.name || 'General'}</span>
              </div>
            </header>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="mb-8 text-center">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="max-w-full h-auto mx-auto shadow-lg"
                />
                {article.imageCaption && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {article.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Article Content */}
            <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="article-content"
              />
            </article>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {article.author && (
              <div className="mt-8 pt-8 border-t border-gray-200 print-avoid-break">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
                <div className="flex items-start space-x-4">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-16 h-16 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {article.author.name}
                    </h4>
                    {article.author.bio && (
                      <p className="text-gray-700 leading-relaxed">
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Published by Magazine Website</p>
              <p>© {new Date().getFullYear()} All rights reserved</p>
              <p className="mt-2">URL: {window.location.href}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintVersion;