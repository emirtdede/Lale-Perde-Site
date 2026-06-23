-- ==============================================================================
-- GÖREV: VERİTABANI ÇÖP TOPLAYICI (GARBAGE COLLECTION)
-- AMAÇ: `form_interactions` tablosunda 'form_started' durumunda kalmış ve
--       30 günden eski (terk edilmiş) kayıtları otomatik olarak temizlemek.
-- YÖNTEM: pg_cron eklentisi kullanılarak günlük çalışan bir cron job oluşturmak.
-- NOT: Bu kodu Supabase SQL Editor üzerinden çalıştırınız.
-- ==============================================================================

-- 1. pg_cron eklentisinin aktif olduğundan emin olun
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Eğer daha önce eklenmiş bir job varsa temizleyelim (güvenlik için)
-- Job adını 'cleanup_abandoned_forms' olarak belirliyoruz.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup_abandoned_forms'
  ) THEN
    PERFORM cron.unschedule('cleanup_abandoned_forms');
  END IF;
END $$;

-- 3. Zamanlanmış görevi (Cron Job) oluşturun
-- '0 3 * * *' -> Her gece saat 03:00'te çalışır.
SELECT cron.schedule(
  'cleanup_abandoned_forms',
  '0 3 * * *',
  $$
    DELETE FROM public.form_interactions
    WHERE status = 'form_started'
      AND created_at < NOW() - INTERVAL '30 days';
  $$
);

-- ==============================================================================
-- KONTROL VE TEST İŞLEMLERİ (İsteğe Bağlı)
-- ==============================================================================

-- Aktif cron job'ları listelemek için:
-- SELECT * FROM cron.job;

-- Bu scriptin çalıştırılması sırasında anlık olarak eski kayıtları silmek isterseniz 
-- aşağıdaki DELETE komutunu tek seferlik çalıştırabilirsiniz (yorum satırından çıkarıp):
-- 
-- DELETE FROM public.form_interactions
-- WHERE status = 'form_started'
--   AND created_at < NOW() - INTERVAL '30 days';
