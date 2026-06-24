'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { useDb } from '../../context/DbContext';

export default function GuidePage() {
  const { t, language } = useLanguage();
  const { guides: rawGuides, fetchGuidesLazy } = useDb();

  useEffect(() => {
    fetchGuidesLazy?.();
  }, [fetchGuidesLazy]);

  const guidesList = React.useMemo(() => {
    return [...rawGuides].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawGuides]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 2rem 3rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {language === 'tr' ? 'Rehber ve Blog' : 'Guides & Blog'}
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
          {language === 'tr' ? 'Perde seçimi, bakımı ve modern dekorasyon fikirleri hakkında uzman tavsiyeler.' : 'Expert advice on curtain selection, care, and modern decoration ideas.'}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {guidesList.map((post) => (
          <Link 
            key={post.id}
            href={`/rehber/${post.id}`}
            style={{ 
              backgroundColor: 'var(--color-card-bg)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'var(--transition-smooth)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <Image src={post.image} alt={post.titleTr} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>
                  {new Date(post.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')} • 3 min read
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {language === 'tr' ? post.titleTr : post.titleEn}
                </h3>
                <p style={{ opacity: 0.8, lineHeight: 1.5, fontSize: '0.95rem' }}>
                  {language === 'tr' ? post.summaryTr : post.summaryEn}
                </p>
              </div>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.85rem' }}>
                {language === 'tr' ? 'Daha Fazla Oku →' : 'Read More →'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
