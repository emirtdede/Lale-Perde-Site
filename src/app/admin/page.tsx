'use client';

import React, { useState, useEffect, useRef } from 'react';
import LoginScreen from './components/LoginScreen';
import { useDb } from '@/context/DbContext';
import { SystemSettings, Product, ServiceItem, GuideItem, InboxMessage, Campaign } from '@/context/dbTypes';
import DashboardTab from './components/DashboardTab'; // Dashboard is usually the first view, can be static, but let's dynamic it too if we want
import Sidebar from './components/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LoadingTab = () => {
  const { t } = useLanguage();
  return <div style={{ padding: '3rem', color: '#BD954B', textAlign: 'center', fontSize: '1.2rem' }}>{t('admin.loadingTab')}</div>;
};

const DynamicDashboardTab = dynamic(() => import('./components/DashboardTab'), { ssr: false, loading: LoadingTab });
const HomePageContentTab = dynamic(() => import('./components/HomePageContentTab'), { ssr: false, loading: LoadingTab });
const CategoriesTab = dynamic(() => import('./components/CategoriesTab'), { ssr: false, loading: LoadingTab });
const ProductsTab = dynamic(() => import('./components/ProductsTab'), { ssr: false, loading: LoadingTab });
const ServicesTab = dynamic(() => import('./components/ServicesTab'), { ssr: false, loading: LoadingTab });
const GuidesTab = dynamic(() => import('./components/GuidesTab'), { ssr: false, loading: LoadingTab });
const ContactInfoTab = dynamic(() => import('./components/ContactInfoTab'), { ssr: false, loading: LoadingTab });
const InboxTab = dynamic(() => import('./components/InboxTab'), { ssr: false, loading: LoadingTab });
const CampaignsTab = dynamic(() => import('./components/CampaignsTab'), { ssr: false, loading: LoadingTab });
const VisitorsTab = dynamic(() => import('./components/VisitorsTab'), { ssr: false, loading: LoadingTab });
const SecurityTab = dynamic(() => import('./components/SecurityTab'), { ssr: false, loading: LoadingTab });
const GoogleAdsTab = dynamic(() => import('./components/GoogleAdsTab'), { ssr: false, loading: LoadingTab });

export type AdminTab = 'dashboard' | 'homeContent' | 'categories' | 'products' | 'services' | 'guides' | 'contactInfo' | 'inbox' | 'campaigns' | 'visitors' | 'security' | 'googleAds';

interface SearchResultItem {
  id: string;
  tab: AdminTab;
  category: string;
  title: string;
  snippet: string;
}

