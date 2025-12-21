import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export function AppHeader({ title = "uShop", showNotifications = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="w-10" />
        
        <Link to="/" className="flex items-center gap-1">
          <span className="text-muted-foreground font-medium">u</span>
          <span className="text-xl font-bold text-primary">Shop</span>
        </Link>
        
        {showNotifications ? (
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
