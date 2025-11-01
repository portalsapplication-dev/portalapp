import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { savePortal } from "@/lib/storage";
import { Portal } from "@/types/portal";
import { Calendar, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

const CreatePortal = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !unlockDate) {
      toast.error("Please fill in title and unlock date");
      return;
    }

    const selectedDate = new Date(unlockDate);
    if (selectedDate <= new Date()) {
      toast.error("Unlock date must be in the future");
      return;
    }

    const portal: Portal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      unlockDate,
      createdAt: new Date().toISOString(),
      images,
      notes: notes.trim(),
      isUnlocked: false,
    };

    savePortal(portal);
    toast.success("Portal created successfully!");
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Portal</h1>
          <p className="text-muted-foreground">
            Store your memories for the future
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer memories 2024"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this moment special?"
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unlockDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Unlock Date *
              </Label>
              <Input
                id="unlockDate"
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/50 transition-colors">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images
                  </p>
                </label>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a message to your future self..."
                rows={5}
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Portal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreatePortal;
