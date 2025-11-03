import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Target, Map, Settings, Clock, Unlock } from "lucide-react";
import NumericPad from "./NumericPad";

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [password, setPassword] = useState("");

  const handleNext = () => {
    if (currentPage < 5) {
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
    setCurrentPage(5);
  };

  const pages = [
    // Page 1: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
      <div className="relative">
        {/* Glowing portal animation with underglow */}
        <div className="absolute inset-0 bg-foreground/10 blur-[60px] rounded-full animate-portal-pulse" />
        <div className="absolute -inset-4 bg-foreground/5 blur-[80px] rounded-full animate-glow-pulse" />
        <div className="relative w-32 h-32 rounded-full border-4 border-foreground/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-foreground/20 to-transparent animate-portal-spin" />
          <Sparkles className="absolute w-12 h-12 text-foreground animate-float" />
        </div>
      </div>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold drop-shadow-[0_2px_10px_hsl(var(--foreground)/0.2)]">Welcome to Portals</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Your journey of self-discovery begins here.
        </p>
      </div>
      <Button 
        onClick={handleNext} 
        size="lg" 
        className="mt-8 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all"
      >
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

    // Page 3: Portal States & Reactions
    <div key="portal-states" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in-scale px-6">
      <h2 className="text-3xl font-bold">How Portals React</h2>
      <p className="text-muted-foreground text-center max-w-lg">
        Portals change their appearance based on how close they are to unlocking
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        {/* Far from Opening - Static */}
        <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card border border-border">
          <div className="relative w-24 h-24">
            {/* Static portal */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/8 via-foreground/4 to-transparent blur-3xl" />
            <div className="absolute inset-0 rounded-full border border-foreground/30 shadow-[0_0_15px_hsl(var(--foreground)/0.15)]" style={{ borderWidth: '2px' }} />
            <div className="absolute inset-3 rounded-full border border-dashed border-foreground/20" style={{ borderWidth: '1px' }} />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-background/90 via-muted/60 to-background/90 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Far from Opening</h3>
            <p className="text-xs text-muted-foreground">Static and calm - more than 24 hours away</p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>7d 12h</span>
            </div>
          </div>
        </div>

        {/* Close to Opening - Pulsing */}
        <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card border border-border">
          <div className="relative w-24 h-24">
            {/* Pulsing portal */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/12 via-foreground/6 to-transparent animate-glow-pulse blur-3xl" />
            <div className="absolute inset-0 rounded-full border border-foreground/50 shadow-[0_0_20px_hsl(var(--foreground)/0.3)] animate-glow-pulse" style={{ borderWidth: '2px' }} />
            <div className="absolute inset-3 rounded-full border border-dashed border-foreground/20 animate-portal-spin" style={{ borderWidth: '1px' }} />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-background/90 via-muted/60 to-background/90 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-6 h-6 text-foreground animate-float" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Almost Ready</h3>
            <p className="text-xs text-muted-foreground">Pulsing and glowing - less than 24 hours away</p>
            <div className="flex items-center justify-center gap-1 text-xs text-foreground">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>8h 32m</span>
            </div>
          </div>
        </div>

        {/* Opened */}
        <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card border border-border">
          <div className="relative w-24 h-24">
            {/* Badge */}
            <div className="absolute -top-2 -left-2 z-10 bg-foreground text-background text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
              Opened
            </div>
            {/* Opened portal */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/20 via-foreground/10 to-transparent blur-3xl" />
            <div className="absolute inset-0 rounded-full border-foreground/50 shadow-[0_0_20px_hsl(var(--foreground)/0.25)]" style={{ borderWidth: '3px' }} />
            <div className="absolute inset-3 rounded-full border border-dashed border-foreground/30" style={{ borderWidth: '1px' }} />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-background/90 via-muted/60 to-background/90 backdrop-blur-sm flex items-center justify-center">
              <Unlock className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Opened</h3>
            <p className="text-xs text-muted-foreground">Static with "Opened" badge - ready to view</p>
            <div className="flex items-center justify-center gap-1 text-xs text-foreground">
              <Clock className="w-3 h-3" />
              <span>Unlocked</span>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleNext} size="lg">
        Continue
      </Button>
    </div>,

    // Page 4: Features Overview
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

    // Page 5: Privacy Setup
    <div key="privacy" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in px-6">
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/10 blur-[60px] rounded-full animate-glow-pulse" />
        <div className="absolute -inset-4 bg-foreground/5 blur-[80px] rounded-full animate-glow-pulse" />
        <Lock className="relative w-20 h-20 text-foreground drop-shadow-[0_0_20px_hsl(var(--foreground)/0.3)]" />
      </div>
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-3xl font-bold">Protect Your Journey</h2>
        <p className="text-muted-foreground">
          Set a 4-6 digit passcode to keep your portals private (optional).
        </p>
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-4">
          <Label className="text-center block">Journey Passcode</Label>
          <NumericPad 
            value={password}
            onChange={setPassword}
            maxLength={6}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          This passcode will protect your Journey section. You can change it later in Settings.
        </p>
      </div>
      <div className="flex gap-4">
        <Button 
          variant="ghost" 
          onClick={handleSkipPassword}
          className="shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          Skip
        </Button>
        <Button 
          onClick={handleNext}
          disabled={password.length > 0 && password.length < 4}
          className="shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {password ? "Set Passcode" : "Continue"}
        </Button>
      </div>
    </div>,

    // Page 6: Final
    <div key="final" className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-foreground/10 blur-[60px] rounded-full animate-glow-pulse" />
        <div className="absolute -inset-4 bg-foreground/5 blur-[80px] rounded-full animate-glow-pulse" />
        <div className="relative">
          <Sparkles className="w-24 h-24 text-foreground animate-float drop-shadow-[0_0_25px_hsl(var(--foreground)/0.4)]" />
        </div>
      </div>
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-4xl font-bold drop-shadow-[0_2px_10px_hsl(var(--foreground)/0.2)]">You're All Set!</h2>
        <p className="text-muted-foreground text-lg">
          You can always change your settings or find help in the Settings menu.
        </p>
      </div>
      <Button 
        onClick={handleNext} 
        size="lg" 
        className="mt-8 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all"
      >
        Get Started
      </Button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Background stars for consistency */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-foreground/40 rounded-full animate-[twinkle_4s_ease-in-out_infinite]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full h-full max-w-4xl max-h-screen flex flex-col relative z-10">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
                i === currentPage
                  ? "w-8 bg-foreground"
                  : i < currentPage
                  ? "w-2 bg-foreground/50"
                  : "w-2 bg-foreground/20"
              }`}
            />
          ))}
        </div>
        
        {/* Current page content with smooth fade transition */}
        <div className="flex-1 flex items-center justify-center transition-opacity duration-500">
          {pages[currentPage]}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
