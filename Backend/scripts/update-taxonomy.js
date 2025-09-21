import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flipbookService } from '../services/flipbookService';
import HTMLFlipBook from 'react-pageflip';
    {
// Import react-pdf for proper flipbook functionality
import { Document, Page, pdfjs } from 'react-pdf';
      description: 'News articles, reporting, and editorial content',
// Import react-pdf CSS styles for proper rendering
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
        { id: 3, name: 'Investigative Reporting' },
// Configure PDF.js worker with fallback' },
try {   { id: 5, name: 'Analysis & Commentary' },
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
} catch (error) {name: 'Commentary' },
  console.warn('Failed to configure PDF worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}       { id: 10, name: 'Market Reports' },
        { id: 11, name: 'Earnings Coverage' },
// Memoized PDF Page Component for better performance
const MemoizedPDFPage = memo(({ pageNumber, scale, onLoadSuccess, onLoadError }) => (
  <Page { id: 14, name: 'Executive Profiles' },
    key={`${pageNumber}-${scale}`} // Force re-render when scale changes
    pageNumber={pageNumber}deo Content' },
    scale={scale} name: 'Audio Content' },
    renderTextLayer={true}isual Content' },
    renderAnnotationLayer={true}tive Content' },
    onLoadSuccess={onLoadSuccess}edia Content' },
    onLoadError={onLoadError}letter Content' },
    loading=""22, name: 'Mobile-Specific' },
    style={{: 23, name: 'Emerging Formats' }
      margin: '0 auto',
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',erage',
      maxWidth: '100%',ional and country-specific content location',
      maxHeight: '100%',
      objectFit: 'contain'lobal' },
    }}  { id: 25, name: 'East Asia and Pacific' },
  />    { id: 26, name: 'Europe and Central Asia' },
));     { id: 27, name: 'Latin America and Caribbean' },
        { id: 28, name: 'Middle East, North Africa, Afghanistan and Pakistan' },
MemoizedPDFPage.displayName = 'MemoizedPDFPage';
        { id: 30, name: 'South Asia' },
