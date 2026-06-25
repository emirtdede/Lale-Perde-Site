'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function UsagePage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Kullanım Koşulları</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Lale Perde web sitesine hoş geldiniz. Sitemizi ziyaret ederek veya kullanarak bu koşulları peşinen kabul etmiş bulunmaktasınız.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Fikri Mülkiyet</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Bu web sitesinde yer alan tasarımlar, logo, metinler, görseller, fotoğraf albümleri ve kodlamalar Lale Perde&apos;ye aittir. Yazılı izin olmaksızın kısmen veya tamamen kopyalanması, dağıtılması ve ticari amaçlarla kullanılması yasaktır.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Hizmet Şartları</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Ücretsiz keşif randevu formunda doldurulan bilgilerin doğruluğundan kullanıcı sorumludur. Yanlış girilen iletişim veya adres bilgileri nedeniyle oluşabilecek randevu gecikmelerinden veya iptallerinden Lale Perde sorumlu tutulamaz.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Değişiklikler</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Lale Perde, site içeriğini, kullanım koşullarını ve sunulan hizmetlerin kapsamını önceden bildirimde bulunmaksızın tek taraflı olarak değiştirme hakkını saklı tutar.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Terms of Use</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Welcome to Lale Perde website. By visiting or using our site, you accept these terms in advance.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Intellectual Property</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            The designs, logo, texts, images, photo albums, and codings contained in this website belong to Lale Perde. Copying, distributing, and using them for commercial purposes in whole or in part without written permission is prohibited.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Terms of Service</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            The user is responsible for the accuracy of the information filled out in the free survey appointment form. Lale Perde cannot be held responsible for appointment delays or cancellations due to incorrectly entered contact or address information.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Amendments</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Lale Perde reserves the right to unilaterally change the content of the site, the terms of use, and the scope of the services offered without prior notice.
          </p>
        </>
      )}
    </div>
  );
}
