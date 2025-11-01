import { useEffect, useState } from "react";
import { getPortals } from "@/lib/storage";
import { Portal } from "@/types/portal";
import PortalCard from "@/components/PortalCard";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        <div className="text-center py-20 space-y-4 animate-fade-in">
          <p className="text-muted-foreground text-lg">No portals yet</p>
          <Link to="/create">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Portal
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-8 min-w-min animate-fade-in">
            {portals.map((portal, index) => (
              <div
                key={portal.id}
                className="w-64 flex-shrink-0"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <PortalCard portal={portal} />
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
