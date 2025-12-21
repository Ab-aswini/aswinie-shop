import { 
  Package, 
  ImagePlus, 
  Eye, 
  Star, 
  Share2, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const VendorDashboard = () => {
  // Mock vendor data
  const vendor = {
    name: "Verma's Boutique",
    totalProducts: 12,
    totalViews: 1247,
    avgRating: 4.8,
    pendingRatings: 3,
  };

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
    { icon: Package, label: "Products", value: vendor.totalProducts },
    { icon: Eye, label: "Views", value: vendor.totalViews },
    { icon: Star, label: "Rating", value: vendor.avgRating.toFixed(1) },
  ];

  const menuItems = [
    { icon: Package, label: "My Products", path: "/vendor/products", count: vendor.totalProducts },
    { icon: BarChart3, label: "Analytics", path: "/vendor/analytics" },
    { icon: Eye, label: "Portfolio Preview", path: "/vendor/portfolio" },
    { icon: Star, label: "Ratings Received", path: "/vendor/ratings", count: vendor.pendingRatings },
    { icon: Share2, label: "Share Shop Link", path: "/vendor/share" },
  ];

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Business Dashboard</h1>
            <p className="text-sm text-muted-foreground">{vendor.name}</p>
          </div>
          <Link
            to="/profile"
            className="text-sm text-primary font-medium"
          >
            Consumer Mode
          </Link>
        </div>

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
        <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/20">
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
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path, count }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{label}</span>
              {count !== undefined && (
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
