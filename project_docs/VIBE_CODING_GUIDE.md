# VIBE CODING — Proje Bilgi Merkezi (Şablon Deposu ve Kılavuz)

> Bu doküman, yapay zeka ajanlarının (AI Agents) ve geliştiricilerin projede kullanacağı markdown dokümantasyon şablonlarını, klasör yapısını ve genel çalışma felsefesini barındıran "Referans Kılavuzu"dur. 
> **Not:** Ajanın asıl operasyonel anayasası proje kökündeki `.rules` dosyasıdır. Ajan, belge formatlarını öğrenmek için bu dosyaya başvurur.

---

## Klasör Yapısı

```text
project-root/
│
├── src/
├── public/
├── locales/
│   ├── tr.js                        ← Türkçe UI metinleri (key-value)
│   └── en.js                        ← İngilizce UI metinleri (key-value)
├── plans/                           ← Ajan tarafından oluşturulan eylem planları
├── [paket yöneticisi dosyası]
├── .env.example                     ← Ortam değişkenleri şablonu (GitHub'a eklenir)
├── .env                             ← Gizli ortam değişkenleri (ASLA commit edilmez)
├── .gitignore                       ← .env dosyasını İÇERMELİ
├── .rules                           ← AJANIN TEK VE YEGANE ANAYASASI
│
└── project_docs/
    │
    ├── VIBE_CODING_GUIDE.md         ← BU DOSYA (Şablon Deposu)
    ├── PRD.md                       ← Ürün Gereksinimleri Belgesi
    ├── SRS.md                       ← Yazılım Gereksinimleri Spesifikasyonu
    ├── SAD.md                       ← Sistem Mimarisi Belgesi (TDD)
    │
    ├── DATABASE_SCHEMA.md           ← Veri modeli
    ├── API_SPECIFICATION.md         ← Endpoint listesi
    ├── UI_UX_GUIDELINES.md          ← Tasarım sistemi
    ├── DEVELOPMENT_ROADMAP.md       ← Versiyon planı
    │
    ├── MEMORY.md                    ← Ajanın proje hafızası (maks. 100 satır)
    ├── GLOSSARY.md                  ← Projeye özgü terimler
    ├── LOCALIZATION.md              ← Çeviri, dil ve üslup kuralları
    │
    ├── CHANGELOG.md                 ← Son 30 günün değişiklikleri
    ├── CHANGELOG_ARCHIVE/           ← Eski kayıtlar (YYYY-MM.md)
    │
    ├── TASKS.md                     ← Görev listesi (maks. 250 satır)
    ├── TASKS_ARCHIVE/               ← Arşivlenen görevler (YYYY-MM.md)
    ├── TECHNICAL_DEBT.md            ← Sonraya bırakılan işler
    ├── DECISIONS.md                 ← Mimari karar kayıtları (ADR)
    ├── RISKS.md                     ← Aktif riskler
    │
    ├── FILE_STRUCTURE.md            ← Proje dosya haritası
    ├── TESTING_STATUS.md            ← Test takibi
    ├── ENVIRONMENT.md               ← Env değişkenleri ve local kurulum
    ├── SECURITY.md                  ← Güvenlik kuralları ve hassas alanlar
    ├── DEPLOYMENT.md                ← Sunucu, CI/CD ve dağıtım adımları
    └── PROMPTS_LIBRARY.md           ← Özel ajan promptları ve sistem komutları
```

---

## Dosyaların Görevleri ve Şablonları

Ajan, `project_docs/` dizinindeki herhangi bir belgeyi sıfırdan oluştururken veya güncellerken aşağıdaki şablonları BİREBİR referans alacaktır.

---

### PRD.md (Ürün Gereksinimleri Belgesi)

Projenin iş hedeflerini ve kullanıcı beklentilerini tanımlar. Yeni modüller öncesi ilk bu yazılır.

