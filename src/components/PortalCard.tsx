import { Portal } from "@/types/portal";
import { Card } from "@/components/ui/card";
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
    <Link to={`/portal/${portal.id}`} className="block">
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                {portal.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {portal.description}
              </p>
            </div>
            <div className="ml-3 flex-shrink-0">
              {isUnlocked ? (
                <div className="p-2 rounded-full bg-accent">
                  <Unlock className="w-5 h-5 text-foreground" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-muted">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={isUnlocked ? "text-foreground font-medium" : "text-muted-foreground"}>
              {isUnlocked ? "Ready to open" : timeLeft}
            </span>
          </div>

          {!isUnlocked && (
            <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground transition-all duration-1000"
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
        </div>
      </Card>
    </Link>
  );
};

export default PortalCard;
