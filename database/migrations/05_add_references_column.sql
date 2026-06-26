-- Add references column to home_page_content table
ALTER TABLE public.home_page_content
ADD COLUMN IF NOT EXISTS "references" jsonb DEFAULT '[]'::jsonb;
