'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function KvkkPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>KVKK Aydınlatma Metni</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Lale Perde olarak, 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, siz değerli ziyaretçilerimizin kişisel verilerinin güvenliğine azami hassasiyet gösteriyoruz.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Veri Sorumlusu</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Kişisel verileriniz, veri sorumlusu sıfatıyla Lale Perde (Kâhta Showroom) tarafından Kanun’a uygun olarak işlenecek ve muhafaza edilecektir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Kişisel Verilerin Hangi Amaçla İşleneceği</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Sitemizdeki formlar aracılığıyla toplanan adınız, telefon numaranız, e-posta adresiniz ve ev adresiniz; ücretsiz keşif ve ölçü talebinizin karşılanması, mobilya ve mekan analizi danışmanlığı randevularının organize edilmesi amacıyla sınırlı, ölçülü ve Kanun’un 5. maddesinde belirtilen veri işleme şartları dahilinde işlenmektedir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. İşlenen Kişisel Verilerin Aktarımı</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Kişisel verileriniz, herhangi bir aracı kuruma veya ticari üçüncü partilere aktarılmamakta, yalnızca şirketimizin ölçüm, montaj ve idari departmanları bünyesinde paylaşılmaktadır.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>4. Haklarınız</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            KVKK’nın 11. maddesi uyarınca Lale Perde ile iletişime geçerek kişisel verilerinizin silinmesini, güncellenmesini, işlenip işlenmediğini öğrenmeyi veya yasal haklarınızı kullanmayı talep edebilirsiniz.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>GDPR & KVKK Aydınlatma Metni</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            At Lale Perde, within the scope of the Personal Data Protection Law No. 6698 (KVKK), we show maximum sensitivity to the security of the personal data of our valued visitors.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Data Controller</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Your personal data will be processed and preserved in accordance with the Law by Lale Perde (Kahta Showroom) in the capacity of data controller.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Purpose of Processing Personal Data</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Your name, phone number, e-mail address, and home address collected through forms on our site are processed limited to fulfilling your free survey and measurement requests, and organizing appointment arrangements.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Transfer of Processed Personal Data</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Your personal data is not transferred to any intermediary organization or commercial third parties; it is only shared within the measurement, installation, and administrative departments of our company.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>4. Your Rights</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            In accordance with Article 11 of the KVKK, you can contact Lale Perde to request deletion of your personal data, its updating, learning whether it is processed or not, or exercising your legal rights.
          </p>
        </>
      )}
    </div>
  );
}
