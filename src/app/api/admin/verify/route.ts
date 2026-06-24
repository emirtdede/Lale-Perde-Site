import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
    const { data: authRecord } = await supabaseAdmin
      .from('admin_auth')
      .select('admin_username, admin_email, admin_phone, two_factor_enabled, two_factor_type')
      .eq('id', 'main_admin')
      .single();

    return NextResponse.json({
      authenticated: true,
      adminUsername: authRecord?.admin_username || '',
      adminEmail: authRecord?.admin_email || '',
      adminPhone: authRecord?.admin_phone || '',
      twoFactorEnabled: authRecord?.two_factor_enabled || false,
      twoFactorType: authRecord?.two_factor_type || 'both'
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
