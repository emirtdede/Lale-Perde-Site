import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'lale-perde-fallback-secret-key-32chars'
);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session');

  if (!token) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    await jwtVerify(token.value, SECRET_KEY);
    
    const body = await request.json();
    const { action, currentPassword, newPassword, adminEmail, adminPhone, twoFactorEnabled, twoFactorType, adminUsername } = body;

    // Get current secure settings to verify password
    const { data: authRecord, error: fetchError } = await supabaseAdmin
      .from('admin_auth')
      .select('id, admin_password_hash')
      .eq('id', 'main_admin')
      .single();

    if (fetchError || !authRecord) {
      return NextResponse.json({ error: 'Sistem hatası' }, { status: 500 });
    }

    const updates: any = {};

    if (action === 'change_password') {
      if (currentPassword !== authRecord.admin_password_hash) {
        return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 });
      }
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Yeni şifre geçersiz' }, { status: 400 });
      }
      updates.admin_password_hash = newPassword;
    } else if (action === 'update_profile') {
      if (adminUsername !== undefined) updates.admin_username = adminUsername;
      if (adminEmail !== undefined) updates.admin_email = adminEmail;
      if (adminPhone !== undefined) updates.admin_phone = adminPhone;
    } else if (action === 'update_2fa') {
      if (twoFactorEnabled !== undefined) updates.two_factor_enabled = twoFactorEnabled;
      if (twoFactorType !== undefined) updates.two_factor_type = twoFactorType;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('admin_auth')
        .update(updates)
        .eq('id', authRecord.id);

      if (updateError) {
        return NextResponse.json({ error: 'Güncelleme başarısız oldu' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Geçersiz oturum veya sunucu hatası' }, { status: 401 });
  }
}
