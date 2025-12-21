-- Add parent_id column for hierarchical categories
ALTER TABLE public.categories ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create index for faster parent lookups
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);