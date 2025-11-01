-- Add x and y coordinates to skill_nodes table and rename columns
ALTER TABLE public.skill_nodes 
  RENAME COLUMN name TO title;

ALTER TABLE public.skill_nodes 
  RENAME COLUMN completed TO is_achieved;

ALTER TABLE public.skill_nodes 
  ADD COLUMN x REAL DEFAULT 0,
  ADD COLUMN y REAL DEFAULT 0;