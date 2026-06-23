'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../../context/LanguageContext';
import { guidesList, GuidePost } from '../guidesData';

export default function GuideDetailPage() {
  const { language } = useLanguage();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<GuidePost | null>(null);

  useEffect(() => {
    const found = guidesList.find(g => g.id === id);
    if (found) {
      setPost(found);
    }
  }, [id]);

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem' }}>
        <h2>Yazı bulunamadı / Article not found.</h2>
        <Link href="/rehber" style={{ color: 'var(--color-accent)', textDecoration: 'underline', marginTop: '2rem', display: 'inline-block' }}>
          Rehbere Dön
        </Link>
      </div>
    );
  }

  const title = language === 'tr' ? post.titleTr : post.titleEn;
  const content = language === 'tr' ? post.contentTr : post.contentEn;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 2rem 5rem' }}>
      <Link 
        href="/rehber" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '2.5rem', 
          color: 'var(--color-accent)', 
          textTransform: 'uppercase', 
          fontSize: '0.8rem', 
          letterSpacing: '0.05em',
          fontWeight: 600
        }}
      >
        ← {language === 'tr' ? 'Rehbere Dön' : 'Back to Guides'}
      </Link>

      <article>
        <header style={{ marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {post.date} • {language === 'tr' ? post.readTimeTr : post.readTimeEn}
          </span>
          <h1 
            style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '3rem', 
              lineHeight: 1.2, 
              color: 'var(--color-primary)', 
              marginTop: '1rem', 
              marginBottom: '1.5rem' 
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.85, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--color-text)' }}>
            {language === 'tr' ? post.descTr : post.descEn}
          </p>
        </header>

        <div style={{ position: 'relative', height: '400px', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem' }}>
          <Image src={post.image} alt={title} fill style={{ objectFit: 'cover' }} priority />
        </div>

        <div 
          className="guide-rich-content" 
          dangerouslySetInnerHTML={{ __html: content }} 
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: 'var(--color-text)',
            opacity: 0.9
          }}
        />
      </article>

      <style jsx global>{`
        .guide-rich-content h2 {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--color-primary);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .guide-rich-content p {
          margin-bottom: 1.5rem;
        }
        .guide-rich-content ul {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .guide-rich-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
