import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const getSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET ortam değişkeni eksik!");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    throw new Error('Yetkisiz işlem: Oturum bulunamadı.');
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (err) {
    throw new Error('Yetkisiz işlem: Geçersiz veya süresi dolmuş oturum.');
  }
}