```markdown
# Ürün Gereksinimleri Belgesi (PRD)

## Ürün Vizyonu
[Ürünün tek cümlelik amacı ve hedefi]

## Hedef Kitle
- **Birincil Kullanıcı:** [Kim, ne istiyor, neden kullanıyor]
- **İkincil Kullanıcı:** [Kim, ne istiyor, neden kullanıyor]

## İş Hedefleri
- [İş hedefi 1]
- [İş hedefi 2]
- [İş hedefi 3]

## Kullanıcı Hikayeleri (User Stories)
- **[Kullanıcı tipi]** olarak, **[eylem]** yapabilmek istiyorum; böylece **[fayda]** elde ederim.
- **[Kullanıcı tipi]** olarak, **[eylem]** yapabilmek istiyorum; böylece **[fayda]** elde ederim.

## Başarı Metrikleri (KPI)
| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| [Metrik 1] | [Hedef değer] | [Nasıl ölçülür] |
| [Metrik 2] | [Hedef değer] | [Nasıl ölçülür] |

## Kapsam Dışı (Out of Scope)
- [Bu versiyonda yapılmayacak şey 1]
- [Bu versiyonda yapılmayacak şey 2]
```

---

### SRS.md (Yazılım Gereksinimleri Spesifikasyonu)

İşlevsel ve teknik gereksinimlerin test edilebilir biçimde listelendiği belgedir. PRD'den sonra yazılır.

```markdown
# Yazılım Gereksinimleri Spesifikasyonu (SRS)

## İşlevsel Gereksinimler

### [Modül Adı]
- **FR-001:** [Test edilebilir gereksinim tanımı]
- **FR-002:** [Test edilebilir gereksinim tanımı]

### [Modül Adı]
- **FR-003:** [Test edilebilir gereksinim tanımı]

## İşlevsel Olmayan Gereksinimler

### Performans
- [Performans gereksinimi, örn. sayfa yüklenme süresi < 2sn]
- [Eşzamanlı kullanıcı kapasitesi]

### Güvenilirlik
- [Uptime hedefi, örn. %99.9]
- [Veri yedekleme sıklığı]

### Ölçeklenebilirlik
- [Yatay/dikey ölçeklendirme gereksinimleri]

### Güvenlik
- [Kimlik doğrulama standardı]
- [Veri şifreleme gereksinimi]

## Kısıtlamalar
- [Teknik kısıt 1]
- [Yasal/uyumluluk kısıtı]

## Kabul Kriterleri
- [ ] [Özellik 1] için: [test edilebilir kriter]
- [ ] [Özellik 2] için: [test edilebilir kriter]
```

---

### SAD.md (Sistem Mimarisi Belgesi)

Sistem mimarisi, kritik algoritmalar, veri akışı ve teknoloji stack'ini kapsar. SRS'ten sonra yazılır.

```markdown
# Sistem Mimarisi Belgesi (SAD / TDD)

## Mimari Genel Bakış
[Sistemin yüksek seviyeli mimarisinin açıklaması — monolith / microservice / serverless vb.]

## Teknoloji Stack'i
| Katman        | Teknoloji          | Versiyon | Sebep                      |
|---------------|--------------------|----------|----------------------------|
| Frontend      | [teknoloji]        | [x.x]+   | [seçim sebebi]             |
| Backend       | [teknoloji]        | [x.x]+   | [seçim sebebi]             |
| Veritabanı    | [teknoloji]        | [x.x]+   | [seçim sebebi]             |
| Cache         | [teknoloji]        | [x.x]+   | [seçim sebebi]             |

## Kritik Algoritmalar ve İş Mantığı
- **[Algoritma/İş Kuralı Adı]:** [Detaylı açıklama]
- **[Algoritma/İş Kuralı Adı]:** [Detaylı açıklama]

## Veri Akışı
[Kritik veri akışlarının adım adım açıklaması]

## Güvenlik Mimarisi
[Kimlik doğrulama, yetkilendirme, veri güvenliği yaklaşımları]

## Ölçeklendirme Stratejisi
[Yatay/dikey ölçeklendirme planı ve bottleneck analizi]
```

---

### LOCALIZATION.md (Dil, Çeviri ve Üslup Kuralları)

Uygulamanın dil bütünlüğünü sağlamak için referans alınır. Yeni UI metinleri eklenmeden önce okunmalıdır.

```markdown
# Dil ve Yerelleştirme Stratejisi

## Uygulama Üslubu (Tone of Voice)
- **Türkçe (Ana Dil):** [Samimi mi, resmi mi? Örn: "Giriş yapın" vs "Giriş yap"]
- **İngilizce:** [Örn: Formal ve doğrudan.]

## Özel Kelime Karşılıkları
| Türkçe (Referans) | İngilizce Karşılığı | Asla Kullanılmayacaklar |
|-------------------|---------------------|-------------------------|
| İptal             | Cancel              | Abort, Quit             |
| Sepete Ekle       | Add to Cart         | Buy, Get                |
| Oturum Aç         | Sign In             | Login, Log in           |

## Çeviri Kuralları
- Noktalama işaretleri (sonunda nokta olup olmaması) diller arası tutarlı olmalıdır.
- Hata mesajları her zaman "Neden hata oldu + Nasıl çözülür" formatında olmalıdır.
```

