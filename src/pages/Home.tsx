import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPortals, migrateLocalStorageToSupabase } from "@/lib/supabaseStorage";
import { Portal } from "@/types/portal";
import PortalCard from "@/components/PortalCard";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth and migrate data
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        await migrateLocalStorageToSupabase();
        loadPortals();
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        await migrateLocalStorageToSupabase();
        loadPortals();
      } else {
        setPortals([]);
      }
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
    
    const interval = setInterval(loadPortals, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Your Portals</h1>
            <p className="text-muted-foreground italic">
              "Time reveals everything."
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
        <div className="text-center py-20 space-y-4 animate-fade-in">
          <p className="text-muted-foreground text-lg">Sign in to view your portals</p>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      ) : portals.length === 0 ? (
        <div className="text-center py-20 space-y-4 animate-fade-in">
          <p className="text-muted-foreground text-lg">No portals yet</p>
          <Link to="/create">
            <Button 
              className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all h-14 px-8 text-lg"
              size="lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Your First Portal
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-4 animate-fade-in">
          {portals.map((portal, index) => (
            <div
              key={portal.id}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <PortalCard portal={portal} />
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Home;
