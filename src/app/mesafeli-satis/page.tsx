'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function SalesPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Mesafeli Satış Sözleşmesi</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            İşbu sözleşme, Lale Perde ile alıcı arasında mesafeli sipariş ve satış şartlarını belirlemek amacıyla düzenlenmiştir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Sözleşmenin Konusu</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Alıcının, satıcıya ait laleperde.com veya anlaşmalı platformlar (örneğin Shopier) üzerinden sipariş ettiği özel ölçü perdelerin, zanaat ürünlerinin üretimi, teslimatı ve ödeme detayları hakkında hak ve yükümlülükleri kapsamaktadır.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Özel Üretim İstisnası (Cayma Hakkı)</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>ÖNEMLİ:</strong> 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamında, tüketicinin özel istek ve talepleri doğrultusunda hazırlanan veya kişisel ihtiyaçlarına göre özel ölçülerle dikilen/hazırlanan mallarda (perde, stor, jaluzi vb.) alıcı <strong>cayma hakkını kullanamaz ve iade talep edemez</strong>.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Teslimat ve Montaj</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Özel dikim süreci tamamlanan perdeler, belirlenen adrese kargo veya yerel kurulum ekibimiz vasıtasıyla teslim edilerek randevulu şekilde monte edilir.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Distance Sales Agreement</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            This agreement has been prepared to determine the distance ordering and sales terms between Lale Perde and the buyer.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Subject of the Agreement</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            It covers the rights and obligations regarding the production, delivery, and payment details of custom-measured curtains and craft products ordered by the buyer through Lale Perde channels.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Custom Production Exception (Right of Withdrawal)</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>IMPORTANT:</strong> In accordance with Consumer Protection Legislation, the buyer <strong>cannot exercise the right of withdrawal and cannot request a return</strong> for goods prepared in accordance with the consumer&apos;s special requests and personal needs with custom measurements (curtains, roller blinds, venetians, etc.).
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Delivery and Installation</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Curtains whose custom sewing process is completed are delivered to the designated address via shipping or by our local installation team and mounted by appointment.
          </p>
        </>
      )}
    </div>
  );
}
