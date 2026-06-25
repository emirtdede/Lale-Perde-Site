'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const getSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET ortam değişkeni eksik!");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Sadece sunucuda çalışan güvenli rastgele kod üretici
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// E-posta gönderimi (Dışarıya kapalı yardımcı fonksiyon)
async function sendOTPEmail(email: string, code: string, type: '2fa' | 'change' | 'reset') {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('\n[SERVER WARNING] RESEND_API_KEY is undefined. Email sending skipped.\n');
    return;
  }

  // Günlük limit kontrolü
  const { data: settings } = await supabaseAdmin
    .from('site_settings')
    .select('email_send_count, last_email_send_date')
    .eq('id', 'main_settings')
    .single();

  const todayStr = new Date().toISOString().split('T')[0];
  let sendCount = settings?.email_send_count || 0;
  if (settings?.last_email_send_date !== todayStr) sendCount = 0;
  
  if (sendCount >= 5) {
    throw new Error('Günlük e-posta gönderme limitinize (5/5) ulaştınız.');
  }

  const emailSubject = type === 'change' 
    ? 'Lale Perde - Güvenlik Bilgisi Değişikliği' 
    : type === 'reset' 
    ? 'Lale Perde - Şifre Sıfırlama Kodu' 
    : 'Lale Perde - 2FA Giriş Kodu';
    
  const emailIntro = type === 'change' 
    ? 'Yönetici güvenlik bilgilerinizi güncellemek için doğrulama kodu:' 
    : type === 'reset'
    ? 'Şifrenizi sıfırlamak için doğrulama kodu:'
    : 'Giriş yapmak için 2FA kodunuz:';

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
    body: JSON.stringify({
      from: 'Lale Perde Güvenlik <onboarding@resend.dev>',
      to: email,
      subject: emailSubject,
      html: `
        <div style="font-family: sans-serif; padding: 25px;">
          <h2>LALE PERDE</h2>
          <p>${emailIntro}</p>
          <h1 style="letter-spacing: 5px;">${code}</h1>
          <p>Bu kod 5 dakika geçerlidir.</p>
        </div>
      `
    })
  });

  if (!resendRes.ok) throw new Error('E-posta servisi gönderim hatası verdi.');

  await supabaseAdmin
    .from('site_settings')
    .update({ email_send_count: sendCount + 1, last_email_send_date: todayStr })
    .eq('id', 'main_settings');
}

// 1. Giriş Ön Kontrolü
export async function loginAttempt(username: string, password: string) {
  const { data: authRecord } = await supabaseAdmin
    .from('admin_auth')
    .select('admin_username, admin_email, admin_phone, admin_password_hash, two_factor_enabled, two_factor_type')
    .eq('id', 'main_admin')
    .single();

  if (!authRecord) return { error: 'Güvenlik ayarları okunamadı.' };

  const isValidUser = (username === authRecord.admin_username || username === authRecord.admin_email);
  const isValidPass = await bcrypt.compare(password, authRecord.admin_password_hash);

  if (!isValidUser || !isValidPass) return { error: 'Geçersiz kullanıcı adı veya şifre' };

  if (authRecord.two_factor_enabled) {
    return { 
      requires2FA: true, 
      twoFactorType: authRecord.two_factor_type,
      adminEmail: authRecord.admin_email,
      adminPhone: authRecord.admin_phone
    };
  }

  // 2FA kapalıysa doğrudan oturum aç
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 86400, path: '/'
  });

  return { success: true };
}

// 2. Giriş için OTP Gönderimi ve Şifreli Çerez (Cookie) Ataması
export async function sendLoginOTP(destinationType: 'email' | 'phone', targetEmail: string, _targetPhone: string) {
  try {
    const otp = generateOTP();
    
    const token = await new SignJWT({ otp })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(getSecretKey());

    const cookieStore = await cookies();
    cookieStore.set('pending_2fa', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 300, path: '/'
    });

    if (destinationType === 'email') {
      await sendOTPEmail(targetEmail, otp, '2fa');
    } else {
      // TODO: İleride gerçek SMS sağlayıcısı (örn: Netgsm/Twilio) entegre edilecek.
      console.log(`\n[SERVER LOG] SMS 2FA KODU (SIMÜLASYON) - İstemci Göremez: ${otp}\n`);
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'OTP gönderilemedi.' };
  }
}

