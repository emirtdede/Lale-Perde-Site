import React, { useEffect, useState } from 'react';
import { useDb } from '@/context/DbContext';
import { useLanguage } from '@/context/LanguageContext';

export default function GoogleAdsTab() {
  const { settings, updateSettings } = useDb();
  const { t } = useLanguage();
  const [googleAdsId, setGoogleAdsId] = useState('');
  const [labelWhatsapp, setLabelWhatsapp] = useState('');
  const [labelContact, setLabelContact] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setGoogleAdsId(settings.googleAdsId || '');
      setLabelWhatsapp(settings.adsLabelWhatsapp || '');
      setLabelContact(settings.adsLabelContact || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const trimmedId = googleAdsId.trim();

    if (trimmedId !== '' && !trimmedId.startsWith('AW-')) {
      setError(t('admin.googleAds.errors.invalidFormat'));
      return;
    }

    if (settings) {
      const result = await updateSettings({
        ...settings,
        googleAdsId: trimmedId,
        adsLabelWhatsapp: labelWhatsapp.trim(),
        adsLabelContact: labelContact.trim(),
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(t('admin.googleAds.errors.dbError'));
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem 1rem',
    background: 'rgba(10, 10, 10, 0.9)',
    border: '1px solid #1A2E40',
    borderRadius: '4px',
    color: '#FFF',
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    fontFamily: 'monospace',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    color: '#A3B3C2',
    marginBottom: '0.6rem',
    fontWeight: 500,
  };

  const helpTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#A3B3C2',
    marginTop: '0.6rem',
    lineHeight: '1.4',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#D4AF37';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#1A2E40';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div 
        style={{ 
          backgroundColor: '#0A0A0A', 
          border: '1px solid #1A2E40', 
          borderRadius: '8px', 
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <h3 
          style={{ 
            color: '#D4AF37', 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.5rem', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(26, 46, 64, 0.5)',
            paddingBottom: '0.8rem'
          }}
        >
          {t('admin.googleAds.title')}
        </h3>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Ana Conversion ID */}
          <div>
            <label htmlFor="googleAdsIdInput" style={labelStyle}>
              {t('admin.googleAds.fields.conversionId')}
            </label>
            <input
              id="googleAdsIdInput"
              type="text"
              placeholder={t('admin.googleAds.fields.conversionIdPlaceholder')}
              value={googleAdsId}
              onChange={(e) => {
                setGoogleAdsId(e.target.value);
                setError('');
              }}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <p style={helpTextStyle}>
              {t('admin.googleAds.fields.conversionIdHelp')}
            </p>
          </div>

          {/* Divider */}
          <div style={{ 
            borderTop: '1px solid rgba(26, 46, 64, 0.5)', 
            margin: '0.5rem 0',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0A0A0A',
              padding: '0 12px',
              color: '#A3B3C2',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap'
            }}>
              {t('admin.googleAds.fields.customLabelsTitle')}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#A3B3C2', lineHeight: '1.5', marginTop: '0.25rem' }}>
            {t('admin.googleAds.fields.customLabelsDesc')}
          </p>

          {/* WhatsApp Conversion Label */}
          <div>
            <label htmlFor="labelWhatsappInput" style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                {t('admin.googleAds.fields.whatsappLabel')}
              </span>
            </label>
            <input
              id="labelWhatsappInput"
              type="text"
              placeholder={t('admin.googleAds.fields.whatsappPlaceholder')}
              value={labelWhatsapp}
              onChange={(e) => {
                setLabelWhatsapp(e.target.value);
                setError('');
              }}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <p style={helpTextStyle}>
              {t('admin.googleAds.fields.whatsappHelp')}
            </p>
          </div>

          {/* Contact/Form Conversion Label */}
          <div>
            <label htmlFor="labelContactInput" style={labelStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3B3C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {t('admin.googleAds.fields.contactLabel')}
              </span>
            </label>
            <input
              id="labelContactInput"
              type="text"
              placeholder={t('admin.googleAds.fields.contactPlaceholder')}
              value={labelContact}
              onChange={(e) => {
                setLabelContact(e.target.value);
                setError('');
              }}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <p style={helpTextStyle}>
              {t('admin.googleAds.fields.contactHelp')}
            </p>
          </div>

          {error && (
            <div 
              style={{ 
                color: '#FF6B6B', 
                fontSize: '0.85rem', 
                background: 'rgba(255, 75, 75, 0.08)', 
                padding: '0.8rem 1rem', 
                borderRadius: '4px',
                border: '1px solid rgba(255, 75, 75, 0.2)' 
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div 
              style={{ 
                color: '#4CAF50', 
                fontSize: '0.85rem', 
                background: 'rgba(76, 175, 80, 0.08)', 
                padding: '0.8rem 1rem', 
                borderRadius: '4px',
                border: '1px solid rgba(76, 175, 80, 0.2)' 
              }}
            >
              ✓ {t('admin.googleAds.success')}
            </div>
          )}

          <button 
            type="submit"
            style={{ 
              background: '#D4AF37', 
              color: '#0A0A0A', 
              border: 'none', 
              padding: '0.9rem 1.5rem', 
              borderRadius: '4px', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#C5A030'}
            onMouseOut={(e) => e.currentTarget.style.background = '#D4AF37'}
          >
            {t('admin.googleAds.saveBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
