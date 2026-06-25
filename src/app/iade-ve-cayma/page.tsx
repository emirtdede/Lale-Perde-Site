'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ReturnPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>İade, İptal ve Değişim Koşulları</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Lale Perde bünyesinde üretilen ürünlerin tamamına yakını müşterilerimizin pencerelerine özel ölçülerle dikildiğinden/üretildiğinden dolayı yasal mevzuat gereğince standart iade prosedürlerinden farklı kurallar geçerlidir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Özel Ölçülü Ürünlerde İade Koşulu</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Kişiye özel ölçü, renk, pile veya tasarım tercihi doğrultusunda dikilen/üretilen tül perde, fon perde, stor, jaluzi ve motorlu sistemlerde <strong>cayma hakkı ve iade kabul edilmemektedir</strong>. Çünkü bu ürünlerin başka bir pencere ölçüsüne uyması veya yeniden satılması hukuken ve teknik olarak mümkün değildir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Hatalı Ölçü veya Kusurlu Üretim Durumu</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Lale Perde ölçüm veya üretim ekibinden kaynaklanan herhangi bir boy/en hatası, kumaş defosu veya dikiş kusuru tespit edilirse; ürünün düzeltilmesi, yeniden dikilmesi veya gerekirse yenisiyle değiştirilmesi şirketimizin sorumluluğundadır. Bu tür durumlarda tadilat ve lojistik masrafları tamamen satıcıya aittir.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. İptal Şartları</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Sipariş onaylanıp kumaş kesim ve dikim aşamasına geçilmeden önceki ilk 24 saat içinde sipariş iptal edilebilir. Kesim işlemine başlandıktan sonra siparişlerin iptali veya iadesi mümkün olmamaktadır.
          </p>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>Return, Cancellation & Exchange Conditions</h1>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            Since almost all products manufactured by Lale Perde are custom sewn/produced with individual measurements for our customers&apos; windows, rules different from standard return procedures apply in accordance with legal regulations.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. Return Conditions for Custom Sized Products</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>Right of withdrawal and returns are not accepted</strong> for sheers, drapes, rollers, venetian blinds, and motorized systems custom sewn/produced in accordance with individual size, color, pleat, or design preferences. It is legally and technically not possible to adapt these products to another window size or to resell them.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. Faulty Dimensions or Defective Production</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            If any height/width error, fabric defect, or sewing flaw arising from Lale Perde measurement or production team is detected; it is our company&apos;s responsibility to adjust, re-sew, or replace the product. In such cases, modification and logistics costs belong entirely to the seller.
          </p>
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. Cancellation Policy</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            Orders can be cancelled within the first 24 hours before the order is approved and sent to fabric cutting and sewing. After the cutting process starts, cancellation or refund of the orders is not possible.
          </p>
        </>
      )}
    </div>
  );
}