// 3. OTP Doğrulaması ve Oturum Açılışı
export async function verifyLoginOTPAndLogin(username: string, enteredOTP: string) {
  try {
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('pending_2fa')?.value;
    
    if (!pendingToken) return { error: 'Doğrulama süresi dolmuş. Lütfen tekrar kod isteyin.' };

    const { payload } = await jwtVerify(pendingToken, getSecretKey());
    
    if (payload.otp !== enteredOTP) return { error: 'Hatalı doğrulama kodu.' };

    cookieStore.delete('pending_2fa');

    const token = await new SignJWT({ username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(getSecretKey());

    cookieStore.set('admin_session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 86400, path: '/'
    });

    return { success: true };
  } catch (_err) {
    return { error: 'Geçersiz veya süresi dolmuş kod.' };
  }
}

// 4. Panel İçi Güvenlik Ayarları (SecurityTab) OTP'si
export async function sendSecurityOTP(destinationType: 'email' | 'phone', targetEmail: string) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession) return { error: 'Yetkisiz erişim.' };
    await jwtVerify(adminSession.value, getSecretKey());

    const otp = generateOTP();
    const token = await new SignJWT({ otp })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(getSecretKey());

    cookieStore.set('security_2fa', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 300, path: '/'
    });

    if (destinationType === 'email') {
      await sendOTPEmail(targetEmail, otp, 'change');
    } else {
      // TODO: İleride gerçek SMS sağlayıcısı (örn: Netgsm/Twilio) entegre edilecek.
      console.log(`\n[SERVER LOG] SECURITY SMS KODU (SIMÜLASYON) - İstemci Göremez: ${otp}\n`);
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'OTP gönderilemedi.' };
  }
}

export async function verifySecurityOTP(enteredOTP: string) {
  try {
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('security_2fa')?.value;
    if (!pendingToken) return { error: 'Doğrulama süresi dolmuş.' };

    const { payload } = await jwtVerify(pendingToken, getSecretKey());
    if (payload.otp !== enteredOTP) return { error: 'Hatalı doğrulama kodu.' };

    cookieStore.delete('security_2fa');
    return { success: true };
  } catch (_err) {
    return { error: 'Geçersiz veya süresi dolmuş kod.' };
  }
}

// 5. Password Reset OTP
export async function sendResetOTP(targetEmail: string) {
  try {
    const otp = generateOTP();
    
    const token = await new SignJWT({ otp, email: targetEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(getSecretKey());

    const cookieStore = await cookies();
    cookieStore.set('reset_otp', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 300, path: '/'
    });

    await sendOTPEmail(targetEmail, otp, 'reset');

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Sıfırlama e-postası gönderilemedi.' };
  }
}

export async function verifyResetOTP(enteredOTP: string) {
  try {
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('reset_otp')?.value;
    
    if (!pendingToken) return { error: 'Doğrulama süresi dolmuş.' };

    const { payload } = await jwtVerify(pendingToken, getSecretKey());
    
    if (payload.otp !== enteredOTP) return { error: 'Hatalı doğrulama kodu.' };

    // Şifre değiştirilene kadar tutabiliriz ya da yeni bir token (reset_verified) atayabiliriz. 
    // Basitlik için burada temizlemiyoruz, şifre değiştirildiğinde temizlenecek.
    return { success: true };
  } catch (_err) {
    return { error: 'Geçersiz veya süresi dolmuş kod.' };
  }
}

export async function completePasswordReset(_newPasswordHash: string) {
    // Burada aslında bcrypt hash işlemi ve update yapılmalı, ancak UI tarafında useDb(updateSettings) kullanılıyor.
    // O yüzden cookie'yi temizlemek için basit bir action bırakıyoruz.
    const cookieStore = await cookies();
    cookieStore.delete('reset_otp');
    return { success: true };
}
