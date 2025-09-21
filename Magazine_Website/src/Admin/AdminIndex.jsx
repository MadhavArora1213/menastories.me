import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { VideoArticleProvider } from "../context/VideoArticleContext";
import ToastContainer from "../Components/ToastContainer";
import AdminLogin from "./Components/AdminLogin";
import Dashboard from "./Dashboard";
import AllCategory from "./Category_Admin/AllCategory";
import CreateCategory from "./Category_Admin/CreateCategory";
import UpdateCategory from "./Category_Admin/UpdateCategory";
import DeleteCategory from "./Category_Admin/DeleteCategory";
import AllSubCategory from "./Category_Admin/AllSubCategory";
import CreateSubCategory from "./Category_Admin/CreateSubCategory";
import UpdateSubCategory from "./Category_Admin/UpdateSubCategory";
import DeleteSubCategory from "./Category_Admin/DeleteSubCategory";
import ArticleManagement from "./Article_Admin/ArticleManagement";
import CreateArticle from "./Article_Admin/CreateArticle";
import EditArticle from "./Article_Admin/EditArticle";
import ArticleDisplayTest from "./Article_Admin/ArticleDisplayTest";
import BulkArticleUpload from "./Article_Admin/BulkArticleUpload";
import { VideoArticleManagement, CreateVideoArticle, EditVideoArticle, VideoArticleRoutes } from "./Video_Admin";
import SMSManagement from "./SMS_Admin/SMSManagement";
import AllTags from "./Tag_Admin/AllTags";
import CreateTag from "./Tag_Admin/CreateTag";
import UpdateTag from "./Tag_Admin/UpdateTag";
import AllEvents from "./Event_Admin/AllEvents";
import CreateEvent from "./Event_Admin/CreateEvent";
import UpdateEvent from "./Event_Admin/UpdateEvent";
import UserManagement from "./User_Admin/UserManagement";
import RoleManagement from "./User_Admin/RoleManagement";
import SystemSettings from "./SystemSettings";
import ProfileSettings from "./ProfileSettings";
import NewsletterManagement from "./Newsletter_Admin/NewsletterManagement";
import CommentModeration from "./Comment_Admin/CommentModeration";
import MediaManagement from "./Media_Admin/MediaManagement";
import SearchManagement from "./Search_Admin/SearchManagement";
import AnalyticsManagement from "./Analytics_Admin/AnalyticsManagement";
import SecurityManagement from "./Security_Admin/SecurityManagement";
import FlipbookManagement from "./Flipbook_Admin/FlipbookManagement";
import ListManagement from "./List_Admin/ListManagement";
import CreateList from "./List_Admin/CreateList";
import EditList from "./List_Admin/EditList";
import ListEntries from "./List_Admin/ListEntries";
import CreateListEntry from "./List_Admin/CreateListEntry";
import EditListEntry from "./List_Admin/EditListEntry";
import PowerListManagement from "./Power_List_Admin/PowerListManagement";
import CreatePowerList from "./Power_List_Admin/CreatePowerList";
import PowerListView from "./Power_List_Admin/PowerListView";
import PowerListEdit from "./Power_List_Admin/PowerListEdit";
import PowerListEntries from "./Power_List_Admin/PowerListEntries";
import CreatePowerListEntry from "./Power_List_Admin/CreatePowerListEntry";
import EditPowerListEntry from "./Power_List_Admin/EditPowerListEntry";
import MediaKitManagement from "./Media_Kit_Admin/MediaKitManagement";
import CreateMediaKit from "./Media_Kit_Admin/CreateMediaKit";
import EditMediaKit from "./Media_Kit_Admin/EditMediaKit";
import DownloadManagement from "./Download_Admin/DownloadManagement";
import CreateDownload from "./Download_Admin/CreateDownload";
import EditDownload from "./Download_Admin/EditDownload";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { admin, loading, hasPermission, hasRole } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-white text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">You don't have permission to access this page.</p>
          <p className="text-gray-400 text-sm">Required: {requiredPermission}</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-white text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">You don't have the required role for this page.</p>
          <p className="text-gray-400 text-sm">Required: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}</p>
        </div>
      </div>
    );
  }

  return children;
};

