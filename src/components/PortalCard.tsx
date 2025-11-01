import { Portal } from "@/types/portal";
import { Clock, Lock, Unlock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface PortalCardProps {
  portal: Portal;
}

const PortalCard = ({ portal }: PortalCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const unlockDate = new Date(portal.unlockDate);
  const isUnlocked = new Date() >= unlockDate;

  useEffect(() => {
    if (isUnlocked) {
      setTimeLeft("Unlocked");
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = unlockDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft("Unlocked");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [unlockDate, isUnlocked]);

  return (
    <Link to={`/portal/${portal.id}`} className="block group">
      <div className="relative aspect-square">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent animate-portal-pulse blur-2xl" />
        
        {/* Thin portal ring - sci-fi style */}
        <div className="absolute inset-0 rounded-full border border-foreground/40 group-hover:border-foreground/60 transition-all duration-500 shadow-[0_0_20px_hsl(var(--foreground)/0.2)]" />
        
        {/* Inner spinning ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-foreground/20 animate-portal-spin" style={{ animationDuration: '30s' }} />
        
        {/* Portal center - clickable area */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-background/80 via-muted/50 to-transparent backdrop-blur-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
          {/* Inner shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/3 to-transparent animate-shimmer" 
               style={{ backgroundSize: "200% 200%" }} />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
            {/* Lock/Unlock icon */}
            <div className={`mb-2 p-2 rounded-full transition-all duration-300 ${
              isUnlocked 
                ? "bg-foreground/10 group-hover:scale-110 animate-float" 
                : "bg-muted/50"
            }`}>
              {isUnlocked ? (
                <Unlock className="w-5 h-5 text-foreground" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {portal.title}
            </h3>

            {/* Countdown */}
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className={`font-medium ${isUnlocked ? "text-foreground animate-pulse" : "text-muted-foreground"}`}>
                {isUnlocked ? "Ready" : timeLeft}
              </span>
            </div>

            {/* Progress ring for locked portals */}
            {!isUnlocked && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground/60 transition-all duration-1000 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((new Date().getTime() - new Date(portal.createdAt).getTime()) /
                        (unlockDate.getTime() - new Date(portal.createdAt).getTime())) *
                        100
                    )}%`,
                  }}
                />
              </div>
            )}

            {/* Unlocked glow */}
            {isUnlocked && (
              <div className="absolute inset-0 border-2 border-foreground/15 rounded-full animate-glow-pulse" />
            )}
          </div>
        </div>
      </div>
      
      {/* Unlock date below portal */}
      <div className="text-center mt-3 text-xs text-muted-foreground">
        {new Date(portal.unlockDate).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </Link>
  );
};

export default PortalCard;
