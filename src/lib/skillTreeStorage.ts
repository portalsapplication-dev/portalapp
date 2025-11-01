import { SkillNode } from "@/types/skillTree";

const STORAGE_KEY = "portals_skill_tree";

export const getSkillNodes = (): SkillNode[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSkillNodes = (nodes: SkillNode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
};

export const addSkillNode = (node: Omit<SkillNode, "id" | "createdAt">) => {
  const nodes = getSkillNodes();
  const newNode: SkillNode = {
    ...node,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  nodes.push(newNode);
  saveSkillNodes(nodes);
  return newNode;
};

export const updateSkillNode = (id: string, updates: Partial<SkillNode>) => {
  const nodes = getSkillNodes();
  const index = nodes.findIndex((n) => n.id === id);
  if (index !== -1) {
    nodes[index] = { ...nodes[index], ...updates };
    saveSkillNodes(nodes);
  }
};

export const deleteSkillNode = (id: string) => {
  const nodes = getSkillNodes();
  const filtered = nodes.filter((n) => n.id !== id && n.parentId !== id);
  saveSkillNodes(filtered);
};
