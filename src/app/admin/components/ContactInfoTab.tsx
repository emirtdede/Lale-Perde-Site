import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { SystemSettings } from '@/context/dbTypes';

export default function ContactInfoTab() {
  const { settings: dbSettings, updateSettings } = useDb();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbSettings) setSettings(dbSettings);
  }, [dbSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (settings) {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!settings) return <div style={{ color: '#E0E6ED' }}>Yükleniyor...</div>;

  const renderInput = (label: string, name: keyof SystemSettings, isTextArea = false) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={settings[name] as string}
          onChange={handleChange}
          rows={5}
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={settings[name] as string}
          onChange={handleChange}
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
        />
      )}
    </div>
  );

  return (
    <div>
      {portalTarget && createPortal(
        <button 
          onClick={handleSave}
          style={{ 
            background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
            color: '#FFF', 
            border: 'none', 
            padding: '0.6rem 1.5rem', 
            borderRadius: '6px', 
            fontWeight: 600, 
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {saved ? 'Kaydedildi ✓' : 'Değişiklikleri Kaydet'}
        </button>,
        portalTarget
      )}

      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Genel İletişim</h4>
          {renderInput('Mağaza Adı', 'storeName')}
          {renderInput('Telefon Numarası', 'phone')}
          {renderInput('WhatsApp Numarası', 'whatsappNumber')}
          {renderInput('E-Posta Adresi', 'email')}
        </div>
        
        <div>
          <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Adres ve Konum</h4>
          {renderInput('Açık Adres', 'address', true)}
          {renderInput('Google Maps Embed URL / Kodu', 'googleMapsEmbed', true)}
          <p style={{ fontSize: '0.8rem', color: '#8899A6', marginTop: '-1rem' }}>Google Maps'ten aldığınız "Haritayı Yerleştir" URL'sini (src içindeki link) buraya yapıştırın.</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', marginTop: '2rem' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Çalışma Saatleri</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {renderInput('Çalışma Saatleri (TR)', 'workingHoursTr')}
          {renderInput('Çalışma Saatleri (EN)', 'workingHoursEn')}
        </div>
      </div>
      
      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', marginTop: '2rem' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Sosyal Medya Hesapları</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {renderInput('Shopier Dükkan Linki', 'shopierUrl')}
          {renderInput('Instagram Sayfa Linki', 'instagramUrl')}
          {renderInput('Facebook Sayfa Linki', 'facebookUrl')}
          {renderInput('LinkedIn Şirket Linki', 'linkedinUrl')}
        </div>
      </div>
    </div>
  );
}
