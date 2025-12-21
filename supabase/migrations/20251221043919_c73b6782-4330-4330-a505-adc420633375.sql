-- Make user_id nullable for demo vendors
ALTER TABLE public.vendors ALTER COLUMN user_id DROP NOT NULL;

-- Update the RLS policy to handle null user_ids for demo data
DROP POLICY IF EXISTS "Approved vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Approved vendors are viewable by everyone" 
ON public.vendors 
FOR SELECT 
USING ((is_approved = true) OR (user_id IS NOT NULL AND auth.uid() = user_id));