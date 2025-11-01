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
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/20 via-foreground/10 to-transparent animate-portal-pulse blur-xl" />
        
        {/* Portal outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-foreground/30 group-hover:border-foreground/50 transition-all duration-500" />
        
        {/* Spinning orbital ring */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-foreground/20 animate-portal-spin" />
        
        {/* Portal center - clickable area */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-background via-muted to-accent overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-2xl">
          {/* Inner shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/5 to-transparent animate-shimmer" 
               style={{ backgroundSize: "200% 200%" }} />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Lock/Unlock icon */}
            <div className={`mb-3 p-3 rounded-full transition-all duration-300 ${
              isUnlocked 
                ? "bg-foreground/10 group-hover:scale-110 animate-float" 
                : "bg-muted"
            }`}>
              {isUnlocked ? (
                <Unlock className="w-6 h-6 text-foreground" />
              ) : (
                <Lock className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {portal.title}
            </h3>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={`font-medium ${isUnlocked ? "text-foreground animate-pulse" : "text-muted-foreground"}`}>
                {isUnlocked ? "Ready" : timeLeft}
              </span>
            </div>

            {/* Progress ring for locked portals */}
            {!isUnlocked && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-1000 rounded-full"
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

            {/* Unlocked indicator */}
            {isUnlocked && (
              <div className="absolute inset-0 border-4 border-foreground/20 rounded-full animate-glow-pulse" />
            )}
          </div>
        </div>

        {/* Corner timestamp */}
        <div className="absolute -bottom-2 -right-2 bg-background border border-border rounded-full px-3 py-1 text-xs text-muted-foreground shadow-lg">
          {new Date(portal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </Link>
  );
};

export default PortalCard;
