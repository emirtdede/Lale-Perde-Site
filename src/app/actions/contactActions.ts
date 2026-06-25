'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function submitContactForm(formData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type?: 'contact' | 'appointment' | 'lead';
  formId?: string;
}) {
  try {
    // 1. Validate Input
    if (!formData.name || !formData.email || !formData.message) {
      return { error: 'Lütfen zorunlu alanları doldurun (Ad, E-posta, Mesaj).' };
    }

    const type = formData.type || 'contact';
    
    // 2. Insert into Inbox table securely
    const id = `msg-${Date.now()}`;
    const insertData = {
      id,
      type,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      subject: formData.subject || 'Yeni İletişim Formu Mesajı',
      message: formData.message,
      date: new Date().toISOString(),
      is_read: false,
      is_resolved: false,
      is_archived: false,
    };

    const { error: dbError } = await supabaseAdmin.from('inbox').insert([insertData]);

    if (dbError) {
      console.error('Veritabanına mesaj kaydedilirken hata oluştu:', dbError);
      return { error: 'Mesaj kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.' };
    }

    // 3. (Optional) Send to Formspree securely from the server (Hiding the URL and IP from client)
    const formspreeUrl = `https://formspree.io/f/${formData.formId || 'xyzyqobd'}`;
    
    try {
      await fetch(formspreeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (formspreeErr) {
      // Sadece konsola yaz, ana akışı bozma çünkü mesaj veritabanına kaydedildi
      console.warn('Formspree gönderimi başarısız:', formspreeErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('İletişim formu işlenirken sunucu hatası:', err);
    return { error: 'Bir sunucu hatası oluştu.' };
  }
}
