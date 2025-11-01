import { useEffect, useState } from "react";
import portalLogo from "@/assets/portal-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center animate-zoom-in">
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 animate-glow-pulse rounded-full" />
          <img
            src={portalLogo}
            alt="Portals Logo"
            className="w-32 h-32 mx-auto animate-float relative z-10"
          />
          <div className="absolute inset-0 animate-portal-spin opacity-30">
            <div className="w-full h-full rounded-full border-4 border-t-foreground border-r-transparent border-b-transparent border-l-transparent" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-foreground mb-2 animate-slide-up">
          Portals
        </h1>
        <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Your memories through time
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
