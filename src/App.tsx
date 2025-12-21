import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

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

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            
            {/* Consumer Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/saved" element={<SavedShopsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shop/:shopId" element={<ShopProfilePage />} />
            <Route path="/rate/vendor/:shopId" element={<RateVendorPage />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/register" element={<VendorRegisterPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/ai-studio" element={<AIStudioPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
