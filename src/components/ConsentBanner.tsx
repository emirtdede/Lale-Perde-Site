'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ConsentBanner: React.FC = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    cookies: true,
    location: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = localStorage.getItem('lale-perde-consent');
    if (!savedConsent) {
      // Show banner after a short delay for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location access granted:', position.coords);
          // Optional: You can store rough city info in visitor logs if needed
        },
        (error) => {
          console.warn('Location access denied:', error.message);
        }
      );
    }
  };

  const handleAcceptAll = () => {
    const choices = { cookies: true, location: true };
    localStorage.setItem('lale-perde-consent', JSON.stringify(choices));
    requestLocation();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('lale-perde-consent', JSON.stringify(consent));
    if (consent.location) {
      requestLocation();
    }
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const choices = { cookies: true, location: true };
    localStorage.setItem('lale-perde-consent', JSON.stringify(choices));
    requestLocation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const trText = {
    title: 'Çerez ve Konum Tercihleri',
    description: 'Sitemizdeki deneyiminizi geliştirmek, trafiği analiz etmek ve size en yakın hizmet noktalarımızı sunabilmek adına çerezler ve konum bilginizi kullanmak istiyoruz.',
    cookieLabel: 'Çerezler (Deneyim ve Analiz)',
    cookieDesc: 'Site trafiğini analiz etmemize ve tercihlerinizi hatırlamamıza yardımcı olur.',
    locationLabel: 'Konum İzni (Hizmet ve Keşif)',
    locationDesc: 'İstanbul ve çevresinde size en yakın ücretsiz keşif ekiplerimizi belirlememizi sağlar.',
    acceptAll: 'Hepsini Kabul Et',
    saveSelected: 'Seçilenleri Kaydet',
    customize: 'Tercihleri Yönet',
    essentialOnly: 'Sadece Gerekli Olanlar',
  };

  const enText = {
    title: 'Cookie & Location Preferences',
    description: 'We use cookies and your location to analyze site traffic, remember your preferences, and show the closest free on-site survey and design services.',
    cookieLabel: 'Cookies (Experience & Analytics)',
    cookieDesc: 'Helps us analyze traffic and remember your settings.',
    locationLabel: 'Location Access (Services)',
    locationDesc: 'Helps us locate the closest on-site consultation team for you.',
    acceptAll: 'Accept All',
    saveSelected: 'Save Preferences',
    customize: 'Manage Preferences',
    essentialOnly: 'Essential Only',
  };

  const t = language === 'tr' ? trText : enText;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '420px',
      width: 'calc(100% - 48px)',
      backgroundColor: 'var(--color-primary)',
      color: '#FFF',
      border: '1px solid rgba(189, 149, 75, 0.4)',
      borderRadius: '12px',
      padding: '1.5rem',
      zIndex: 99999,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
      fontFamily: 'var(--font-sans)',
      animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '1.3rem' }}>🛡️</span>
        <h4 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.2rem',
          color: 'var(--color-accent)',
          letterSpacing: '0.03em',
          margin: 0,
        }}>{t.title}</h4>
      </div>

      <p style={{
        fontSize: '0.85rem',
        lineHeight: '1.5',
        color: '#A3B3C2',
        marginBottom: '1.2rem',
        fontWeight: 300,
      }}>
        {t.description}
      </p>

      {showSettings && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {/* Cookies checkbox */}
          <label style={{ display: 'flex', gap: '0.8rem', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input 
              type="checkbox" 
              checked={consent.cookies} 
              onChange={(e) => setConsent({ ...consent, cookies: e.target.checked })}
              style={{ accentColor: 'var(--color-accent)', width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#FFF', display: 'block' }}>{t.cookieLabel}</span>
              <span style={{ fontSize: '0.75rem', color: '#A3B3C2', display: 'block', marginTop: '2px' }}>{t.cookieDesc}</span>
            </div>
          </label>

          {/* Location checkbox */}
          <label style={{ display: 'flex', gap: '0.8rem', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input 
              type="checkbox" 
              checked={consent.location} 
              onChange={(e) => setConsent({ ...consent, location: e.target.checked })}
              style={{ accentColor: 'var(--color-accent)', width: '18px', height: '18px', marginTop: '2px' }}
            />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#FFF', display: 'block' }}>{t.locationLabel}</span>
              <span style={{ fontSize: '0.75rem', color: '#A3B3C2', display: 'block', marginTop: '2px' }}>{t.locationDesc}</span>
            </div>
          </label>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleAcceptAll}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
              color: '#FFF',
              border: 'none',
              padding: '0.65rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'filter 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
          >
            {t.acceptAll}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              flex: 1,
              background: 'transparent',
              color: 'var(--color-accent)',
              border: '1px solid rgba(189, 149, 75, 0.4)',
              padding: '0.65rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(189,149,75,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {t.customize}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {showSettings ? (
            <button 
              onClick={handleSavePreferences}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              {t.saveSelected}
            </button>
          ) : (
            <button 
              onClick={handleRejectAll}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#A3B3C2',
                border: 'none',
                padding: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 400,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {t.essentialOnly}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
