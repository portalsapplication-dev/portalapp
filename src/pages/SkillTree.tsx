import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  getSkillNodes,
  addSkillNode,
  updateSkillNode,
  deleteSkillNode,
} from "@/lib/skillTreeStorage";
import { SkillNode as SkillNodeType } from "@/types/skillTree";
import SkillNode from "@/components/SkillNode";
import { toast } from "sonner";

const SkillTree = () => {
  const [nodes, setNodes] = useState<SkillNodeType[]>([]);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  useEffect(() => {
    setNodes(getSkillNodes());
  }, []);

  const handleAddNode = () => {
    if (!newNodeTitle.trim()) return;

    const parentNodes = nodes.filter((n) => n.parentId === selectedParent);
    const newNode = addSkillNode({
      title: newNodeTitle,
      parentId: selectedParent,
      isAchieved: false,
      x: 0,
      y: parentNodes.length * 100,
    });

    setNodes([...nodes, newNode]);
    setNewNodeTitle("");
    toast.success("Node added");
  };

  const handleToggleAchieved = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (node) {
      updateSkillNode(id, { isAchieved: !node.isAchieved });
      setNodes(
        nodes.map((n) =>
          n.id === id ? { ...n, isAchieved: !n.isAchieved } : n
        )
      );
    }
  };

  const handleUpdateTitle = (id: string, title: string) => {
    updateSkillNode(id, { title });
    setNodes(nodes.map((n) => (n.id === id ? { ...n, title } : n)));
  };

  const handleDelete = (id: string) => {
    deleteSkillNode(id);
    setNodes(nodes.filter((n) => n.id !== id && n.parentId !== id));
    toast.success("Node deleted");
  };

  const renderTree = (parentId: string | null, level = 0) => {
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="space-y-6" style={{ marginLeft: level * 40 }}>
        {children.map((node) => (
          <div key={node.id} className="relative">
            {level > 0 && (
              <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-border" />
            )}
            <SkillNode
              node={node}
              onToggleAchieved={handleToggleAchieved}
              onUpdateTitle={handleUpdateTitle}
              onDelete={handleDelete}
              onAddChild={setSelectedParent}
            />
            {renderTree(node.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  const rootNodes = nodes.filter((n) => n.parentId === null);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Skill Tree</h1>
          <p className="text-muted-foreground italic">
            "Growth is not instant, but it's visible."
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a skill or milestone..."
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
            className="flex-1"
          />
          <Button onClick={handleAddNode} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="min-h-[400px] relative">
          {rootNodes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground animate-fade-in">
              <p>Start building your skill tree</p>
            </div>
          ) : (
            <div className="space-y-8">{renderTree(null)}</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SkillTree;
