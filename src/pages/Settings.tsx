import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { toast as sonnerToast } from "sonner";
import NumericPad from "@/components/NumericPad";

const Settings = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [journeyPassword, setJourneyPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showEmailRecovery, setShowEmailRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    // Check if Journey password exists
    const savedPassword = localStorage.getItem("journeyPassword");
    setIsPasswordSet(!!savedPassword);
    setShowPasswordInput(!!savedPassword);

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleJourneyPasswordToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPasswordInput(true);
      setIsPasswordSet(false);
    } else {
      localStorage.removeItem("journeyPassword");
      setShowPasswordInput(false);
      setIsPasswordSet(false);
      setJourneyPassword("");
      sonnerToast.success("Journey password protection disabled");
    }
  };

  const handleSaveJourneyPassword = () => {
    localStorage.setItem("journeyPassword", journeyPassword);
    sonnerToast.success("Journey passcode saved");
    setJourneyPassword("");
    setIsPasswordSet(true);
  };

  const handleResetPassword = () => {
    setVerificationStep(true);
    setCurrentPasswordInput("");
    sonnerToast.info("Verify your current passcode");
  };

  const handleVerifyCurrentPassword = () => {
    const savedPassword = localStorage.getItem("journeyPassword");
    if (currentPasswordInput === savedPassword) {
      setIsPasswordSet(false);
      setJourneyPassword("");
      setVerificationStep(false);
      setCurrentPasswordInput("");
      sonnerToast.success("Verified! Enter a new passcode");
    } else {
      sonnerToast.error("Incorrect passcode");
      setCurrentPasswordInput("");
    }
  };

  const handleEmailRecovery = () => {
    const savedPassword = localStorage.getItem("journeyPassword");
    if (recoveryEmail && savedPassword) {
      // Store email-password association
      const emailPasswords = JSON.parse(localStorage.getItem("emailPasswords") || "{}");
      emailPasswords[recoveryEmail] = savedPassword;
      localStorage.setItem("emailPasswords", JSON.stringify(emailPasswords));
      
      // Simulate email (in production, this would be a real email)
      sonnerToast.success(`Recovery email sent to ${recoveryEmail}`);
      sonnerToast.info(`Your passcode is: ${savedPassword}`);
      setShowEmailRecovery(false);
      setRecoveryEmail("");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto relative">
        {/* Animated stars in the background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-foreground/50 rounded-full animate-[twinkle_4s_ease-in-out_infinite]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            />
          ))}
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
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>

        <Card className="p-6 relative z-10">
          <div className="space-y-6">
            {/* Account Section */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">Account</h3>
              {userEmail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{userEmail}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Sign in to save your data across devices
                  </p>
                  <Button onClick={handleLogin} className="w-full">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">Privacy & Storage</h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base">Cloud Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Back up your portals and media to the cloud
                    </p>
                  </div>
                  <Switch 
                    checked={false}
                    onCheckedChange={(checked) => {
                      toast({
                        title: checked ? "Cloud backup enabled" : "Cloud backup disabled",
                        description: checked 
                          ? "Your portals will be backed up to the cloud." 
                          : "Your portals are stored locally only.",
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-4 p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="journey-protection" className="text-base">Journey Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Require password to view Journey section
                      </p>
                    </div>
                    <Switch
                      id="journey-protection"
                      checked={showPasswordInput}
                      onCheckedChange={handleJourneyPasswordToggle}
                    />
                  </div>
                  {showPasswordInput && !isPasswordSet && (
                    <div className="space-y-4 pt-4 animate-fade-in">
                      <Label className="text-center block">Set Journey Passcode</Label>
                      <NumericPad 
                        value={journeyPassword}
                        onChange={setJourneyPassword}
                      />
                      <Button 
                        onClick={handleSaveJourneyPassword} 
                        className="w-full shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        Save Passcode
                      </Button>
                    </div>
                  )}
                  {showPasswordInput && isPasswordSet && !verificationStep && (
                    <div className="pt-4 text-center space-y-2 animate-fade-in">
                      <p className="text-sm text-muted-foreground">Passcode is set and active</p>
                      <Button 
                        onClick={handleResetPassword} 
                        variant="outline"
                        className="w-full"
                      >
                        Reset Passcode
                      </Button>
                      <Button 
                        onClick={() => setShowEmailRecovery(true)} 
                        variant="ghost"
                        className="w-full text-xs"
                      >
                        Forgot passcode?
                      </Button>
                    </div>
                  )}
                  {showPasswordInput && verificationStep && (
                    <div className="space-y-4 pt-4 animate-fade-in">
                      <Label className="text-center block">Enter Current Passcode</Label>
                      <NumericPad 
                        value={currentPasswordInput}
                        onChange={setCurrentPasswordInput}
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setVerificationStep(false);
                            setCurrentPasswordInput("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleVerifyCurrentPassword} 
                          className="flex-1"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}
                  {showEmailRecovery && (
                    <div className="space-y-4 pt-4 animate-fade-in">
                      <Label className="text-center block">Email Recovery</Label>
                      <p className="text-sm text-muted-foreground text-center">
                        Enter your email to receive your passcode
                      </p>
                      <Input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="text-center"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            setShowEmailRecovery(false);
                            setRecoveryEmail("");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleEmailRecovery} 
                          className="flex-1"
                          disabled={!recoveryEmail}
                        >
                          Send Recovery Email
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  🔒 Your content stays private unless you choose to back it up. All portal media is stored locally by default for privacy and faster access.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-2">About Portals</h3>
              <p className="text-sm text-muted-foreground">
                Portals is a time capsule app that helps you preserve and rediscover your
                memories. Create portals to store images, notes, and reflections, then set a
                future date to unlock them.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
