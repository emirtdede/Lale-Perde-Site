import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'lale-perde-fallback-secret-key-32chars'
);

export async function POST(request: Request) {
  try {
    const { username, password, preCheck } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    // Server-side check
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('admin_username, admin_email, admin_phone, admin_password_hash, two_factor_enabled, two_factor_type')
      .limit(1)
      .single();

    if (error || !settings) {
      return NextResponse.json({ error: 'Sistem ayarları okunamadı' }, { status: 500 });
    }

    const isValidUser = (username === settings.admin_username || username === settings.admin_email);
    const isValidPass = (password === settings.admin_password_hash);

    if (isValidUser && isValidPass) {
      if (preCheck) {
        return NextResponse.json({ 
          success: true, 
          twoFactorEnabled: settings.two_factor_enabled, 
          twoFactorType: settings.two_factor_type,
          adminEmail: settings.admin_email,
          adminPhone: settings.admin_phone
        });
      }

      // Create session
      const alg = 'HS256';
      const token = await new SignJWT({ user: 'admin' })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('24h') // 24 hours
        .sign(SECRET_KEY);

      // Set HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
