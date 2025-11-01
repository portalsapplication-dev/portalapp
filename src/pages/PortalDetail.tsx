import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { getPortals, deletePortal } from "@/lib/storage";
import { Portal } from "@/types/portal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PortalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const portals = getPortals();
    const found = portals.find((p) => p.id === id);
    if (found) {
      setPortal(found);
      setIsUnlocked(new Date() >= new Date(found.unlockDate));
    }
  }, [id]);

  useEffect(() => {
    if (!portal || isUnlocked) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const unlockTime = new Date(portal.unlockDate).getTime();
      const distance = unlockTime - now;

      if (distance < 0) {
        setIsUnlocked(true);
        setTimeLeft("Unlocked!");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [portal, isUnlocked]);

  const handleDelete = () => {
    if (portal) {
      deletePortal(portal.id);
      toast.success("Portal deleted");
      navigate("/");
    }
  };

  if (!portal) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Portal not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {!isUnlocked ? (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{portal.title}</h1>
            <p className="text-muted-foreground mb-8">{portal.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">Unlocks in:</span>
              </div>
              <p className="text-4xl font-bold text-foreground tabular-nums">{timeLeft}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(portal.unlockDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your portal
                      and all its contents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-unlock">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{portal.title}</h1>
                  <p className="text-muted-foreground">{portal.description}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                Created on {new Date(portal.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </Card>

            {portal.images.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portal.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Memory ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </Card>
            )}

            {portal.notes && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
                <p className="text-foreground whitespace-pre-wrap">{portal.notes}</p>
              </Card>
            )}

            <Button onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortalDetail;
