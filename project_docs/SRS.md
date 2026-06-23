# Yazılım Gereksinimleri Spesifikasyonu (SRS)

## İşlevsel Gereksinimler

### 1. Çoklu Dil & i18n
- **FR-001:** Site, Türkçe (TR) ve İngilizce (EN) dillerini desteklemelidir. Dil seçimi sitedeki dil değiştirici ile yapılır.
- **FR-002:** Tüm sabit metinler ve dinamik içeriklerin çevirileri dil dosyalarında/state içinde tutulmalıdır.

### 2. Ölçü Sihirbazı & Teklif İsteme
- **FR-003:** Kullanıcı ürün sayfasında veya `/olcu-sihirbazi` sayfasında en ve boy ölçülerini girip WhatsApp butonuna bastığında WhatsApp web/app yönlendirmesi yapılmalıdır.
- **FR-004:** WhatsApp mesaj şablonu şu formatta olmalıdır: "Merhaba Lale Perde, [Kategori] kategorisindeki [Ürün Adı] ürünü için En: [En] cm, Boy: [Boy] cm ölçülerinde fiyat teklifi almak istiyorum."

### 3. Arama & Filtreleme
- **FR-005:** Global arama çubuğu anasayfa dahil tüm sayfalardan ürün adına göre arama yapıp ilgili ürüne yönlendirmelidir.
- **FR-006:** `/urunler` sayfasında kategoriye, kumaş tipine ve renge göre dinamik filtreleme olmalıdır.

### 4. Admin Yönetim Paneli
- **FR-007:** İstatistikler (toplam ürün/kategori, ziyaretçiler, en çok aranan kelimeler, şehir bazlı grafikler) gösterilmelidir.
- **FR-008:** Katalog yönetimi (ürün ekleme/düzenleme/arşive kaldırma/toplu işlemler/sürükle-bırak sıralama) yapılabilmelidir.
- **FR-009:** Müşteri randevu talepleri ve iletişim formu mesajları listelenmeli; durumları (Yeni, Görüşülüyor, Kazanıldı, Kaybedildi) yönetilmelidir.
- **FR-010:** Müşteri Öncelik Puanı: WhatsApp'a tıklayan müşterinin sitede kalma süresine göre 0-100 arası puanlama yapılmalıdır.
- **FR-011:** Ayarlar ekranından WhatsApp numarası, Google Maps iframe kodu, iletişim detayları güncellenebilmelidir.
- **FR-012:** Güvenlik: Admin giriş bilgileri e-posta/SMS doğrulama kodu simülasyonu ile güncellenebilmelidir.

## İşlevsel Olmayan Gereksinimler
- **Performans:** Sayfa açılış hızı optimize edilmelidir.
- **Güvenlik:** Yetkisiz kullanıcılar admin sayfasına (örneğin `/admin/dashboard`) erişememelidir.
- **Kullanıcı Deneyimi:** Açık ve koyu tema geçişleri göz yormayan animasyonlarla yapılmalıdır.
- **Duyarlılık:** Yönetim paneli dahil tüm sayfalar mobil ve tablet uyumlu olmalıdır.
