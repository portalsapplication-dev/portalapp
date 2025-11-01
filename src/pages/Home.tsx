import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPortals, migrateLocalStorageToSupabase } from "@/lib/supabaseStorage";
import { Portal } from "@/types/portal";
import PortalCard from "@/components/PortalCard";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Home = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);
  const navigate = useNavigate();

  const quotes = [
    "Time reveals everything.",
    "Every moment is a portal to your future self.",
    "Memories are the architecture of our identity.",
    "Your journey is uniquely yours.",
    "Small steps today, great strides tomorrow.",
  ];

  useEffect(() => {
    // Check auth and migrate data
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        await migrateLocalStorageToSupabase();
        await loadPortals();
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      setIsAuthenticated(!!session);
      if (session) {
        await migrateLocalStorageToSupabase();
        await loadPortals();
      } else {
        setPortals([]);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPortals = async () => {
    const stored = await getPortals();
    const sortedPortals = stored.sort(
      (a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
    );
    setPortals(sortedPortals);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      const oldPortals = portals;
      await loadPortals();
      
      // Check for newly unlocked portals
      const newPortals = await getPortals();
      newPortals.forEach(newPortal => {
        const oldPortal = oldPortals.find(p => p.id === newPortal.id);
        const wasLocked = oldPortal && new Date(oldPortal.unlockDate) > new Date();
        const isNowUnlocked = new Date(newPortal.unlockDate) <= new Date();
        
        if (wasLocked && isNowUnlocked && !sessionStorage.getItem(`notified-${newPortal.id}`)) {
          toast.success(`🎉 ${newPortal.title} is ready!`, {
            description: "Your portal has unlocked. Tap to view.",
            action: {
              label: "View",
              onClick: () => navigate(`/portal/${newPortal.id}`)
            }
          });
          sessionStorage.setItem(`notified-${newPortal.id}`, "true");
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, portals, navigate]);

  useEffect(() => {
    if (!isAuthenticated || portals.length === 0) return;
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, portals.length, quotes.length]);

  if (isLoading) {
    return <LoadingScreen text="Loading your portals..." />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Your Portals</h1>
            <p className="text-muted-foreground italic transition-opacity duration-500">
              "{quotes[currentQuote]}"
            </p>
          </div>
          <Link to="/create">
            <Button 
              className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg font-semibold"
              size="lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create new portal
            </Button>
          </Link>
        </div>

      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-muted-foreground text-lg">Sign in to view your portals</p>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg"
              size="lg"
            >
              Sign In
            </Button>
          </div>
        </div>
      ) : portals.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-muted-foreground text-lg">No portals yet</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-4 animate-fade-in w-full max-w-6xl">
            {portals.map((portal, index) => (
              <div
                key={portal.id}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
                className="group"
              >
                <PortalCard portal={portal} onDelete={loadPortals} />
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Home;