---

### DEPLOYMENT.md (Dağıtım ve Sunucu Süreçleri)

Projenin canlı ortama nasıl aktarılacağını tanımlar.

```markdown
# Dağıtım ve Sunucu Mimarisi

## Sunucu Altyapısı
- **Sağlayıcı:** [AWS / Vercel / DigitalOcean vb.]
- **İşletim Sistemi / Çevre:** [Ubuntu 24.04 / Node 20 vb.]

## CI/CD Akışı
- **Tetikleyici:** `main` dalına push yapıldığında.
- **Adımlar:**
  1. Lint ve Unit Testler çalışır.
  2. Build alınır.
  3. Sunucuya deploy edilir.

## Manuel Deploy Komutları
```bash
# Projeyi derleme
[build komutu]

# Sunucuda başlatma
[start komutu]
```

## Ortamlar (Environments)
- **Staging:** [URL] - `dev` dalından beslenir.
- **Production:** [URL] - `main` dalından beslenir.
```

---

### PROMPTS_LIBRARY.md (Özel Ajan İstemleri)

Farklı görevler için ajana verilecek spesifik prompt şablonlarıdır.

```markdown
# Ajan Komut Kütüphanesi

*Bu dosya, farklı görevler için ajana verilecek hazır şablonları (prompt) içerir.*

## 1. UI İnce Ayar Prompt'u
> "Şu anki modülün UI tasarımını UI_UX_GUIDELINES.md standartlarına göre incele. Renk paleti, erişilebilirlik (ARIA) ve mobil uyumluluk açısından eksikleri bul ve doğrudan uygula."

## 2. Güvenlik Check-Up Prompt'u
> "Yazdığımız son API endpointlerini SECURITY.md standartlarına göre denetle. Rate limit, input validasyonu ve auth eksikliklerini tespit et."

## 3. Refactor Prompt'u
> "Bu dosyadaki fonksiyonları Pure Function prensibine göre ayır. Yan etkileri (API çağrısı, DB yazması) ana mantıktan izole et."
```

---

### DATABASE_SCHEMA.md

Tüm tablo yapıları. Her DB değişiklikten sonra güncellenmeli.

```markdown
# Veritabanı Şeması

## Tablolar

### [tablo_adı]
| Kolon        | Tip           | Özellik          |
|--------------|---------------|------------------|
| id           | [tip]         | PK               |
| [kolon]      | [tip]         | [kısıt]          |
| [kolon]      | [tip]         | [kısıt]          |
| created_at   | TIMESTAMP     | DEFAULT NOW()    |

### [tablo_adı]
| Kolon        | Tip           | Özellik                |
|--------------|---------------|------------------------|
| id           | [tip]         | PK                     |
| [parent]_id  | [tip]         | FK → [parent_tablo].id |
| created_at   | TIMESTAMP     | DEFAULT NOW()          |

## İlişkiler
- [tablo] → [tablo] ([1:N / N:N / 1:1])
- [diğer ilişkiler]

## İndeksler
- [tablo].[kolon]
- [tablo].[kolon]
```

---

### API_SPECIFICATION.md

Tüm endpoint'ler. Frontend ile backend arasındaki sözleşme. 

```markdown
# API Spesifikasyonu

Base URL: /api/[versiyon]

## [Modül Adı]

### POST /[modül]/[aksiyon]
Auth: [yöntem]
Body: { [alan], [alan] }
Response: { [alan], [alan] }

### GET /[modül]/:id
Auth: [yöntem]
Response: { [alan] }

### PATCH /[modül]/:id
Auth: [yöntem] ([rol kısıtı])
Body: { [alan]?, [alan]? }
Response: { [alan] }

## Hata Kodları
| Kod | Anlamı               |
|-----|----------------------|
| 400 | Geçersiz istek       |
| 401 | Kimlik doğrulanamadı |
| 403 | Yetkisiz             |
| 404 | Bulunamadı           |
| 500 | Sunucu hatası        |
```

