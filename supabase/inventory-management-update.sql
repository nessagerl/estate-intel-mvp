-- Run once in Supabase SQL Editor before using investigation renaming.
ALTER TABLE public.investigations ADD COLUMN IF NOT EXISTS title text;
NOTIFY pgrst, 'reload schema';
