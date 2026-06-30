'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useDb } from '../context/DbContext';
import { usePathname } from 'next/navigation';
import { useGoogleAds } from '../context/GoogleAdsContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { settings } = useDb();
  const pathname = usePathname();
  const { trackConversion } = useGoogleAds();


  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="professional-footer">
      <div className="footer-grid">
        <div className="footer-brand-section">
          <div className="footer-logo">
            <Image src="/assets/laleperdelogo.svg" alt="Lale Perde" className="footer-logo-icon" width={32} height={32} />
            <span className="footer-logo-text">LALE PERDE</span>
          </div>
          <p className="footer-desc">
            {t('footer.brandDesc')}
          </p>
          <div className="footer-social-links" style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <a 
              href={settings?.shopierUrl || "https://www.shopier.com/laleperdekahta"} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Shopier Store" 
              style={{ color: 'var(--color-accent)', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-white)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </a>
            <a 
              href={settings?.instagramUrl || "http://instagram.com/laleperdekahta"} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Instagram" 
              style={{ color: 'var(--color-accent)', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-white)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a 
              href={settings?.facebookUrl || "https://www.facebook.com/Laleperdekahta/"} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Facebook" 
              style={{ color: 'var(--color-accent)', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-white)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a 
              href={settings?.linkedinUrl || "https://www.linkedin.com/company/laleperde/about/"} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="LinkedIn" 
              style={{ color: 'var(--color-accent)', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-white)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a 
              href={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}` : "https://wa.me/905432480503"} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="WhatsApp" 
              style={{ color: 'var(--color-accent)', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-white)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
              onClick={() => trackConversion('whatsapp')}
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 2C6.49 2 2 6.48 2 12.01c0 1.77.46 3.49 1.34 5.01L2 22l5.12-1.34c1.47.8 3.12 1.22 4.9 1.22 5.54 0 10.03-4.48 10.03-10.01C22.05 6.48 17.56 2 12.03 2zm4.8 13.86c-.27.76-1.34 1.39-1.85 1.49-.46.09-.94.13-2.93-.68-2.54-1.04-4.18-3.62-4.31-3.79-.12-.17-.99-1.32-.99-2.51 0-1.2.62-1.78.84-2.03.22-.25.47-.31.62-.31.15 0 .31 0 .44.01.14 0 .32-.05.5.38.18.43.62 1.51.68 1.63.06.12.1.26.02.43-.08.17-.12.28-.25.43-.12.15-.26.33-.37.45-.12.13-.25.27-.11.51.14.24.63 1.03 1.36 1.68.93.83 1.72 1.09 1.97 1.21.25.12.39.1.53-.06.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.51.71 1.77.84.26.13.43.19.49.3.06.11.06.66-.21 1.42z"/>
              </svg>
            </a>
          </div>
          <div className="footer-contact-info">
            {settings?.phone && (
              <div className="footer-contact-item">
                <svg className="contact-svg-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>
                  {settings.phone}
                </a>
              </div>
            )}
            {settings?.email && (
              <div className="footer-contact-item">
                <svg className="contact-svg-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </div>
            )}
            {settings?.address && (
              <div className="footer-contact-item">
                <svg className="contact-svg-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer">
                  {settings.address}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="footer-col-links footer-col-pages">
          <h4>{language === 'tr' ? 'Sayfalar' : 'Pages'}</h4>
          <ul className="footer-links-list">
            <li><Link href="/">{t('nav.home')}</Link></li>
            <li><Link href="/urunler">{t('nav.products')}</Link></li>
            <li><Link href="/hizmetler">{t('nav.services')}</Link></li>
            <li><Link href="/rehber">{t('nav.guide')}</Link></li>
            <li><Link href="/olcu-sihirbazi">{t('nav.wizard')}</Link></li>
            <li><Link href="/iletisim">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div className="footer-col-links">
          <h4>{language === 'tr' ? 'Yasal Bilgilendirme' : 'Legal Information'}</h4>
          <ul className="footer-links-list">
            <li><Link href="/gizlilik-politikasi">{language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</Link></li>
            <li><Link href="/cerez-politikasi">{language === 'tr' ? 'Çerez Politikası' : 'Cookie Policy'}</Link></li>
            <li><Link href="/kvkk-aydinlatma">{language === 'tr' ? 'KVKK Aydınlatma Metni' : 'KVKK Text'}</Link></li>
            <li><Link href="/kullanim-kosullari">{language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Use'}</Link></li>
            <li><Link href="/mesafeli-satis">{language === 'tr' ? 'Mesafeli Satış Sözleşmesi' : 'Distance Selling Agreement'}</Link></li>
            <li><Link href="/on-bilgilendirme">{language === 'tr' ? 'Ön Bilgilendirme Formu' : 'Preliminary Information Form'}</Link></li>
            <li><Link href="/garanti-taahhutnamesi">{language === 'tr' ? 'Garanti Taahhütnamesi' : 'Warranty Declaration'}</Link></li>
            <li><Link href="/iade-ve-cayma">{language === 'tr' ? 'İade ve Cayma Şartları' : 'Return & Withdrawal Terms'}</Link></li>
          </ul>
        </div>

        <div className="footer-col-map">
          <h4>{t('footer.colHours')}</h4>
          <div className="footer-hours-item" style={{ alignItems: 'flex-start' }}>
            <svg className="contact-svg-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginTop: '3px', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {(() => {
                const hoursText = language === 'tr' ? settings?.workingHoursTr : settings?.workingHoursEn;
                if (!hoursText) return null;
                const parts = hoursText.split('|');
                return parts.map((part, idx) => (
                  <span key={idx} style={{ display: 'block' }}>{part.trim()}</span>
                ));
              })()}
            </div>
          </div>
          
          <div className="footer-map-container">
            <iframe
              src={settings?.googleMapsEmbed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d394.1424440361272!2d38.61035475548639!3d37.786769185663445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15335f0e3cd67197%3A0x5711b777789062f1!2sLALE%20PERDE%20KAHTA!5e0!3m2!1str!2str!4v1782053953763!5m2!1str!2str'}
               width="100%"
              height="240"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="footer-bottom" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="footer-bottom-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <p className="footer-copyright footer-shimmer" style={{ margin: 0 }}>&copy; {currentYear} Lale Perde. {t('footer.allRightsReserved')}</p>
          <a 
            href="https://vellium.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-attribution" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', transition: 'opacity 0.3s ease' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg 
              version="1.0" 
              xmlns="http://www.w3.org/2000/svg"
              width="22" 
              height="18" 
              viewBox="0 145 1024 818" 
              style={{ flexShrink: 0 }}
            >
              <defs>
                <linearGradient id="velliumShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BD954B" />
                  <stop offset="50%" stopColor="#FFF5D6" />
                  <stop offset="100%" stopColor="#BD954B" />
                  <animate attributeName="x1" from="-200%" to="200%" dur="6s" repeatCount="indefinite" />
                  <animate attributeName="x2" from="-100%" to="300%" dur="6s" repeatCount="indefinite" />
                </linearGradient>
              </defs>
              <g transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" fill="url(#velliumShimmer)" stroke="none">
                <path d="M53 8745 c-34 -24 -29 -64 12 -112 52 -61 101 -80 235 -93 410 -38 673 -149 923 -389 161 -155 293 -332 442 -591 106 -186 1284 -2552 2777 -5580 621 -1260 655 -1327 674 -1334 22 -8 47 38 236 422 773 1576 1151 2344 1548 3147 117 237 259 525 315 640 350 715 1261 2549 1313 2643 256 465 528 758 836 903 161 75 298 110 530 135 175 19 214 32 266 91 46 53 53 93 18 117 -27 19 -189 21 -718 6 -626 -18 -768 -30 -1008 -86 -260 -61 -467 -156 -682 -313 -97 -71 -300 -274 -374 -374 -147 -198 -178 -257 -674 -1272 -115 -236 -373 -761 -572 -1165 -200 -404 -504 -1023 -676 -1375 -369 -754 -336 -690 -354 -690 -8 0 -67 106 -141 255 -185 368 -886 1784 -1431 2890 -469 952 -541 1092 -626 1225 -287 449 -705 733 -1233 839 -228 46 -487 61 -1203 72 -373 5 -413 5 -433 -11z m1717 -370 c184 -30 402 -121 560 -234 171 -121 350 -325 463 -527 55 -99 606 -1204 1367 -2744 608 -1230 930 -1873 946 -1890 12 -13 16 -13 28 0 13 13 278 547 751 1515 62 127 240 487 395 800 155 314 331 669 390 790 355 726 736 1487 780 1560 166 275 368 471 615 597 207 105 451 166 553 139 76 -21 66 -62 -72 -288 -85 -140 -211 -382 -396 -758 -92 -187 -353 -713 -580 -1170 -792 -1595 -1317 -2664 -1742 -3550 -399 -830 -687 -1410 -702 -1413 -20 -4 -297 544 -701 1388 -430 899 -2542 5154 -2657 5355 -26 44 -80 137 -121 208 -86 146 -94 169 -73 202 24 37 64 41 196 20z"/>
              </g>
            </svg>
            <span className="footer-shimmer" style={{ fontWeight: 400 }}>Designed & Developed by Vellium</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