// Add react-pageflip CSS styles with full responsive design
const flipbookStyles = `'Northeast Asia' },
  .flipbook-container { 'Southeast Asia (ASEAN)' },
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
    margin: 0 auto;ame: 'Western Europe' },
    display: flex;name: 'Eastern Europe' },
    justify-content: center;kans' },
    align-items: center;'Central Asia' },
    width: 100%;, name: 'South America' },
    height: 100%; name: 'Central America' },
  }     { id: 41, name: 'Caribbean' },
        { id: 42, name: 'Gulf Cooperation Council (GCC)' },
  .flipbook-container .page {le East' },
    background-color: white;th Africa' },
    box-shadow:5, name: 'Extended Region' },
      0 2px 8px rgba(0,0,0,0.15),ica' },
      0 1px 3px rgba(0,0,0,0.1);rica' },
    border-radius: 4px; 'Central Africa' },
    border: 1px solid #e8e8e8;ern Africa' }
    display: flex;
    justify-content: center;
    align-items: center;
  }   id: 3,
      name: 'Real Estate',
  .flipbook-container .page .page-content { property-related classifications',
    height: 100%;es: [
    width: 100%;, name: 'Residential Real Estate' },
    overflow: hidden;e: 'Commercial Real Estate' },
    position: relative; 'Industrial Real Estate' },
    display: flex;name: 'Retail Properties' },
    justify-content: center;l Estate Investment Trusts (REITs)' },
    align-items: center;'Property Management' },
  }     { id: 56, name: 'Real Estate Development' },
        { id: 57, name: 'PropTech' }
  .flipbook-container .page .pdf-page-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;ustries',
    height: 100%;: 'Business sectors and industry verticals',
    margin: 0 !important;
    padding: 8px !important;hnology & Digital' },
    position: relative; 'Financial Services' },
    gap: 8px; 59, name: 'Healthcare & Life Sciences' },
  }     { id: 60, name: 'Energy & Utilities' },
        { id: 61, name: 'Manufacturing & Industrial' },
  .flipbook-container .page .pdf-page-wrapper::after {
    content: '';, name: 'Real Estate & Construction' },
    position: absolute; 'Media & Entertainment' },
    left: 50%;65, name: 'Education' },
    top: 15px;66, name: 'Agriculture & Food' },
    bottom: 15px; name: 'Software & Services' },
    width: 2px;8, name: 'Hardware & Equipment' },
    background: linear-gradient(to bottom, #8B7355, #A0522D, #8B7355);
    box-shadow:0, name: 'Fintech' },
      0 0 4px rgba(0,0,0,0.2),& Blockchain' },
      inset 0 0 1px rgba(255,255,255,0.4);
    z-index: 10;, name: 'Insurance' },
    transform: translateX(-50%);ent Management' },
    border-radius: 1px; 'Capital Markets' },
    opacity: 0.5; name: 'Pharmaceuticals' },
  }     { id: 77, name: 'Medical Devices' },
        { id: 78, name: 'Healthcare Services' },
  .flipbook-container .pdf-left-page,th' },
  .flipbook-container .pdf-right-page {
    flex: 1;: 81, name: 'Renewable Energy' },
    display: flex;name: 'Electric Utilities' },
    justify-content: center;an Technology' },
    align-items: center;'Automotive' },
    height: 100%; name: 'Aerospace & Defense' },
    margin: 0 !important;Industrial Equipment' },
    padding: 0 3px !important;ials' },
    position: relative; 'Consumer Products' },
    z-index: 2;9, name: 'Fashion & Apparel' },
    max-width: 48%;ame: 'Retail' },
  }     { id: 91, name: 'Hospitality' },
        { id: 92, name: 'Residential Real Estate' },
  .flipbook-container .react-pdf__Page { Estate' },
    margin: 0 auto !important;ruction' },
    padding: 0 !important;roperty Technology (PropTech)' },
    display: flex !important;itional Media' },
    justify-content: center !important; },
    align-items: center !important;ent' },
    width: 100% !important;vertising' },
    height: 100% !important;gher Education' },
  }     { id: 101, name: 'K-12 Education' },
        { id: 102, name: 'EdTech' },
  .flipbook-container .react-pdf__Page__canvas { },
    margin: 0 auto !important; Production' },
    padding: 0 !important;Livestock' },
    display: block !important; Processing' },
    max-width: 100% !important;ultural Technology' }
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
  }   name: 'Finance',
      description: 'Company size, maturity, funding, and financial classifications',
  .flipbook-container .title-page {
    display: flex; name: 'Banking' },
    align-items: center; 'Insurance' },
    justify-content: center;vestment Management' },
    height: 100%;, name: 'Capital Markets' },
    width: 100%;2, name: 'Fintech' },
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    position: relative;: 'Venture Capital' },
    z-index: 2;15, name: 'Hedge Funds' },
    padding: 20px; name: 'Pre-Seed Funding' },
  }     { id: 117, name: 'Seed Funding' },
        { id: 118, name: 'Series A' },
  .flipbook-container .title-content {
    text-align: center;: 'Series C+' },
    padding: 20px; name: 'IPO/Exit' }
    max-width: 90%;
  } },
    {
  .flipbook-container .magazine-title {
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 900;ifestyle segments and consumer behavior patterns',
    color: #162048;: [
    margin-bottom: 15px; 'Innovators' },
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    line-height: 1.1;me: 'Achievers' },
  }     { id: 125, name: 'Experiencers' },
        { id: 126, name: 'Believers' },
  .flipbook-container .magazine-subtitle {
    font-size: clamp(0.9rem, 2.5vw, 1.3rem);
    color: #6c757d;name: 'Survivors' },
    margin-bottom: 20px; 'Health & Fitness' },
    font-weight: 300;me: 'Technology' },
  }     { id: 132, name: 'Luxury & Premium' },
        { id: 133, name: 'Environmental' },
  .flipbook-container .magazine-meta { (18-30)' },
    font-size: clamp(0.8rem, 2vw, 1rem); (30-45)' },
    color: #495057;name: 'Established Families (35-55)' },
    line-height: 1.4;me: 'Empty Nesters (50-70)' },
  }     { id: 138, name: 'Retirees (65+)' }
      ]
  .flipbook-container .magazine-meta p {
    margin: 6px 0;
    font-weight: 500;
  }   name: 'Web3',
      description: 'Blockchain, crypto, and decentralized technologies',
  /* Performance optimizations */
  .flipbook-container .page {ckchain' },
    will-change: transform;ryptocurrencies' },
    backface-visibility: hidden;ngible Tokens (NFTs)' },
    transform-style: preserve-3d;alized Finance (DeFi)' },
  }     { id: 143, name: 'Decentralized Applications (dApps)' },
        { id: 144, name: 'DAOs (Decentralized Autonomous Organizations)' },
  .flipbook-container .page-content {acts' },
    contain: layout style paint;aming' },
  }     { id: 147, name: 'Metaverse' },
        { id: 148, name: 'Tokenization' },
  .flipbook-container .pdf-page-wrapper {ls' },
    contain: layout style;Layer 2 Solutions' }
  }   ]
    },
  /* Smooth transitions for better UX */
  .flipbook-container .page {
    transition: opacity 0.3s ease-in-out;
  }   description: 'Hospitality, tourism, and accommodation industry',
      subcategories: [
  .flipbook-container .page.loading {commodations' },
    opacity: 0.7;, name: 'Restaurants & Food Service' },
  }     { id: 181, name: 'Travel & Tourism' },
        { id: 182, name: 'Luxury Hotels' },
  .flipbook-container .page.loaded {ommodations' },
    opacity: 1;84, name: 'Resort Management' },
  }     { id: 185, name: 'Event Management' },
        { id: 186, name: 'Cruise Industry' },
  /* Optimize rendering */Airlines' },
  .flipbook-container {: 'Food & Beverage' },
    -webkit-font-smoothing: antialiased;gy' },
    -moz-osx-font-smoothing: grayscale;s' },
  }     { id: 191, name: 'Hospitality Management' },
        { id: 192, name: 'Guest Services' },
  /* Responsive Design Breakpoints */ Innovation' }
      ]
  /* Extra Large Screens (1200px+) */
  @media (min-width: 1200px) {
    .flipbook-container .page .pdf-page-wrapper {
      padding: 12px !important;
      gap: 12px;ug = (name) => {
    }urn name
    .toLowerCase()
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {
      padding: 0 6px !important;
    }trim();
  }

  /* Large Screens (992px - 1199px) */
  @media (max-width: 1199px) and (min-width: 992px) {
    .flipbook-container .page .pdf-page-wrapper {
      padding: 10px !important;
      gap: 10px;'Starting taxonomy update...');
    }
  } // First, clear all foreign key references to categories (outside transaction)
    console.log('🗑️  Clearing existing references...');
  /* Medium Screens (768px - 991px) */
  @media (max-width: 991px) and (min-width: 768px) {reign key constraints
    .flipbook-container .page .pdf-page-wrapper {articles...');
      padding: 8px !important;ETE FROM "VideoArticles"');
      gap: 8px;('✅ Removed video articles temporarily.');
    }
    // Clear category references from tags
    .flipbook-container .page .pdf-page-wrapper::after {" = NULL');
      top: 12px;'✅ Cleared category references from tags.');
      bottom: 12px;
      width: 1.5px;icles table exists and clear references
    }ry {
      await sequelize.query('UPDATE "Articles" SET "categoryId" = NULL');
    .flipbook-container .pdf-left-page,eferences from articles.');
    .flipbook-container .pdf-right-page {
      padding: 0 2px !important;t exist, that's okay
    } console.log('ℹ️  Articles table not found or no category references to clear.');
  } }

  /* Small Screens (576px - 767px) */gories (including subcategories)
  @media (max-width: 767px) and (min-width: 576px) {tegories...');
    .flipbook-container .page .pdf-page-wrapper {ries" CASCADE'); // Truncate with cascade to handle all constraints
      flex-direction: column;ted all existing categories.');
      gap: 8px;
      padding: 8px !important;on for creating new categories
    }onst transaction = await sequelize.transaction();
    
    .flipbook-container .page .pdf-page-wrapper::after {tch
      left: 15px;\n🏗️  Creating new taxonomy...');
      right: 15px;
      top: 50%;= 0; i < newTaxonomy.categories.length; i++) {
      bottom: auto;yData = newTaxonomy.categories[i];
      height: 1.5px;
      width: auto;in category
      transform: translateY(-50%);ory.create({
    }   name: categoryData.name,
        slug: generateSlug(categoryData.name),
    .flipbook-container .pdf-left-page,iption,
    .flipbook-container .pdf-right-page {
      max-width: 100%;e',
      flex: none; true
      height: 47%;tion });
      padding: 2px !important;
    } console.log(`✅ Created category ${i + 1}: ${categoryData.name} (ID: ${category.id})`);
  }
      // Create subcategories
  /* Extra Small Screens (575px and below) */egories.length; j++) {
  @media (max-width: 575px) { = categoryData.subcategories[j];
    .flipbook-container .page .pdf-page-wrapper {
      flex-direction: column;({
      gap: 5px; subcategoryData.name,
      padding: 5px !important;ubcategoryData.name),
    }     description: `${subcategoryData.name} content`,
          parentId: category.id,
    .flipbook-container .page .pdf-page-wrapper::after {
      left: 10px; 'active',
      right: 10px;: true
      top: 50%;ansaction });
      bottom: auto;
      height: 1px;g(`  └─ Created subcategory: ${subcategoryData.name}`);
      width: auto;
      transform: translateY(-50%);
      opacity: 0.3;
    }wait transaction.commit();
    
    .flipbook-container .pdf-left-page,
    .flipbook-container .pdf-right-page {ategories.length;
      max-width: 100%;gories = newTaxonomy.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
      flex: none;
      height: 47%;n🎉 Taxonomy update completed successfully!');
      padding: 1px !important;${totalCategories} main categories`);
    }onsole.log(`   - Created ${totalSubcategories} subcategories`);
    console.log(`   - All with fresh UUIDs`);
    .flipbook-container .title-page {
      padding: 10px;
    }wait transaction.rollback();
    console.error('❌ Error updating taxonomy:', error);
    .flipbook-container .title-content {
      padding: 15px;
    }
  }
