-- Add unique constraint on user_id in vendors table to enforce one vendor account per user
ALTER TABLE public.vendors ADD CONSTRAINT vendors_user_id_unique UNIQUE (user_id);