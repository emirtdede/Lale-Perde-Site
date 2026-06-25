'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useDb } from '../context/DbContext';
import { useGoogleAds } from '../context/GoogleAdsContext';
import { submitContactForm } from './actions/contactActions';

const CategoryImageSlideshow = ({ images, fallbackImage, alt }: { images?: string[], fallbackImage: string, alt: string }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const slideImages = React.useMemo(() => {
    return images && images.length > 0 ? images : [fallbackImage];
  }, [images, fallbackImage]);

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideImages]);

  return (
    <div className="collection-img" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      {slideImages.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIdx ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: index === currentIdx ? 1 : 0,
          }}
          aria-label={alt}
        />
      ))}
    </div>
  );
};

export default function HomeClient({ 
  initialCategories, 
  initialServices, 
  initialSettings, 
  initialHomeContent 
}: { 
  initialCategories: any[]; 
  initialServices: any[]; 
  initialSettings: any; 
  initialHomeContent: any; 
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

  // Parallax elements references
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const bulbGlowRef = useRef<HTMLDivElement>(null);
  const storyImgRef = useRef<HTMLDivElement>(null);
  const fabricBgRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addInboxMessage } = useDb();

  const categories = initialCategories;
  const services = initialServices;
  const settings = initialSettings;
  const homeContent = initialHomeContent;

  // Load initial settings, categories, home content, and services
  useEffect(() => {
    if (services.length > 0) {
      setService(services[0].titleTr);
    }

    // Handle service query parameter to auto-select in form
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryService = params.get('service');
      if (queryService) {
        // Find if it matches service id, titleTr, or titleEn
        const matched = services.find((s: any) => 
          s.id === queryService || 
          s.titleTr === queryService || 
          s.titleEn === queryService
        );
        if (matched) {
          setService(matched.titleTr);
        }
      }
    }
  }, [services]);

  // Bulb positioning logic
  const bulbOrigX = 0.743;
  const bulbOrigY = 0.298;

  const repositionBulbGlow = () => {
    if (!heroRef.current || !heroBgRef.current || !bulbGlowRef.current) return;

    const bgWidth = heroRef.current.clientWidth;
    const bgHeight = heroRef.current.clientHeight * 1.2; // 120% height from CSS

    const imgRatio = 1.0; // Square original image ratio
    const containerRatio = bgWidth / bgHeight;

    let renderedWidth, renderedHeight;
    let offsetLeft = 0;
    let offsetTop = 0;

    if (containerRatio > imgRatio) {
      renderedWidth = bgWidth;
      renderedHeight = bgWidth / imgRatio;
      offsetTop = (bgHeight - renderedHeight) / 2;
    } else {
      renderedHeight = bgHeight;
      renderedWidth = bgHeight * imgRatio;
      offsetLeft = (bgWidth - renderedWidth) / 2;
    }

    const bulbPixelX = offsetLeft + (bulbOrigX * renderedWidth);
    const bulbPixelY = offsetTop + (bulbOrigY * renderedHeight);

    // Apply values to elements
    bulbGlowRef.current.style.left = `${bulbPixelX}px`;
    bulbGlowRef.current.style.top = `${bulbPixelY}px`;

    // Pass custom properties to CSS so glow cast aligns in %
    heroBgRef.current.style.setProperty('--bulb-x', `${(bulbPixelX / bgWidth) * 100}%`);
    heroBgRef.current.style.setProperty('--bulb-y', `${(bulbPixelY / bgHeight) * 100}%`);
  };

  useEffect(() => {
    window.addEventListener('resize', repositionBulbGlow);
    const timeoutId = setTimeout(repositionBulbGlow, 100);

    // Parallax logic
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Parallax for Hero Background
          if (heroBgRef.current) {
            const heroOffset = window.scrollY * 0.4;
            heroBgRef.current.style.transform = `translateY(${heroOffset}px)`;
          }

          // Parallax for Story Image
          if (storyImgRef.current) {
            const storyContainer = storyImgRef.current.parentElement;
            if (storyContainer) {
              const rect = storyContainer.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrolledRatio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                const offset = (scrolledRatio - 0.5) * 100; // range from -50px to 50px
                storyImgRef.current.style.transform = `translateY(${offset}px) scale(1.1)`;
              }
            }
          }

          // Parallax for Fabric Showcase Background
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
      clearTimeout(timeoutId);
      window.removeEventListener('resize', repositionBulbGlow);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  // Appointment Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Track Google Ads Conversion
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

  const particles = [
    { x: '-35px', y: '-45px', delay: '0s', size: '3px' },
    { x: '45px', y: '-30px', delay: '1.5s', size: '2px' },
    { x: '-55px', y: '30px', delay: '0.8s', size: '4px' },
    { x: '35px', y: '55px', delay: '2.2s', size: '2px' },
    { x: '-15px', y: '65px', delay: '3s', size: '3px' },
    { x: '60px', y: '15px', delay: '1.2s', size: '4px' },
    { x: '-50px', y: '-20px', delay: '2.7s', size: '2px' },
  ];

  return (
    <>
      {/* Parallax Hero Section */}
      <section id="hero" className={`hero ${isNight ? 'night' : ''}`} ref={heroRef}>
        <div 
          className="hero-bg" 
          id="hero-bg" 
          ref={heroBgRef}
        >
          <Image 
            src="/assets/hero.png" 
            alt="Lale Perde" 
            fill 
            priority
            quality={90}
            style={{ objectFit: 'cover', zIndex: -1 }} 
          />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to bottom, rgba(26, 46, 64, 0.4), rgba(26, 46, 64, 0.7))', zIndex: -1 }} />
          <div className="bulb-glow" id="bulb-glow" ref={bulbGlowRef}>
            <div className="particles-container">
              {particles.map((p, idx) => (
                <div 
                  key={idx}
                  className="particle" 
                  style={{
                    '--x': p.x,
                    '--y': p.y,
                    '--delay': p.delay,
                    '--size': p.size
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="light-overlay" id="light-overlay"></div>
        <div className="hero-content">
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <h1 className="hero-title">{t('hero.title')}: <span>Lale Perde</span></h1>
          <div className="cta-group">
            <Link href="/urunler" className="btn-primary">{t('hero.discoverBtn')}</Link>
            <a href="#randevu" className="btn-outline">{t('hero.appointmentBtn')}</a>
          </div>
        </div>
        
        {/* Cozy Night / Day Switch */}
        <div className="light-switch" id="light-switch" title="Işığı Aç/Kapat" onClick={() => setIsNight(!isNight)}>
          <span className="switch-icon">{isNight ? '☾' : '☼'}</span>
          <span className="switch-text">{isNight ? t('hero.night') : t('hero.day')}</span>
        </div>

        <div className="scroll-down">
          <span>{t('hero.scrollDown')}</span>
          <div className="line"></div>
        </div>
      </section>

      {/* Story / Philosophy Section */}
      <section id="hikayemiz" className="story">
        <div className="story-img-container reveal active">
          <div className="story-img" id="story-img" ref={storyImgRef} style={{ position: 'relative', overflow: 'hidden' }}>
            <Image src="/assets/scandi.png" alt={t('story.title')} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className="story-content reveal active">
          <span className="section-label">{t('story.label')}</span>
          <h2 className="section-title">
            {homeContent ? (language === 'tr' ? homeContent.philosophyTitleTr : homeContent.philosophyTitleEn) : t('story.title')}
          </h2>
          <p className="story-text">
            {homeContent ? (language === 'tr' ? homeContent.philosophyDescTr : homeContent.philosophyDescEn) : t('story.text1')}
          </p>
          <div className="story-quote">{t('story.quote')}</div>
          <p className="story-text">{t('story.text2')}</p>
        </div>
      </section>

      {/* Parallax Fabric Showcase */}
      <section className="fabric-showcase">
        <div className="fabric-bg" id="fabric-bg" ref={fabricBgRef} style={{ backgroundImage: "linear-gradient(to bottom, rgba(26, 46, 64, 0.6), rgba(26, 46, 64, 0.6)), url('/assets/fabric.png')" }}></div>
        <div className="fabric-content reveal active">
          <span className="section-label" style={{ color: 'var(--color-accent)' }}>{t('fabric.label')}</span>
          <h2 className="fabric-title" style={{ color: 'var(--color-white)' }}>
            {homeContent ? (language === 'tr' ? homeContent.craftTitleTr : homeContent.craftTitleEn) : t('fabric.title')}
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', fontWeight: 300, fontSize: '1.1rem', color: 'var(--color-white)' }}>
            {homeContent ? (language === 'tr' ? homeContent.craftDescTr : homeContent.craftDescEn) : t('fabric.desc')}
          </p>
          <Link href="/urunler" className="btn-primary">{t('fabric.btn')}</Link>
        </div>
      </section>

      {/* Collections Grid Section */}
      <section id="koleksiyonlar" className="collections">
        <div className="collections-header reveal active">
          <span className="section-label">{t('collections.label')}</span>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            {homeContent ? (language === 'tr' ? homeContent.collectionsTitleTr : homeContent.collectionsTitleEn) : t('collections.title')}
          </h2>
          <p style={{ color: 'var(--color-primary)', fontWeight: 300 }}>
            {homeContent ? (language === 'tr' ? homeContent.collectionsDescTr : homeContent.collectionsDescEn) : t('collections.subtitle')}
          </p>
        </div>

        <div className="collections-grid">
          {(() => {
            const featured = homeContent?.featuredCategoryIds;
            const displayCategories = featured && featured.length > 0
              ? categories.filter(c => featured.includes(c.id))
              : categories;
            return displayCategories.map((cat, idx) => (
              <div 
                key={cat.id} 
                className="collection-card reveal active" 
                style={{ transitionDelay: `${0.1 * (idx + 1)}s` }}
                onClick={() => router.push(`/urunler?category=${cat.id}`)}
              >
                <CategoryImageSlideshow images={cat.images} fallbackImage={cat.image} alt={language === 'tr' ? cat.nameTr : cat.nameEn} />
                <div className="collection-info">
                  <span className="collection-num">{t('collections.collectionNum')} 0{idx + 1}</span>
                  <h3 className="collection-name">{language === 'tr' ? cat.nameTr : cat.nameEn}</h3>
                  <p className="collection-desc">
                    {language === 'tr' ? cat.descriptionTr : cat.descriptionEn}
                  </p>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* Appointment / Contact Section */}
      <section id="randevu" className="appointment">
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
    </>
  );
}
