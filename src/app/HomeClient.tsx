'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useDb } from '../context/DbContext';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { submitContactForm } from './actions/contactActions';
import ParticlesLogo from '../components/ParticlesLogo';
import CollectionsCarousel from '../components/CollectionsCarousel';
import MarqueeComments from '../components/MarqueeComments';
import MeasurePromoVisual from '../components/MeasurePromoVisual';
import LineDivider from '../components/LineDivider';

export default function HomeClient({ 
  initialCategories, 
  initialServices, 
  initialSettings, 
  initialHomeContent,
  initialProducts
}: { 
  initialCategories: any[]; 
  initialServices: any[]; 
  initialSettings: any; 
  initialHomeContent: any; 
  initialProducts: any[];
}) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { trackConversion } = useGoogleAds();

  const [isNight, setIsNight] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Tül Perde');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { fetchCommentsLazy, comments, homeContent: dbHomeContent } = useDb();

  const categories = initialCategories;
  const services = initialServices && initialServices.length > 0 ? initialServices : [
    {
      id: 'work-1',
      titleTr: 'Zekeriyaköy Villa Projesi',
      titleEn: 'Zekeriyaköy Villa Project',
      descriptionTr: 'Salon ve yatak odalarında keten tül ve motorlu kadife fon perde uygulamaları.',
      descriptionEn: 'Linen tulle and motorized velvet drapery applications in living room and bedrooms.',
      image: '/assets/scandi.png',
      focalX: 50,
      focalY: 45
    },
    {
      id: 'work-2',
      titleTr: 'Göktürk Rezidans Penthouse',
      titleEn: 'Göktürk Residence Penthouse',
      descriptionTr: 'Minimalist dekorasyona uygun ahşap jaluzi ve modern dalga tül perdeler.',
      descriptionEn: 'Wooden venetian blinds and modern wave tulle curtains matching minimalist decor.',
      image: '/assets/fabric.png',
      focalX: 50,
      focalY: 50
    },
    {
      id: 'work-3',
      titleTr: 'Tarabya Yalı Dairesi',
      titleEn: 'Tarabya Bosphorus Apartment',
      descriptionTr: 'Boğaz manzarasına eşlik eden premium ipek fon perdeler ve motorlu stor sistemler.',
      descriptionEn: 'Premium silk draperies and motorized roller systems accompanying the Bosphorus view.',
      image: '/assets/hero.png',
      focalX: 50,
      focalY: 60
    },
    {
      id: 'work-4',
      titleTr: 'Bebek Sahil Evi',
      titleEn: 'Bebek Coastal House',
      descriptionTr: 'Lüks salon alanı için ipek keten tül ve modern katlamalı perde tasarımları.',
      descriptionEn: 'Silk-linen tulle and modern roman shade designs for the luxury living area.',
      image: '/assets/fabric.png',
      focalX: 50,
      focalY: 50
    },
    {
      id: 'work-5',
      titleTr: 'Kemerburgaz Konakları',
      titleEn: 'Kemerburgaz Mansions',
      descriptionTr: 'Yüksek tavanlı salonlar için akustik özellikli kadife fon perdeler.',
      descriptionEn: 'Acoustic velvet draperies tailored for high-ceiling living spaces.',
      image: '/assets/scandi.png',
      focalX: 50,
      focalY: 50
    },
    {
      id: 'work-6',
      titleTr: 'Şişli Modern Ofis',
      titleEn: 'Şişli Modern Office',
      descriptionTr: 'Çalışma alanları için motorlu dikey stor ve jaluzi perde otomasyonu.',
      descriptionEn: 'Motorized vertical roller and venetian blind automation systems for work environments.',
      image: '/assets/hero.png',
      focalX: 50,
      focalY: 50
    }
  ];
  const settings = initialSettings;
  const homeContent = dbHomeContent || initialHomeContent;

  // Lightbox Zoom & Pan states
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxOffset, setLightboxOffset] = useState({ x: 0, y: 0 });
  const [isLightboxDragging, setIsLightboxDragging] = useState(false);
  const lightboxDragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetchCommentsLazy?.();
  }, [fetchCommentsLazy]);

  // Measure wizard Card 3D tilt coordinate state
  const [wizardCoords, setWizardCoords] = useState({ x: 0, y: 0 });
  const [isWizardHovered, setIsWizardHovered] = useState(false);

  // Parallax elements references
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const fabricBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (heroBgRef.current) {
            const heroOffset = window.scrollY * 0.4;
            heroBgRef.current.style.transform = `translateY(${heroOffset}px)`;
          }

          if (fabricBgRef.current) {
            const rect = fabricBgRef.current.parentElement?.getBoundingClientRect();
            if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
              const scrolledRatio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
              const offset = (scrolledRatio - 0.5) * 150;
              fabricBgRef.current.style.transform = `translateY(${offset}px)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  // Appointment Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    trackConversion('contact');

    const result = await submitContactForm({
      type: 'appointment',
      name,
      email,
      phone,
      subject: `${service} İçin Keşif Randevusu`,
      message: `Ev Adresi: ${address}\nTercih Edilen Keşif Tarihi: ${appointmentDate}\nTercih Edilen Keşif Saati: ${appointmentTime}`
    });

    if (result.error) {
      console.warn('Form submission failed:', result.error);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setAppointmentDate('');
      setAppointmentTime('');
      setAddress('');
    }, 1200);
  };

  // Helper for tracking dynamic cursor coordinates on Measure wizard glass visual
  const handleWizardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Range -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // Range -1 to 1
    setWizardCoords({ x, y });
  };

  // Helper card style calculation for works gallery tilt
  const [galleryTilt, setGalleryTilt] = useState<{ [key: string]: { x: number; y: number } }>({});
  
  const handleGalleryMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setGalleryTilt((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const handleGalleryMouseLeave = (id: string) => {
    setGalleryTilt((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
  };

  // Lightbox Handlers
  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLightboxDragging(true);
    lightboxDragStart.current = { x: e.clientX - lightboxOffset.x, y: e.clientY - lightboxOffset.y };
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!isLightboxDragging) return;
    setLightboxOffset({
      x: e.clientX - lightboxDragStart.current.x,
      y: e.clientY - lightboxDragStart.current.y
    });
  };

  const handleLightboxMouseUp = () => {
    setIsLightboxDragging(false);
  };

  const zoomIn = () => setLightboxZoom(prev => Math.min(prev + 0.25, 4));
  const zoomOut = () => setLightboxZoom(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => {
    setLightboxZoom(1);
    setLightboxOffset({ x: 0, y: 0 });
  };

  const logoConfig = settings?.logoConfig || {
    theme: 'gold',
    interactionRadius: 30,
    returnSpeed: 0.001,
    friction: 0.86,
    scatterPower: 30
  };

  return (
    <>
      {/* 1. HERO SECTION WITH FIXED VIDEO BACKGROUND */}
      <section id="hero" className="hero" ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }}>
        <div 
          className="hero-bg" 
          id="hero-bg" 
          ref={heroBgRef}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* WebM Video background container */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
          >
            <source src="/assets/videos/hero-background.webm" type="video/webm" />
          </video>
          {/* Overlay at 60% opacity with Navy Brand color #1A2E40 */}
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: '#1A2E40', 
              opacity: 0.60, 
              zIndex: -1 
            }} 
          />
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <h1 className="hero-title">{t('hero.title')}:<br /><span>Lale Perde</span></h1>
          <div className="cta-group">
            <Link href="/urunler" className="btn-primary">{t('hero.discoverBtn')}</Link>
            <a href="#randevu" className="btn-outline">{t('hero.appointmentBtn')}</a>
          </div>
        </div>

        <div className="scroll-down">
          <span>{t('hero.scrollDown')}</span>
          <div className="line"></div>
        </div>
      </section>

      {/* 2. KINETIC LOGO SECTION (PHILOSOPHY) */}
      <section id="hikayemiz" style={{ padding: '6rem 0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-neutral)', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
          
          {/* Particles logo rendering box without border frame */}
          <div 
            style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <ParticlesLogo 
              theme={logoConfig.theme}
              interactionRadius={logoConfig.interactionRadius}
              returnSpeed={logoConfig.returnSpeed}
              friction={logoConfig.friction}
              scatterPower={logoConfig.scatterPower}
            />
          </div>

          <div className="story-content reveal active" style={{ paddingRight: 0 }}>
            <span className="section-label">{t('story.label')}</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>
              {homeContent ? (language === 'tr' ? homeContent.philosophyTitleTr : homeContent.philosophyTitleEn) : t('story.title')}
            </h2>
            <p className="story-text" style={{ fontSize: '1.05rem', lineHeight: '1.8', opacity: 0.95, fontWeight: 300, marginBottom: '1.5rem' }}>
              {homeContent ? (language === 'tr' ? homeContent.philosophyDescTr : homeContent.philosophyDescEn) : t('story.text1')}
            </p>
            <div className="story-quote story-quote-shimmer" style={{ borderLeft: '3px solid #BD954B', paddingLeft: '1.5rem', margin: '2rem 0', fontStyle: 'italic', fontSize: '1.2rem' }}>
              {t('story.quote')}
            </div>
            <p className="story-text" style={{ fontSize: '1.05rem', lineHeight: '1.8', opacity: 0.95, fontWeight: 300 }}>{t('story.text2')}</p>
          </div>
        </div>
      </section>

      {/* 3. COLLECTIONS (3D WHEEL CAROUSEL) */}
      <section id="koleksiyonlar" className="collections" style={{ padding: '6rem 0', background: '#0A141D', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="collections-header reveal active" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label" style={{ color: '#BD954B', letterSpacing: '2px', display: 'block', marginBottom: '1rem' }}>{t('collections.label')}</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: '#ffffff', marginBottom: '1.5rem' }}>
              {homeContent ? (language === 'tr' ? homeContent.collectionsTitleTr : homeContent.collectionsTitleEn) : t('collections.title')}
            </h2>
            <p className="collections-desc" style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 300, margin: '0 auto' }}>
              {homeContent ? (language === 'tr' ? homeContent.collectionsDescTr : homeContent.collectionsDescEn) : t('collections.subtitle')}
            </p>
          </div>

          <CollectionsCarousel categories={categories} />
        </div>
      </section>

      {/* 4. MEASURE WIZARD PROMO SECTION (REDESIGNED LUXURY SEGMENT) */}
      <section style={{ padding: '7rem 0', background: 'var(--color-neutral)', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'stretch' }}>
            
            {/* Left side: Guide and Steps */}
            <div>
              <span className="section-label" style={{ color: '#BD954B', letterSpacing: '3px' }}>
                {language === 'tr' ? 'MİLİMETRİK HESAPLAMA' : 'PRECISE CALCULATION'}
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                {language === 'tr' ? 'Akıllı Ölçü Sihirbazı' : 'Smart Measure Wizard'}
              </h2>
              <p style={{ color: 'var(--color-text)', fontWeight: 300, fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem', opacity: 0.9 }}>
                {language === 'tr' 
                  ? 'Kendi pencerelerinizin ölçülerini profesyonel bir hassasiyetle çıkarın. Akıllı sihirbazımız, payları ve pile oranlarını otomatik hesaplayarak sıfır hata garantisi sunar.'
                  : 'Obtain professional-grade window measurements easily. Our smart calculation engine handles fullness and fabric folds automatically to guarantee a flawless fit.'}
              </p>

              {/* Steps display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', marginBottom: '2.5rem' }}>
                {[
                  {
                    num: '01',
                    titleTr: 'Model ve Tarz Belirleme',
                    titleEn: 'Style & Model Selection',
                    descTr: 'Tül, fon veya modern jaluzi seçeneklerinden odanıza uygun stili işaretleyin.',
                    descEn: 'Select the curtain type (tulle, drapery, roller, wood) that mirrors your space.'
                  },
                  {
                    num: '02',
                    titleTr: 'Görsel Yönlendirmeli Ölçü',
                    titleEn: 'Visual Measurement Guide',
                    descTr: 'Rehberleri takip ederek pencere genişliğini ve yüksekliğini milimetrik girin.',
                    descEn: 'Enter accurate width and height values by following simple visual guides.'
                  },
                  {
                    num: '03',
                    titleTr: 'Tek Tıkla Siparişe Dönüştür',
                    titleEn: 'Instant Fabrication Report',
                    descTr: 'Tasarım özetini kaydedin, keşif ekibimize anında iletin veya sipariş edin.',
                    descEn: 'Save your customized report, instantly share with our discovery team or place an order.'
                  }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: '#BD954B',
                      background: 'rgba(189, 149, 75, 0.1)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {step.num}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                        {language === 'tr' ? step.titleTr : step.titleEn}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', opacity: 0.7, fontWeight: 300, lineHeight: '1.5' }}>
                        {language === 'tr' ? step.descTr : step.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/olcu-sihirbazi" className="btn-primary" style={{ display: 'inline-block', borderRadius: '30px' }}>
                {language === 'tr' ? 'Ölçü Almaya Başla' : 'Start Measuring'}
              </Link>
            </div>

            {/* Right side: Embedded Measure Promo Visual Component */}
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <MeasurePromoVisual />
            </div>

          </div>
        </div>
      </section>

      {/* 5. PARALLAX GALLERY: TAMAMLANAN ÇALIŞMALAR */}
      <section style={{ padding: '3.5rem 0 0 0', background: '#0A141D', overflow: 'hidden' }}>
        <div style={{ width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '0 2rem' }}>
            <span className="section-label" style={{ color: '#BD954B' }}>{t('fabric.label')}</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: '#ffffff', marginBottom: '1rem' }}>
              {language === 'tr' ? 'Tamamlanan Seçkin Çalışmalarımız' : 'Our Completed Premium Works'}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 300, maxWidth: '600px', margin: '0 auto' }}>
              {language === 'tr' 
                ? 'Lale Perde dokunuşuyla zerafete kavuşmuş mekanlardan ilham verici kesitler.'
                : 'Inspiring spaces enriched with elegance by Lale Perde craftsmanship.'}
            </p>
          </div>

          {/* Full-width responsive Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, 1fr)', 
            gridAutoRows: 'minmax(180px, auto)',
            gap: '1rem',
            width: '100%',
            padding: '0 2rem',
            boxSizing: 'border-box'
          }}>
            {(homeContent?.references?.items && homeContent.references.items.length > 0
              ? homeContent.references.items
              : services.map((s, idx) => {
                  const colIdx = idx % 3;
                  const rowIdx = Math.floor(idx / 3);
                  return {
                    ...s,
                    gridColumnStart: colIdx * 4 + 1,
                    gridColumnEnd: (colIdx + 1) * 4 + 1,
                    gridRowStart: rowIdx * 2 + 1,
                    gridRowEnd: (rowIdx + 1) * 2 + 1
                  };
                })
            ).map((item: any, idx: number) => {
              const tilt = galleryTilt[item.id] || { x: 0, y: 0 };
              return (
                <div
                  key={item.id}
                  onMouseMove={(e) => handleGalleryMouseMove(item.id, e)}
                  onMouseLeave={() => handleGalleryMouseLeave(item.id)}
                  onClick={() => {
                    if (item.image) {
                      setActiveLightboxImage(item.image);
                      resetZoom();
                    }
                  }}
                  style={{
                    gridColumnStart: item.gridColumnStart,
                    gridColumnEnd: item.gridColumnEnd,
                    gridRowStart: item.gridRowStart,
                    gridRowEnd: item.gridRowEnd,
                    position: 'relative',
                    minHeight: '260px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: `perspective(800px) rotateX(${tilt.y * -5}deg) rotateY(${tilt.x * 5}deg)`,
                    transition: 'transform 0.1s ease, box-shadow 0.3s',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <Image
                    src={item.image || '/assets/fabric.png'}
                    alt={language === 'tr' ? item.titleTr : item.titleEn}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    style={{
                      objectFit: 'cover',
                      transform: `scale(1.1) translate(${tilt.x * -8}px, ${tilt.y * -8}px)`,
                      transition: 'transform 0.1s ease',
                      zIndex: -1
                    }}
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'linear-gradient(to bottom, transparent 40%, rgba(10, 20, 29, 0.95))',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '2rem'
                    }}
                  >
                    <span style={{ color: '#BD954B', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 500 }}>
                      {t('collections.collectionNum')} 0{idx + 1}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', color: '#ffffff', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                      {language === 'tr' ? item.titleTr : item.titleEn}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', fontWeight: 300, lineHeight: '1.4' }}>
                      {language === 'tr' ? item.descriptionTr : item.descriptionEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. YORUMLAR (MARQUEE RIBBON) */}
      <section style={{ padding: '2rem 0 6rem 0', background: '#0A141D' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <LineDivider />
            <span className="section-label">{language === 'tr' ? 'MÜŞTERİ YORUMLARI' : 'TESTIMONIALS'}</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: '#ffffff' }}>
              {language === 'tr' ? 'Hakkımızda Neler Dediler?' : 'What Our Customers Say'}
            </h2>
          </div>
        </div>
        <MarqueeComments comments={comments} />
      </section>

      {/* 7. APPOINTMENT / CONTACT FORM SECTION */}
      <section id="randevu" className="appointment" style={{ padding: '6rem 0', background: 'var(--color-primary)' }}>
        <div className="appointment-info reveal active">
          <span className="section-label">{t('appointment.label')}</span>
          <h2 className="appointment-title">{t('appointment.title')}</h2>
          <p style={{ marginBottom: '2rem', fontWeight: 300, opacity: 0.9 }}>
            {t('appointment.desc')}
          </p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <div className="contact-text">
                <h4>{t('appointment.emailLabel')}</h4>
                <p><a href={settings?.email ? `mailto:${settings.email}` : '#'}>{settings?.email}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div className="contact-text">
                <h4>{t('appointment.phoneLabel')}</h4>
                <p><a href={settings?.phone ? `tel:${settings.phone.replace(/\s+/g, '')}` : '#'}>{settings?.phone}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className="contact-text">
                <h4>{t('appointment.addressLabel')}</h4>
                <p>
                  <a href={settings?.address ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` : '#'} target="_blank" rel="noopener noreferrer">
                    {settings?.address}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="appointment-form reveal active" style={{ transitionDelay: '0.2s' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2.5rem', textAlign: 'center', color: 'var(--color-white)' }}>
            {t('appointment.appointmentFormTitle')}
          </h3>
          {submitted ? (
            <div style={{ textAlign: 'center', color: 'var(--color-accent)', fontSize: '1.2rem', padding: '2rem', fontFamily: 'var(--font-serif)' }}>
              {t('appointment.appointmentSuccessMsg')}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">{t('appointment.fullName')}</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder={t('appointment.placeholderName')}
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t('appointment.phone')}</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    placeholder={t('appointment.placeholderPhone')}
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('appointment.email')}</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder={t('appointment.placeholderEmail')}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="service">{t('appointment.serviceInterest')}</label>
                  <select 
                    id="service" 
                    value={service} 
                    onChange={(e) => setService(e.target.value)}
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.titleTr}>
                        {language === 'tr' ? s.titleTr : s.titleEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentDate">{t('appointment.appointmentDate')}</label>
                  <input 
                    type="date" 
                    id="appointmentDate" 
                    required 
                    value={appointmentDate} 
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentTime">{t('appointment.appointmentTime')}</label>
                  <input 
                    type="time" 
                    id="appointmentTime" 
                    required 
                    value={appointmentTime} 
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="address">{t('appointment.appointmentAddress')}</label>
                  <textarea 
                    id="address" 
                    rows={3} 
                    required
                    placeholder={t('appointment.placeholderAddress')}
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : t('appointment.appointmentSubmitBtn')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 8. ZOOMABLE LIGHTBOX MODAL FOR REFERENCES */}
      {activeLightboxImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            overflow: 'hidden',
            userSelect: 'none'
          }}
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
          onMouseLeave={handleLightboxMouseUp}
        >
          {/* Close Area Backdrop */}
          <div 
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            onClick={() => setActiveLightboxImage(null)}
          />

          {/* Interactive Zoomable Image */}
          <div 
            style={{
              position: 'relative',
              width: '90vw',
              height: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              cursor: isLightboxDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleLightboxMouseDown}
          >
            <img 
              src={activeLightboxImage} 
              alt="Reference Detail" 
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `translate(${lightboxOffset.x}px, ${lightboxOffset.y}px) scale(${lightboxZoom})`,
                transition: isLightboxDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'center center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Controls HUD */}
          <div 
            style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(15, 24, 32, 0.85)',
              border: '1px solid rgba(189, 149, 75, 0.3)',
              padding: '0.8rem 1.5rem',
              borderRadius: '30px',
              zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)'
            }}
          >
            {/* Zoom Out Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '1.2rem',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              —
            </button>

            {/* Current Zoom Level / Reset */}
            <span 
              onClick={(e) => { e.stopPropagation(); resetZoom(); }}
              style={{
                color: '#BD954B',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '1px',
                minWidth: '50px',
                textAlign: 'center'
              }}
              title="Sıfırla / Reset"
            >
              {Math.round(lightboxZoom * 100)}%
            </span>

            {/* Zoom In Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: '1.2rem',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ＋
            </button>
          </div>

          {/* Top Right Close Button */}
          <button 
            onClick={() => setActiveLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(15, 24, 32, 0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFF',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              zIndex: 10,
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.5)';
              e.currentTarget.style.color = '#BD954B';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#FFF';
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
