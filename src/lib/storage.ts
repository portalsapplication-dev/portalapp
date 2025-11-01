import { Portal } from "@/types/portal";

const STORAGE_KEY = "portals";

export const getPortals = (): Portal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const savePortal = (portal: Portal): void => {
  const portals = getPortals();
  portals.push(portal);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portals));
};

export const updatePortal = (id: string, updates: Partial<Portal>): void => {
  const portals = getPortals();
  const index = portals.findIndex((p) => p.id === id);
  if (index !== -1) {
    portals[index] = { ...portals[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portals));
  }
};

export const deletePortal = (id: string): void => {
  const portals = getPortals().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portals));
};
