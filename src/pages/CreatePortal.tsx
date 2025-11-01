import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { savePortal } from "@/lib/storage";
import { Portal } from "@/types/portal";
import { Calendar, ArrowRight, Upload, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import portalLogo from "@/assets/portal-logo.png";

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
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [unlockDate, setUnlockDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [finalNotes, setFinalNotes] = useState("");

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

  const handleFinish = () => {
    const portal: Portal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      unlockDate,
      createdAt: new Date().toISOString(),
      images,
      notes: finalNotes.trim(),
      isUnlocked: false,
    };

    savePortal(portal);
    toast.success("Portal created successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-foreground/5 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <img 
            src={portalLogo} 
            alt="Portals Logo" 
            className="w-16 h-16 object-contain opacity-80"
          />
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
              
              <Button 
                onClick={handleNextStep} 
                className="w-full h-12 text-base"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="w-full"
              >
                Cancel
              </Button>
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
                {DURATION_PRESETS.map((preset) => (
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
                <div className="text-center text-sm text-muted-foreground animate-fade-in">
                  Opens on {format(new Date(unlockDate), "MMMM dd, yyyy")}
                </div>
              )}
              
              <Button 
                onClick={handleNextStep} 
                className="w-full h-12 text-base"
                size="lg"
                disabled={!unlockDate}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back
              </Button>
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
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Images & Videos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/40 transition-colors bg-background/50 backdrop-blur-sm">
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Tap to upload
                    </p>
                  </label>
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
                  placeholder="What makes this moment special? How do you feel right now?"
                  rows={5}
                  maxLength={1000}
                  className="bg-background/50 backdrop-blur-sm border-foreground/20"
                />
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleNextStep} 
                className="w-full h-12 text-base"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep(2)}
                className="w-full"
              >
                Back
              </Button>
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
              
              <Button 
                onClick={handleFinish} 
                className="w-full h-12 text-base"
                size="lg"
              >
                Seal Portal
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setStep(3)}
                className="w-full"
              >
                Back
              </Button>
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
