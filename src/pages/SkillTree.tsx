import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles } from "lucide-react";
import {
  getSkillNodes,
  addSkillNode,
  updateSkillNode,
  deleteSkillNode,
} from "@/lib/supabaseStorage";
import { SkillNode as SkillNodeType } from "@/types/skillTree";
import SkillNode from "@/components/SkillNode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Sound effect for completing a node
const playCompletionSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const SkillTree = () => {
  const [nodes, setNodes] = useState<SkillNodeType[]>([]);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const loadedNodes = await getSkillNodes();
      setNodes(loadedNodes);
      
      // Animate nodes appearing one by one
      loadedNodes.forEach((node, index) => {
        setTimeout(() => {
          setAnimatedNodes((prev) => new Set([...prev, node.id]));
        }, index * 150);
      });
    };

    checkAuthAndLoad();
  }, [navigate]);

  const calculateNodePosition = (node: SkillNodeType, allNodes: SkillNodeType[]) => {
    const centerX = 400;
    const centerY = 300;
    
    if (!node.parentId) {
      // Root nodes in center
      const rootNodes = allNodes.filter(n => !n.parentId);
      const rootIndex = rootNodes.findIndex(n => n.id === node.id);
      const angle = (rootIndex / rootNodes.length) * Math.PI * 2;
      const radius = 80;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }
    
    // Child nodes radiate outward
    const parent = allNodes.find(n => n.id === node.parentId);
    if (!parent) return { x: centerX, y: centerY };
    
    const siblings = allNodes.filter(n => n.parentId === node.parentId);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const parentPos = calculateNodePosition(parent, allNodes);
    
    // Calculate depth level
    let depth = 1;
    let currentParent = parent;
    while (currentParent.parentId) {
      depth++;
      currentParent = allNodes.find(n => n.id === currentParent.parentId)!;
    }
    
    const radius = 80 + depth * 120;
    const angleSpread = Math.PI / 3;
    const angle = Math.atan2(parentPos.y - centerY, parentPos.x - centerX) + 
                  (siblingIndex - siblings.length / 2 + 0.5) * angleSpread / siblings.length;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const handleAddNode = async () => {
    if (!newNodeTitle.trim()) return;

    const newNode = await addSkillNode({
      title: newNodeTitle,
      parentId: selectedParent || null,
      isAchieved: false,
      x: 0,
      y: 0,
    });

    if (!newNode) {
      toast.error("Failed to add node");
      return;
    }

    setNodes([...nodes, newNode]);
    setNewNodeTitle("");
    setSelectedParent(null);
    
    // Animate new node
    setTimeout(() => {
      setAnimatedNodes((prev) => new Set([...prev, newNode.id]));
    }, 50);
    
    toast.success("Node added");
  };

  const handleToggleAchieved = async (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (node) {
      const newState = !node.isAchieved;
      await updateSkillNode(id, { isAchieved: newState });
      setNodes(
        nodes.map((n) =>
          n.id === id ? { ...n, isAchieved: newState } : n
        )
      );
      
      if (newState) {
        playCompletionSound();
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Congratulations! Skill unlocked: {node.title}</span>
          </div>,
          { duration: 3000 }
        );
      }
    }
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    await updateSkillNode(id, { title });
    setNodes(nodes.map((n) => (n.id === id ? { ...n, title } : n)));
  };

  const handleDelete = async (id: string) => {
    await deleteSkillNode(id);
    setNodes(nodes.filter((n) => n.id !== id && n.parentId !== id));
    toast.success("Node deleted");
  };

  return (
    <Layout>
      <div className="w-full h-[calc(100vh-8rem)] flex flex-col animate-fade-in pb-20">
        <div className="text-center space-y-2 py-6">
          <h1 className="text-4xl font-bold text-foreground">Skill Tree</h1>
          <p className="text-muted-foreground italic">
            "Every branch is growth."
          </p>
        </div>

        <div className="flex gap-2 mx-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-foreground/10">
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

        <div className="flex-1 relative overflow-hidden">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground animate-fade-in space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-foreground/30" />
                </div>
                <p className="text-lg">Start mapping your growth</p>
                <p className="text-sm">Add your first skill to begin your journey</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0">
              {/* Constellation background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--foreground)/0.05),transparent_70%)]" />
              
              <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox="0 0 800 600"
              >
                {/* Draw connection lines */}
                {nodes.map((node) => {
                  if (!node.parentId) return null;
                  const parent = nodes.find((n) => n.id === node.parentId);
                  if (!parent) return null;
                  
                  const nodePos = calculateNodePosition(node, nodes);
                  const parentPos = calculateNodePosition(parent, nodes);
                  
                  return (
                    <line
                      key={`line-${node.id}`}
                      x1={parentPos.x}
                      y1={parentPos.y}
                      x2={nodePos.x}
                      y2={nodePos.y}
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2"
                      strokeOpacity={animatedNodes.has(node.id) ? (node.isAchieved ? 0.4 : 0.2) : 0}
                      className="transition-all duration-500"
                      style={{
                        filter: node.isAchieved ? 'drop-shadow(0 0 4px hsl(var(--foreground)/0.5))' : 'none'
                      }}
                    />
                  );
                })}
                
                {/* Draw nodes */}
                {nodes.map((node) => {
                  const pos = calculateNodePosition(node, nodes);
                  const isAnimated = animatedNodes.has(node.id);
                  
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      style={{
                        opacity: isAnimated ? 1 : 0,
                        transform: isAnimated ? 'scale(1)' : 'scale(0)',
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {/* Outer glow ring for achieved nodes */}
                      {node.isAchieved && (
                        <circle
                          r="32"
                          fill="none"
                          stroke="hsl(var(--foreground))"
                          strokeWidth="2"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        r="24"
                        fill={node.isAchieved ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                        stroke="hsl(var(--foreground))"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-300 hover:r-26"
                        onClick={() => handleToggleAchieved(node.id)}
                        style={{
                          filter: node.isAchieved 
                            ? 'drop-shadow(0 0 12px hsl(var(--foreground)/0.6))' 
                            : 'drop-shadow(0 0 4px hsl(var(--foreground)/0.2))'
                        }}
                      />
                      
                      {/* Check mark for achieved */}
                      {node.isAchieved && (
                        <path
                          d="M -8 0 L -3 5 L 8 -6"
                          stroke="hsl(var(--background))"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      
                      {/* Node title */}
                      <text
                        y="45"
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="12"
                        className="pointer-events-none select-none"
                      >
                        {node.title.length > 15 ? node.title.slice(0, 15) + '...' : node.title}
                      </text>
                      
                      {/* Action buttons on hover */}
                      <foreignObject
                        x="-60"
                        y="-60"
                        width="120"
                        height="120"
                        className="pointer-events-none"
                      >
                        <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
                          <SkillNode
                            node={node}
                            onToggleAchieved={handleToggleAchieved}
                            onUpdateTitle={handleUpdateTitle}
                            onDelete={handleDelete}
                            onAddChild={setSelectedParent}
                          />
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Footer quote */}
        <div className="text-center pt-4 pb-4 text-sm text-muted-foreground italic opacity-60">
          Growth is not instant, but it's visible.
        </div>
      </div>
    </Layout>
  );
};

export default SkillTree;
