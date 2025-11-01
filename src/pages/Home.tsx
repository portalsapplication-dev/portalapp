import { useEffect, useState } from "react";
import { getPortals } from "@/lib/storage";
import { Portal } from "@/types/portal";
import PortalCard from "@/components/PortalCard";
import Layout from "@/components/Layout";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [portals, setPortals] = useState<Portal[]>([]);

  useEffect(() => {
    const loadPortals = () => {
      const stored = getPortals();
      const sortedPortals = stored.sort(
        (a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()
      );
      setPortals(sortedPortals);
    };

    loadPortals();
    const interval = setInterval(loadPortals, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Portals</h1>
          <p className="text-muted-foreground">
            Time capsules waiting to be unlocked
          </p>
        </div>

        {portals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-muted to-accent flex items-center justify-center mb-6 animate-float shadow-xl">
              <Package className="w-12 h-12 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3 animate-slide-up">No portals yet</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Create your first time portal to store memories for your future self
            </p>
            <Link to="/create">
              <Button className="animate-fade-in-scale" style={{ animationDelay: "0.4s" }}>
                Create Your First Portal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {portals.map((portal, index) => (
              <div
                key={portal.id}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
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
