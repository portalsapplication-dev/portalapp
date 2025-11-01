import { SkillNode as SkillNodeType } from "@/types/skillTree";
import { Check, Edit2, Trash2 } from "lucide-react";
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
    <div
      className={`relative group animate-fade-in-scale ${
        node.isAchieved ? "animate-glow-pulse" : ""
      }`}
    >
      <div
        className={`px-6 py-3 rounded-full border-2 transition-all duration-500 cursor-pointer ${
          node.isAchieved
            ? "bg-foreground/10 border-foreground shadow-[0_0_20px_hsl(var(--foreground)/0.3)]"
            : "bg-background border-muted-foreground/30"
        }`}
        onClick={() => onToggleAchieved(node.id)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              node.isAchieved
                ? "bg-foreground border-foreground"
                : "border-muted-foreground"
            }`}
          >
            {node.isAchieved && <Check className="w-3 h-3 text-background" />}
          </div>

          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="h-6 px-2 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={`text-sm font-medium ${
                node.isAchieved ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {node.title}
            </span>
          )}
        </div>
      </div>

      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default SkillNode;
