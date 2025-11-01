import { Portal } from "@/types/portal";
import { SkillNode } from "@/types/skillTree";
import { supabase } from "@/integrations/supabase/client";

// Portal functions
export const getPortals = async (): Promise<Portal[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("portals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portals:", error);
    return [];
  }

  return data.map((portal) => ({
    id: portal.id,
    title: portal.title,
    description: portal.description,
    unlockDate: portal.unlock_date,
    createdAt: portal.created_at,
    images: portal.images || [],
    notes: portal.notes || "",
    isUnlocked: portal.is_unlocked,
  }));
};

export const savePortal = async (portal: Omit<Portal, "id">): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("portals")
    .insert({
      user_id: user.id,
      title: portal.title,
      description: portal.description,
      unlock_date: portal.unlockDate,
      images: portal.images,
      notes: portal.notes,
      is_unlocked: portal.isUnlocked,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving portal:", error);
    return null;
  }

  return data.id;
};

export const updatePortal = async (id: string, updates: Partial<Portal>): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.unlockDate !== undefined) updateData.unlock_date = updates.unlockDate;
  if (updates.images !== undefined) updateData.images = updates.images;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.isUnlocked !== undefined) updateData.is_unlocked = updates.isUnlocked;

  const { error } = await supabase
    .from("portals")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating portal:", error);
  }
};

export const deletePortal = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("portals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting portal:", error);
  }
};

// Skill Node functions
export const getSkillNodes = async (): Promise<SkillNode[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("skill_nodes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching skill nodes:", error);
    return [];
  }

  return data.map((node) => ({
    id: node.id,
    title: node.title,
    parentId: node.parent_id || null,
    isAchieved: node.is_achieved,
    createdAt: node.created_at,
    x: node.x || 0,
    y: node.y || 0,
  }));
};

export const saveSkillNodes = async (nodes: SkillNode[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete all existing nodes and insert new ones
  await supabase.from("skill_nodes").delete().eq("user_id", user.id);

  if (nodes.length === 0) return;

  const { error } = await supabase.from("skill_nodes").insert(
    nodes.map((node) => ({
      id: node.id,
      user_id: user.id,
      title: node.title,
      parent_id: node.parentId || null,
      is_achieved: node.isAchieved,
      created_at: node.createdAt,
      x: node.x,
      y: node.y,
    }))
  );

  if (error) {
    console.error("Error saving skill nodes:", error);
  }
};

export const addSkillNode = async (
  node: Omit<SkillNode, "id" | "createdAt">
): Promise<SkillNode | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("skill_nodes")
    .insert({
      user_id: user.id,
      title: node.title,
      parent_id: node.parentId || null,
      is_achieved: node.isAchieved,
      x: node.x,
      y: node.y,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding skill node:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    parentId: data.parent_id || null,
    isAchieved: data.is_achieved,
    createdAt: data.created_at,
    x: data.x || 0,
    y: data.y || 0,
  };
};

export const updateSkillNode = async (
  id: string,
  updates: Partial<SkillNode>
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
  if (updates.isAchieved !== undefined) updateData.is_achieved = updates.isAchieved;
  if (updates.x !== undefined) updateData.x = updates.x;
  if (updates.y !== undefined) updateData.y = updates.y;

  const { error } = await supabase
    .from("skill_nodes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating skill node:", error);
  }
};

export const deleteSkillNode = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete the node and its children
  const { error } = await supabase
    .from("skill_nodes")
    .delete()
    .or(`id.eq.${id},parent_id.eq.${id}`)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting skill node:", error);
  }
};

// Migration helper - migrate localStorage data to Supabase
export const migrateLocalStorageToSupabase = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Migrate portals
  const localPortals = localStorage.getItem("portals");
  if (localPortals) {
    try {
      const portals: Portal[] = JSON.parse(localPortals);
      for (const portal of portals) {
        await supabase.from("portals").insert({
          user_id: user.id,
          title: portal.title,
          description: portal.description,
          unlock_date: portal.unlockDate,
          images: portal.images,
          notes: portal.notes,
          is_unlocked: portal.isUnlocked,
          created_at: portal.createdAt,
        });
      }
      localStorage.removeItem("portals");
    } catch (error) {
      console.error("Error migrating portals:", error);
    }
  }

  // Migrate skill nodes
  const localSkillNodes = localStorage.getItem("portals_skill_tree");
  if (localSkillNodes) {
    try {
      const nodes: SkillNode[] = JSON.parse(localSkillNodes);
      for (const node of nodes) {
        await supabase.from("skill_nodes").insert({
          id: node.id,
          user_id: user.id,
          title: node.title,
          parent_id: node.parentId || null,
          is_achieved: node.isAchieved,
          created_at: node.createdAt,
          x: node.x,
          y: node.y,
        });
      }
      localStorage.removeItem("portals_skill_tree");
    } catch (error) {
      console.error("Error migrating skill nodes:", error);
    }
  }
};
