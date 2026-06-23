# Sistem Mimarisi Belgesi (SAD)

## Mimari Genel Bakış
Uygulama, Next.js (React 19) App Router mimarisini kullanır. Sunucu tarafı ve istemci tarafı bileşenleri net şekilde ayrıştırılmıştır. Tüm dinamik veriler (ürünler, kategoriler, ayarlar, randevular ve istatistikler) client-side `localStorage` tabanlı bir veri katmanında (Mock Database Service) tutulacaktır. Bu sayede harici bir veritabanına ihtiyaç kalmadan tamamen dinamik bir "Zero-Code" / "No-Code" yönetim deneyimi sunulur.

## Teknoloji Stack'i
| Katman | Teknoloji | Versiyon | Sebep |
|---|---|---|---|
| Framework | Next.js (App Router) | 15+ | Hazır routing, SEO ve React 19 desteği |
| State & Storage | React Context & LocalStorage | - | Kalıcı client-side mock DB, hızlı prototipleme |
| Stil | CSS Modules / Vanilla CSS | - | Maksimum performans, lüks/minimalist görsel kontrol |
| Çeviri | Custom React i18n Context | - | Dil dosyalarını dinamik key-value eşleme |

## Veri Katmanı (Mock DB)
Tüm veriler `localStorage` altında JSON formatında saklanır. Sayfa ilk açıldığında varsayılan tohum veriler (seed data) yüklenir. 
- `lale_perde_products`: Ürün listesi ve varyantları
- `lale_perde_categories`: Koleksiyonlar/kategoriler
- `lale_perde_settings`: Harita, telefon, çalışma saatleri vb. genel ayarlar
- `lale_perde_appointments`: Keşif randevuları
- `lale_perde_leads`: İletişim formu mesajları
- `lale_perde_stats`: Ziyaretçi sayıları, şehir bilgileri, arama kelimeleri analizi