// Run the script
  /* Portrait Orientation Adjustments */
  @media (orientation: portrait) and (max-width: 768px) {
    .flipbook-container .page .pdf-page-wrapper {
      flex-direction: column;    }        .flipbook-container .pdf-left-page,    .flipbook-container .pdf-right-page {      max-width: 100%;      height: 47%;    }  }  /* Landscape Orientation on Mobile */  @media (orientation: landscape) and (max-height: 500px) {    .flipbook-container .magazine-title {      font-size: clamp(1.2rem, 3vw, 2rem);      margin-bottom: 10px;    }        .flipbook-container .magazine-subtitle {      font-size: clamp(0.8rem, 2vw, 1rem);      margin-bottom: 15px;    }        .flipbook-container .magazine-meta {      font-size: clamp(0.7rem, 1.5vw, 0.9rem);    }        .flipbook-container .title-content {      padding: 15px;    }  }`;// Inject stylesif (typeof document !== 'undefined') {  const styleSheet = document.createElement('style');  styleSheet.type = 'text/css';  styleSheet.innerText = flipbookStyles;  document.head.appendChild(styleSheet);}const Flipbook = () => {  const { id } = useParams();  const navigate = useNavigate();  // Responsive state management  const [windowSize, setWindowSize] = useState({    width: typeof window !== 'undefined' ? window.innerWidth : 1200,    height: typeof window !== 'undefined' ? window.innerHeight : 800  });  // Optimized state management with useMemo for derived values  const [currentPage, setCurrentPage] = useState(0);  const [numPages, setNumPages] = useState(null);  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);  const [magazine, setMagazine] = useState(null);  const [pdfFile, setPdfFile] = useState(null);  const [pdfLoadError, setPdfLoadError] = useState(false);  const [scale, setScale] = useState(0.8);  const [isFullscreen, setIsFullscreen] = useState(false);  // React-pageflip flipbook state  const [pages, setPages] = useState([]);  const [usePdfRendering, setUsePdfRendering] = useState(true);  const flipbookRef = useRef(null);  // Magazine list state  const [magazines, setMagazines] = useState([]);  const [magazinesLoading, setMagazinesLoading] = useState(false);  const [magazinesError, setMagazinesError] = useState(null);  // Performance optimizations  const [pageLoadStates, setPageLoadStates] = useState(new Map());  const [isInitialized, setIsInitialized] = useState(false);  // Responsive calculations  const isMobile = windowSize.width <= 768;  const isTablet = windowSize.width > 768 && windowSize.width <= 1024;  const isDesktop = windowSize.width > 1024;  // Dynamic flipbook dimensions based on screen size  const flipbookDimensions = useMemo(() => {    if (isMobile) {      return {        width: Math.min(windowSize.width - 40, 400),        height: Math.min(windowSize.height - 300, 500)      };    } else if (isTablet) {      return {        width: Math.min(windowSize.width - 80, 700),        height: Math.min(windowSize.height - 250, 550)      };    } else {      return {        width: Math.min(windowSize.width - 120, 900),        height: Math.min(windowSize.height - 200, 650)      };    }  }, [windowSize, isMobile, isTablet]);  // Dynamic scale based on screen size  const responsiveScale = useMemo(() => {    if (isMobile) {      return Math.min(scale, 0.6);    } else if (isTablet) {      return Math.min(scale, 0.8);    }    return scale;  }, [scale, isMobile, isTablet]);  // Memoized calculations to prevent unnecessary re-renders  const flipbookPages = useMemo(() => Math.ceil(numPages / 2) + 1, [numPages]);  const pageDisplayText = useMemo(() => {    if (!numPages) return '';    if (currentPage === 0) return 'Title Page';    return `Pages ${(currentPage - 1) * 2 + 1}-${Math.min(currentPage * 2, numPages)} of ${numPages}`;  }, [currentPage, numPages]);  // Backend URL memoized  const backendUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000', []);  // Window resize handler  useEffect(() => {    const handleResize = () => {      setWindowSize({        width: window.innerWidth,        height: window.innerHeight      });    };    window.addEventListener('resize', handleResize);    return () => window.removeEventListener('resize', handleResize);  }, []);  // Debug scale changes  useEffect(() => {    console.log('Scale changed to:', responsiveScale);  }, [responsiveScale]);  const loadMagazine = useCallback(async () => {    if (!id || isInitialized) return;    try {      setLoading(true);      setError(null);      setIsInitialized(true);      const magazineData = await flipbookService.getFlipbookMagazineById(id);      setMagazine(magazineData.magazine);      // Load page images for flipbook      await loadPageImages(id);      // Use the memoized backend URL      setPdfFile(`${backendUrl}/flipbook/download/${id}`);    } catch (err) {      console.error('Failed to load magazine:', err);      setError('Failed to load magazine data');      setPdfLoadError(true);    } finally {      setLoading(false);    }  }, [id, isInitialized, backendUrl]);  // Load magazine data if ID is provided, otherwise load magazine list  useEffect(() => {    if (id) {      loadMagazine();    } else {      loadMagazines();    }  }, [id, loadMagazine]);  // Cleanup effect for component unmount  useEffect(() => {    return () => {      // Cleanup any pending operations      if (flipbookRef.current?.pageFlip) {        try {          // Reset flipbook state          setCurrentPage(0);          setIsInitialized(false);        } catch (error) {          console.warn('Cleanup error:', error);        }      }    };  }, []);  const loadMagazines = async () => {    try {      setMagazinesLoading(true);      setMagazinesError(null);      const response = await flipbookService.getFlipbookMagazines({ limit: 50 });      setMagazines(response.magazines || []);    } catch (err) {      console.error('Failed to load magazines:', err);      setMagazinesError('Failed to load magazines');    } finally {      setMagazinesLoading(false);    }  };  const loadPageImages = async (magazineId) => {    try {      console.log('Loading page images for magazine:', magazineId);      const pagesData = await flipbookService.getFlipbookPages(magazineId);      console.log('Received pages data:', pagesData);      console.log('Pages array:', pagesData.pages);      console.log('Pages length:', pagesData.pages?.length || 0);      // Fix image URLs to use correct backend path      const fixedPages = (pagesData.pages || []).map(page => ({        ...page,        imageUrl: page.imageUrl ? page.imageUrl.replace('/storage', '/api/storage') : page.imageUrl,        thumbnailUrl: page.thumbnailUrl ? page.thumbnailUrl.replace('/storage', '/api/storage') : page.thumbnailUrl      }));      // Log first few corrected image URLs for debugging      if (fixedPages && fixedPages.length > 0) {        console.log('Sample corrected image URLs:');        fixedPages.slice(0, 3).forEach((page, index) => {          console.log(`Page ${index + 1} corrected URL:`, page.imageUrl);        });      }      setPages(fixedPages);      setNumPages(pagesData.magazine?.totalPages || 0);    } catch (err) {      console.error('Failed to load page images:', err);      setError('Failed to load magazine pages');    }  };  // Optimized navigation functions with error handling  const nextPage = useCallback(() => {    if (flipbookRef.current?.pageFlip) {      try {        flipbookRef.current.pageFlip().flipNext();      } catch (error) {        console.error('Error flipping next:', error);        setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));      }    } else {      setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));    }  }, [flipbookPages]);  const prevPage = useCallback(() => {    if (flipbookRef.current?.pageFlip) {      try {        flipbookRef.current.pageFlip().flipPrev();      } catch (error) {        console.error('Error flipping prev:', error);        setCurrentPage(prev => Math.max(prev - 1, 0));      }    } else {      setCurrentPage(prev => Math.max(prev - 1, 0));    }  }, []);  const goToPage = useCallback((pageNumber) => {    const validPage = Math.max(0, Math.min(pageNumber, flipbookPages - 1));    if (flipbookRef.current?.pageFlip) {      try {        flipbookRef.current.pageFlip().flip(validPage);      } catch (error) {        console.error('Error going to page:', error);        setCurrentPage(validPage);      }    } else {      setCurrentPage(validPage);    }  }, [flipbookPages]);  // Optimized zoom functions with bounds checking and responsive limits  const zoomIn = useCallback(() => {    setScale(prevScale => {      const maxScale = isMobile ? 2.0 : isTablet ? 2.5 : 3.0;      const newScale = Math.min(prevScale + 0.2, maxScale);      console.log('Zoom In: from', prevScale, 'to', newScale);      return newScale;    });  }, [isMobile, isTablet]);  const zoomOut = useCallback(() => {    setScale(prevScale => {      const minScale = isMobile ? 0.4 : isTablet ? 0.5 : 0.5;      const newScale = Math.max(prevScale - 0.2, minScale);      console.log('Zoom Out: from', prevScale, 'to', newScale);      return newScale;    });  }, [isMobile, isTablet]);  const resetZoom = useCallback(() => {    const defaultScale = isMobile ? 0.6 : isTablet ? 0.7 : 0.8;    console.log('Reset Zoom: to', defaultScale);    setScale(defaultScale);  }, [isMobile, isTablet]);  // Optimized fullscreen toggle with error handling  const toggleFullscreen = useCallback(async () => {    try {      if (!document.fullscreenElement) {        await document.documentElement.requestFullscreen();        setIsFullscreen(true);      } else {        await document.exitFullscreen();        setIsFullscreen(false);      }    } catch (error) {      console.error('Fullscreen error:', error);      setIsFullscreen(false);    }  }, []);  const handleMagazineClick = (magazineId) => {    navigate(`/flipbook/${magazineId}`);  };  // If no ID provided, show magazine list  if (!id) {    return (      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-6 sm:py-12">        <div className="container mx-auto px-4 max-w-7xl">          {/* Header */}          <div className="text-center mb-8 sm:mb-12">            <div className="flex justify-center mb-4 sm:mb-6">              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>                </svg>              </div>            </div>            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-[#162048] mb-2 sm:mb-4 tracking-wide drop-shadow-lg px-4">              DIGITAL MAGAZINE LIBRARY            </h1>            <p className="text-lg sm:text-xl text-gray-600 mb-1 sm:mb-2 px-4">              Explore Our Collection of Interactive Magazines            </p>            <p className="text-base sm:text-lg text-gray-500 px-4">              Click on any magazine to start your reading experience            </p>          </div>        {/* Loading State */}        {magazinesLoading && (          <div className="flex flex-col sm:flex-row justify-center items-center py-10 sm:py-20 px-4">            <div className="relative mb-4 sm:mb-0">              <div className="rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#e3e7f7] border-t-[#162048] flex items-center justify-center animate-spin">                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>                </svg>              </div>            </div>            <div className="ml-0 sm:ml-6 text-center sm:text-left">              <span className="text-[#162048] font-bold text-base sm:text-lg">Loading your magazine collection...</span>              <div className="flex justify-center sm:justify-start space-x-1 mt-2">                <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce"></div>                <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>                <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>              </div>            </div>          </div>        )}        {/* Error State */}        {magazinesError && (          <div className="text-center py-10 sm:py-20 px-4">            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>              </svg>            </div>            <h2 className="text-xl sm:text-2xl font-bold text-[#162048] mb-2">Unable to Load Magazines</h2>            <p className="text-gray-600 mb-4 px-4">{magazinesError}</p>            <button              onClick={loadMagazines}              className="bg-[#ffe000] text-[#162048] font-extrabold px-6 sm:px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg flex items-center mx-auto text-sm sm:text-base"            >              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>              </svg>              Try Again            </button>          </div>        )}        {/* Magazine Grid - Fully Responsive */}        {!magazinesLoading && !magazinesError && (          <div className="max-w-7xl mx-auto px-2 sm:px-4">            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">              {magazines.map((mag, index) => (                <div                  key={mag.id}                  onClick={() => handleMagazineClick(mag.id)}                  className="bg-white rounded-2xl shadow-xl border-4 border-[#162048] p-4 sm:p-6 flex flex-col cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-500 h-full group"                >                  <div className="flex flex-col h-full">                    {/* Icon */}                    <div className="flex justify-center mb-3 sm:mb-4">                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e3e7f7] rounded-full flex items-center justify-center border-2 border-[#162048]">                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>                        </svg>                      </div>                    </div>                    {/* Title */}                    <h3 className="text-lg sm:text-xl font-bold text-[#162048] mb-2 sm:mb-3 text-center line-clamp-2 flex-grow">                      {mag.title}                    </h3>                    {/* Description */}                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3 text-center flex-grow">                      {mag.description}                    </p>                    {/* Category and Pages */}                    <div className="flex justify-between items-center text-xs sm:text-sm mb-4 sm:mb-6 bg-[#e3e7f7] rounded-lg p-2 sm:p-3">                      <span className="bg-[#ffe000] text-[#162048] px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">                        {mag.category || 'General'}                      </span>                      <span className="bg-[#162048] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center">                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>                        </svg>                        {mag.totalPages || 0} pages                      </span>                    </div>                    {/* Read Now Button */}                    <div className="flex justify-center mb-3 sm:mb-4">                      <button className="bg-[#ffe000] text-[#162048] font-extrabold px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg flex items-center text-sm sm:text-base">                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>                        </svg>                        Read Now                      </button>                    </div>                    {/* Rating stars */}                    <div className="flex justify-center space-x-1 mt-auto">                      {[...Array(5)].map((_, i) => (                        <svg key={i} className={`w-3 h-3 sm:w-4 sm:h-4 ${i < 4 ? 'text-[#ffe000]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>                        </svg>                      ))}                    </div>                  </div>                </div>              ))}            </div>            {magazines.length === 0 && (              <div className="text-center py-10 sm:py-20 px-4">                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#162048]">                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>                  </svg>                </div>                <h3 className="text-lg sm:text-xl font-bold text-[#162048] mb-2">No Magazines Found Yet</h3>                <p className="text-gray-600 mb-4">Check back later for exciting new publications!</p>                <div className="mt-4 flex justify-center space-x-2">                  {[...Array(3)].map((_, i) => (                    <div key={i} className="w-3 h-3 bg-[#162048] rounded-full animate-ping" style={{animationDelay: `${i * 0.2}s`}}></div>                  ))}                </div>              </div>            )}          </div>        )}        </div>      </div>    );  }  // Individual flipbook view - Error State  if (error) {    return (      <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex items-center justify-center py-6 sm:py-12">        <div className="container mx-auto px-4 max-w-xl">          <div className="text-center">            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>              </svg>            </div>            <h2 className="text-xl sm:text-2xl font-bold text-[#162048] mb-2">Unable to Load Magazine</h2>            <p className="text-gray-600 mb-4 px-4">{error}</p>            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">              <button                onClick={() => window.location.reload()}                className="bg-[#ffe000] text-[#162048] font-extrabold px-6 sm:px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors border-2 border-[#162048] shadow-lg flex items-center justify-center text-sm sm:text-base"              >                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>                </svg>                Try Again              </button>              <button                onClick={() => navigate('/flipbook')}                className="bg-[#162048] text-white font-extrabold px-6 sm:px-8 py-3 rounded-full hover:bg-black transition-colors border-2 border-[#162048] shadow-lg flex items-center justify-center text-sm sm:text-base"              >                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>                </svg>                Back to Library              </button>            </div>          </div>        </div>      </div>    );  }  return (    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen flex flex-col">      <div className="container mx-auto px-2 sm:px-4 max-w-6xl flex flex-col justify-center items-center py-4 sm:py-8">        {/* Header - Responsive */}        <div className="text-center mb-6 sm:mb-12 mt-16 sm:mt-32">          <div className="flex justify-center mb-3 sm:mb-6">            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e3e7f7] rounded-full flex items-center justify-center border-4 border-[#162048]">              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#162048]" fill="none" stroke="currentColor" viewBox="0 0 24 24">                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>              </svg>            </div>          </div>          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-[#162048] mb-2 sm:mb-4 tracking-wide drop-shadow-lg px-4">            {magazine ? magazine.title : 'DIGITAL MAGAZINE'}          </h1>          <p className="text-lg sm:text-xl text-gray-600 mb-1 sm:mb-2 px-4">            {magazine ? magazine.description : 'Interactive Flipbook Experience'}          </p>          <p className="text-base sm:text-lg text-gray-500 px-4">            {magazine ? `By ${magazine.author?.name || 'Unknown Author'}` : 'Professional Magazine Reader'}          </p>          {numPages && (            <div className="mt-3 sm:mt-4 flex justify-center px-4">              <div className="bg-green-50 inline-block px-3 sm:px-4 py-2 rounded-full border-2 border-green-200">                <span className="text-green-800 font-semibold flex items-center text-sm sm:text-base">                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>                  </svg>                  Interactive Flipbook: {pageDisplayText}                </span>              </div>            </div>          )}          {/* Flipbook Instructions - Responsive */}          {pages.length > 0 && (            <div className="mt-3 sm:mt-4 text-center px-4">              <p className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-center">                <svg className="w-4 h-4 mr-0 sm:mr-1 mb-1 sm:mb-0 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9M7 11H17V13H7V11M7 15H17V17H7V15M7 19H13V21H7V19Z"/>                </svg>                <span><strong>Flipbook Controls:</strong></span>                <span className="sm:ml-1">Click page edges to turn • Use navigation buttons {!isMobile && '• Drag to flip'}</span>              </p>            </div>          )}        </div>        {/* Flipbook Container - Fully Responsive */}        <div className="flex justify-center items-center w-full px-2 sm:px-0">          <div className="relative w-full max-w-6xl mx-auto">            {loading ? (              <div className="flex flex-col items-center justify-center h-64 sm:h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048] mx-2 sm:mx-0">                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-[#e3e7f7] border-t-[#162048] mb-4"></div>                <span className="text-[#162048] font-bold text-base sm:text-lg">Loading Magazine...</span>                <span className="text-gray-600 text-xs sm:text-sm mt-2 flex items-center px-4 text-center">                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>                  </svg>                  Preparing your reading experience                </span>                <div className="mt-4 flex space-x-1">                  <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce"></div>                  <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>                  <div className="w-2 h-2 bg-[#162048] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>                </div>              </div>            ) : pages.length > 0 ? (              <div className="bg-white rounded-lg shadow-xl border-4 border-[#162048] p-2 sm:p-4 mx-2 sm:mx-0">                {/* Flipbook Controls - Responsive */}                <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-2 sm:gap-4">                  <div className="flex items-center gap-1 sm:gap-2">                    <button                      onClick={(e) => {                        e.preventDefault();                        e.stopPropagation();                        zoomOut();                      }}                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"                      title="Zoom Out"                      disabled={responsiveScale <= (isMobile ? 0.4 : isTablet ? 0.5 : 0.5)}                    >                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>                      </svg>                    </button>                    <span className="text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">{Math.round(responsiveScale * 100)}%</span>                    <button                      onClick={(e) => {                        e.preventDefault();                        e.stopPropagation();                        zoomIn();                      }}                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"                      title="Zoom In"                      disabled={responsiveScale >= (isMobile ? 2.0 : isTablet ? 2.5 : 3.0)}                    >                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>                      </svg>                    </button>