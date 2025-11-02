import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { savePortal } from "@/lib/supabaseStorage";
import { Portal } from "@/types/portal";
import { Calendar, ArrowRight, Upload, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import portalLogo from "@/assets/portal-logo.png";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { Camera, Video } from "lucide-react";

const DURATION_PRESETS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "5 Days", days: 5 },
  { label: "1 Week", weeks: 1 },
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", years: 1 },
  { label: "Custom", custom: true },
];

const CreatePortal = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [unlockDate, setUnlockDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [finalNotes, setFinalNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [sealingProgress, setSealingProgress] = useState(0);
  const [unlockTime, setUnlockTime] = useState("00:00");

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to create a portal");
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDurationSelect = (preset: typeof DURATION_PRESETS[0]) => {
    if (preset.custom) {
      setShowCustomDate(true);
      setSelectedDuration(preset.label);
      return;
    }

    let date = new Date();
    if (preset.days) date = addDays(date, preset.days);
    if (preset.weeks) date = addWeeks(date, preset.weeks);
    if (preset.months) date = addMonths(date, preset.months);
    if (preset.years) date = addYears(date, preset.years);

    setUnlockDate(date.toISOString().split("T")[0]);
    setSelectedDuration(preset.label);
    setShowCustomDate(false);
  };

  const handleNextStep = () => {
    if (step === 1 && !title.trim()) {
      toast.error("Please name your portal");
      return;
    }
    if (step === 2 && !unlockDate) {
      toast.error("Please select an unlock date");
      return;
    }
    if (step === 2) {
      const selectedDate = new Date(unlockDate);
      if (selectedDate <= new Date()) {
        toast.error("Unlock date must be in the future");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (isCreating) return; // Prevent duplicate creation
    
    try {
      setIsCreating(true);
      setSealingProgress(0);
      console.log("Starting portal creation...");
      
      // Simulate sealing progress
      const progressInterval = setInterval(() => {
        setSealingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);
      
      // Combine date and time
      const [hours, minutes] = unlockTime.split(':');
      const combinedDate = new Date(unlockDate);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const portal: Omit<Portal, "id"> = {
        title: title.trim(),
        description: description.trim(),
        unlockDate: combinedDate.toISOString(),
        createdAt: new Date().toISOString(),
        images,
        notes: finalNotes.trim(),
        isUnlocked: false,
      };

      console.log("Portal data:", portal);
      const id = await savePortal(portal);
      console.log("Portal saved with ID:", id);
      
      clearInterval(progressInterval);
      setSealingProgress(100);
      
      // Brief pause to show 100%
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (id) {
        toast.success("Portal sealed successfully! 🌟");
        navigate("/");
      } else {
        toast.error("Failed to create portal. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleFinish:", error);
      toast.error("An error occurred while creating the portal.");
    } finally {
      setIsCreating(false);
      setSealingProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-foreground/5 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo - Larger and theme-reactive */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-foreground/10 blur-[80px] rounded-full animate-glow-pulse" />
            <img 
              src={theme === 'dark' ? logoWhite : logoBlack} 
              alt="Portals Logo" 
              className="relative w-48 h-48 object-contain drop-shadow-[0_0_30px_hsl(var(--foreground)/0.4)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-foreground">Name your portal</h1>
              <p className="text-muted-foreground italic">Name your moment in time</p>
            </div>
            
            <div className="space-y-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer of 2024..."
                className="text-center text-xl h-14 bg-background/50 backdrop-blur-sm border-foreground/20"
                maxLength={100}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
              />
              
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  className="flex-1 h-12 text-base"
                  size="lg"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Duration Selection */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-foreground">When will it unlock?</h1>
              <p className="text-muted-foreground italic">Choose how long until this portal opens</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {DURATION_PRESETS.filter(p => !p.custom).map((preset) => (
                  <Button
                    key={preset.label}
                    variant={selectedDuration === preset.label ? "default" : "outline"}
                    className={`h-16 text-base transition-all ${
                      selectedDuration === preset.label
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                    onClick={() => handleDurationSelect(preset)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{preset.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Custom option centered below */}
              <div className="flex justify-center">
                <Button
                  variant={selectedDuration === "Custom" ? "default" : "outline"}
                  className={`h-16 text-base transition-all w-48 ${
                    selectedDuration === "Custom"
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  onClick={() => handleDurationSelect(DURATION_PRESETS.find(p => p.custom)!)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Custom</span>
                  </div>
                </Button>
              </div>

              {showCustomDate && (
                <div className="animate-fade-in">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="date"
                      value={unlockDate}
                      onChange={(e) => {
                        setUnlockDate(e.target.value);
                        setSelectedDuration("Custom");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="text-center text-lg h-14 pl-12 bg-background/50 backdrop-blur-sm border-foreground/20"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {unlockDate && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Time</Label>
                    <Input
                      type="time"
                      value={unlockTime}
                      onChange={(e) => setUnlockTime(e.target.value)}
                      className="text-center text-lg h-14 bg-background/50 backdrop-blur-sm border-foreground/20"
                    />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Opens on {format(new Date(unlockDate), "MMMM dd, yyyy")} at {unlockTime}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  className="flex-1 h-12 text-base"
                  size="lg"
                  disabled={!unlockDate}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Content */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Fill your portal</h1>
              <p className="text-muted-foreground">Add photos, videos, and reflections</p>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Image Upload with Multiple Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Images & Videos</Label>
                
                {/* Upload Options */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/heic,image/webp,video/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="media-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-foreground/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        asChild
                      >
                        <div>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Upload</span>
                        </div>
                      </Button>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="media-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="media-camera">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-foreground/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        asChild
                      >
                        <div>
                          <Camera className="w-6 h-6" />
                          <span className="text-xs">Photo</span>
                        </div>
                      </Button>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="media-video"
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="media-video">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-24 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-foreground/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        asChild
                      >
                        <div>
                          <Video className="w-6 h-6" />
                          <span className="text-xs">Video</span>
                        </div>
                      </Button>
                    </label>
                  </div>
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reflections</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Speak your mind, let all your thoughts loose."
                  rows={5}
                  maxLength={1000}
                  className="bg-background/50 backdrop-blur-sm border-foreground/20"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(2)}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  className="flex-1 h-12 text-base"
                  size="lg"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Notes (Auto-appears) */}
        {step === 4 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-foreground">One last thing...</h1>
              <p className="text-muted-foreground italic">
                Any final notes for your future self before you say goodbye?
              </p>
            </div>
            
            <div className="space-y-6">
              <Textarea
                value={finalNotes}
                onChange={(e) => setFinalNotes(e.target.value)}
                placeholder="Dear future me..."
                rows={8}
                maxLength={2000}
                className="bg-background/50 backdrop-blur-sm border-foreground/20 text-base"
                autoFocus
              />
              
              <div className="space-y-4">
                {/* Progress bar */}
                {isCreating && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-foreground transition-all duration-300 ease-out"
                        style={{ width: `${sealingProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Sealing portal... {sealingProgress}%
                    </p>
                    <p className="text-center text-sm text-muted-foreground italic animate-pulse">
                      "Your future self will thank you for this moment."
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(3)}
                    className="flex-1 h-12"
                    size="lg"
                    disabled={isCreating}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleFinish} 
                    className="flex-1 h-12 text-base"
                    size="lg"
                    disabled={isCreating}
                  >
                    {isCreating ? "Sealing..." : "Seal Portal"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              s === step 
                ? "bg-foreground w-8" 
                : s < step 
                ? "bg-foreground/60" 
                : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CreatePortal;