---

### UI_UX_GUIDELINES.md

Tasarım sistemi. Ajanın UI yazarken referans alacağı tek kaynak.

```markdown
# UI/UX Kılavuzu

## Tema & Stil
- Açık / Koyu Mod: [destekleniyor / desteklenmiyor]
- Varsayılan: [sistem tercihi / açık / koyu]
- CSS framework: [Tailwind / CSS Modules / Styled Components vb.]

## Renk Paleti
| İsim          | Değer     | Kullanım          |
|---------------|-----------|-------------------|
| primary       | [#hex]    | Butonlar, CTA     |
| secondary     | [#hex]    | Sidebar, Header   |
| background    | [#hex]    | Ana arka plan     |
| surface       | [#hex]    | Kartlar           |
| text          | [#hex]    | Genel metin       |
| error         | [#hex]    | Hata durumu       |
| success       | [#hex]    | Başarı durumu     |

## Tipografi
- Font: [font ailesi]
- Heading: [ağırlık]
- Body: [ağırlık]

## Bileşen Kuralları
- Buton: [min genişlik], [border-radius]
- Input: [border stili], [focus stili]

## Erişilebilirlik
- ARIA label'ları zorunlu
- Kontrast oranı min 4.5:1
```

---

### DEVELOPMENT_ROADMAP.md

Versiyon planı. Önceliklerin ve kapsamın tek kaynağı.

```markdown
# Geliştirme Yol Haritası

## V1 — Temel (Şu an)
- [ ] [Temel özellik 1]
- [ ] [Temel özellik 2]
- [ ] [Temel özellik 3]

## V2 — [Tema]
- [ ] [Özellik 1]
- [ ] [Özellik 2]

## V3 — [Tema]
- [ ] [Özellik 1]
- [ ] [Özellik 2]

## İptal Edilen / Ertelenen
- [Sebep ile birlikte listele]
```

---

### MEMORY.md

**En kritik dosya.** Ajanın projeyi hatırlamak için okuduğu ilk yer. Maksimum 100 satır.

```markdown
# Proje Hafızası

Son güncelleme: YYYY-MM-DD

## Proje Özeti
[2-3 cümle: Proje ne, kimin için, temel hedef ne]

## Teknik Özet
- Frontend: [teknoloji]
- Backend: [teknoloji]
- DB: [teknoloji]
- Auth: [yöntem]

## Şu Anki Durum
- Tamamlanan: [modüller]
- Devam eden: [aktif modül]
- Sıradaki: [planlanan modül]

## Son Yapılan İş
[Son görevin 3-5 cümlelik özeti]

## Dikkat Edilmesi Gerekenler
- [Kritik uyarı 1]
- [Kritik uyarı 2]

## Açık Sorunlar
- [Çözülmemiş teknik sorun varsa]
```

---

### GLOSSARY.md

Projeye özgü terimler. Ajan bu dosya sayesinde domain dilini öğrenir.

```markdown
# Sözlük

## Kullanıcı Tipleri
- **[Tip adı]**: [açıklama — ne yapabilir, ne yapamaz]
- **[Tip adı]**: [açıklama]

## İş Terimleri
- **[Terim]**: [Projeye özgü tanım]
- **[Terim]**: [Projeye özgü tanım]

## Teknik Terimler
- **[Kısaltma veya özel terim]**: [Açıklama]

## Kullanılmayacak Terimler
- "[Eski/yanlış terim]" → "[Doğru terim]" kullan
```

---

### CHANGELOG.md

Conventional Commits formatıyla tutulur. 200 satırı geçince arşivlenir.

```markdown
# Değişiklik Geçmişi

## YYYY-MM-DD
- feat([modül]): [Eklenen özellik veya modül]
- fix([modül]): [Düzeltilen hata]
- refactor([modül]): [Yeniden düzenlenen yapı]
- docs([modül]): [Güncellenen doküman]
- test([modül]): [Eklenen testler]
- chore([modül]): [Bağımlılık güncellemeleri vb.]
```

---

### TASKS.md

Aktif görev listesi. 250 satırı aşınca arşive taşınır.

```markdown
# Görev Listesi

## Aktif Görev
- [ ] [Görev adı] — devam ediyor

## Sıradaki
- [ ] [Görev 1]
- [ ] [Görev 2]
- [ ] [Görev 3]

## Tamamlanan
- [x] [Görev]
- [x] [Görev]

## Engellenen
- [ ] [Görev] — [neden engellenmiş, ne gerekiyor]
```

