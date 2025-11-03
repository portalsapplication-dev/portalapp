import { z } from "zod";

// Portal validation schema
export const portalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters"),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes must be less than 2000 characters"),
  unlockDate: z.string().refine((date) => {
    const unlockDate = new Date(date);
    return unlockDate > new Date();
  }, "Unlock date must be in the future"),
  images: z.array(z.string()).max(20, "Maximum 20 images allowed"),
});

// Skill node validation schema
export const skillNodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must be less than 100 characters"),
  x: z.number(),
  y: z.number(),
});
