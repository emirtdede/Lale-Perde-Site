-- Add UPDATE policies for public logging tables so public users can update search counts and dwell times
CREATE POLICY "Allow public update on search_logs" ON public.search_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update on visitor_logs" ON public.visitor_logs FOR UPDATE USING (true) WITH CHECK (true);
