import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { TransitionProvider, useTransition } from './context/TransitionContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Loading from './Components/Loading';
import Header from './Components/Header';
import Footer from './Components/Footer';
import ToastContainer from './Components/ToastContainer';
// Authentication Components
import { LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, VerifyEmail, MFASetup, UserProfile, RoleManagement } from './Components/Auth';
// CMS Components
import { CMSDashboard } from './Components/CMS';
// Article Components
import ArticleRenderer from './Components/ArticleRenderer';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import Dashboard from './Pages/Dashboard';
import PrivacyPolicySection from './Components/PrivacyPolicySection';
import TermsAndConditions from './Pages/TermsAndConditions';
import CookiePolicySection from './Components/Cookie_Policy';
import EditorialStandardsSection from './Components/EditorialStandards';
import CorrectionPolicySection from './Components/CorrectionPolicy';
import CopyrightInformationSection from './Components/CopyrightInformation';
import DisclaimerSection from './Components/Disclaimer';
import MissionVision from './Pages/MissionVision';
import OurTeam from './Pages/OurTeam'; // <-- Import OurTeam page
import EditorialGuidelines from './Pages/Editorial_Guidelines'; // Add this import
import Careers from './Pages/Careers'; // Add this import
import AwardsRecognition from './Pages/AwardsRecognition'; // Add this import
import AdvertiseWithUs from './Pages/AdvertiseWithUs'; // Add this import
import ContactUsForm from './Pages/ContactUsForm'; // Add this import
import EditorialContact from './Pages/EditorialContact'; // Add this import
// New imports for additional pages
import TechnicalSupport from './Pages/TechnicalSupport';
import OfficeLocations from './Pages/OfficeLocations';
import SocialMediaLinks from './Pages/SocialMediaLinks';
import MediaKit from './Pages/MediaKit';
import Downloads from './Pages/Downloads';
import PressReleases from './Pages/PressReleases';
import RSSFeeds from './Pages/RSSFeeds';
import Archive from './Pages/Archive';
import SiteSearch from './Pages/SiteSearch';
// Import new module components
import { AdvancedSearch, SearchResults, SearchSuggestions, SavedSearches } from './Components/Search';
import { MediaLibrary, MediaUploader, ImageGallery, VideoPlayer, MediaEditor, MediaMetadata, BulkMediaActions } from './Components/Media';
import { NewsletterSignup, NewsletterPreferences, NewsletterBuilder, EmailTemplateEditor, WhatsAppIntegration, CommunicationLog, SubscriberManagement, NewsletterManagement } from './Components/Newsletter';
import NewsletterArchive from './Pages/NewsletterArchive';
import NewsletterConfirm from './Pages/NewsletterConfirm';
import NewsletterSuccess from './Pages/NewsletterSuccess';
import AdvertisingEnquiries from './Pages/AdvertisingEnquiries';
import EventsPage from './Pages/EventsPage';
import Flipbook from './Pages/Flipbook';
import TrendingPage from './Pages/TrendingPage';
import CategoryPage from './Pages/CategoryPage'; // Dynamic category page
import SubCategoryPage from './Pages/SubCategoryPage'; // Dynamic subcategory page
import NewsContentPage from './Pages/NewsContentPage'; // Dedicated News Content page
import VideoPage from './Pages/VideoPage'; // Video article page
import ListPage from './Pages/ListPage'; // List page
import ListDetailPage from './Pages/ListDetailPage'; // Individual list detail page
import ListEntryDetailPage from './Pages/ListEntryDetailPage'; // Individual list entry detail page
import AdminIndex from './Admin/AdminIndex';
import NewsletterSubscriptionPopup from './Components/Newsletter/NewsletterSubscriptionPopup';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

// Global Loading Component
const GlobalLoading = () => {
  const { isLoading, setIsLoading } = useTransition();
  return <Loading isLoading={isLoading} setIsLoading={setIsLoading} />;
};

