import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const getSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET ortam değişkeni eksik!");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { username, password, preCheck } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    // Server-side check
    const { data: authRecord, error } = await supabaseAdmin
      .from('admin_auth')
      .select('admin_username, admin_email, admin_phone, admin_password_hash, two_factor_enabled, two_factor_type')
      .eq('id', 'main_admin')
      .single();

    if (error || !authRecord) {
      return NextResponse.json({ error: 'Güvenlik ayarları okunamadı' }, { status: 500 });
    }

    const isValidUser = (username === authRecord.admin_username || username === authRecord.admin_email);
    const isValidPass = await bcrypt.compare(password, authRecord.admin_password_hash);

    if (isValidUser && isValidPass) {
      if (preCheck) {
        return NextResponse.json({ 
          success: true, 
          twoFactorEnabled: authRecord.two_factor_enabled, 
          twoFactorType: authRecord.two_factor_type,
          adminEmail: authRecord.admin_email,
          adminPhone: authRecord.admin_phone
        });
      }

      // Create session
      const alg = 'HS256';
      const token = await new SignJWT({ 
        username,
        role: 'admin'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(getSecretKey());

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