export default function AdminPage() {
  const { settings, updateSettings, services, guides, inbox, campaigns } = useDb();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  // Sidebar states
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isSidebarMinimal, setIsSidebarMinimal] = useState(false);
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Search state
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Login States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [resetFlow, setResetFlow] = useState(false);
  const [resetEmailOrPhone, setResetEmailOrPhone] = useState('');
  const [sentResetOTP, setSentResetOTP] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  // 2FA States
  const [twoFactorFlow, setTwoFactorFlow] = useState(false);
  const [twoFactorChoiceFlow, setTwoFactorChoiceFlow] = useState(false);
  const [twoFactorOTP, setTwoFactorOTP] = useState('');
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSentDestination, setTwoFactorSentDestination] = useState('');

  const [serverAdminEmail, setServerAdminEmail] = useState('');
  const [serverAdminPhone, setServerAdminPhone] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check auth status from server instead of localStorage
      fetch('/api/admin/verify')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setIsAuthenticated(true);
          }
        })
        .catch(err => console.error('Auth verify error:', err))
        .finally(() => setIsCheckingAuth(false));

      // Load sidebar settings
      const savedWidth = localStorage.getItem('lale_admin_sidebar_width');
      if (savedWidth) setSidebarWidth(parseInt(savedWidth, 10));

      const savedMinimal = localStorage.getItem('lale_admin_sidebar_minimal');
      if (savedMinimal) setIsSidebarMinimal(savedMinimal === 'true');

      const savedClosed = localStorage.getItem('lale_admin_sidebar_closed');
      if (savedClosed) setIsSidebarClosed(savedClosed === 'true');

      // Load tab from URL query params
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      const validTabs: AdminTab[] = ['dashboard', 'homeContent', 'categories', 'products', 'services', 'guides', 'contactInfo', 'inbox', 'campaigns', 'visitors', 'security', 'googleAds'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Save states to localStorage when changed
  const handleSetSidebarMinimal = (minimal: boolean) => {
    setIsSidebarMinimal(minimal);
    localStorage.setItem('lale_admin_sidebar_minimal', String(minimal));
  };

  const handleSetSidebarClosed = (closed: boolean) => {
    setIsSidebarClosed(closed);
    localStorage.setItem('lale_admin_sidebar_closed', String(closed));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput, preCheck: true })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.twoFactorEnabled) {
          setServerAdminEmail(data.adminEmail);
          setServerAdminPhone(data.adminPhone);
          if (data.twoFactorType === 'both') {
            setTwoFactorChoiceFlow(true);
          } else {
            sendOTPForLogin(data.twoFactorType || 'email', data.adminEmail, data.adminPhone);
          }
        } else {
          await completeLogin();
        }
      } else {
        setLoginError(data.error || 'Geçersiz kullanıcı adı veya şifre.');
      }
    } catch (err) {
      setLoginError('Bağlantı hatası.');
    }
  };

  const completeLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setTwoFactorFlow(false);
        setLoginError('');
      } else {
        setLoginError('Sunucu oturumunuzu başlatamadı.');
      }
    } catch (err) {
      setLoginError('Bağlantı hatası.');
    }
  };

  const sendOTPForLogin = async (type: 'email' | 'phone', email?: string, phone?: string) => {
    const targetEmail = email || serverAdminEmail;
    const targetPhone = phone || serverAdminPhone;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    let destination = '';
    
    if (type === 'email') {
      destination = `E-Posta (${targetEmail})`;
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, code })
        });
        const data = await response.json();
        if (!response.ok) {
          setLoginError(data.error || 'E-posta gönderilemedi.');
          return;
        }
      } catch (err) {
        console.error('2FA E-posta gönderme hatası:', err);
        setLoginError('E-posta servisi ile bağlantı kurulamadı.');
        return;
      }
    } else {
      destination = `Telefon (${targetPhone})`;
      console.log(`[LALE PERDE GÜVENLİK] SMS 2FA code generated (simulated): ${code}`);
    }

    setTwoFactorOTP(code);
    setTwoFactorFlow(true);
    setTwoFactorChoiceFlow(false);
    setTwoFactorInput('');
    setTwoFactorError('');
    setTwoFactorSentDestination(destination);
    console.log(`[LALE PERDE GÜVENLİK] 2FA OTP Code sent successfully.`);
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorInput === twoFactorOTP) {
      await completeLogin();
    } else {
      setTwoFactorError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    }
  };

  const triggerResetOTP = async () => {
    if (!settings) return;
    
    if (resetEmailOrPhone === settings.adminEmail || resetEmailOrPhone === settings.adminPhone) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setResetStatus('E-posta gönderiliyor...');
      
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: settings.adminEmail, code: otp, type: 'reset' })
        });
        const data = await response.json();
        
        if (!response.ok) {
          setResetStatus(data.error || 'Doğrulama kodu e-posta ile gönderilemedi.');
          return;
        }
      } catch (err) {
        console.error('Şifre sıfırlama e-posta hatası:', err);
        setResetStatus('E-posta servisine erişilemedi.');
        return;
      }

      setSentResetOTP(otp);
      setResetStatus(`Doğrulama kodu e-posta adresinize (${settings.adminEmail}) başarıyla gönderildi.`);
    } else {
      setResetStatus('Sistemde kayıtlı böyle bir iletişim bilgisi bulunamadı.');
    }
  };

  const verifyResetOTP = () => {
    if (otpInput === sentResetOTP) {
      setOtpVerified(true);
      setResetStatus('Kod doğrulandı. Lütfen yeni şifrenizi girin.');
    } else {
      setResetStatus('Geçersiz doğrulama kodu.');
    }
  };

  const changePasswordWithOTP = () => {
    if (newPasswordInput.length < 6) {
      setResetStatus('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (settings) {
      updateSettings({ ...settings, adminPasswordHash: newPasswordInput });
      setResetStatus('Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.');
      setTimeout(() => {
        setResetFlow(false);
        setSentResetOTP('');
        setOtpInput('');
        setOtpVerified(false);
        setNewPasswordInput('');
        setResetStatus('');
        setResetEmailOrPhone('');
      }, 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Sidebar drag resizing logic
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 180 && newWidth <= 450) {
        setSidebarWidth(newWidth);
        localStorage.setItem('lale_admin_sidebar_width', String(newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Global search filtering logic
  const getSearchResults = (query: string): SearchResultItem[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // Services
    services.forEach(s => {
      if (
        s.titleTr.toLowerCase().includes(lowerQuery) ||
        s.titleEn.toLowerCase().includes(lowerQuery) ||
        s.descriptionTr.toLowerCase().includes(lowerQuery) ||
        s.descriptionEn.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: s.id,
          tab: 'services',
          category: 'Hizmetler',
          title: s.titleTr,
          snippet: s.descriptionTr
        });
      }
    });

    // Guides
    guides.forEach(g => {
      if (
        g.titleTr.toLowerCase().includes(lowerQuery) ||
        g.titleEn.toLowerCase().includes(lowerQuery) ||
        g.summaryTr.toLowerCase().includes(lowerQuery) ||
        g.summaryEn.toLowerCase().includes(lowerQuery) ||
        g.contentTr.toLowerCase().includes(lowerQuery) ||
        g.contentEn.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: g.id,
          tab: 'guides',
          category: 'Rehberler',
          title: g.titleTr,
          snippet: g.summaryTr
        });
      }
    });

    // Inbox Messages
    inbox.forEach(m => {
      if (
        m.name.toLowerCase().includes(lowerQuery) ||
        m.email.toLowerCase().includes(lowerQuery) ||
        m.subject.toLowerCase().includes(lowerQuery) ||
        m.message.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: m.id,
          tab: 'inbox',
          category: 'Gelen Kutusu',
          title: `${m.name} - ${m.subject}`,
          snippet: m.message
        });
      }
    });

    // Campaigns
    campaigns.forEach(c => {
      if (
        c.titleTr.toLowerCase().includes(lowerQuery) ||
        c.titleEn.toLowerCase().includes(lowerQuery) ||
        c.descriptionTr.toLowerCase().includes(lowerQuery) ||
        c.descriptionEn.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: c.id,
          tab: 'campaigns',
          category: 'Kampanyalar',
          title: c.titleTr,
          snippet: c.descriptionTr
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults(adminSearchQuery);

  const handleSearchIconClick = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      if (!adminSearchQuery.trim()) {
        setIsSearchExpanded(false);
      }
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0A1015' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(189, 149, 75, 0.2)', borderTopColor: '#BD954B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        handleLogin={handleLogin}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        loginError={loginError}
        resetFlow={resetFlow}
        setResetFlow={setResetFlow}
        resetEmailOrPhone={resetEmailOrPhone}
        setResetEmailOrPhone={setResetEmailOrPhone}
        triggerResetOTP={triggerResetOTP}
        sentResetOTP={sentResetOTP}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        verifyResetOTP={verifyResetOTP}
        otpVerified={otpVerified}
        newPasswordInput={newPasswordInput}
        setNewPasswordInput={setNewPasswordInput}
        changePasswordWithOTP={changePasswordWithOTP}
        resetStatus={resetStatus}
        twoFactorFlow={twoFactorFlow}
        setTwoFactorFlow={setTwoFactorFlow}
        twoFactorInput={twoFactorInput}
        setTwoFactorInput={setTwoFactorInput}
        twoFactorError={twoFactorError}
        twoFactorSentDestination={twoFactorSentDestination}
        handleTwoFactorVerify={handleTwoFactorVerify}
        twoFactorChoiceFlow={twoFactorChoiceFlow}
        setTwoFactorChoiceFlow={setTwoFactorChoiceFlow}
        sendOTPForLogin={sendOTPForLogin}
        adminEmail={serverAdminEmail || settings?.adminEmail || ''}
        adminPhone={serverAdminPhone || settings?.adminPhone || ''}
      />
    );
  }

  const currentSidebarWidth = isSidebarClosed ? 0 : (isSidebarMinimal ? 70 : sidebarWidth);

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#0A1118', 
      position: 'relative'
    }}>
      
      {/* Floating Toggle Button when Sidebar is fully closed */}
      {isSidebarClosed && (
        <button 
          onClick={() => handleSetSidebarClosed(false)}
          title="Menüyü Aç"
          style={{
            position: 'fixed',
            left: '2px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 99,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: 0.85,
            filter: 'drop-shadow(0 0 6px rgba(189, 149, 75, 0.6))'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.25)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(189, 149, 75, 0.95)) brightness(1.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.opacity = '0.85';
            e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(189, 149, 75, 0.6))';
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Sidebar Wrapper */}
      <div style={{ 
        width: `${currentSidebarWidth}px`, 
        flexShrink: 0,
        overflow: 'hidden',
        transition: isResizing ? 'none' : 'width 0.2s ease'
      }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            handleTabChange(tab);
            setAdminSearchQuery(''); // Clear search when tab changes
          }} 
          handleLogout={handleLogout}
          isMinimal={isSidebarMinimal}
          setIsMinimal={handleSetSidebarMinimal}
          onClose={() => handleSetSidebarClosed(true)}
        />
      </div>

      {/* Sidebar Drag Resizer Handle */}
      {!isSidebarClosed && !isSidebarMinimal && (
        <div 
          onMouseDown={startResizing}
          style={{
            width: '4px',
            cursor: 'col-resize',
            backgroundColor: 'rgba(189, 149, 75, 0.15)',
            transition: 'background-color 0.2s',
            zIndex: 10,
            alignSelf: 'stretch',
            flexShrink: 0
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(189, 149, 75, 0.15)'}
        />
      )}
      
      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        
        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', position: 'relative' }}>
          
          {/* Unified Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {/* Tab Title */}
            <h2 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0, whiteSpace: 'nowrap' }}>
              {{
                dashboard: t('admin.sidebar.dashboard') || 'Dashboard',
                homeContent: t('admin.sidebar.homeContent') || 'Home Page Content',
                categories: t('admin.sidebar.categories') || 'Category Management',
                products: t('admin.sidebar.products') || 'Product Management',
                services: t('admin.sidebar.services') || 'Services',
                guides: t('admin.sidebar.guides') || 'Guides & Blog',
                contactInfo: t('admin.sidebar.contactInfo') || 'Contact Information',
                inbox: t('admin.sidebar.inbox') || 'Inbox',
                campaigns: t('admin.sidebar.campaigns') || 'Campaigns and Announcements',
                visitors: t('admin.sidebar.visitors') || 'Site Visitors',
                security: t('admin.sidebar.security') || 'Privacy and Security',
                googleAds: t('admin.sidebar.googleAds') || 'Google Ads Integration',
              }[activeTab]}
            </h2>

            {/* Right Controls Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              {/* Tab-specific action buttons portal */}
              <div id="admin-tab-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}></div>

              {/* Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="İçerik ara..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  style={{
                    width: isSearchExpanded ? '200px' : '0px',
                    opacity: isSearchExpanded ? 1 : 0,
                    padding: isSearchExpanded ? '0.4rem 2rem 0.4rem 0.8rem' : '0px',
                    background: '#0F1820',
                    border: '1px solid rgba(189, 149, 75, 0.3)',
                    borderRadius: '4px',
                    color: '#FFF',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
                <svg 
                  onClick={handleSearchIconClick} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  style={{ 
                    cursor: 'pointer', 
                    width: '20px', 
                    height: '20px', 
                    color: 'var(--color-accent)',
                    position: isSearchExpanded ? 'absolute' : 'static',
                    right: isSearchExpanded ? '8px' : 'auto'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                title="Tema Değiştir"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px 8px'
                }}
              >
                {theme === 'light' ? '☾' : '☼'}
              </button>

              {/* Language Switch */}
              <button 
                onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                title="Language"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '4px 8px'
                }}
              >
                {language === 'tr' ? 'EN' : 'TR'}
              </button>

              {/* Siteye Devam Et */}
              <Link 
                href="/"
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
            </div>
          </div>

          {adminSearchQuery.trim() ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(189, 149, 75, 0.2)', paddingBottom: '1rem' }}>
                <h2 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '1.8rem' }}>
                  Arama Sonuçları: "{adminSearchQuery}"
                </h2>
                <button 
                  onClick={() => {
                    setAdminSearchQuery('');
                  }}
                  style={{
                    background: 'rgba(255, 75, 75, 0.1)',
                    color: '#FF6B6B',
                    border: '1px solid rgba(255, 75, 75, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Aramayı Temizle
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div style={{ color: '#A3B3C2', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>
                  Aradığınız kriterlere uygun herhangi bir admin içeriği bulunamadı.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {searchResults.map((result) => (
                    <div 
                      key={result.id + '-' + result.tab}
                      style={{
                        background: '#0F1820',
                        border: '1px solid rgba(189, 149, 75, 0.15)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.15)'}
                    >
                      <div>
                        <span style={{
                          background: 'rgba(189, 149, 75, 0.15)',
                          color: 'var(--color-accent)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }}>
                          {result.category}
                        </span>
                        <h4 style={{ color: '#FFFFFF', margin: '0 0 0.4rem 0', fontSize: '1.15rem' }}>{result.title}</h4>
                        <p style={{ color: '#A3B3C2', margin: 0, fontSize: '0.9rem', opacity: 0.85 }}>{result.snippet}</p>
                      </div>

                      <button 
                        onClick={() => {
                          handleTabChange(result.tab);
                          setAdminSearchQuery('');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, var(--color-accent), #A17E3B)',
                          color: '#0A1118',
                          border: 'none',
                          padding: '0.6rem 1.2rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 10px rgba(189,149,75,0.2)',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Git & Düzenle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {activeTab === 'dashboard' && <DynamicDashboardTab />}
              {activeTab === 'homeContent' && <HomePageContentTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'services' && <ServicesTab />}
              {activeTab === 'guides' && <GuidesTab />}
              {activeTab === 'contactInfo' && <ContactInfoTab />}
              {activeTab === 'inbox' && <InboxTab />}
              {activeTab === 'campaigns' && <CampaignsTab />}
              {activeTab === 'visitors' && <VisitorsTab />}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'googleAds' && <GoogleAdsTab />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
