import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabaseClient';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'lale-perde-fallback-secret-key-32chars'
);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session');

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    await jwtVerify(token.value, SECRET_KEY);
    
    // Fetch secure settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('admin_username, admin_email, admin_phone, two_factor_enabled, two_factor_type')
      .limit(1)
      .single();

    return NextResponse.json({ 
      authenticated: true,
      adminUsername: settings?.admin_username || '',
      adminEmail: settings?.admin_email || '',
      adminPhone: settings?.admin_phone || '',
      twoFactorEnabled: settings?.two_factor_enabled || false,
      twoFactorType: settings?.two_factor_type || 'both'
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
