import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flipbookService } from '../services/flipbookService';
import HTMLFlipBook from 'react-pageflip';
import SEO from '../Components/SEO';

// Import react-pdf for proper flipbook functionality
import { Document, Page, pdfjs } from 'react-pdf';

// Import react-pdf CSS styles for proper rendering
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker with fallback
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
} catch (error) {
  console.warn('Failed to configure PDF worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

// Memoized PDF Page Component for better performance
const MemoizedPDFPage = memo(({ pageNumber, scale, onLoadSuccess, onLoadError }) => (
  <Page
    key={`${pageNumber}-${scale}`} // Force re-render when scale changes
    pageNumber={pageNumber}
    scale={scale}
    renderTextLayer={true}
    renderAnnotationLayer={true}
    onLoadSuccess={onLoadSuccess}
    onLoadError={onLoadError}
    loading=""
    style={{
      margin: '0 auto',
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    }}
  />
));

MemoizedPDFPage.displayName = 'MemoizedPDFPage';

// Add react-pageflip CSS styles with full responsive design
const flipbookStyles = `
  .flipbook-container {
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .flipbook-container .page {
    background-color: white;
    box-shadow:
      0 2px 8px rgba(0,0,0,0.15),
      0 1px 3px rgba(0,0,0,0.1);
    border-radius: 4px;
    border: 1px solid #e8e8e8;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flipbook-container .page .page-content {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flipbook-container .page .pdf-page-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0 !important;
    padding: 8px !important;
    position: relative;
    gap: 8px;
  }

  .flipbook-container .page .pdf-page-wrapper::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 15px;
    bottom: 15px;
    width: 2px;
    background: linear-gradient(to bottom, #8B7355, #A0522D, #8B7355);
    box-shadow:
      0 0 4px rgba(0,0,0,0.2),
      inset 0 0 1px rgba(255,255,255,0.4);
    z-index: 10;
    transform: translateX(-50%);
    border-radius: 1px;
    opacity: 0.5;
  }

  .flipbook-container .pdf-left-page,
  .flipbook-container .pdf-right-page {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin: 0 !important;
    padding: 0 3px !important;
    position: relative;
    z-index: 2;
    max-width: 48%;
  }

  .flipbook-container .react-pdf__Page {
    margin: 0 auto !important;
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    height: 100% !important;
  }

  .flipbook-container .react-pdf__Page__canvas {
    margin: 0 auto !important;
    padding: 0 !important;
    display: block !important;
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
  }

  .flipbook-container .title-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    position: relative;
    z-index: 2;
    padding: 20px;
  }

  .flipbook-container .title-content {
    text-align: center;
    padding: 20px;
    max-width: 90%;
  }

  .flipbook-container .magazine-title {
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 900;
    color: #162048;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    line-height: 1.1;
  }

  .flipbook-container .magazine-subtitle {
    font-size: clamp(0.9rem, 2.5vw, 1.3rem);
    color: #6c757d;
    margin-bottom: 20px;
    font-weight: 300;
  }

  .flipbook-container .magazine-meta {
    font-size: clamp(0.8rem, 2vw, 1rem);
    color: #495057;
    line-height: 1.4;
  }

  .flipbook-container .magazine-meta p {
    margin: 6px 0;
    font-weight: 500;
  }

  /* Performance optimizations */
  .flipbook-container .page {
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .flipbook-container .page-content {
    contain: layout style paint;
  }

  .flipbook-container .pdf-page-wrapper {
    contain: layout style;
  }

  /* Smooth transitions for better UX */
  .flipbook-container .page {
    transition: opacity 0.3s ease-in-out;
  }

  .flipbook-container .page.loading {
    opacity: 0.7;
  }

  .flipbook-container .page.loaded {
    opacity: 1;
  }

  /* Optimize rendering */
  .flipbook-container {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Responsive Design Breakpoints */
  
  /* Extra Large Screens (1200px+) */
  @media (min-width: 1200px) {
    .flipbook-container .page .pdf-page-wrapper {
      padding: 12px !important;
      gap: 12px;
    }
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      padding: 0 6px !important;
    }
  }

  /* Large Screens (992px - 1199px) */
  @media (max-width: 1199px) and (min-width: 992px) {
    .flipbook-container .page .pdf-page-wrapper {
      padding: 10px !important;
      gap: 10px;
    }
  }

  /* Medium Screens (768px - 991px) */
  @media (max-width: 991px) and (min-width: 768px) {
    .flipbook-container .page .pdf-page-wrapper {
      padding: 8px !important;
      gap: 8px;
    }
    
    .flipbook-container .page .pdf-page-wrapper::after {
      top: 12px;
      bottom: 12px;
      width: 1.5px;
    }
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      padding: 0 2px !important;
    }
  }

  /* Small Screens (576px - 767px) */
  @media (max-width: 767px) and (min-width: 576px) {
    .flipbook-container .page .pdf-page-wrapper {
      flex-direction: column;
      gap: 8px;
      padding: 8px !important;
    }
    
    .flipbook-container .page .pdf-page-wrapper::after {
      left: 15px;
      right: 15px;
      top: 50%;
      bottom: auto;
      height: 1.5px;
      width: auto;
      transform: translateY(-50%);
    }
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      max-width: 100%;
      flex: none;
      height: 47%;
      padding: 2px !important;
    }
  }

  /* Extra Small Screens (575px and below) */
  @media (max-width: 575px) {
    .flipbook-container .page .pdf-page-wrapper {
      flex-direction: column;
      gap: 5px;
      padding: 5px !important;
    }
    
    .flipbook-container .page .pdf-page-wrapper::after {
      left: 10px;
      right: 10px;
      top: 50%;
      bottom: auto;
      height: 1px;
      width: auto;
      transform: translateY(-50%);
      opacity: 0.3;
    }
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      max-width: 100%;
      flex: none;
      height: 47%;
      padding: 1px !important;
    }
    
    .flipbook-container .title-page {
      padding: 10px;
    }
    
    .flipbook-container .title-content {
      padding: 15px;
    }
  }

  /* Portrait Orientation Adjustments */
  @media (orientation: portrait) and (max-width: 768px) {
    .flipbook-container .page .pdf-page-wrapper {
      flex-direction: column;
    }
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      max-width: 100%;
      height: 47%;
    }
  }

  /* Landscape Orientation on Mobile */
  @media (orientation: landscape) and (max-height: 500px) {
    .flipbook-container .magazine-title {
      font-size: clamp(1.2rem, 3vw, 2rem);
      margin-bottom: 10px;
    }
    
    .flipbook-container .magazine-subtitle {
      font-size: clamp(0.8rem, 2vw, 1rem);
      margin-bottom: 15px;
    }
    
    .flipbook-container .magazine-meta {
      font-size: clamp(0.7rem, 1.5vw, 0.9rem);
    }
    
    .flipbook-container .title-content {
      padding: 15px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = flipbookStyles;
  document.head.appendChild(styleSheet);
}

const Flipbook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on the list view or individual view based on pathname
  const isListView = location.pathname === '/flipbook';


  // Theme variables for consistent styling
  const isDark = false; // Assuming light theme for flipbook page
  const textMain = isDark ? 'text-white' : 'text-black';
  const cardBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-black/10';

  // Responsive state management
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Optimized state management with useMemo for derived values
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [magazine, setMagazine] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // React-pageflip flipbook state
  const [pages, setPages] = useState([]);
  const [usePdfRendering, setUsePdfRendering] = useState(true);
  const flipbookRef = useRef(null);

  // Magazine list state
  const [magazines, setMagazines] = useState([]);
  const [magazinesLoading, setMagazinesLoading] = useState(false);
  const [magazinesError, setMagazinesError] = useState(null);

  // Performance optimizations
  const [pageLoadStates, setPageLoadStates] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Responsive calculations
  const isMobile = windowSize.width <= 768;
  const isTablet = windowSize.width > 768 && windowSize.width <= 1024;
  const isDesktop = windowSize.width > 1024;

  // Dynamic flipbook dimensions based on screen size
  const flipbookDimensions = useMemo(() => {
    if (isMobile) {
      return {
        width: Math.min(windowSize.width - 40, 400),
        height: Math.min(windowSize.height - 300, 500)
      };
    } else if (isTablet) {
      return {
        width: Math.min(windowSize.width - 80, 700),
        height: Math.min(windowSize.height - 250, 550)
      };
    } else {
      return {
        width: Math.min(windowSize.width - 120, 900),
        height: Math.min(windowSize.height - 200, 650)
      };
    }
  }, [windowSize, isMobile, isTablet]);

  // Dynamic scale based on screen size
  const responsiveScale = useMemo(() => {
    if (isMobile) {
      return Math.min(scale, 0.6);
    } else if (isTablet) {
      return Math.min(scale, 0.8);
    }
    return scale;
  }, [scale, isMobile, isTablet]);

  // Memoized calculations to prevent unnecessary re-renders
  const flipbookPages = useMemo(() => Math.ceil(numPages / 2) + 1, [numPages]);

  const pageDisplayText = useMemo(() => {
    if (!numPages) return '';
    if (currentPage === 0) return 'Title Page';
    return `Pages ${(currentPage - 1) * 2 + 1}-${Math.min(currentPage * 2, numPages)} of ${numPages}`;
  }, [currentPage, numPages]);

  // Backend URL memoized
  const backendUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000', []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug scale changes
  useEffect(() => {
    console.log('Scale changed to:', responsiveScale);
  }, [responsiveScale]);

  const loadMagazine = useCallback(async () => {
    if (!id || isInitialized) return;

    try {
      setLoading(true);
      setError(null);
      setIsInitialized(true);

      console.log('=== FRONTEND DEBUG ===');
      console.log('Loading magazine with ID:', id);
      console.log('Backend URL:', backendUrl);

      const magazineData = await flipbookService.getFlipbookMagazineById(id);
      setMagazine(magazineData.magazine);

      console.log('Magazine loaded successfully:', magazineData.magazine.title);

      // Load page images for flipbook
      await loadPageImages(id);

      // Use the memoized backend URL
      const pdfUrl = `${backendUrl}/flipbook/download/${id}`;
      console.log('PDF download URL:', pdfUrl);
      setPdfFile(pdfUrl);
    } catch (err) {
      console.error('Failed to load magazine:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load magazine data');
      setPdfLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [id, isInitialized, backendUrl]);

  // Load magazine data if ID is provided, otherwise load magazine list
  useEffect(() => {
    if (isListView) {
      loadMagazines();
    } else if (id) {
      loadMagazine();
    }
  }, [isListView, id, loadMagazine]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      if (flipbookRef.current?.pageFlip) {
        try {
          // Reset flipbook state
          setCurrentPage(0);
          setIsInitialized(false);
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      }
    };
  }, []);

  const loadMagazines = async () => {
    try {
      setMagazinesLoading(true);
      setMagazinesError(null);
      const response = await flipbookService.getFlipbookMagazines({ limit: 50 });
      setMagazines(response.magazines || []);
    } catch (err) {
      console.error('Failed to load magazines:', err);
      setMagazinesError('Failed to load magazines');
    } finally {
      setMagazinesLoading(false);
    }
  };

  const loadPageImages = async (magazineId) => {
    try {
      console.log('Loading page images for magazine:', magazineId);
      const pagesData = await flipbookService.getFlipbookPages(magazineId);
      console.log('Received pages data:', pagesData);
      console.log('Pages array:', pagesData.pages);
      console.log('Pages length:', pagesData.pages?.length || 0);

      // Fix image URLs to use correct backend path
      const fixedPages = (pagesData.pages || []).map(page => ({
        ...page,
        imageUrl: page.imageUrl ? page.imageUrl.replace('/storage', '/api/storage') : page.imageUrl,
        thumbnailUrl: page.thumbnailUrl ? page.thumbnailUrl.replace('/storage', '/api/storage') : page.thumbnailUrl
      }));

      // Log first few corrected image URLs for debugging
      if (fixedPages && fixedPages.length > 0) {
        console.log('Sample corrected image URLs:');
        fixedPages.slice(0, 3).forEach((page, index) => {
          console.log(`Page ${index + 1} corrected URL:`, page.imageUrl);
        });
      }

      setPages(fixedPages);
      setNumPages(pagesData.magazine?.totalPages || 0);
    } catch (err) {
      console.error('Failed to load page images:', err);
      setError('Failed to load magazine pages');
    }
  };

  // Optimized navigation functions with error handling
  const nextPage = useCallback(() => {
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flipNext();
      } catch (error) {
        console.error('Error flipping next:', error);
        setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));
      }
    } else {
      setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));
    }
  }, [flipbookPages]);

  const prevPage = useCallback(() => {
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flipPrev();
      } catch (error) {
        console.error('Error flipping prev:', error);
        setCurrentPage(prev => Math.max(prev - 1, 0));
      }
    } else {
      setCurrentPage(prev => Math.max(prev - 1, 0));
    }
  }, []);

  const goToPage = useCallback((pageNumber) => {
    const validPage = Math.max(0, Math.min(pageNumber, flipbookPages - 1));
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flip(validPage);
      } catch (error) {
        console.error('Error flipping to page:', error);
        setCurrentPage(validPage);
      }
    } else {
      setCurrentPage(validPage);
    }
  }, [flipbookPages]);

  // Zoom and Fullscreen handlers
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      flipbookRef.current?.requestFullscreen();
    }
  }, []);

  // Magazines List View (when on /flipbook path)
  if (isListView) {
    return (
      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex flex-col">
        <SEO
          title="Digital Magazine Library"
          description="Explore our interactive digital magazine collection. Experience premium content through our advanced flipbook technology with stunning visuals and engaging reading experience."
          keywords="digital magazines, flipbook, interactive magazines, digital library, online magazines, magazine reader"
          url="/flipbook"
          type="website"
        />

        <div className="container mx-auto px-4 max-w-7xl flex flex-col justify-center items-center py-8">
          {/* Header */}
          <div className="text-center mb-12 mt-32">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">
                <svg className="w-10 h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#162048] mb-4 tracking-wide drop-shadow-lg">
              DIGITAL MAGAZINE LIBRARY
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Explore Our Collection of Interactive Flipbooks
            </p>
            <p className="text-lg text-gray-500">
              Click on any magazine to start reading
            </p>
          </div>

          {/* Magazines Grid */}
          <div className="w-full">
            {magazinesLoading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#e3e7f7] border-t-[#162048] mb-4"></div>
                <span className="text-[#162048] font-bold text-lg">Loading Magazines...</span>
                <span className="text-gray-600 text-sm mt-2">Fetching your digital library</span>
              </div>
            ) : magazinesError ? (
              <div className={`${cardBg} p-8 rounded-lg border text-center`}>
                <svg className="w-16 h-16 text-red-500 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span className="text-red-600 font-bold text-lg">Failed to Load Magazines</span>
                <span className="text-gray-600 text-sm mt-2 block">{magazinesError}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors border border-yellow-600"
                >
                  Try Again
                </button>
              </div>
            ) : magazines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {magazines.map((magazine) => (
                  <div
                    key={magazine.id}
                    onClick={() => navigate(`/flipbook/${magazine.id}`)}
                    className={`${cardBg} p-6 rounded-lg border cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                  >
                    {/* Magazine Cover/Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
                      {magazine.coverImage || magazine.thumbnail ? (
                        <img
                          src={magazine.coverImage || magazine.thumbnail}
                          alt={magazine.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${magazine.coverImage || magazine.thumbnail ? 'hidden' : 'flex'}`}>
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                    </div>

                    {/* Magazine Info */}
                    <div>
                      <h3 className={`text-lg font-bold ${textMain} mb-2 line-clamp-2`}>
                        {magazine.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {magazine.description || 'Interactive digital magazine experience'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          {magazine.author?.name || 'Unknown Author'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          {magazine.totalPages || 'N/A'} Pages
                        </span>
                      </div>
                      {magazine.createdAt && (
                        <div className="mt-3 text-xs text-gray-400">
                          Published: {new Date(magazine.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${cardBg} p-8 rounded-lg border text-center`}>
                <svg className="w-16 h-16 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0H8"></path>
                </svg>
                <span className={`${textMain} font-bold text-lg`}>No Magazines Available</span>
                <span className="text-gray-600 text-sm mt-2 block">Check back later for new publications</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Individual magazine view
  if (magazine && !error) {
    return (
      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex flex-col">
        <SEO
          title={magazine.title}
          description={magazine.description || `Read ${magazine.title} in our interactive digital flipbook format. Experience premium content with stunning visuals and smooth page transitions.`}
          keywords={`digital magazine, flipbook, ${magazine.title}, interactive reading, digital publication`}
          image={magazine.coverImage || magazine.thumbnail}
          url={`/flipbook/${id}`}
          type="article"
          article={{
            title: magazine.title,
            description: magazine.description,
            publishedAt: magazine.createdAt,
            modifiedAt: magazine.updatedAt
          }}
          author={magazine.author}
        />

        <div className="container mx-auto px-4 max-w-6xl flex flex-col justify-center items-center py-8">
          {/* Header */}
          <div className="text-center mb-12 mt-32">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">
                <svg className="w-10 h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#162048] mb-4 tracking-wide drop-shadow-lg">
              {magazine ? magazine.title : 'DIGITAL MAGAZINE'}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {magazine ? magazine.description : 'Interactive Flipbook Experience'}
            </p>
            <p className="text-lg text-gray-500">
              {magazine ? `By ${magazine.author?.name || 'Unknown Author'}` : 'Professional Magazine Reader'}
            </p>
            {numPages && (
              <div className="mt-4 flex justify-center">
                <div className="bg-green-50 inline-block px-4 py-2 rounded-full border-2 border-green-200">
                  <span className="text-green-800 font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Interactive Flipbook: {pageDisplayText}
                  </span>
                </div>
              </div>
            )}

            {/* Flipbook Instructions */}
            {pages.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9M7 11H17V13H7V11M7 15H17V17H7V15M7 19H13V21H7V19Z"/>
                  </svg>
                  <strong>Flipbook Controls:</strong> Click page edges to turn • Use navigation buttons • Drag to flip
                </p>
              </div>
            )}
          </div>


          {/* Flipbook Container */}
          <div className="flex justify-center items-center w-full">
            <div className="relative w-full max-w-6xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048]">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#e3e7f7] border-t-[#162048] mb-4"></div>
                  <span className="text-[#162048] font-bold text-lg">Loading Magazine...</span>
                  <span className="text-gray-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Preparing your reading experience
                  </span>
                  <div className="mt-4 flex space-x-1">
                    <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce"></div>
                  </div>
                </div>
              ) : pages.length > 0 ? (
                <div className="bg-white rounded-lg shadow-xl border-4 border-[#162048] p-4">
                  {/* Flipbook Controls */}
                  <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          zoomOut();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                        disabled={scale <= 0.5}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                        </svg>
                      </button>
                      <span className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          zoomIn();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom In"
                        disabled={scale >= 3.0}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          resetZoom();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer"
                        title="Reset Zoom"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="bg-[#162048] text-white px-4 py-2 rounded hover:bg-black transition-colors text-sm"
                        title="Toggle Fullscreen"
                      >
                        {isFullscreen ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3H3m18 0v18M3 21V3m18 0l-5.5 5.5M3 21l5.5-5.5m13-10L21 3l-5.5 5.5M3 21l5.5-5.5M21 3l-5.5 5.5M3 21l5.5-5.5"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* React-pageflip Flipbook Container */}
                  <div className="flex justify-center items-center w-full" style={{ height: '650px' }}>
                    {usePdfRendering && pdfFile ? (
                      <Document
                        file={pdfFile}
                        onLoadSuccess={({ numPages: pdfNumPages }) => {
                          console.log('PDF loaded with', pdfNumPages, 'pages');
                          setNumPages(pdfNumPages);
                        }}
                        onLoadError={(error) => {
                          console.error('Failed to load PDF:', error);
                          setPdfLoadError(true);
                          setUsePdfRendering(false);
                        }}
                        loading="Loading PDF..."
                        className="flipbook-container"
                      >
                        <div style={{ 
                          margin: '0 auto', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          width: '100%',
                          height: '100%'
                        }}>
                          <HTMLFlipBook
                            ref={flipbookRef}
                            width={900}
                            height={650}
                            size="fixed"
                            maxShadowOpacity={0.7}
                            showCover={true}
                            mobileScrollSupport={true}
                            onFlip={(e) => {
                              console.log('Flip event:', e);
                              setCurrentPage(e.data);
                            }}
                            className="flipbook-container"
                            style={{
                              margin: '0 auto',
                              display: 'block'
                            }}
                          >
                          {Array.from({ length: Math.ceil(numPages / 2) + 1 }, (_, index) => {
                            return (
                              <div key={index} className="page loaded">
                                <div className="page-content">
                                  {index === 0 ? (
                                    // Title/Cover Page
                                    <div className="title-page">
                                      <div className="title-content">
                                        <h1 className="magazine-title">{magazine?.title || 'DIGITAL MAGAZINE'}</h1>
                                        <p className="magazine-subtitle">{magazine?.description || 'Interactive Digital Experience'}</p>
                                        <div className="magazine-meta">
                                          <p>By {magazine?.author?.name || 'Professional Publisher'}</p>
                                          <p>{numPages} Pages • Interactive Flipbook</p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="pdf-page-wrapper">
                                      {/* Left page */}
                                      {((index - 1) * 2 + 1) <= numPages && (
                                        <div className="pdf-left-page">
                                          <MemoizedPDFPage
                                            pageNumber={(index - 1) * 2 + 1}
                                            scale={0.8}
                                            onLoadSuccess={() => {
                                              setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 1}`, 'loaded')));
                                            }}
                                            onLoadError={(error) => {
                                              console.error(`Failed to load page ${(index - 1) * 2 + 1}:`, error);
                                              setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 1}`, 'error')));
                                            }}
                                          />
                                        </div>
                                      )}
                                      {/* Right page */}
                                      {((index - 1) * 2 + 2) <= numPages && (
                                        <div className="pdf-right-page">
                                          <MemoizedPDFPage
                                            pageNumber={(index - 1) * 2 + 2}
                                            scale={0.8}
                                            onLoadSuccess={() => {
                                              setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 2}`, 'loaded')));
                                            }}
                                            onLoadError={(error) => {
                                              console.error(`Failed to load page ${(index - 1) * 2 + 2}:`, error);
                                              setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 2}`, 'error')));
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          </HTMLFlipBook>
                        </div>
                      </Document>
                    ) : (
                      <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <HTMLFlipBook
                          ref={flipbookRef}
                          width={900}
                          height={650}
                          size="fixed"
                          minWidth={400}
                          maxWidth={1000}
                          minHeight={300}
                          maxHeight={800}
                          maxShadowOpacity={0.5}
                          showCover={true}
                          mobileScrollSupport={true}
                          onFlip={(e) => {
                            console.log('Flip event:', e);
                            setCurrentPage(e.data);
                          }}
                          className="flipbook-container"
                        >
                        {pages.filter(page => page && page.imageUrl).map((page, index) => (
                          <div key={page.id || index} className="page">
                            <div className="page-content">
                              <img
                                src={page.imageUrl}
                                alt={`Page ${page.pageNumber || index + 1}`}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                onLoad={() => console.log(`Page ${page.pageNumber || index + 1} loaded successfully`)}
                                onError={(e) => {
                                  console.error(`Failed to load page ${page.pageNumber || index + 1}:`, e.target.src);
                                  // Show a placeholder with correct page number
                                  const pageNum = page.pageNumber || index + 1;
                                  const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" font-size="18" fill="#999" text-anchor="middle" dy=".3em">Page ${pageNum}</text></svg>`;
                                  e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        </HTMLFlipBook>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048]">
                  <svg className="w-16 h-16 text-[#162048] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="text-[#162048] font-bold text-lg">No PDF Available</span>
                  <span className="text-gray-600 text-sm mt-2">Unable to load magazine content</span>
                </div>
              )}
            </div>
          </div>




          {/* Navigation Controls */}
          {numPages && flipbookPages > 1 && pages.length > 0 && (
            <div className="flex justify-center items-center space-x-6 mb-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`px-8 py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center ${
                  currentPage === 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous Page
              </button>

              <div className="text-[#162048] text-center bg-[#e3e7f7] px-8 py-4 rounded-lg shadow-lg border-2 border-[#162048]">
                <p className="text-xl font-bold">
                  {currentPage === 0 ? 'Title Page' : `Spread ${currentPage} of ${flipbookPages - 1}`}
                </p>
                <p className="text-sm text-gray-600">Interactive Flipbook Experience</p>
                <div className="flex justify-center mt-2 space-x-1">
                  {Array.from({ length: Math.min(flipbookPages, 10) }, (_, i) => {
                    const pageNum = Math.floor((i / Math.min(flipbookPages, 10)) * flipbookPages);
                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          Math.abs(currentPage - pageNum) <= 1
                            ? 'bg-[#162048] scale-125'
                            : 'bg-gray-400 hover:bg-[#162048]'
                        }`}
                        title={pageNum === 0 ? 'Go to title page' : `Go to spread ${pageNum}`}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === flipbookPages - 1}
                className={`px-8 py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center ${
                  currentPage === flipbookPages - 1
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
                }`}
              >
                Next Page
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}


          {/* Enhanced Controls */}
          {pdfFile && (
            <div className="flex justify-center space-x-4 mb-8 flex-wrap">
              <a
                href={`${backendUrl}/flipbook/download/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  console.log('=== DOWNLOAD LINK CLICKED ===');
                  console.log('Download URL:', `${backendUrl}/flipbook/download/${id}`);
                  console.log('Magazine ID:', id);
                  console.log('Backend URL:', backendUrl);
                }}
                className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open PDF
              </a>
              <a
                href={`${backendUrl}/flipbook/download/${id}`}
                download="Magazine.pdf"
                onClick={(e) => {
                  console.log('=== DOWNLOAD LINK CLICKED ===');
                  console.log('Download URL:', `${backendUrl}/flipbook/download/${id}`);
                  console.log('Magazine ID:', id);
                  console.log('Backend URL:', backendUrl);
                }}
                className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-black transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Individual flipbook view
  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#162048] mb-2">Unable to Load Magazine</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#ffe000] text-[#162048] font-extrabold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Try Again
              </button>
              <button
                onClick={() => navigate('/flipbook')}
                className="bg-[#162048] text-white font-extrabold px-8 py-3 rounded-full hover:bg-black transition-colors border-2 border-[#162048] shadow-lg flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex flex-col">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col justify-center items-center py-8">
        {/* Header */}
        <div className="text-center mb-12 mt-32">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">
              <svg className="w-10 h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#162048] mb-4 tracking-wide drop-shadow-lg">
            {magazine ? magazine.title : 'DIGITAL MAGAZINE'}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {magazine ? magazine.description : 'Interactive Flipbook Experience'}
          </p>
          <p className="text-lg text-gray-500">
            {magazine ? `By ${magazine.author?.name || 'Unknown Author'}` : 'Professional Magazine Reader'}
          </p>
          {numPages && (
            <div className="mt-4 flex justify-center">
              <div className="bg-green-50 inline-block px-4 py-2 rounded-full border-2 border-green-200">
                <span className="text-green-800 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  Interactive Flipbook: {pageDisplayText}
                </span>
              </div>
            </div>
          )}

          {/* Flipbook Instructions */}
          {pages.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9M7 11H17V13H7V11M7 15H17V17H7V15M7 19H13V21H7V19Z"/>
                </svg>
                <strong>Flipbook Controls:</strong> Click page edges to turn • Use navigation buttons • Drag to flip
              </p>
            </div>
          )}
        </div>


        {/* Flipbook Container */}
        <div className="flex justify-center items-center w-full">
          <div className="relative w-full max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#e3e7f7] border-t-[#162048] mb-4"></div>
                <span className="text-[#162048] font-bold text-lg">Loading Magazine...</span>
                <span className="text-gray-600 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Preparing your reading experience
                </span>
                <div className="mt-4 flex space-x-1">
                  <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce"></div>
                </div>
              </div>
            ) : pages.length > 0 ? (
              <div className="bg-white rounded-lg shadow-xl border-4 border-[#162048] p-4">
                {/* Flipbook Controls */}
                <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        zoomOut();
                      }}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Zoom Out"
                      disabled={scale <= 0.5}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                      </svg>
                    </button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        zoomIn();
                      }}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Zoom In"
                      disabled={scale >= 3.0}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        resetZoom();
                      }}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-3 py-2 rounded text-sm transition-colors duration-200 cursor-pointer"
                      title="Reset Zoom"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="bg-[#162048] text-white px-4 py-2 rounded hover:bg-black transition-colors text-sm"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3H3m18 0v18M3 21V3m18 0l-5.5 5.5M3 21l5.5-5.5m13-10L21 3l-5.5 5.5M3 21l5.5-5.5M21 3l-5.5 5.5M3 21l5.5-5.5"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* React-pageflip Flipbook Container */}
                <div className="flex justify-center items-center w-full" style={{ height: '650px' }}>
                  {usePdfRendering && pdfFile ? (
                    <Document
                      file={pdfFile}
                      onLoadSuccess={({ numPages: pdfNumPages }) => {
                        console.log('PDF loaded with', pdfNumPages, 'pages');
                        setNumPages(pdfNumPages);
                      }}
                      onLoadError={(error) => {
                        console.error('Failed to load PDF:', error);
                        setPdfLoadError(true);
                        setUsePdfRendering(false);
                      }}
                      loading="Loading PDF..."
                      className="flipbook-container"
                    >
                      <div style={{ 
                        margin: '0 auto', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        width: '100%',
                        height: '100%'
                      }}>
                        <HTMLFlipBook
                          ref={flipbookRef}
                          width={900}
                          height={650}
                          size="fixed"
                          maxShadowOpacity={0.7}
                          showCover={true}
                          mobileScrollSupport={true}
                          onFlip={(e) => {
                            console.log('Flip event:', e);
                            setCurrentPage(e.data);
                          }}
                          className="flipbook-container"
                          style={{
                            margin: '0 auto',
                            display: 'block'
                          }}
                        >
                        {Array.from({ length: Math.ceil(numPages / 2) + 1 }, (_, index) => {
                          return (
                            <div key={index} className="page loaded">
                              <div className="page-content">
                                {index === 0 ? (
                                  // Title/Cover Page
                                  <div className="title-page">
                                    <div className="title-content">
                                      <h1 className="magazine-title">{magazine?.title || 'DIGITAL MAGAZINE'}</h1>
                                      <p className="magazine-subtitle">{magazine?.description || 'Interactive Digital Experience'}</p>
                                      <div className="magazine-meta">
                                        <p>By {magazine?.author?.name || 'Professional Publisher'}</p>
                                        <p>{numPages} Pages • Interactive Flipbook</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pdf-page-wrapper">
                                    {/* Left page */}
                                    {((index - 1) * 2 + 1) <= numPages && (
                                      <div className="pdf-left-page">
                                        <MemoizedPDFPage
                                          pageNumber={(index - 1) * 2 + 1}
                                          scale={0.8}
                                          onLoadSuccess={() => {
                                            setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 1}`, 'loaded')));
                                          }}
                                          onLoadError={(error) => {
                                            console.error(`Failed to load page ${(index - 1) * 2 + 1}:`, error);
                                            setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 1}`, 'error')));
                                          }}
                                        />
                                      </div>
                                    )}
                                    {/* Right page */}
                                    {((index - 1) * 2 + 2) <= numPages && (
                                      <div className="pdf-right-page">
                                        <MemoizedPDFPage
                                          pageNumber={(index - 1) * 2 + 2}
                                          scale={0.8}
                                          onLoadSuccess={() => {
                                            setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 2}`, 'loaded')));
                                          }}
                                          onLoadError={(error) => {
                                            console.error(`Failed to load page ${(index - 1) * 2 + 2}:`, error);
                                            setPageLoadStates(prev => new Map(prev.set(`page-${(index - 1) * 2 + 2}`, 'error')));
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        </HTMLFlipBook>
                      </div>
                    </Document>
                  ) : (
                    <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <HTMLFlipBook
                        ref={flipbookRef}
                        width={900}
                        height={650}
                        size="fixed"
                        minWidth={400}
                        maxWidth={1000}
                        minHeight={300}
                        maxHeight={800}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={(e) => {
                          console.log('Flip event:', e);
                          setCurrentPage(e.data);
                        }}
                        className="flipbook-container"
                      >
                      {pages.filter(page => page && page.imageUrl).map((page, index) => (
                        <div key={page.id || index} className="page">
                          <div className="page-content">
                            <img
                              src={page.imageUrl}
                              alt={`Page ${page.pageNumber || index + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onLoad={() => console.log(`Page ${page.pageNumber || index + 1} loaded successfully`)}
                              onError={(e) => {
                                console.error(`Failed to load page ${page.pageNumber || index + 1}:`, e.target.src);
                                // Show a placeholder with correct page number
                                const pageNum = page.pageNumber || index + 1;
                                const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" font-size="18" fill="#999" text-anchor="middle" dy=".3em">Page ${pageNum}</text></svg>`;
                                e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      </HTMLFlipBook>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048]">
                <svg className="w-16 h-16 text-[#162048] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="text-[#162048] font-bold text-lg">No PDF Available</span>
                <span className="text-gray-600 text-sm mt-2">Unable to load magazine content</span>
              </div>
            )}
          </div>
        </div>




        {/* Navigation Controls */}
        {numPages && flipbookPages > 1 && pages.length > 0 && (
          <div className="flex justify-center items-center space-x-6 mb-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-8 py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center ${
                currentPage === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous Page
            </button>

            <div className="text-[#162048] text-center bg-[#e3e7f7] px-8 py-4 rounded-lg shadow-lg border-2 border-[#162048]">
              <p className="text-xl font-bold">
                {currentPage === 0 ? 'Title Page' : `Spread ${currentPage} of ${flipbookPages - 1}`}
              </p>
              <p className="text-sm text-gray-600">Interactive Flipbook Experience</p>
              <div className="flex justify-center mt-2 space-x-1">
                {Array.from({ length: Math.min(flipbookPages, 10) }, (_, i) => {
                  const pageNum = Math.floor((i / Math.min(flipbookPages, 10)) * flipbookPages);
                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        Math.abs(currentPage - pageNum) <= 1
                          ? 'bg-[#162048] scale-125'
                          : 'bg-gray-400 hover:bg-[#162048]'
                      }`}
                      title={pageNum === 0 ? 'Go to title page' : `Go to spread ${pageNum}`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === flipbookPages - 1}
              className={`px-8 py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center ${
                currentPage === flipbookPages - 1
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
              }`}
            >
              Next Page
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}


        {/* Enhanced Controls */}
        {pdfFile && (
          <div className="flex justify-center space-x-4 mb-8 flex-wrap">
            <a
              href={`${backendUrl}/flipbook/download/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ffe000] text-[#162048] font-extrabold px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open PDF
            </a>
            <a
              href={`${backendUrl}/flipbook/download/${id}`}
              download="Magazine.pdf"
              className="bg-[#162048] text-white font-extrabold px-6 py-3 rounded-full hover:bg-black transition-colors border-2 border-[#162048] shadow-lg inline-flex items-center transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Flipbook;