-- Create the admin_auth table
CREATE TABLE IF NOT EXISTS public.admin_auth (
    id text PRIMARY KEY DEFAULT 'main_admin',
    admin_username text NOT NULL,
    admin_password_hash text NOT NULL,
    admin_email text,
    admin_phone text,
    two_factor_enabled boolean DEFAULT false,
    two_factor_type text,
    two_factor_secret text
);

-- Copy data from site_settings into admin_auth
INSERT INTO public.admin_auth (
    id, 
    admin_username, 
    admin_password_hash, 
    admin_email, 
    admin_phone, 
    two_factor_enabled, 
    two_factor_type, 
    two_factor_secret
)
SELECT 
    'main_admin',
    admin_username,
    admin_password_hash,
    admin_email,
    admin_phone,
    two_factor_enabled,
    two_factor_type,
    NULL as two_factor_secret
FROM public.site_settings
WHERE id = 'main_settings'
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on admin_auth but DO NOT create any public policies
-- Only Service Role will be able to read/write this table
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Drop sensitive columns from site_settings
ALTER TABLE public.site_settings
    DROP COLUMN IF EXISTS admin_username,
    DROP COLUMN IF EXISTS admin_password_hash,
    DROP COLUMN IF EXISTS admin_email,
    DROP COLUMN IF EXISTS admin_phone,
    DROP COLUMN IF EXISTS two_factor_enabled,
    DROP COLUMN IF EXISTS two_factor_type,
    DROP COLUMN IF EXISTS two_factor_secret;

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Allow anonymous read access to non-sensitive site settings
CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);
-- To temporarily not break updates, we might need a policy, but we will move to proxy API.
