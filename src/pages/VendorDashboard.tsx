import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ImagePlus, 
  Eye, 
  Star, 
  Share2,
  ChevronRight,
  Sparkles,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor } from "@/hooks/useCurrentVendor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { VendorOnboardingChecklist } from "@/components/vendor/VendorOnboardingChecklist";
import { useProducts } from "@/hooks/useProducts";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isVendor } = useAuth();
  const { data: vendor, isLoading: vendorLoading, error } = useCurrentVendor();
  const { toast } = useToast();
  const [showChecklist, setShowChecklist] = useState(true);
  
  // Get vendor products for onboarding checklist
  const { data: vendorProducts = [] } = useProducts(vendor?.id);

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
      return;
    }
    
    if (!authLoading && user && !vendorLoading && !vendor && !isVendor) {
      toast({
        title: "Register as Vendor",
        description: "You need to register your business first.",
      });
      navigate("/vendor/register", { replace: true });
    }
  }, [authLoading, user, vendorLoading, vendor, isVendor, navigate, toast]);

  const isLoading = authLoading || vendorLoading;

  const quickActions = [
    {
      icon: ImagePlus,
      label: "AI Studio",
      description: "Enhance product photos",
      path: "/vendor/ai-studio",
      color: "bg-gradient-to-br from-primary to-primary/80",
    },
    {
      icon: Package,
      label: "Add Product",
      description: "List a new item",
      path: "/vendor/product/new",
      color: "bg-secondary",
    },
  ];

  const stats = [
    { icon: Package, label: "Products", value: vendor?.totalProducts ?? 0 },
    { icon: Eye, label: "Views (30d)", value: vendor?.totalViews ?? 0 },
    { icon: Star, label: "Rating", value: vendor?.avgRating ? vendor.avgRating.toFixed(1) : "N/A" },
  ];

  const menuItems = [
    { icon: Package, label: "My Products", path: "/vendor/products", count: vendor?.totalProducts },
    { icon: BarChart3, label: "Analytics", path: "/vendor/analytics" },
    { icon: Eye, label: "Portfolio Preview", path: `/shop/${vendor?.id}` },
    { icon: Star, label: "Ratings Received", path: "/vendor/ratings", count: vendor?.reviewCount },
    { icon: Share2, label: "Share Shop Link", path: `/shop/${vendor?.id}`, external: true },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load vendor data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Business Dashboard</h1>
            <p className="text-sm text-muted-foreground">{vendor?.business_name || "Your Business"}</p>
          </div>
          <Link
            to="/profile"
            className="text-sm text-primary font-medium"
          >
            Consumer Mode
          </Link>
        </div>

        {/* Approval Status */}
        {vendor && !vendor.isApproved && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Approval</AlertTitle>
            <AlertDescription>
              Your shop is under review. You'll be notified once approved.
            </AlertDescription>
          </Alert>
        )}

        {vendor?.isVerified && (
          <Alert className="border-emerald-500/50 bg-emerald-500/10">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <AlertTitle className="text-emerald-500">Verified Business</AlertTitle>
            <AlertDescription>
              Your business is verified and trusted.
            </AlertDescription>
          </Alert>
        )}

        {/* Onboarding Checklist */}
        {vendor && showChecklist && (
          <VendorOnboardingChecklist
            vendor={{
              id: vendor.id,
              business_name: vendor.business_name,
              description: vendor.description,
              logo_url: vendor.logo_url,
              shop_image_url: vendor.shop_image_url,
              location: vendor.location,
              gst_number: vendor.gst_number,
              udyam_number: vendor.udyam_number,
              is_approved: vendor.isApproved || false,
            }}
            products={vendorProducts}
            onDismiss={() => setShowChecklist(false)}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-card border border-border/50 text-center"
            >
              <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ icon: Icon, label, description, path, color }) => (
            <Link
              key={path}
              to={path}
              className={`p-4 rounded-xl ${color} ${
                color.includes("primary")
                  ? "text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold">{label}</h3>
              <p className={`text-xs mt-1 ${
                color.includes("primary")
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              }`}>
                {description}
              </p>
            </Link>
          ))}
        </div>

        {/* AI Studio Highlight */}
        <Link 
          to="/vendor/ai-studio"
          className="block p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/20 hover:from-accent/30 hover:to-accent/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Try AI Studio</h3>
              <p className="text-sm text-muted-foreground">
                Turn raw photos into studio-quality images
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path, count, external }) => (
            <Link
              key={label}
              to={path}
              target={external ? "_blank" : undefined}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{label}</span>
              {count !== undefined && count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {count}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default VendorDashboard;
