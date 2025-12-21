import { Home, Compass, Search, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Local Gems", path: "/explore" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Heart, label: "Saved", path: "/saved" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon 
                className={`w-6 h-6 transition-transform duration-200 ${
                  isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                }`} 
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
