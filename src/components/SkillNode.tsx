import { SkillNode as SkillNodeType } from "@/types/skillTree";
import { Check, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";

interface SkillNodeProps {
  node: SkillNodeType;
  onToggleAchieved: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

const SkillNode = ({
  node,
  onToggleAchieved,
  onUpdateTitle,
  onDelete,
  onAddChild,
}: SkillNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTitle(node.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex gap-1 bg-background/95 backdrop-blur-sm p-2 rounded-lg border border-foreground/10 shadow-lg">
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 hover:bg-foreground/10"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          title="Add branch"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 hover:bg-foreground/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      {isEditing && (
        <div className="absolute top-full mt-2 pointer-events-auto">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-48"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default SkillNode;
