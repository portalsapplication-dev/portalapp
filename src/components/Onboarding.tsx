import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Target, Map, Settings } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [password, setPassword] = useState("");

  const handleNext = () => {
    if (currentPage < 4) {
      setCurrentPage(currentPage + 1);
    } else {
      // Save onboarding completion and optional password
      localStorage.setItem("hasCompletedOnboarding", "true");
      if (password) {
        localStorage.setItem("journeyPassword", password);
      }
      onComplete();
    }
  };

  const handleSkipPassword = () => {
    setCurrentPage(4);
  };

  const pages = [
    // Page 1: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale">
      <div className="relative">
        {/* Glowing portal animation */}
        <div className="absolute inset-0 bg-foreground/10 blur-3xl rounded-full animate-portal-pulse" />
        <div className="relative w-32 h-32 rounded-full border-4 border-foreground/20 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-foreground/20 to-transparent animate-portal-spin" />
          <Sparkles className="absolute w-12 h-12 text-foreground animate-float" />
        </div>
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Portals</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your journey of self-discovery begins here.
        </p>
      </div>
      <Button onClick={handleNext} size="lg" className="mt-8">
        Continue
      </Button>
    </div>,

    // Page 2: How Portals Work
    <div key="how-it-works" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale px-6">
      <div className="relative">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-full border-2 border-foreground/30 animate-portal-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      <div className="text-center space-y-4 max-w-lg">
        <h2 className="text-3xl font-bold">How Portals Work</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Portals are reflections of your goals and growth. Each one helps you focus, heal, or transform.
        </p>
        <p className="text-muted-foreground">
          Create a portal, seal it with your intentions, and open it when the time is right to see how far you've come.
        </p>
      </div>
      <Button onClick={handleNext} size="lg">
        Continue
      </Button>
    </div>,

    // Page 3: Features Overview
    <div key="features" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale px-6">
      <h2 className="text-3xl font-bold">App Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-card border border-border">
          <Target className="w-8 h-8 text-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Create & Seal Portals</h3>
            <p className="text-sm text-muted-foreground">
              Set intentions and lock them until you're ready to reflect
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-card border border-border">
          <Map className="w-8 h-8 text-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Journey Comparisons</h3>
            <p className="text-sm text-muted-foreground">
              See your transformation with before/after visuals
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-card border border-border">
          <Sparkles className="w-8 h-8 text-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Skill Tree</h3>
            <p className="text-sm text-muted-foreground">
              Track your growth and unlock new abilities
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-4 rounded-lg bg-card border border-border">
          <Settings className="w-8 h-8 text-foreground flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-1">Theme & Settings</h3>
            <p className="text-sm text-muted-foreground">
              Customize your experience and protect your privacy
            </p>
          </div>
        </div>
      </div>
      <Button onClick={handleNext} size="lg">
        Continue
      </Button>
    </div>,

    // Page 4: Privacy Setup
    <div key="privacy" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale px-6">
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/5 blur-2xl rounded-full animate-glow-pulse" />
        <Lock className="relative w-20 h-20 text-foreground" />
      </div>
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-3xl font-bold">Protect Your Journey</h2>
        <p className="text-muted-foreground">
          Set a password to keep your portals private (optional).
        </p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="journey-password">Journey Password</Label>
          <Input
            id="journey-password"
            type="password"
            placeholder="Enter a password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This password will protect your Journey section. You can change it later in Settings.
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={handleSkipPassword}>
          Skip
        </Button>
        <Button onClick={handleNext}>
          {password ? "Set Password" : "Continue"}
        </Button>
      </div>
    </div>,

    // Page 5: Final
    <div key="final" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale">
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/10 blur-3xl rounded-full animate-glow-pulse" />
        <div className="relative">
          <Sparkles className="w-24 h-24 text-foreground animate-float" />
        </div>
      </div>
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-4xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground text-lg">
          You can always change your settings or find help in the Settings menu.
        </p>
      </div>
      <Button onClick={handleNext} size="lg" className="mt-8">
        Get Started
      </Button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="w-full h-full max-w-4xl max-h-screen flex flex-col">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "w-8 bg-foreground"
                  : i < currentPage
                  ? "w-2 bg-foreground/50"
                  : "w-2 bg-foreground/20"
              }`}
            />
          ))}
        </div>
        
        {/* Current page content */}
        <div className="flex-1 flex items-center justify-center">
          {pages[currentPage]}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
