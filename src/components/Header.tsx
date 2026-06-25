'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useDb } from '../context/DbContext';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { settings: _settings, campaigns, incrementSearchLog, fetchCampaignsLazy } = useDb();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCampaignsLazy?.();
  }, [fetchCampaignsLazy]);

  // Filter active campaigns based on today's date
  const activeCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    const now = new Date().toISOString().split('T')[0];
    return campaigns.filter(c => {
      if (!c.isActive) return false;
      if (c.startDate && now < c.startDate) return false;
      if (c.endDate && now > c.endDate) return false;
      return true;
    });
  }, [campaigns]);

  // Construct banner list (active campaigns only)
  const bannerItems = React.useMemo(() => {
    const items: Array<{ textTr: string; textEn: string; duration: number }> = [];
    
    // Add active campaigns
    activeCampaigns.forEach(c => {
      items.push({
        textTr: `${c.titleTr}${c.descriptionTr ? ` : ${c.descriptionTr}` : ''}`,
        textEn: `${c.titleEn || c.titleTr}${c.descriptionEn ? ` : ${c.descriptionEn}` : (c.descriptionTr ? ` : ${c.descriptionTr}` : '')}`,
        duration: c.duration || 8,
      });
    });

    return items;
  }, [activeCampaigns]);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerFade, setBannerFade] = useState(true);

  // Dynamic banner rotation based on per-campaign custom duration
  useEffect(() => {
    if (bannerItems.length <= 1) {
      setCurrentBannerIndex(0);
      setBannerFade(true);
      return;
    }
    
    const currentItem = bannerItems[currentBannerIndex];
    const durationMs = (currentItem?.duration || 8) * 1000;

    const timer = setTimeout(() => {
      setBannerFade(false); // Fade out
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerItems.length);
        setBannerFade(true); // Fade in
      }, 1000); // fade out duration
    }, durationMs);

    return () => clearTimeout(timer);
  }, [bannerItems, currentBannerIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname?.startsWith('/admin') && !searchQuery) {
      window.dispatchEvent(new CustomEvent('admin-search', { detail: '' }));
    }
  }, [searchQuery, pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (pathname?.startsWith('/admin')) {
        window.dispatchEvent(new CustomEvent('admin-search', { detail: searchQuery.trim() }));
        return;
      }
      incrementSearchLog(searchQuery.trim());
      router.push(`/urunler?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  const handleSearchIconClick = (e: React.MouseEvent) => {
    if (!isSearchExpanded) {
      e.preventDefault();
      setIsSearchExpanded(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      if (!searchQuery.trim()) {
        setIsSearchExpanded(false);
      } else {
        handleSearchSubmit(e);
      }
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const hasBanner = bannerItems.length > 0;

  return (
    <>
      {hasBanner && !pathname?.startsWith('/admin') && (
        <div className="announcement-banner">
          <div 
            style={{
              transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: bannerFade ? 1 : 0,
              display: 'inline-block',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {language === 'tr' ? bannerItems[currentBannerIndex]?.textTr : bannerItems[currentBannerIndex]?.textEn}
          </div>
        </div>
      )}
      <header id="main-header" className={`${scrolled ? 'scrolled' : ''} ${hasBanner ? 'has-banner' : ''} ${!isHome ? 'not-home' : ''}`}>

        <Link 
          href="/" 
          className="logo-container" 
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="logo">
            <Image src="/assets/laleperdelogo.svg" alt="Lale Perde" className="logo-icon" width={40} height={40} priority />
            <span className="logo-text">LALE PERDE</span>
          </div>
        </Link>

        {!pathname?.startsWith('/admin') && (
          <nav suppressHydrationWarning>
            <Link suppressHydrationWarning href="/urunler" className={pathname?.startsWith('/urunler') ? 'active' : ''}>{t('nav.products')}</Link>
            <Link suppressHydrationWarning href="/hizmetler" className={pathname === '/hizmetler' ? 'active' : ''}>{t('nav.services')}</Link>
            <Link suppressHydrationWarning href="/rehber" className={pathname?.startsWith('/rehber') ? 'active' : ''}>{t('nav.guide')}</Link>
            <Link suppressHydrationWarning href="/olcu-sihirbazi" className={pathname === '/olcu-sihirbazi' ? 'active' : ''}>{t('nav.wizard')}</Link>
            <Link suppressHydrationWarning href="/iletisim" className={pathname === '/iletisim' ? 'active' : ''}>{t('nav.contact')}</Link>
          </nav>
        )}

        <div className="header-right">
          <form onSubmit={handleSearchSubmit} className={`header-search ${isSearchExpanded ? 'expanded' : ''}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={pathname?.startsWith('/admin') ? 'Admin paneli ara...' : t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim()) {
                  setIsSearchExpanded(false);
                }
              }}
            />
            <svg onClick={handleSearchIconClick} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </form>

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Tema Değiştir">
            {!mounted ? '☾' : (theme === 'light' ? '☾' : '☼')}
          </button>

          <button 
            className="lang-switch-btn" 
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            title="Language"
            suppressHydrationWarning
          >
            {language === 'tr' ? 'EN' : 'TR'}
          </button>

          {pathname?.startsWith('/admin') && (
            <Link 
              href="/"
              className="continue-site-btn" 
              style={{
                background: 'transparent',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                marginLeft: '8px',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-accent)';
                e.currentTarget.style.color = '#0A1118';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
            >
              Siteye Devam Et
            </Link>
          )}
        </div>
      </header>
    </>
  );
};
export default Header;
