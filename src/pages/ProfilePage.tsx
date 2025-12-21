import { User, ChevronRight, Settings, HelpCircle, LogOut, Shield, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RatingStars } from "@/components/ui/RatingStars";
import { TrustBadge } from "@/components/ui/TrustBadge";

const ProfilePage = () => {
  // Mock user data
  const user = {
    name: "Ashwin Behera",
    phone: "+91 98765 43210",
    trustScore: 4.5,
    trustLevel: "gold" as const,
    savedShopsCount: 12,
    ratingsGiven: 8,
  };

  const menuItems = [
    {
      icon: Store,
      label: "Switch to Business Mode",
      path: "/vendor/dashboard",
      highlight: true,
    },
    {
      icon: Shield,
      label: "Trust & Privacy",
      path: "/profile/trust",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/profile/settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/profile/help",
    },
  ];

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <TrustBadge level={user.trustLevel} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={user.trustScore} />
              <span className="text-sm font-medium">{user.trustScore}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/saved"
            className="p-4 rounded-xl bg-secondary/50 text-center"
          >
            <div className="text-2xl font-bold text-primary">
              {user.savedShopsCount}
            </div>
            <div className="text-sm text-muted-foreground">Saved Shops</div>
          </Link>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <div className="text-2xl font-bold text-primary">
              {user.ratingsGiven}
            </div>
            <div className="text-sm text-muted-foreground">Ratings Given</div>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path, highlight }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                highlight
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/50 hover:bg-muted/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 font-medium">{label}</span>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button className="flex items-center gap-3 w-full p-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
