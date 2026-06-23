# Dil ve Yerelleştirme Stratejisi

## Uygulama Üslubu
- **Türkçe:** Saygın, resmi ve premium lüks marka dili ("Giriş yapın", "Koleksiyonumuzu keşfedin").
- **İngilizce:** Elegant, formal and direct ("Discover the collection", "Book a consultation").

## Dil Yapısı
Proje altında `src/locales/tr.ts` ve `src/locales/en.ts` dosyaları oluşturulacak ve tüm sabit metinler bu dosyalar üzerinden `useLanguage` hook'u ile dinamik olarak çekilecektir.

Örnek yapı:
```typescript
export const tr = {
  nav: {
    home: "Giriş",
    story: "Hikayemiz",
    products: "Ürünler",
    services: "Hizmetler",
    guide: "Rehber",
    appointment: "Tasarım Danışmanlığı"
  },
  hero: {
    subtitle: "Premium Ev Tekstili & Tasarım",
    title: "Işığın En Zarif Hali"
  }
};
```