---

### TECHNICAL_DEBT.md

Bilinçli olarak sonraya bırakılan işler.

```markdown
# Teknik Borç

## Yüksek Öncelik
- [ ] [İş] — [neden borç alındı, ne zaman ödenmeli]
- [ ] [İş] — [açıklama]

## Orta Öncelik
- [ ] [İş] — [açıklama]

## Düşük Öncelik
- [ ] [İş] — [açıklama]

## Ödenen Borçlar
- [x] [İş] — ([tarih])
```

---

### DECISIONS.md

Mimari karar kayıtları (ADR). 

```markdown
# Mimari Kararlar

## ADR-001 — [Karar Başlığı]
Tarih: YYYY-MM-DD
Durum: Aktif

Karar: [Ne yapılacağına karar verildi?]

Sebep:
[Neden bu seçenek tercih edildi? 2-3 cümle.]

Alternatifler değerlendirildi:
- [Seçenek A]: [Neden reddedildi]
- [Seçenek B]: [Neden reddedildi]

Sonuç: [Seçilen çözüm] tercih edildi.
```

---

### RISKS.md

Aktif riskler. Her görev sonunda gözden geçirilir.

```markdown
# Risk Kaydı

## Yüksek Risk
- **[Risk başlığı]** — [Durum ve çözüm için gerekli adım]

## Orta Risk
- **[Risk başlığı]** — [Açıklama]

## Düşük Risk
- **[Risk başlığı]** — [Açıklama]

## Kapanan Riskler
- ~~[Risk]~~ → [Nasıl çözüldü] ([tarih])
```

---

### FILE_STRUCTURE.md

Projenin dosya haritası.

```markdown
# Dosya Yapısı

## Genel Bakış

src/
├── [modül-1]/
│   ├── [modül].controller.[uzantı]
│   ├── [modül].service.[uzantı]
│   └── [alt-klasör]/
│       └── [dosya].[uzantı]
│
├── [modül-2]/
│   ├── [modül].controller.[uzantı]
│   ├── [modül].service.[uzantı]
│   └── [alt-klasör]/
│       └── [dosya].[uzantı]
│
├── [ortak-klasör]/
│   └── [yardımcı-klasör]/
│
└── [giriş-dosyası].[uzantı]

## Klasör Kuralları
- [Kural 1: hangi dosyalar nereye gider]
- [Kural 2: isimlendirme standartları]
```

---

### TESTING_STATUS.md

Test takibi. Hangi modülün test edildiği raporlanır.

```markdown
# Test Durumu

## Birim Testler
| Modül             | Durum         | Notlar                |
|-------------------|---------------|-----------------------|
| [Modül Adı]       | ✓ Tamamlandı  |                       |
| [Modül Adı]       | ✗ Eksik       | Öncelik: Yüksek       |
| [Modül Adı]       | ✗ Eksik       |                       |

## Entegrasyon Testleri
| Akış              | Durum         | Notlar                |
|-------------------|---------------|-----------------------|
| [Akış Adı]        | ✓ Tamamlandı  |                       |
| [Akış Adı]        | ✗ Eksik       |                       |

## E2E Testler
| Senaryo           | Durum         | Notlar                |
|-------------------|---------------|-----------------------|
| [Senaryo Adı]     | ✗ Planlandı   | [Hangi versiyonda]    |

## Test Ortamı
- Framework: [test aracı]
- E2E: [e2e aracı]
- Coverage hedefi: [%] (kritik modüller)
```

---

### ENVIRONMENT.md

Ortam değişkenleri ve local kurulum adımları.

```markdown
# Ortam Yapılandırması

## Kurulum Adımları
1. `npm install` (veya ilgili paket yöneticisi)
2. `cp .env.example .env`
3. Veritabanını başlat
4. Migration / seed çalıştır
5. Uygulamayı başlat (`npm run dev`)

## Environment Değişkenleri

# Uygulama
NODE_ENV=development
PORT=[port]

# Veritabanı
DATABASE_URL=[bağlantı string formatı]

# Kimlik Doğrulama
[AUTH_SECRET_KEY]=[açıklama]
[AUTH_EXPIRES_IN]=[açıklama]

# Cache (varsa)
[CACHE_URL]=[açıklama]

# Dosya Depolama (varsa)
[STORAGE_KEY]=[açıklama]
[STORAGE_SECRET]=[açıklama]
[STORAGE_BUCKET]=[açıklama]
[STORAGE_REGION]=[açıklama]

## Gereksinimler
- [Çalışma ortamı]: [versiyon]+
- [Veritabanı]: [versiyon]+
- [Container aracı] (opsiyonel ama önerilir)
```

