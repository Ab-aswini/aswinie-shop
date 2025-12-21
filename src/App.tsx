import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Consumer Pages
import Index from "./pages/Index";
import ExplorePage from "./pages/ExplorePage";
import SearchPage from "./pages/SearchPage";
import SavedShopsPage from "./pages/SavedShopsPage";
import ProfilePage from "./pages/ProfilePage";
import ShopProfilePage from "./pages/ShopProfilePage";
import RateVendorPage from "./pages/RateVendorPage";
import AuthPage from "./pages/AuthPage";

// Vendor Pages
import VendorDashboard from "./pages/VendorDashboard";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import AIStudioPage from "./pages/AIStudioPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import ProductEditPage from "./pages/ProductEditPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import VendorRatingsPage from "./pages/VendorRatingsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import VendorPortfolioPage from "./pages/VendorPortfolioPage";
import VendorAnalyticsPage from "./pages/VendorAnalyticsPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/shop/:shopId" element={<ShopProfilePage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            
            {/* Protected User Routes */}
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedShopsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/rate/vendor/:shopId" element={
              <ProtectedRoute>
                <RateVendorPage />
              </ProtectedRoute>
            } />
            
            {/* Vendor Routes - Require vendor role */}
            <Route path="/vendor/register" element={
              <ProtectedRoute>
                <VendorRegisterPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/ai-studio" element={
              <ProtectedRoute requiredRole="vendor">
                <AIStudioPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/product/new" element={
              <ProtectedRoute requiredRole="vendor">
                <ProductCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/product/:productId/edit" element={
              <ProtectedRoute requiredRole="vendor">
                <ProductEditPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/ratings" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorRatingsPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/portfolio" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorPortfolioPage />
              </ProtectedRoute>
            } />
            <Route path="/vendor/analytics" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorAnalyticsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes - Require admin role */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
