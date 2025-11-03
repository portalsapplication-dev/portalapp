import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showButton, setShowButton] = useState(false);
  const { theme, systemTheme } = useTheme();
  
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logo = currentTheme === "dark" ? logoWhite : logoBlack;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center animate-zoom-in relative z-10">
        <div className="relative mb-12 inline-block">
          {/* Glowing portal effect */}
          <div className="absolute inset-[-40px] rounded-full bg-gradient-to-br from-foreground/20 via-foreground/10 to-transparent animate-glow-pulse blur-3xl" />
          
          {/* Portal logo */}
          <img
            src={logo}
            alt="Portals Logo"
            className="w-56 h-56 mx-auto animate-float relative z-10"
          />
          
          {/* Spinning rings */}
          <div className="absolute inset-[-20px] animate-portal-spin opacity-40">
            <div className="w-full h-full rounded-full border-2 border-t-foreground border-r-transparent border-b-transparent border-l-transparent" />
          </div>
          <div className="absolute inset-[-30px] animate-portal-spin opacity-20" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
            <div className="w-full h-full rounded-full border border-dashed border-t-foreground border-r-transparent border-b-transparent border-l-transparent" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-foreground mb-3 animate-slide-up">
          Portals
        </h1>
        <p className="text-muted-foreground text-lg mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Your memories through time
        </p>

        {showButton && (
          <Button
            onClick={onComplete}
            size="lg"
            className="animate-fade-in-scale bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-lg shadow-[0_0_30px_hsl(var(--foreground)/0.3)]"
          >
            Enter Portal
          </Button>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
