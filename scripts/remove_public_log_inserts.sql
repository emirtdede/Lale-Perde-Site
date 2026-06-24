-- Drop the existing public insert policies so rate limits cannot be bypassed
DROP POLICY IF EXISTS "Allow public insert on visitor_logs" ON public.visitor_logs;
DROP POLICY IF EXISTS "Allow public insert on search_logs" ON public.search_logs;

-- Ensure RLS is still enabled
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
