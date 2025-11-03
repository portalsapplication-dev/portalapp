export interface Portal {
  id: string;
  title: string;
  description: string;
  unlockDate: string;
  createdAt: string;
  images: string[];
  notes: string;
  isUnlocked: boolean;
  portalPassword?: string;
}
