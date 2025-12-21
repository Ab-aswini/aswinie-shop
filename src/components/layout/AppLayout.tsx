import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerTitle?: string;
}

export function AppLayout({ 
  children, 
  showHeader = true, 
  showNav = true,
  headerTitle 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <AppHeader title={headerTitle} />}
      <main className={`${showNav ? "pb-24" : ""} ${showHeader ? "" : "pt-safe"}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
