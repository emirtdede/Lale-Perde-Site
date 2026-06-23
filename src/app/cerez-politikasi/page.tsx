'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CookiePage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Çerez Politikası</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Lale Perde olarak sitemizin performansını artırmak, kullanıcı deneyiminizi kişiselleştirmek ve tercihlerinizi kaydetmek amacıyla çerezler (cookies) kullanıyoruz.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Çerez Nedir?</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Sitemizin düzgün çalışması ve tercih ettiğiniz ayarların (dil tercihi, tema modu gibi) hatırlanması için kullanılır.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Hangi Çerezleri Kullanıyoruz?</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Sitemizde temel işlevler için zorunlu çerezler (örneğin dil tercihini saklamak için localStorage) ve kullanıcı oturumu çerezleri kullanılmaktadır. Reklam veya üçüncü taraf takip çerezleri barındırmıyoruz.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Çerez Yönetimi</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Tarayıcınızın ayarlarını değiştirerek çerezleri tamamen engelleyebilir veya silinmesini sağlayabilirsiniz. Ancak çerezleri devre dışı bırakmanız halinde sitemizin bazı fonksiyonları (örneğin karanlık mod geçişi veya dil seçimi) kararlı çalışmayabilir.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Cookie Policy</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            At Lale Perde, we use cookies to improve the performance of our site, personalize your user experience, and save your preferences.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. What is a Cookie?</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Cookies are small text files saved on your device through your browser when you visit our website. They are used for the site to work correctly and to remember your preferred settings (like language preferences and theme mode).
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Which Cookies Do We Use?</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            On our site, we use necessary cookies for core functionalities (for example, localStorage to store language preference) and user session cookies. We do not host marketing or third-party tracking cookies.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Cookie Management</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            You can completely block cookies or request their deletion by changing your browser settings. However, if you disable cookies, some functions of our site (for example, dark mode transition or language selection) may not work correctly.
          </p>
        </>
      )}
    </div>
  );
}
