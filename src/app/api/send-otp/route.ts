import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, code, type = '2fa' } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'E-posta ve doğrulama kodu gereklidir.' }, { status: 400 });
    }

    // Initialize Supabase Client with Service Role Key for server-side DDL/DML access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase sunucu bağlantı ayarları eksik.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch site settings to check daily limits
    const { data: settings, error: fetchError } = await supabase
      .from('site_settings')
      .select('email_send_count, last_email_send_date')
      .eq('id', 'main_settings')
      .single();

    if (fetchError || !settings) {
      return NextResponse.json({ error: 'Sistem ayarları veritabanından yüklenemedi.' }, { status: 500 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let sendCount = settings.email_send_count || 0;
    const lastSendDate = settings.last_email_send_date || '';

    // Reset daily count if it's a new day
    if (lastSendDate !== todayStr) {
      sendCount = 0;
    }

    const DAILY_LIMIT = 5; // Daily email sending limit
    if (sendCount >= DAILY_LIMIT) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('tr-TR');
      return NextResponse.json({ 
        error: `Günlük e-posta gönderme limitinize (${DAILY_LIMIT}/${DAILY_LIMIT}) ulaştınız. Limitleriniz ${tomorrowStr} tarihinde yenilenecektir. Lütfen o zaman tekrar deneyin.`
      }, { status: 429 });
    }

    // 2. Send email via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Resend API key is not configured' }, { status: 500 });
    }

    const emailSubject = type === 'change'
      ? 'Lale Perde Yönetim Paneli - Güvenlik Bilgisi Değişikliği'
      : type === 'reset'
      ? 'Lale Perde Yönetim Paneli - Şifre Sıfırlama Kodu'
      : 'Lale Perde Yönetim Paneli - 2FA Giriş Kodu';
      
    const emailIntro = type === 'change'
      ? 'Yönetici güvenlik bilgilerinizi (2FA E-Posta / Telefon) güncellemek veya silmek için talep ettiğiniz tek seferlik güvenlik doğrulama kodu aşağıdadır:'
      : type === 'reset'
      ? 'Şifrenizi sıfırlamak için talep ettiğiniz tek seferlik doğrulama kodu aşağıdadır:'
      : 'Giriş yapmak için talep ettiğiniz tek seferlik iki adımlı doğrulama (2FA) kodunuz aşağıdadır:';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Lale Perde Güvenlik <onboarding@resend.dev>',
        to: email,
        subject: emailSubject,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #1a2e40; border-radius: 12px; background-color: #0a1118; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid rgba(189, 149, 75, 0.15); padding-bottom: 15px;">
              <h2 style="color: #d4af37; margin: 0; font-family: Georgia, serif; letter-spacing: 0.1em;">LALE PERDE</h2>
              <p style="color: #a3b3c2; font-size: 11px; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 0.15em;">Yönetim Paneli Güvenlik Sistemi</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #e0e6ed;">${emailIntro}</p>
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; text-align: center; padding: 20px; background-color: #0f1820; border: 1px solid rgba(189,149,75,0.3); border-radius: 6px; color: #d4af37; margin: 25px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #a3b3c2; line-height: 1.5;">Bu kod 5 dakika boyunca geçerlidir. Bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.</p>
          </div>
        `
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend API response error:', errText);
      return NextResponse.json({ error: 'E-posta servisi gönderim hatası verdi.' }, { status: 500 });
    }

    // 3. Increment email count and save today's date in DB
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        email_send_count: sendCount + 1,
        last_email_send_date: todayStr
      })
      .eq('id', 'main_settings');

    if (updateError) {
      console.error('Error updating email send settings in DB:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
