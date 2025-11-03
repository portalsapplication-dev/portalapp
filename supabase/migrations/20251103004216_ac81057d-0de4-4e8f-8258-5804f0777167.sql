-- Add portal_views table to track when users view their portals
CREATE TABLE public.portal_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_id uuid NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, portal_id)
);

-- Enable RLS
ALTER TABLE public.portal_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own portal views
CREATE POLICY "Users can view their own portal views"
ON public.portal_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own portal views
CREATE POLICY "Users can insert their own portal views"
ON public.portal_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own portal views
CREATE POLICY "Users can update their own portal views"
ON public.portal_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_portal_views_user_portal ON public.portal_views(user_id, portal_id);