import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { SystemSettings } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactInfoTab() {
  const { settings: dbSettings, updateSettings } = useDb();
  const { t } = useLanguage();
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

  if (!settings) return <div style={{ color: '#E0E6ED' }}>{t('admin.contact.loading')}</div>;

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
          {saved ? t('admin.contact.saved') : t('admin.contact.saveChanges')}
        </button>,
        portalTarget
      )}

      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>{t('admin.contact.sections.general')}</h4>
          {renderInput(t('admin.contact.fields.storeName'), 'storeName')}
          {renderInput(t('admin.contact.fields.phone'), 'phone')}
          {renderInput(t('admin.contact.fields.whatsapp'), 'whatsappNumber')}
          {renderInput(t('admin.contact.fields.email'), 'email')}
        </div>
        
        <div>
          <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>{t('admin.contact.sections.address')}</h4>
          {renderInput(t('admin.contact.fields.fullAddress'), 'address', true)}
          {renderInput(t('admin.contact.fields.googleMapsUrl'), 'googleMapsEmbed', true)}
          <p style={{ fontSize: '0.8rem', color: '#8899A6', marginTop: '-1rem' }}>{t('admin.contact.fields.googleMapsHelp')}</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', marginTop: '2rem' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>{t('admin.contact.sections.workingHours')}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {renderInput(t('admin.contact.fields.hoursTr'), 'workingHoursTr')}
          {renderInput(t('admin.contact.fields.hoursEn'), 'workingHoursEn')}
        </div>
      </div>
      
      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', marginTop: '2rem' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>{t('admin.contact.sections.socialMedia')}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {renderInput(t('admin.contact.fields.shopier'), 'shopierUrl')}
          {renderInput(t('admin.contact.fields.instagram'), 'instagramUrl')}
          {renderInput(t('admin.contact.fields.facebook'), 'facebookUrl')}
          {renderInput(t('admin.contact.fields.linkedin'), 'linkedinUrl')}
        </div>
      </div>
    </div>
  );
}
