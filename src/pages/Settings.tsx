import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
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
