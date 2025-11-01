export interface SkillNode {
  id: string;
  title: string;
  parentId: string | null;
  isAchieved: boolean;
  createdAt: string;
  x: number;
  y: number;
}

export interface SkillTree {
  id: string;
  nodes: SkillNode[];
  createdAt: string;
}
