import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-background text-sm font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">Portals</span>
          </Link>

          <Link to="/create">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Portal</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 animate-fade-in">
        {children}
      </main>

      <nav className="sticky bottom-0 z-50 w-full border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="container flex h-16 items-center justify-around px-4">
          <Link to="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>

          <Link to="/create">
            <Button
              variant={isActive("/create") ? "default" : "ghost"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Create</span>
            </Button>
          </Link>

          <Link to="/settings">
            <Button
              variant={isActive("/settings") ? "default" : "ghost"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
