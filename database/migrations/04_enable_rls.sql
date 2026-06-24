-- Enable RLS on all tables and allow public SELECT (read-only)

-- 1. Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on categories" ON public.categories FOR SELECT USING (true);

-- 2. Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on products" ON public.products FOR SELECT USING (true);

-- 3. Curtain Types
ALTER TABLE public.curtain_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on curtain_types" ON public.curtain_types FOR SELECT USING (true);

-- 4. Fabric Types
ALTER TABLE public.fabric_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on fabric_types" ON public.fabric_types FOR SELECT USING (true);

-- 5. Mounting Types
ALTER TABLE public.mounting_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on mounting_types" ON public.mounting_types FOR SELECT USING (true);

-- 6. Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on services" ON public.services FOR SELECT USING (true);

-- 7. Guides
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on guides" ON public.guides FOR SELECT USING (true);

-- 8. Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on campaigns" ON public.campaigns FOR SELECT USING (true);

-- 9. Home Page Content
ALTER TABLE public.home_page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on home_page_content" ON public.home_page_content FOR SELECT USING (true);

-- 10. Inbox (Messages from contact form)
ALTER TABLE public.inbox ENABLE ROW LEVEL SECURITY;
-- We allow INSERT from public so the contact form works
CREATE POLICY "Allow public insert on inbox" ON public.inbox FOR INSERT WITH CHECK (true);
-- DO NOT allow SELECT from public! Only admin should read inbox.

-- 11. Visitor Logs & Search Logs
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
-- No public policies. Only API endpoint using Service Role can insert.

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
-- No public policies. Only API endpoint using Service Role can insert.
