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

    const newNode = addSkillNode({
      title: newNodeTitle,
      parentId: selectedParent,
      isAchieved: false,
      x: 0,
      y: 0,
    });

    setNodes([...nodes, newNode]);
    setNewNodeTitle("");
    setSelectedParent(null);
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
      <div className="relative space-y-8" style={{ marginLeft: level * 60 }}>
        {children.map((node, index) => {
          const hasChildren = nodes.some((n) => n.parentId === node.id);
          
          return (
            <div key={node.id} className="relative">
              {/* Connecting line from parent */}
              {level > 0 && (
                <>
                  {/* Horizontal line */}
                  <div 
                    className="absolute -left-12 top-6 w-12 h-[2px] bg-gradient-to-r from-foreground/30 to-foreground/20"
                    style={{
                      boxShadow: node.isAchieved ? '0 0 8px hsl(var(--foreground) / 0.4)' : 'none'
                    }}
                  />
                  {/* Vertical line connector */}
                  {index !== 0 && (
                    <div 
                      className="absolute -left-12 top-6 w-[2px] bg-gradient-to-b from-foreground/20 to-transparent"
                      style={{
                        height: 'calc(100% + 32px)',
                        top: `-${32 + (index * 8)}px`
                      }}
                    />
                  )}
                </>
              )}
              
              <SkillNode
                node={node}
                onToggleAchieved={handleToggleAchieved}
                onUpdateTitle={handleUpdateTitle}
                onDelete={handleDelete}
                onAddChild={setSelectedParent}
              />
              
              {/* Branch indicator line going down */}
              {hasChildren && (
                <div 
                  className="absolute left-8 top-12 w-[2px] h-6 bg-gradient-to-b from-foreground/20 to-transparent"
                  style={{
                    boxShadow: node.isAchieved ? '0 0 6px hsl(var(--foreground) / 0.3)' : 'none'
                  }}
                />
              )}
              
              {renderTree(node.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const rootNodes = nodes.filter((n) => n.parentId === null);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Skill Tree</h1>
          <p className="text-muted-foreground italic">
            "Every branch is growth."
          </p>
        </div>

        <div className="flex gap-2 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-foreground/10">
          <Input
            placeholder={
              selectedParent 
                ? "Add a branch to selected node..." 
                : "Add a root skill..."
            }
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
            className="flex-1"
          />
          <Button onClick={handleAddNode} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
          {selectedParent && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedParent(null)}
              size="sm"
            >
              Cancel Branch
            </Button>
          )}
        </div>

        <div className="min-h-[500px] relative">
          {rootNodes.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground animate-fade-in space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-foreground/30" />
              </div>
              <p className="text-lg">Start mapping your growth</p>
              <p className="text-sm">Add your first skill to begin your journey</p>
            </div>
          ) : (
            <div className="space-y-12 pt-8">
              {/* Constellation-style background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--foreground)/0.03),transparent_50%)]" />
              </div>
              
              <div className="relative">
                {renderTree(null)}
              </div>
            </div>
          )}
        </div>

        {/* Footer quote */}
        <div className="text-center pt-8 pb-4 text-sm text-muted-foreground italic opacity-60">
          Growth is not instant, but it's visible.
        </div>
      </div>
    </Layout>
  );
};

export default SkillTree;
