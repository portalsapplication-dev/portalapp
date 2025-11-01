import { Portal } from "@/types/portal";
import { Clock, Lock, Unlock, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { deletePortal } from "@/lib/supabaseStorage";
import { toast } from "sonner";

interface PortalCardProps {
  portal: Portal;
  onDelete?: () => void;
}

const PortalCard = ({ portal, onDelete }: PortalCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const unlockDate = new Date(portal.unlockDate);
  const isUnlocked = new Date() >= unlockDate;
  const hasBeenOpened = localStorage.getItem(`portal-opened-${portal.id}`) === "true";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this portal? This cannot be undone.")) {
      try {
        await deletePortal(portal.id);
        toast.success("Portal deleted");
        onDelete?.();
      } catch (error) {
        console.error("Failed to delete portal:", error);
        toast.error("Failed to delete portal");
      }
    }
  };

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

  // Check if portal is nearing unlock (within 24 hours)
  const isNearUnlock = !isUnlocked && (unlockDate.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div className="relative">
      {/* Delete button - only show on hover */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Link to={`/portal/${portal.id}`} className="block group">
        <div className="relative aspect-square">
          {/* Outer glow - CSS only, no images */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-700 ${
              isUnlocked 
                ? hasBeenOpened
                  ? "bg-gradient-to-br from-foreground/20 via-foreground/10 to-transparent blur-3xl" 
                  : "bg-gradient-to-br from-foreground/15 via-foreground/8 to-transparent animate-portal-pulse blur-3xl"
                : isNearUnlock
                ? "bg-gradient-to-br from-foreground/12 via-foreground/6 to-transparent animate-glow-pulse blur-3xl"
                : "bg-gradient-to-br from-foreground/8 via-foreground/4 to-transparent blur-3xl"
            }`} 
          />
          
          {/* Thin portal ring */}
          <div 
            className={`absolute inset-0 rounded-full border transition-all duration-500 ${
              isUnlocked 
                ? hasBeenOpened
                  ? "border-foreground/50 shadow-[0_0_20px_hsl(var(--foreground)/0.25)]"
                  : "border-foreground/70 shadow-[0_0_30px_hsl(var(--foreground)/0.4)]"
                : isNearUnlock
                ? "border-foreground/50 shadow-[0_0_20px_hsl(var(--foreground)/0.3)] animate-glow-pulse"
                : "border-foreground/30 shadow-[0_0_15px_hsl(var(--foreground)/0.15)]"
            } group-hover:border-foreground/80 group-hover:shadow-[0_0_40px_hsl(var(--foreground)/0.5)]`}
            style={{ borderWidth: hasBeenOpened ? '3px' : '2px' }}
          />
          
          {/* Inner spinning ring */}
          <div 
            className={`absolute inset-3 rounded-full border border-dashed transition-opacity duration-500 ${
              isUnlocked ? "border-foreground/30" : "border-foreground/20"
            } animate-portal-spin`} 
            style={{ animationDuration: '40s', borderWidth: '1px' }} 
          />
          
          {/* Portal center */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-background/90 via-muted/60 to-background/90 backdrop-blur-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
            {/* Media silhouette inside portal */}
            {portal.images && portal.images.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-15 blur-[2px]">
                <img 
                  src={portal.images[0]} 
                  alt="Portal preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/5 to-transparent animate-shimmer" 
              style={{ backgroundSize: "200% 200%" }} 
            />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
            {/* Lock/Unlock icon */}
            <div className={`mb-2 p-2 rounded-full transition-all duration-300 ${
              isUnlocked 
                ? "bg-foreground/15 group-hover:scale-110 animate-float" 
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

            {/* Progress indicator for locked portals */}
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

            {/* Unlocked pulse effect */}
            {isUnlocked && (
              <div className="absolute inset-0 border border-foreground/20 rounded-full animate-glow-pulse" />
            )}
          </div>
        </div>
      </div>
      </Link>
      
      {/* Unlock date below portal */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {new Date(portal.unlockDate).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>
  );
};

export default PortalCard;
