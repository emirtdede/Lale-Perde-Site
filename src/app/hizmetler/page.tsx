'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { useDb } from '../../context/DbContext';

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const { services: rawServices } = useDb();

  const servicesList = React.useMemo(() => {
    return [...rawServices].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [rawServices]);

  const defaultIcon = (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
      <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
      <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 2rem 3rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {language === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {language === 'tr' ? 'Lale Perde ayrıcalığıyla pencerelerinize kusursuz dokunuşlar katıyoruz.' : 'We add flawless touches to your windows with the privilege of Lale Perde.'}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {servicesList.map((srv, idx) => {
          const appointmentUrl = `/?service=${encodeURIComponent(srv.titleTr)}#randevu`;

          return (
            <div 
              key={idx}
              style={{ 
                backgroundColor: 'var(--color-card-bg)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                {srv.image ? (
                  <Image src={srv.image} alt={language === 'tr' ? srv.titleTr : srv.titleEn} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-accent)' }}>
                    {defaultIcon}
                  </div>
                )}
                <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', opacity: 0.15, userSelect: 'none' }}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {language === 'tr' ? srv.titleTr : srv.titleEn}
                  </h3>
                  <p style={{ opacity: 0.8, lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {language === 'tr' ? srv.descriptionTr : srv.descriptionEn}
                  </p>
                </div>
                
                <Link 
                  href={appointmentUrl}
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-accent)';
                  }}
                >
                  {language === 'tr' ? 'Randevu Oluştur' : 'Book Appointment'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
