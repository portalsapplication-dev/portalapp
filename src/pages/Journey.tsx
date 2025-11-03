import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPortals } from "@/lib/supabaseStorage";
import { Portal } from "@/types/portal";
import Layout from "@/components/Layout";
import LoadingScreen from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Lock, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import NumericPad from "@/components/NumericPad";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const Journey = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [afterImages, setAfterImages] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if Journey is password protected
      const savedPassword = localStorage.getItem("journeyPassword");
      if (!savedPassword) {
        setIsLocked(false);
      }

      const stored = await getPortals();
      const openedPortals = stored.filter(p => 
        p.images && p.images.length > 0 && new Date(p.unlockDate) <= new Date()
      );
      setPortals(openedPortals);
      
      // Load saved after images
      const savedAfterImages: {[key: string]: string} = {};
      openedPortals.forEach(portal => {
        const saved = localStorage.getItem(`after-image-${portal.id}`);
        if (saved) savedAfterImages[portal.id] = saved;
      });
      setAfterImages(savedAfterImages);
      
      setIsLoading(false);
    };

    initAuth();
  }, [navigate]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem("journeyPassword");
    
    if (passwordInput === savedPassword) {
      setIsLocked(false);
      setPasswordInput("");
      toast.success("Access granted");
    } else {
      toast.error("Incorrect password");
      setPasswordInput("");
    }
  };

  const handleAfterImageUpload = (portalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAfterImages(prev => ({ ...prev, [portalId]: dataUrl }));
        localStorage.setItem(`after-image-${portalId}`, dataUrl);
        toast.success("After image added");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAfterImage = (portalId: string) => {
    setAfterImages(prev => {
      const updated = { ...prev };
      delete updated[portalId];
      return updated;
    });
    localStorage.removeItem(`after-image-${portalId}`);
    toast.success("After image removed");
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : portals.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < portals.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return <LoadingScreen text="Loading your journey..." />;
  }

  if (isLocked) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-md space-y-8 animate-fade-in p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-foreground/10 blur-[60px] rounded-full animate-glow-pulse" />
                <div className="absolute -inset-4 bg-foreground/5 blur-[80px] rounded-full animate-glow-pulse" />
                <Lock className="relative w-16 h-16 text-foreground drop-shadow-[0_0_20px_hsl(var(--foreground)/0.3)]" />
              </div>
              <h2 className="text-2xl font-bold">Journey Protected</h2>
              <p className="text-muted-foreground text-center">
                Enter your passcode to view your journey
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block">Passcode</Label>
                <NumericPad 
                  value={passwordInput}
                  onChange={setPasswordInput}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Unlock Journey
              </Button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  if (portals.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-8rem)]"></div>
      </Layout>
    );
  }

  const currentPortal = portals[currentIndex];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl space-y-6 animate-fade-in">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-4xl font-bold text-foreground">Your Journey</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {portals.length} moments
            </p>
          </div>

          {/* Portal Name */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">{currentPortal.title}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(currentPortal.unlockDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Before & After Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Before</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Media attached before opening
              </p>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted/20 border border-border shadow-lg">
                {currentPortal.images && currentPortal.images[0] && (
                  <img
                    src={currentPortal.images[0]}
                    alt={currentPortal.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </Card>

            {/* After Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">After</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Comparison results
              </p>
              {afterImages[currentPortal.id] ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted/20 border-2 border-foreground shadow-lg">
                  <img
                    src={afterImages[currentPortal.id]}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAfterImage(currentPortal.id)}
                    className="absolute top-4 right-4 bg-destructive/90 hover:bg-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground mb-1">Upload "after" image</span>
                  <span className="text-xs text-muted-foreground">for comparison</span>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/heic,image/webp"
                    onChange={(e) => handleAfterImageUpload(currentPortal.id, e)}
                    className="hidden"
                  />
                </label>
              )}
            </Card>
          </div>

          {/* Description */}
          <Card className="p-6">
            <p className="text-sm text-foreground">{currentPortal.description}</p>
          </Card>

          {/* Navigation arrows */}
          {portals.length > 1 && (
            <div className="flex gap-2 justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="bg-background/80 hover:bg-background/95 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="bg-background/80 hover:bg-background/95 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          )}

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
