import React, { useState, useEffect } from "react";
import downloadService from "../services/downloadService";
import SEO from "../Components/SEO";
import StructuredData from "../Components/StructuredData";

// File type icons component
const FileTypeIcon = ({ type }) => {
  const getIcon = () => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5 2H15.5L19 5.5V22H5V2H8.5ZM15 3.5V7H18.5L15 3.5ZM7 4V20H17V9H13V4H7ZM9 12H11V18H9V12ZM13 10H15V18H13V10Z"/>
          </svg>
        );
      case 'docx':
      case 'doc':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/>
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5 2H15.5L19 5.5V22H5V2H8.5ZM15 3.5V7H18.5L15 3.5ZM7 4V20H17V9H13V4H7ZM9 12H11V18H9V12ZM13 10H15V18H13V10Z"/>
          </svg>
        );
      case 'mp4':
      case 'avi':
      case 'mov':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
    }
  };

  return getIcon();
};

// Download card component
const DownloadCard = ({ download, onDownload }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-6 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#ffe000] rounded-full blur-2xl opacity-30"></div>

      {/* Structured Data for Download Item */}
      <StructuredData
        type="download"
        data={{
          title: download.title,
          description: download.description,
          featuredImage: download.featuredImage || "/images/download-featured.jpg",
          downloadUrl: download.fileUrl,
          fileSize: download.fileSize,
          fileFormat: download.fileType?.toUpperCase(),
          lastModified: download.updatedAt,
          downloadCount: download.downloadCount || 0,
          category: download.category,
          tags: download.tags,
          keywords: [download.category, ...(download.tags || []), download.fileType].filter(Boolean)
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#ffe000]/20 flex items-center justify-center">
              <FileTypeIcon type={download.fileType} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#162048] line-clamp-2">
                {download.title}
              </h3>
              <p className="text-sm text-[#1a1a1a] font-semibold mt-1">
                {download.category || 'General'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#ffe000] text-[#162048] border-2 border-[#162048]">
              {download.fileType?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>

        <p className="text-[#1a1a1a] text-sm mb-4 line-clamp-3 font-medium">
          {download.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between text-sm text-[#1a1a1a] mb-4 font-semibold">
          <span>Size: {formatFileSize(download.fileSize)}</span>
          <span>Updated: {formatDate(download.updatedAt)}</span>
        </div>

        {download.tags && download.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {download.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#ffe000]/20 text-[#162048] border border-[#162048]"
              >
                {tag}
              </span>
            ))}
            {download.tags.length > 3 && (
              <span className="text-xs text-[#1a1a1a] font-semibold">+{download.tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-[#1a1a1a] font-semibold">
            <svg className="w-4 h-4 mr-2 text-[#162048]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {download.downloadCount || 0} downloads
          </div>
          <button
            onClick={() => onDownload(download)}
            className="inline-flex items-center px-6 py-3 border-2 border-[#162048] text-sm font-extrabold rounded-full text-[#162048] bg-[#ffe000] hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadDownloads();
  }, [searchQuery, selectedCategory, sortBy]);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'published',
        limit: 50
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      params.sort_by = sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : 'downloadCount';
      params.sort_order = sortBy === 'oldest' ? 'ASC' : 'DESC';

      const response = await downloadService.getAllDownloads(params);
      setDownloads(response.data.downloads || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.downloads?.map(d => d.category).filter(Boolean) || [])];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to load downloads:', err);
      setError('Failed to load downloads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (download) => {
    try {
      // Track the download
      await downloadService.trackDownload(download.id);

      // Trigger the actual download
      const link = document.createElement('a');
      link.href = download.fileUrl;
      link.download = download.originalFilename || `${download.title}.${download.fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local download count
      setDownloads(prev =>
        prev.map(d =>
          d.id === download.id
            ? { ...d, downloadCount: (d.downloadCount || 0) + 1 }
            : d
        )
      );
    } catch (err) {
      console.error('Failed to download file:', err);
      // Still attempt the download even if tracking fails
      const link = document.createElement('a');
      link.href = download.fileUrl;
      link.download = download.originalFilename || `${download.title}.${download.fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDownloads();
  };

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
      <SEO
        title="Downloads & Resources - Free Reports, Guides & Media Kits"
        description="Access our comprehensive collection of free downloadable resources including reports, guides, media kits, brand assets, and marketing materials for premium content and advertising opportunities."
        keywords="downloads, resources, free reports, guides, media kits, brand assets, marketing materials, PDF downloads, digital resources, advertising resources"
        url="/downloads"
        type="website"
      />

      {/* Structured Data for Downloads Page */}
      <StructuredData
        type="downloads_page"
        data={{
          title: "Downloads & Resources - Free Reports, Guides & Media Kits",
          description: "Comprehensive collection of free downloadable resources, reports, guides, and marketing materials",
          featuredImage: "/images/downloads-featured.jpg",
          totalDownloads: downloads.reduce((sum, d) => sum + (d.downloadCount || 0), 0),
          availableFiles: downloads.length,
          categories: categories,
          lastUpdated: downloads.length > 0 ? downloads[0].updatedAt : new Date().toISOString()
        }}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 tracking-wide drop-shadow-lg">
            Downloads & Resources
          </h1>
          <p className="text-lg text-[#162048] max-w-3xl mx-auto font-semibold">
            Access our comprehensive collection of reports, guides, media kits, and other valuable resources.
            All downloads are free and available instantly.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Downloaded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Processed Content */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6 relative z-10">✨ Featured Processed Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Optimized PDF */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 2H15.5L19 5.5V22H5V2H8.5ZM15 3.5V7H18.5L15 3.5ZM7 4V20H17V9H13V4H7ZM9 12H11V18H9V12ZM13 10H15V18H13V10Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-[#162048] mb-2">Tech Conference PDF</h3>
                  <p className="text-[#1a1a1a] text-sm mb-4 font-medium">
                    Optimized for performance and faster loading. Compressed and processed for optimal delivery.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => window.open('/tech-conference-optimized.pdf', '_blank')}
                      className="inline-flex items-center px-4 py-2 border-2 border-[#162048] text-sm font-extrabold rounded-full text-[#162048] bg-[#ffe000] hover:bg-yellow-400 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View PDF
                    </button>
                    <a
                      href="/tech-conference-optimized.pdf"
                      download
                      className="inline-flex items-center px-4 py-2 border-2 border-[#162048] text-sm font-extrabold rounded-full text-white bg-[#162048] hover:bg-[#0f183a] transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <img
                    src="/tech-conference-thumbnail.png"
                    alt="Featured Image"
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-pdf.png';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-[#162048] mb-2">Featured Image</h3>
                  <p className="text-[#1a1a1a] text-sm mb-4 font-medium">
                    Auto-generated thumbnail from PDF content. Perfect for previews and social media sharing.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => window.open('/tech-conference-thumbnail.png', '_blank')}
                      className="inline-flex items-center px-4 py-2 border-2 border-[#162048] text-sm font-extrabold rounded-full text-[#162048] bg-[#ffe000] hover:bg-yellow-400 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      Preview
                    </button>
                    <a
                      href="/tech-conference-thumbnail.png"
                      download
                      className="inline-flex items-center px-4 py-2 border-2 border-[#162048] text-sm font-extrabold rounded-full text-white bg-[#162048] hover:bg-[#0f183a] transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#ffe000]/10 rounded-lg border border-[#ffe000]/30">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#162048] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-sm text-[#162048] font-semibold">
                <strong>Processing Results:</strong> PDF optimized by 0.23% (1027KB → 1024KB). Featured image generated automatically from PDF content.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Downloads</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadDownloads}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Downloads Found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No downloads are currently available.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {downloads.length} download{downloads.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Stats */}
      {downloads.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
            <div>
              <div className="text-4xl font-extrabold text-[#162048] mb-2">
                {downloads.length}
              </div>
              <div className="text-[#1a1a1a] font-semibold">Available Downloads</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#162048] mb-2">
                {downloads.reduce((sum, d) => sum + (d.downloadCount || 0), 0)}
              </div>
              <div className="text-[#1a1a1a] font-semibold">Total Downloads</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#162048] mb-2">
                {categories.length}
              </div>
              <div className="text-[#1a1a1a] font-semibold">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Downloads;