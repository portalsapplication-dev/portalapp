import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import { getPortals as getSupabasePortals, deletePortal as deleteSupabasePortal, updatePortal, markPortalAsViewed, getPortalView } from "@/lib/supabaseStorage";
import { getPortals as getLocalPortals, deletePortal as deleteLocalPortal } from "@/lib/storage";
import { Portal } from "@/types/portal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import NumericPad from "@/components/NumericPad";
import { Label } from "@/components/ui/label";
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
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [portalPasswordInput, setPortalPasswordInput] = useState("");
  const [isPortalLocked, setIsPortalLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadPortal = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      const portals = session ? await getSupabasePortals() : getLocalPortals();
      const found = portals.find((p) => p.id === id);
      if (found) {
        setPortal(found);
        const unlocked = new Date() >= new Date(found.unlockDate);
        setIsUnlocked(unlocked);
        
        // Check if portal has a password
        if (found.portalPassword) {
          const portalUnlocked = sessionStorage.getItem(`portal-password-${id}`);
          if (!portalUnlocked) {
            setIsPortalLocked(true);
          }
        }
        
        // Check if this portal has been opened before (only for authenticated users)
        if (session) {
          const hasViewed = await getPortalView(id);
          setHasBeenOpened(hasViewed);
          
          // Mark as opened if unlocked and viewing
          if (unlocked && !hasViewed) {
            await markPortalAsViewed(id);
            setHasBeenOpened(true);
          }
        } else {
          // For local storage, check sessionStorage
          const hasViewed = sessionStorage.getItem(`viewed-${id}`);
          setHasBeenOpened(!!hasViewed);
          if (unlocked && !hasViewed) {
            sessionStorage.setItem(`viewed-${id}`, "true");
            setHasBeenOpened(true);
          }
        }
        
        if (unlocked && !sessionStorage.getItem(`unlocked-${id}`)) {
          setShowUnlockAnimation(true);
          sessionStorage.setItem(`unlocked-${id}`, "true");
          setTimeout(() => setShowUnlockAnimation(false), 1500);
        }
      }
      setIsLoading(false);
    };

    loadPortal();
  }, [id, navigate]);

  useEffect(() => {
    if (!portal || isUnlocked) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const unlockTime = new Date(portal.unlockDate).getTime();
      const distance = unlockTime - now;

      if (distance < 0) {
        setIsUnlocked(true);
        setTimeLeft("Unlocked!");
        setShowUnlockAnimation(true);
        setTimeout(() => setShowUnlockAnimation(false), 1500);
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

  const handlePortalPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portal?.portalPassword && portalPasswordInput === portal.portalPassword) {
      setIsPortalLocked(false);
      sessionStorage.setItem(`portal-password-${id}`, "true");
      setPortalPasswordInput("");
      toast.success("Portal unlocked");
    } else {
      toast.error("Incorrect passcode");
      setPortalPasswordInput("");
    }
  };

  const handleDeleteConfirm = async () => {
    const savedPassword = localStorage.getItem("journeyPassword");
    
    if (savedPassword && deletePassword !== savedPassword) {
      toast.error("Incorrect password");
      setDeletePassword("");
      return;
    }
    
    if (portal) {
      if (isAuthenticated) {
        await deleteSupabasePortal(portal.id);
      } else {
        deleteLocalPortal(portal.id);
      }
      toast.success("Portal deleted");
      navigate("/");
    }
  };

  if (isLoading) {
    return <LoadingScreen text="Loading portal..." />;
  }

  if (!portal) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Portal not found</p>
        </div>
      </Layout>
    );
  }

  // Show portal password screen if portal is unlocked but has password
  if (isUnlocked && isPortalLocked && portal?.portalPassword) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-md space-y-8 animate-fade-in p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-foreground/10 blur-[60px] rounded-full animate-glow-pulse" />
                <Lock className="relative w-16 h-16 text-foreground drop-shadow-[0_0_20px_hsl(var(--foreground)/0.3)]" />
              </div>
              <h2 className="text-2xl font-bold">Portal Protected</h2>
              <p className="text-muted-foreground text-center">
                This portal requires a passcode
              </p>
            </div>
            <form onSubmit={handlePortalPasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block">Passcode</Label>
                <NumericPad 
                  value={portalPasswordInput}
                  onChange={setPortalPasswordInput}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                >
                  Unlock
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {showUnlockAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
            <div className="animate-portal-open">
              <div className="w-64 h-64 rounded-full border-4 border-foreground/50 animate-swirl relative">
                <div className="absolute inset-0 bg-[var(--gradient-portal-open)] animate-pulse" />
              </div>
            </div>
          </div>
        )}

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
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {localStorage.getItem("journeyPassword") 
                        ? "Enter your passcode to confirm deletion."
                        : "This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {localStorage.getItem("journeyPassword") && (
                    <div className="py-4">
                      <NumericPad 
                        value={deletePassword}
                        onChange={setDeletePassword}
                      />
                    </div>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <Card className={`p-6 ${hasBeenOpened ? 'border-2 border-foreground/30 shadow-[0_0_30px_hsl(var(--foreground)/0.15)]' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{portal.title}</h1>
                    {hasBeenOpened && (
                      <span className="px-3 py-1 rounded-full bg-foreground/10 text-foreground text-xs font-medium">
                        Opened
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{portal.description}</p>
                </div>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Portal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {localStorage.getItem("journeyPassword") 
                          ? "Enter your passcode to confirm deletion."
                          : "This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {localStorage.getItem("journeyPassword") && (
                      <div className="py-4">
                        <NumericPad 
                          value={deletePassword}
                          onChange={setDeletePassword}
                        />
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
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
                      className="w-full h-64 object-cover rounded-lg animate-fade-in"
                      style={{ animationDelay: `${idx * 0.2}s` }}
                    />
                  ))}
                </div>
              </Card>
            )}


            {portal.notes && (
              <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
