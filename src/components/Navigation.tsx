import { Link, useLocation } from "react-router-dom";
import { Clock, Sparkles, Settings, Camera } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Clock, label: "Portals" },
    { path: "/journey", icon: Camera, label: "Journey" },
    { path: "/skill-tree", icon: Sparkles, label: "Skill Tree" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50 md:static md:border-t-0 md:border-r md:w-20 md:h-screen">
      <div className="flex md:flex-col justify-around md:justify-start md:gap-4 md:pt-8 px-4 py-3 md:px-0 md:py-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs md:hidden">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
