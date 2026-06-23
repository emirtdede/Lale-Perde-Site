'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LegalPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Gizlilik Politikası</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Lale Perde olarak, ziyaretçilerimizin ve müşterilerimizin gizlilik haklarına büyük önem veriyoruz. Bu politika, sitemiz üzerinden toplanan kişisel verilerin türünü, işlenme amaçlarını ve bu verilerin korunmasına dair aldığımız güvenlik önlemlerini açıklamaktadır.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Toplanan Veriler</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Web sitemizde yer alan Ücretsiz Keşif & Ölçü Randevu formu veya İletişim formu aracılığıyla kendi isteğinizle sağladığınız isim, e-posta adresi, telefon numarası ve ev adresi gibi iletişim bilgilerini topluyoruz.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Verilerin Kullanım Amacı</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Toplanan veriler yalnızca talep ettiğiniz ücretsiz ölçü ve keşif hizmetinin sağlanması, sizinle iletişime geçilmesi, randevu planlamasının yapılması ve kurumsal hizmet taleplerinize yanıt verilmesi amacıyla işlenmektedir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Veri Güvenliği</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Kişisel verileriniz, yetkisiz erişim, kayıp veya ifşa risklerine karşı korumak amacıyla yerel sunucularda güvenli şifreleme yöntemleriyle saklanmaktadır. Verileriniz, yasal zorunluluklar haricinde kesinlikle üçüncü taraflarla paylaşılmaz.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Privacy Policy</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            At Lale Perde, we attach great importance to the privacy rights of our visitors and customers. This policy describes the type of personal data collected through our site, the purposes of processing, and the security measures we take to protect this data.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Data Collected</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            We collect contact information such as name, email address, telephone number, and home address that you voluntarily provide through the Free Survey & Measurement form or the Contact form.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Intended Use of Data</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            The collected data is only processed to provide the free measurement and survey service you requested, to contact you, to schedule appointments, and to respond to your corporate service requests.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Data Security</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Your personal data is stored securely on local servers with encryption methods to protect against unauthorized access, loss, or disclosure. Your data is strictly not shared with third parties except for legal obligations.
          </p>
        </>
      )}
    </div>
  );
}