// Main Layout Component
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleSidebarClose}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : ''
      }`}>
        <Header onMenuClick={handleMenuClick} />
        <main className="flex-1 bg-black overflow-auto">
          <div className="w-full px-2 py-2 md:px-3 md:py-3 lg:px-4 max-w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Content Management Routes */}
              <Route path="/articles" element={<ProtectedRoute requiredPermission="content.read"><ArticleManagement /></ProtectedRoute>} />
              <Route path="/articles/create" element={<ProtectedRoute requiredPermission="content.create"><CreateArticle /></ProtectedRoute>} />
              <Route path="/articles/edit/:id" element={<ProtectedRoute requiredPermission="content.edit"><EditArticle /></ProtectedRoute>} />
              <Route path="/articles/test" element={<ProtectedRoute requiredPermission="content.read"><ArticleDisplayTest /></ProtectedRoute>} />
              <Route path="/bulk-upload" element={<ProtectedRoute requiredPermission="content.create"><BulkArticleUpload /></ProtectedRoute>} />
              <Route path="/video-articles/*" element={<ProtectedRoute requiredPermission="content.read"><VideoArticleRoutes /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute requiredPermission="content.read"><AllCategory /></ProtectedRoute>} />
              <Route path="/categories/create" element={<ProtectedRoute requiredPermission="content.create"><CreateCategory /></ProtectedRoute>} />
              <Route path="/category/update/:id" element={<ProtectedRoute requiredPermission="content.edit"><UpdateCategory /></ProtectedRoute>} />
              <Route path="/category/delete" element={<ProtectedRoute requiredPermission="content.delete"><DeleteCategory /></ProtectedRoute>} />
              <Route path="/subcategories" element={<ProtectedRoute requiredPermission="content.read"><AllSubCategory /></ProtectedRoute>} />
              <Route path="/subcategories/create" element={<ProtectedRoute requiredPermission="content.create"><CreateSubCategory /></ProtectedRoute>} />
              <Route path="/subcategory/update/:id" element={<ProtectedRoute requiredPermission="content.edit"><UpdateSubCategory /></ProtectedRoute>} />
              <Route path="/subcategory/delete/:id" element={<ProtectedRoute requiredPermission="content.delete"><DeleteSubCategory /></ProtectedRoute>} />
              <Route path="/tags" element={<ProtectedRoute requiredPermission="content.read"><AllTags /></ProtectedRoute>} />
              <Route path="/tag/create" element={<ProtectedRoute requiredPermission="content.create"><CreateTag /></ProtectedRoute>} />
              <Route path="/tag/update/:id" element={<ProtectedRoute requiredPermission="content.edit"><UpdateTag /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute requiredPermission="content.read"><AllEvents /></ProtectedRoute>} />
              <Route path="/events/create" element={<ProtectedRoute requiredPermission="content.create"><CreateEvent /></ProtectedRoute>} />
              <Route path="/events/update/:id" element={<ProtectedRoute requiredPermission="content.edit"><UpdateEvent /></ProtectedRoute>} />
              <Route path="/comments" element={<ProtectedRoute requiredPermission="content.moderate"><CommentModeration /></ProtectedRoute>} />
              <Route path="/media" element={<ProtectedRoute requiredPermission="content.read"><MediaManagement /></ProtectedRoute>} />
              <Route path="/flipbooks" element={<ProtectedRoute requiredPermission="content.read"><FlipbookManagement /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute requiredPermission="content.read"><SearchManagement /></ProtectedRoute>} />
              <Route path="/lists" element={<ProtectedRoute requiredPermission="content.read"><ListManagement /></ProtectedRoute>} />
              <Route path="/lists/create" element={<ProtectedRoute requiredPermission="content.create"><CreateList /></ProtectedRoute>} />
              <Route path="/lists/edit/:id" element={<ProtectedRoute requiredPermission="content.edit"><EditList /></ProtectedRoute>} />
              <Route path="/lists/:id/entries" element={<ProtectedRoute requiredPermission="content.read"><ListEntries /></ProtectedRoute>} />
              <Route path="/lists/:listId/entries/create" element={<ProtectedRoute requiredPermission="content.create"><CreateListEntry /></ProtectedRoute>} />
              <Route path="/lists/:listId/entries/edit/:entryId" element={<ProtectedRoute requiredPermission="content.edit"><EditListEntry /></ProtectedRoute>} />

              {/* Power List Routes */}
              <Route path="/power-lists" element={<ProtectedRoute requiredPermission="content.read"><PowerListManagement /></ProtectedRoute>} />
              <Route path="/power-lists/create" element={<ProtectedRoute requiredPermission="content.create"><CreatePowerList /></ProtectedRoute>} />
              <Route path="/power-lists/:id" element={<ProtectedRoute requiredPermission="content.read"><PowerListView /></ProtectedRoute>} />
              <Route path="/power-lists/:id/edit" element={<ProtectedRoute requiredPermission="content.edit"><PowerListEdit /></ProtectedRoute>} />
              <Route path="/power-lists/:id/entries" element={<ProtectedRoute requiredPermission="content.read"><PowerListEntries /></ProtectedRoute>} />
              <Route path="/power-lists/:id/entries/create" element={<ProtectedRoute requiredPermission="content.create"><CreatePowerListEntry /></ProtectedRoute>} />
              <Route path="/power-lists/:id/entries/edit/:entryId" element={<ProtectedRoute requiredPermission="content.edit"><EditPowerListEntry /></ProtectedRoute>} />

              {/* Downloads Routes */}
              <Route path="/downloads" element={<ProtectedRoute requiredPermission="content.read"><DownloadManagement /></ProtectedRoute>} />
              <Route path="/downloads/create" element={<ProtectedRoute requiredPermission="content.create"><CreateDownload /></ProtectedRoute>} />
              <Route path="/downloads/edit/:id" element={<ProtectedRoute requiredPermission="content.edit"><EditDownload /></ProtectedRoute>} />

              {/* Media Kit Routes */}
              <Route path="/media-kits" element={<ProtectedRoute requiredPermission="content.read"><MediaKitManagement /></ProtectedRoute>} />
              <Route path="/media-kits/create" element={<ProtectedRoute requiredPermission="content.create"><CreateMediaKit /></ProtectedRoute>} />
              <Route path="/media-kits/edit/:id" element={<ProtectedRoute requiredPermission="content.edit"><EditMediaKit /></ProtectedRoute>} />

              {/* Download Routes */}
              <Route path="/downloads" element={<ProtectedRoute requiredRole="Master Admin"><DownloadManagement /></ProtectedRoute>} />
              <Route path="/downloads/create" element={<ProtectedRoute requiredRole="Master Admin"><CreateDownload /></ProtectedRoute>} />
              <Route path="/downloads/edit/:id" element={<ProtectedRoute requiredRole="Master Admin"><EditDownload /></ProtectedRoute>} />

              {/* User Management Routes */}
              <Route path="/users" element={<ProtectedRoute requiredPermission="users.read"><UserManagement /></ProtectedRoute>} />
              <Route path="/users/create" element={<ProtectedRoute requiredPermission="users.create"><div className="p-2 text-white">Create User - Coming Soon</div></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute requiredPermission="users.manage_roles"><RoleManagement /></ProtectedRoute>} />

              {/* Communication Routes */}
              <Route path="/newsletter" element={<ProtectedRoute requiredPermission="communication.manage"><NewsletterManagement /></ProtectedRoute>} />
              <Route path="/sms" element={<ProtectedRoute requiredPermission="communication.manage"><SMSManagement /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute requiredPermission="communication.manage"><div className="p-2 text-white">Notifications - Coming Soon</div></ProtectedRoute>} />

              {/* Analytics Routes */}
              <Route path="/analytics" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/content" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/users" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/authors" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/realtime" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/seo" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/social" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />
              <Route path="/analytics/reports" element={<ProtectedRoute requiredPermission="analytics.read"><AnalyticsManagement /></ProtectedRoute>} />

              {/* Security Routes */}
              <Route path="/security" element={<ProtectedRoute requiredPermission="security.read"><SecurityManagement /></ProtectedRoute>} />
              <Route path="/security/logs" element={<ProtectedRoute requiredPermission="security.view_logs"><SecurityManagement /></ProtectedRoute>} />
              <Route path="/security/incidents" element={<ProtectedRoute requiredPermission="security.read"><SecurityManagement /></ProtectedRoute>} />
              <Route path="/security/threats" element={<ProtectedRoute requiredPermission="security.read"><SecurityManagement /></ProtectedRoute>} />
              <Route path="/security/settings" element={<ProtectedRoute requiredPermission="security.manage"><SecurityManagement /></ProtectedRoute>} />
              <Route path="/security/backup" element={<ProtectedRoute requiredPermission="security.manage"><SecurityManagement /></ProtectedRoute>} />

              {/* System Routes */}
              <Route path="/settings" element={<ProtectedRoute requiredPermission="system.settings"><SystemSettings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/backup" element={<ProtectedRoute requiredPermission="system.backup"><div className="p-2 text-white">Backup Management - Coming Soon</div></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute requiredPermission="system.logs"><div className="p-2 text-white">System Logs - Coming Soon</div></ProtectedRoute>} />

              {/* Legacy category routes for backward compatibility */}
              <Route path="/category/all" element={<AllCategory />} />
              <Route path="/category/create" element={<CreateCategory />} />

              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function AdminIndex() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AdminAuthProvider>
          <VideoArticleProvider>
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer />
          </VideoArticleProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default AdminIndex;