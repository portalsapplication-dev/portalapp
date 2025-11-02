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
    } else {
      localStorage.removeItem("journeyPassword");
      setShowPasswordInput(false);
      setJourneyPassword("");
      sonnerToast.success("Journey password protection disabled");
    }
  };

  const handleSaveJourneyPassword = () => {
    if (journeyPassword.length < 4 || journeyPassword.length > 6) {
      sonnerToast.error("Passcode must be 4-6 digits");
      return;
    }
    localStorage.setItem("journeyPassword", journeyPassword);
    sonnerToast.success("Journey passcode saved");
    setJourneyPassword("");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </div>

        <Card className="p-6">
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
                  {showPasswordInput && (
                    <div className="space-y-4 pt-4 animate-fade-in">
                      <Label className="text-center block">Set Journey Passcode (4-6 digits)</Label>
                      <NumericPad 
                        value={journeyPassword}
                        onChange={setJourneyPassword}
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleSaveJourneyPassword} 
                        className="w-full shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        disabled={journeyPassword.length < 4}
                      >
                        Save Passcode
                      </Button>
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
