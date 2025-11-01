import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const Settings = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
                      Back up your portals and media to the cloud. Your content stays private unless you choose to back it up.
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
                <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  🔒 All portal media is stored locally by default for privacy and faster access. Enable cloud backup to sync across devices.
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