const MainSiteLayout = ({ children }) => (
  <>
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

function App() {
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

  useEffect(() => {
    // Check if user has already seen/dismissed the newsletter popup
    const hasSeenNewsletter = localStorage.getItem('newsletter-popup-seen');
    const hasSubscribed = localStorage.getItem('newsletter-subscribed');

    // Show popup if user hasn't seen it and hasn't subscribed
    if (!hasSeenNewsletter && !hasSubscribed) {
      // Show after a short delay to not interrupt initial page load
      const timer = setTimeout(() => {
        setShowNewsletterPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleNewsletterSubscribe = (subscriptionData) => {
    // Mark as subscribed to prevent showing popup again
    localStorage.setItem('newsletter-subscribed', 'true');
    setShowNewsletterPopup(false);
  };

  const handleNewsletterClose = () => {
    // Mark as seen to prevent showing popup again
    localStorage.setItem('newsletter-popup-seen', 'true');
    setShowNewsletterPopup(false);
  };

  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <TransitionProvider>
              {/* Global Loading Component */}
              <GlobalLoading />

              <Router>
                <Routes>
                  {/* Admin panel: includes loading and newsletter popup */}
                  <Route path="/admin/*" element={<AdminIndex />} />

                  {/* Authentication routes - includes loading and newsletter popup */}
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

                  {/* Main site: header/footer shown with loading animation */}
                  <Route
                    path="*"
                    element={
                      <MainSiteLayout>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/our-team" element={<OurTeam />} />
                          <Route path="/careers" element={<Careers />} />
                          <Route path="/awards" element={<AwardsRecognition />} />
                          <Route path="/advertise" element={<AdvertiseWithUs />} />
                          <Route path="/contact" element={<ContactUsForm />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicySection />} />
                          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                          <Route path="/cookies" element={<CookiePolicySection />} />
                          <Route path="/editorial-standards" element={<EditorialStandardsSection />} />
                          <Route path="/editorial-guidelines" element={<EditorialGuidelines />} />
                          <Route path="/editorial-contact" element={<EditorialContact />} />
                          <Route path="/correction-policy" element={<CorrectionPolicySection />} />
                          <Route path="/copyright" element={<CopyrightInformationSection />} />
                          <Route path="/disclaimer" element={<DisclaimerSection />} />
                          <Route path="/mission-vision" element={<MissionVision />} />

                          {/* New routes for additional pages */}
                          <Route path="/support" element={<TechnicalSupport />} />
                          <Route path="/locations" element={<OfficeLocations />} />
                          <Route path="/social-media" element={<SocialMediaLinks />} />
                          <Route path="/media-kit" element={<MediaKit />} />
                          <Route path="/downloads" element={<Downloads />} />
                          <Route path="/press" element={<PressReleases />} />
                          <Route path="/rss" element={<RSSFeeds />} />
                          <Route path="/archive" element={<Archive />} />
                          <Route path="/search" element={<SiteSearch />} />
                          <Route path="/advanced-search" element={<AdvancedSearch />} />
                          <Route path="/search-results" element={<SearchResults />} />
                          <Route path="/search-suggestions" element={<SearchSuggestions />} />
                          <Route path="/saved-searches" element={<SavedSearches />} />
                          <Route path="/media-library" element={<MediaLibrary showUploader={false} />} />
                          <Route path="/media-upload" element={<MediaUploader />} />
                          <Route path="/image-gallery" element={<ImageGallery />} />
                          <Route path="/video-player" element={<VideoPlayer />} />
                          <Route path="/media-editor" element={<MediaEditor />} />
                          <Route path="/media-metadata" element={<MediaMetadata />} />
                          <Route path="/bulk-media-actions" element={<BulkMediaActions />} />
                          <Route path="/newsletter-archive" element={<NewsletterArchive />} />
                          <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
                          <Route path="/newsletter/success" element={<NewsletterSuccess />} />
                          <Route path="/newsletter-signup" element={<NewsletterSignup />} />
                          <Route path="/newsletter-preferences" element={<NewsletterPreferences />} />
                          <Route path="/newsletter-builder" element={<NewsletterBuilder />} />
                          <Route path="/email-template-editor" element={<EmailTemplateEditor />} />
                          <Route path="/whatsapp-integration" element={<WhatsAppIntegration />} />
                          <Route path="/communication-log" element={<CommunicationLog />} />
                          <Route path="/subscriber-management" element={<SubscriberManagement />} />
                          <Route path="/newsletter-management" element={<NewsletterManagement />} />
                          <Route path="/advertising" element={<AdvertisingEnquiries />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/flipbook" element={<Flipbook />} />
                          <Route path="/flipbook/:id" element={<Flipbook />} />
                          <Route path="/trending" element={<TrendingPage />} />
                          {/* <Route path="/news-content" element={<NewsContentPage />} /> */}

                          {/* Protected routes */}
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/profile" element={<UserProfile />} />
                          <Route path="/mfa-setup" element={<MFASetup />} />
                          <Route path="/admin/roles" element={<RoleManagement />} />

                          {/* CMS routes */}
                          <Route path="/cms/*" element={<CMSDashboard />} />

                          {/* Article routes */}
                          <Route path="/articles/:id" element={<ArticleRenderer />} />
                          <Route path="/article/:id" element={<ArticleRenderer />} />

                          {/* Video routes */}
                          <Route path="/videos/:slug" element={<VideoPage />} />

                          {/* List page routes */}
                          <Route path="/list" element={<ListPage />} />
                          <Route path="/lists/:slug" element={<ListDetailPage />} />
                          <Route path="/lists/:listSlug/:entrySlug" element={<ListEntryDetailPage />} />

                          {/* Dynamic category and subcategory routes - handle any slug from database */}
                          <Route path="/:categorySlug" element={<CategoryPage />} />
                          <Route path="/:categorySlug/:subcategorySlug" element={<SubCategoryPage />} />

                          <Route path="*" element={<div className="flex justify-center items-center h-screen">Page not found</div>} />
                        </Routes>
                      </MainSiteLayout>
                    }
                  />
                </Routes>

                {/* Global Newsletter Subscription Popup - shown on all routes */}
                {showNewsletterPopup && (
                  <NewsletterSubscriptionPopup
                    onSubscribe={handleNewsletterSubscribe}
                    onClose={handleNewsletterClose}
                  />
                )}

                {/* Toast Notifications */}
                <ToastContainer />
              </Router>
            </TransitionProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
// filepath: c:\Users\DELL\OneDrive\Desktop\Magazine_Website\Magazine_Website\src\App.jsx
