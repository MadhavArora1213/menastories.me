import React, { useState, useEffect } from "react";
import { mediaKitService } from "../services/mediaKitService";
import SEO from "../Components/SEO";
import StructuredData from "../Components/StructuredData";

// PDF Viewer Component
const PDFViewer = ({ url, title, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full min-h-[600px]"
            title={title}
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
};

const MediaKit = () => {
  const [mediaKits, setMediaKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfViewer, setPdfViewer] = useState({ isOpen: false, url: '', title: '' });

  useEffect(() => {
    loadMediaKits();
  }, []);

  const loadMediaKits = async () => {
    try {
      setLoading(true);
      const response = await mediaKitService.getAllMediaKits({
        status: 'published',
        limit: 10
      });
      setMediaKits(response.data.mediaKits || []);
    } catch (err) {
      console.error('Failed to load media kits:', err);
      setError('Failed to load media kits');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (mediaKitId, documentUrl, documentName) => {
    try {
      // Track view/download
      await mediaKitService.trackDownload(mediaKitId);
      // Open PDF in viewer
      setPdfViewer({
        isOpen: true,
        url: documentUrl,
        title: documentName || 'Media Kit Document'
      });
    } catch (err) {
      console.error('Failed to track download:', err);
    }
  };

  const handleDownload = async (mediaKitId, documentUrl) => {
    try {
      // Track download
      await mediaKitService.trackDownload(mediaKitId);
      // Trigger actual download
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to track download:', err);
    }
  };

  const closePdfViewer = () => {
    setPdfViewer({ isOpen: false, url: '', title: '' });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-4 border-[#162048] border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 tracking-wide drop-shadow-lg">
              Media Kit
            </h1>
            <p className="text-lg text-red-600">Error loading media kits. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Use the first published media kit for the main content, or fallback to default
  const mainMediaKit = mediaKits.length > 0 ? mediaKits[0] : null;

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
      <SEO
        title="Media Kit - Advertising & Brand Partnership Resources"
        description="Download our comprehensive media kit featuring audience demographics, advertising opportunities, brand guidelines, and partnership information for premium magazine advertising."
        keywords="media kit, advertising, brand guidelines, audience demographics, partnership opportunities, magazine advertising, brand assets, marketing resources"
        url="/media-kit"
        type="website"
      />

      {/* Structured Data for Media Kit */}
      <StructuredData
        type="media_kit"
        data={{
          title: "Media Kit - Advertising & Brand Partnership Resources",
          description: "Comprehensive media kit with audience insights, advertising opportunities, and brand guidelines",
          featuredImage: "/images/media-kit-featured.jpg",
          downloadUrl: mainMediaKit?.documents?.[0]?.url || "/downloads/neonpulse-media-kit-2025.pdf",
          fileSize: "4.2MB",
          fileFormat: "PDF",
          lastModified: mainMediaKit?.updatedAt || new Date().toISOString(),
          publisher: "Magazine Website"
        }}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#162048] mb-8 text-center tracking-wide drop-shadow-lg">
          Media Kit
        </h1>

        <p className="text-lg text-[#162048] text-center mb-12 max-w-2xl mx-auto font-semibold">
          {mainMediaKit?.description || "Download our comprehensive media kit to learn about advertising opportunities, audience demographics, and brand partnerships."}
        </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Audience Insights */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Audience Insights</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-bold text-[#162048] mb-2">Demographics</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-[#1a1a1a]">Age 18-34:</span>
                  <span className="font-bold text-[#162048]">68%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#1a1a1a]">Age 35-54:</span>
                  <span className="font-bold text-[#162048]">27%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#1a1a1a]">55+:</span>
                  <span className="font-bold text-[#162048]">5%</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-[#162048] mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Lifestyle</span>
                <span className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Entertainment</span>
                <span className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Technology</span>
                <span className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Fashion</span>
                <span className="bg-[#ffe000]/20 text-[#162048] px-3 py-1 rounded-full text-sm font-semibold">Business</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Digital Presence */}
        <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
          <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Digital Presence</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-[#162048] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <span className="text-[#1a1a1a] font-semibold">Monthly Visitors</span>
              </div>
              <span className="font-bold text-[#162048]">2.4M</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-[#162048] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span className="text-[#1a1a1a] font-semibold">Social Followers</span>
              </div>
              <span className="font-bold text-[#162048]">1.8M</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-[#162048] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span className="text-[#1a1a1a] font-semibold">Engagement Rate</span>
              </div>
              <span className="font-bold text-[#162048]">8.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Processed PDF Showcase */}
      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
        <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Latest Processed Content</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Featured Image */}
          <div className="text-center">
            <h3 className="font-bold text-[#162048] mb-4">Featured Image</h3>
            <div className="border-2 border-[#162048] rounded-xl p-4 bg-gray-50">
              <img
                src="/tech-conference-thumbnail.png"
                alt="Tech Conference Featured Image"
                className="w-full h-auto max-w-sm mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/images/placeholder-pdf.png';
                }}
              />
            </div>
            <p className="text-sm text-[#1a1a1a] mt-2">Auto-generated thumbnail from PDF content</p>
          </div>

          {/* PDF Preview */}
          <div className="text-center">
            <h3 className="font-bold text-[#162048] mb-4">Optimized PDF Document</h3>
            <div className="border-2 border-[#162048] rounded-xl p-4 bg-gray-50">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#162048] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-[#162048] font-semibold">Tech Conference PDF</p>
                  <p className="text-sm text-[#1a1a1a]">Optimized for performance</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#1a1a1a] mt-2">Compressed and optimized for faster loading</p>
          </div>
        </div>

        <div className="border-t-2 border-[#162048]/20 pt-6">
          <h3 className="font-bold text-[#162048] mb-4">Download Processed Files</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleViewPDF(null, '/tech-conference-optimized.pdf', 'Tech Conference - Optimized PDF')}
              className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Optimized PDF
            </button>
            <a
              href="/tech-conference-optimized.pdf"
              download
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Optimized PDF
            </a>
            <a
              href="/tech-conference-thumbnail.png"
              download
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Download Featured Image
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-8 mb-12 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#ffe000] rounded-full blur-2xl opacity-40"></div>
        <h2 className="text-2xl font-extrabold text-[#162048] mb-6">Advertising Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mainMediaKit?.advertisingOpportunities ? (
            mainMediaKit.advertisingOpportunities.slice(0, 3).map((opportunity, index) => (
              <div key={index} className="border-2 border-[#162048] rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffe000] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-[#162048] text-lg mb-2">{opportunity.name || `Opportunity ${index + 1}`}</h3>
                <p className="text-[#1a1a1a] text-sm">
                  {opportunity.description || 'Advertising opportunity description'}
                </p>
                {opportunity.pricing && (
                  <p className="text-[#162048] font-semibold text-sm mt-2">
                    {opportunity.pricing}
                  </p>
                )}
              </div>
            ))
          ) : (
            <>
              <div className="border-2 border-[#162048] rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffe000] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-[#162048] text-lg mb-2">Display Ads</h3>
                <p className="text-[#1a1a1a] text-sm">
                  Banner ads, sidebar placements, and custom ad units
                </p>
              </div>

              <div className="border-2 border-[#162048] rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffe000] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-[#162048] text-lg mb-2">Sponsored Content</h3>
                <p className="text-[#1a1a1a] text-sm">
                  Branded articles, product placements, and native advertising
                </p>
              </div>

              <div className="border-2 border-[#162048] rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffe000] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-[#162048] text-lg mb-2">Newsletter Ads</h3>
                <p className="text-[#1a1a1a] text-sm">
                  Reach our engaged subscribers with targeted email campaigns
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t-2 border-[#162048]/20 pt-6">
          <h3 className="font-bold text-[#162048] mb-4">Download Our Complete Media Kit</h3>
          <p className="text-[#1a1a1a] mb-6">
            {mainMediaKit?.content || "Get detailed information about our advertising rates, audience demographics, and brand guidelines."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {mainMediaKit?.documents ? (
              mainMediaKit.documents.slice(0, 2).map((doc, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  {/* Structured Data for PDF Document */}
                  <StructuredData
                    type="document"
                    data={{
                      title: doc.name || `Media Kit Document ${index + 1}`,
                      description: `Download ${doc.name || 'Media Kit Document'} - Comprehensive advertising and brand partnership resources`,
                      featuredImage: "/images/pdf-featured.jpg",
                      downloadUrl: doc.url,
                      fileSize: doc.fileSize || "4.2MB",
                      fileFormat: "PDF",
                      lastModified: doc.updatedAt || mainMediaKit?.updatedAt || new Date().toISOString(),
                      publisher: "Magazine Website",
                      keywords: ["media kit", "advertising", "brand guidelines", "marketing resources"]
                    }}
                  />

                  <button
                    onClick={() => handleViewPDF(mainMediaKit.id, doc.url, doc.name)}
                    className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View PDF
                  </button>
                  <button
                    onClick={() => handleDownload(mainMediaKit.id, doc.url)}
                    className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleViewPDF(mainMediaKit?.id, '/downloads/neonpulse-media-kit-2025.pdf', 'Media Kit 2025')}
                  className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  View PDF (4.2MB)
                </button>
                <a
                  href="/downloads/neonpulse-media-kit-2025.pdf"
                  download
                  className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </a>
              </div>
            )}
            <a
              href="mailto:ads@neonpulse.com?subject=Media Kit Request"
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Request Custom Kit
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#162048] p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-[#162048] mb-4 text-center">Brand Guidelines</h2>
        <p className="text-[#1a1a1a] mb-6 text-center">
          {mainMediaKit?.brandGuidelines?.logoUsage || "For partners and advertisers, our brand guidelines ensure consistent and effective collaborations."}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {mainMediaKit?.documents && mainMediaKit.documents.length > 1 ? (
            <button
              onClick={() => handleDownload(mainMediaKit.id, mainMediaKit.documents[1].url)}
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {mainMediaKit.documents[1].name || 'Download Brand Guidelines'}
            </button>
          ) : (
            <a
              href="/downloads/neonpulse-brand-guidelines.pdf"
              download
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#0f183a] transition-colors border-2 border-[#162048] shadow-lg text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Brand Guidelines
            </a>
          )}
        </div>

        {/* PDF Viewer Modal */}
        {pdfViewer.isOpen && (
          <PDFViewer
            url={pdfViewer.url}
            title={pdfViewer.title}
            onClose={closePdfViewer}
          />
        )}
      </div>
    </div>
  </div>
);
};

export default MediaKit;