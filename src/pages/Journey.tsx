import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortals } from "@/lib/supabaseStorage";
import { Portal } from "@/types/portal";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Journey = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const stored = await getPortals();
      const openedPortals = stored.filter(p => 
        p.images && p.images.length > 0 && new Date(p.unlockDate) <= new Date()
      );
      setPortals(openedPortals);
      setIsLoading(false);
    };

    initAuth();
  }, [navigate]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : portals.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < portals.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return <LoadingScreen text="Loading your journey..." />;
  }

  if (portals.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <span className="text-4xl">🌌</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Your Journey Awaits</h2>
            <p className="text-muted-foreground max-w-md">
              Capture your journey through portals to see your transformation.
            </p>
            <Button onClick={() => navigate("/create")} className="mt-4">
              Create Your First Portal
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPortal = portals[currentIndex];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Your Journey</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {portals.length} moments
            </p>
          </div>

          {/* Main image display */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted/20 border border-border shadow-lg">
            {currentPortal.images && currentPortal.images[0] && (
              <img
                src={currentPortal.images[0]}
                alt={currentPortal.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Navigation arrows */}
            {portals.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/95 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/95 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Portal info */}
          <div className="text-center space-y-2 p-6 rounded-lg bg-card border border-border">
            <h2 className="text-2xl font-semibold text-foreground">{currentPortal.title}</h2>
            <p className="text-muted-foreground">{currentPortal.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(currentPortal.unlockDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Thumbnail navigation */}
          {portals.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {portals.map((portal, index) => (
                <button
                  key={portal.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-foreground shadow-lg scale-110"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  {portal.images && portal.images[0] ? (
                    <img
                      src={portal.images[0]}
                      alt={portal.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Journey;
