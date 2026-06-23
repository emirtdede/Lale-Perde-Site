'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function InfoPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Ön Bilgilendirme Formu</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            İşbu form, sipariş öncesinde alıcının satın alacağı hizmet ve ürünlere dair ön bilgilendirilmesini sağlamak amacıyla düzenlenmiştir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Satıcı Bilgileri</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Ünvan: Lale Perde Kahta<br />
            Telefon: +90 543 248 05 03<br />
            E-posta: laleperdekahta@gmail.com
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Ürünlerin Temel Nitelikleri ve Fiyatı</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Sipariş edilen perdelerin kumaş türü, rengi, aksesuarları ve en-boy ölçüsü alıcının onayladığı biçimde üretilir. Fiyatlandırma, seçilen kumaşın fiyat çarpanı ve metrajına göre teklif usulüyle netleştirilir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Cayma Hakkının Sınırları</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Alıcının isteği ile kişiye özel ölçüyle dikilen tüm perdeler, Tüketici Kanunu kapsamında cayma hakkı istisnasına tabi olup sipariş onayından sonra iptal, iade veya ölçü değişikliği (üretim başlamış ise) kabul edilmemektedir.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Preliminary Information Form</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            This form has been prepared to provide the buyer with preliminary information about the services and products to be purchased before ordering.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Seller Information</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Title: Lale Perde Kahta<br />
            Phone: +90 543 248 05 03<br />
            Email: laleperdekahta@gmail.com
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Basic Characteristics and Price</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            The fabric type, color, accessories, and width-height measurements of the ordered curtains are produced as approved by the buyer. Pricing is finalized by quote according to the price multiplier and yardage of the selected fabric.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Limits of the Right of Withdrawal</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            All curtains custom sewn with individual measurements at the request of the buyer are subject to the exception of the right of withdrawal under Consumer Law. Cancellation, return, or measurement changes are not accepted after order approval once production begins.
          </p>
        </>
      )}
    </div>
  );
}
