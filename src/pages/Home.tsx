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
  const quotes = ["Time reveals everything.", "Every moment is a portal to your future self.", "Memories are the architecture of our identity.", "Your journey is uniquely yours.", "Small steps today, great strides tomorrow."];
  useEffect(() => {
    // Check auth and migrate data
    const initAuth = async () => {
      setIsLoading(true);
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session) {
        await migrateLocalStorageToSupabase();
        await loadPortals();
      }
      setIsLoading(false);
    };
    initAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    const sortedPortals = stored.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());
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
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, portals.length, quotes.length]);
  if (isLoading) {
    return <LoadingScreen text="Loading your portals..." />;
  }
  return <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated stars in the background - larger and brighter */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => <div key={i} className="absolute w-1.5 h-1.5 bg-foreground/50 rounded-full animate-[twinkle_4s_ease-in-out_infinite]" style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${4 + Math.random() * 2}s`
        }} />)}
      </div>

      {/* Glowing stars with seamless looping animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const duration = 6 + Math.random() * 4;
          const delay = -(Math.random() * duration);
          return (
            <div 
              key={i} 
              className="absolute w-2.5 h-2.5 bg-foreground/30 rounded-full blur-sm"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `glow-pulse ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`
              }} 
            />
          );
        })}
      </div>

        <div className="text-center space-y-8 mb-12 animate-fade-in relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Your Portals</h1>
            <div className="relative h-[50px] flex items-center justify-center">
              {quotes.map((quote, index) => (
                <p 
                  key={index}
                  className={`text-muted-foreground italic absolute transition-opacity duration-1000 ease-in-out ${
                    index === currentQuote ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  "{quote}"
                </p>
              ))}
            </div>
          </div>
          <Link to="/create">
            <Button size="lg" className="bg-foreground/10 text-foreground border border-foreground/20 hover:bg-foreground/20 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all h-14 px-8 text-lg font-semibold py-[30px]">
              <Plus className="w-6 h-6 mr-2" />
              Create new portal
            </Button>
          </Link>
        </div>

      {!isAuthenticated ? <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-muted-foreground text-lg">Sign in to view your portals</p>
            <Button onClick={() => navigate("/auth")} className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg" size="lg">
              Sign In
            </Button>
          </div>
        </div> : portals.length === 0 ? <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-muted-foreground text-lg">No portals yet</p>
          </div>
        </div> : <div className="flex justify-center items-center flex-1 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4 animate-fade-in w-full max-w-6xl">
            {portals.map((portal, index) => <div key={portal.id} style={{
            animationDelay: `${index * 0.05}s`
          }} className="group">
                <PortalCard portal={portal} onDelete={loadPortals} />
              </div>)}
          </div>
        </div>}
      </div>
    </Layout>;
};
export default Home;