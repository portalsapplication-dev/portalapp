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
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No portals yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Create your first time portal to store memories for your future self
            </p>
            <Link to="/create">
              <Button>Create Your First Portal</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {portals.map((portal) => (
              <PortalCard key={portal.id} portal={portal} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