---

### SECURITY.md

Güvenlik kuralları ve hassas alanlar. Ajan bu dosyayı auth veya kullanıcı verisiyle ilgili iş yaparken okumalı.

```markdown
# Güvenlik Kuralları

## Hassas Alanlar
Bu alanlara dokunurken ekstra dikkatli ol:
- `[auth modülü]` — kimlik doğrulama ve token işlemleri
- `[kullanıcı modülü]` — kişisel veri
- `.env` dosyası — asla commit etme
- `[admin modülü]` — yetki kontrolü zorunlu

## Zorunlu Kurallar

### Şifre
- [Hashing algoritması ve parametresi]
- Plain text asla saklanmaz, loglanmaz

### Token / Oturum
- Secret değerler .env'de tutulur, kod içinde olmaz
- Access token süresi: [süre]
- Refresh token süresi: [süre]
- Token güvenli bir yerde saklanmalı (httpOnly cookie önerilir)

### API
- Tüm endpoint'lerde input validation zorunlu
- Rate limiting: kritik endpoint'lerde zorunlu
- CORS: sadece izin verilen origin'lar

### Veri
- Kullanıcı verisi response'da minimal dön (hassas alanlar asla)
- Veritabanı sorguları ORM / parameterized query ile yapılmalı
- Log'lara kişisel veri yazma

## Güvenlik Kontrol Listesi (Canlıya Geçmeden)
- [ ] Tüm endpoint'lerde yetki kontrolü var mı?
- [ ] Rate limiting aktif mi?
- [ ] CORS kısıtlaması yapıldı mı?
- [ ] .env değerleri production'da güvenli mi?
- [ ] Admin rotaları kısıtlandı mı?
```

---

## Hızlı Başlangıç Kılavuzu

Yeni bir projeye başlarken takip edilecek BAŞLANGIÇ SIRASI:

1. `project_docs/`, `locales/` ve `plans/` dizinlerini oluştur.
2. `.rules` dosyasını proje kökünde oluştur ve Anayasa metnini içine kopyala.
3. `.env.example` dosyasını oluştur (key'ler var, şifreler boş). Bunu kopyalayarak gerçek `.env` dosyasını oluştur ve `.env` dosyasını mutlaka `.gitignore`'a ekle.
4. **HİYERARŞİYİ UYGULA (Kritik):**
   - Önce `PRD.md`'yi iş hedefleriyle doldur.
   - Sonra `SRS.md`'yi işlevsel gereksinimlerle doldur.
   - Sonra `SAD.md`'de mimari kararı ve stack'i belgele.
5. `MEMORY.md`'yi proje özetiyle başlat.
6. Ajanı tetikle: *"Lütfen .rules dosyasını oku ve ilk görev için hazır ol."*

---

## İpuçları

**PRD → SRS → SAD sırası kesinlikle bozulamaz.**
Bu üç belge, ajanın "ne yapacağını" (PRD), "nasıl test edileceğini" (SRS) ve "nasıl inşa edileceğini" (SAD) anlamasını sağlar. 

**MEMORY.md kısa tutulmazsa sistem yavaşlar.**
Her güncellemede "bu bilgi MEMORY.md'de mi olmalı yoksa başka bir dosyada mı?" sorusunu sor.

**Tüm dosyalar UTF-8 — istisnasız.**
Türkçe karakter, emoji veya özel sembol içeren dosyalar için bu kural hayat kurtarır. Özellikle asenkron medya işlemlerinde encoding hatası almanı önler.

**Planlar /plans'a — sohbete değil.**
Ajanın oluşturduğu planlar `/plans` dizinine gitmelidir. Bu sayede oturumlar arası izlenebilirlik sağlanır.

**3 başarısız deneme = dur ve sor.**
Anti-loop kuralı ajanın saatlerce boşa çalışmasını önler. Otonom bir ajan döngüye girdiğinde en değerli şey hızlıca insan müdahalesi almaktır.