import React, { useState } from 'react';
import { AdminTab } from '../page';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  handleLogout: () => void;
  isMinimal: boolean;
  setIsMinimal: (minimal: boolean) => void;
  onClose: () => void;
}

const LogoIcon = ({ size = 26, className = "", style = {} }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 1024 1024" 
    className={className}
    style={{ fill: 'currentColor', flexShrink: 0, ...style }}
  >
    <g transform="translate(0,1024) scale(0.1,-0.1)">
      <path d="M4815 9870 c-71 -5 -143 -11 -159 -12 l-29 -3 2 -85 c5 -224 49 -599 102 -863 200 -1012 610 -1891 1244 -2667 492 -602 1273 -1234 1733 -1400 56 -21 74 -22 175 -17 105 6 257 24 266 33 2 2 -110 115 -248 251 -258 252 -341 342 -542 589 -404 496 -748 1107 -989 1753 -236 634 -394 1430 -429 2159 -5 106 -12 196 -14 199 -8 8 -243 40 -382 53 -167 15 -574 20 -730 10z"/>
      <path d="M4251 9805 c-1201 -213 -2327 -909 -3048 -1885 -368 -499 -623 -1034 -772 -1620 -60 -237 -89 -399 -123 -685 -21 -177 -17 -833 5 -1015 73 -585 213 -1048 476 -1570 418 -831 1090 -1528 1939 -2014 505 -289 1082 -498 1628 -590 189 -32 204 -32 129 3 -206 95 -499 314 -720 536 -137 137 -221 242 -333 410 -230 345 -368 677 -513 1227 -83 319 -159 529 -251 698 -97 178 -309 468 -497 680 -563 632 -762 1042 -871 1794 -11 77 -22 141 -24 143 -6 6 -61 -236 -85 -367 -46 -259 -56 -389 -56 -740 0 -257 5 -374 18 -500 42 -381 136 -769 274 -1130 68 -179 249 -550 334 -685 151 -239 327 -463 514 -650 114 -115 96 -107 -65 29 -505 425 -885 925 -1140 1496 -402 901 -485 1860 -245 2820 121 482 361 1008 647 1419 241 344 592 706 945 974 390 295 841 532 1298 680 230 75 496 140 664 162 l53 7 -6 67 c-3 36 -8 111 -11 166 -7 119 -13 165 -23 164 -4 0 -67 -11 -141 -24z"/>
      <path d="M6163 9613 c16 -402 97 -986 191 -1375 132 -545 300 -1003 526 -1433 349 -663 791 -1230 1354 -1738 60 -54 124 -110 143 -124 l34 -26 120 48 c65 26 119 50 119 53 0 2 -22 34 -48 71 -328 451 -651 1210 -835 1961 -161 655 -235 1281 -225 1891 l5 279 -96 56 c-296 174 -782 368 -1136 453 -71 18 -136 34 -144 37 -12 4 -13 -20 -8 -153z"/>
      <path d="M7755 8856 c-4 -123 -3 -231 1 -239 5 -8 77 -69 159 -135 704 -563 1222 -1366 1464 -2273 144 -539 177 -1100 100 -1669 -48 -353 -164 -772 -300 -1083 -126 -289 -345 -658 -524 -882 l-56 -70 6 -65 c11 -104 66 -474 72 -480 20 -20 365 421 520 665 617 972 845 2050 678 3210 -109 752 -421 1495 -891 2120 -53 72 -131 171 -172 220 -110 131 -449 466 -582 575 -182 148 -434 330 -457 330 -7 0 -13 -85 -18 -224z"/>
      <path d="M7784 8274 c3 -22 10 -93 16 -159 53 -582 187 -1178 401 -1777 138 -384 358 -824 567 -1128 35 -52 66 -97 68 -99 10 -12 227 131 367 243 l87 70 0 47 c0 60 -24 249 -51 396 -78 438 -249 911 -461 1283 -90 156 -274 430 -374 555 -148 185 -461 492 -605 593 -21 14 -21 14 -15 -24z"/>
      <path d="M3146 8083 c-92 -92 -276 -342 -336 -455 l-35 -66 125 -129 c69 -70 160 -172 203 -225 43 -54 81 -98 86 -98 5 0 24 19 43 42 54 69 216 248 291 321 65 64 69 70 64 103 -12 72 -177 313 -318 466 -40 43 -75 78 -79 78 -4 0 -24 -17 -44 -37z"/>
      <path d="M1940 7805 c0 -3 20 -42 44 -88 25 -45 61 -129 80 -187 94 -283 87 -553 -28 -1105 -20 -93 -41 -217 -47 -275 -25 -230 14 -464 109 -655 149 -300 527 -571 849 -608 l43 -5 -59 65 c-112 125 -192 293 -237 498 -25 111 -24 421 1 555 25 140 80 329 131 455 39 95 161 340 220 442 l19 32 -44 63 c-247 353 -608 633 -1028 797 -29 11 -53 18 -53 16z"/>
      <path d="M4330 7766 c-305 -131 -503 -266 -726 -491 -217 -221 -349 -406 -494 -695 -163 -325 -230 -582 -230 -880 0 -292 69 -490 225 -645 189 -189 364 -211 640 -80 161 77 331 214 434 353 146 195 219 460 208 752 -6 149 -13 197 -72 500 -55 284 -68 403 -62 585 9 249 42 366 175 628 7 14 -23 6 -98 -27z"/>
      <path d="M5105 5873 c-51 -397 -119 -606 -273 -843 -107 -166 -215 -291 -483 -565 -217 -221 -240 -247 -321 -353 -321 -427 -433 -875 -338 -1352 49 -246 103 -406 208 -620 56 -113 67 -130 69 -105 22 254 72 446 165 630 85 168 200 332 421 599 297 360 422 565 531 872 102 288 146 532 153 859 6 253 -8 417 -52 635 -24 119 -64 282 -70 288 -2 2 -6 -18 -10 -45z"/>
      <path d="M9245 5129 c-103 -78 -301 -203 -410 -257 -322 -160 -627 -244 -991 -271 -145 -11 -176 -20 -217 -59 -40 -38 -57 -74 -57 -122 0 -89 58 -156 146 -168 55 -8 264 2 373 18 418 62 796 212 1122 447 l77 55 7 155 c4 85 4 172 -1 193 l-9 39 -40 -30z"/>
      <path d="M3013 4088 c5 -609 16 -795 62 -1126 74 -529 253 -1036 494 -1405 406 -619 967 -1018 1588 -1129 186 -33 516 -33 722 1 141 22 395 82 409 95 7 7 19 210 21 343 l1 72 -102 -35 c-278 -93 -578 -136 -808 -114 -242 23 -428 74 -639 176 -417 201 -754 538 -1004 1004 -280 520 -387 1155 -387 2286 l0 404 -181 0 -181 0 5 -572z"/>
      <path d="M9065 4385 c-125 -74 -163 -101 -176 -128 -23 -44 -121 -357 -159 -504 -61 -242 -88 -407 -115 -698 -19 -210 -19 -204 3 -174 26 35 140 219 201 327 135 237 270 587 351 912 58 233 80 361 63 360 -5 -1 -80 -43 -168 -95z"/>
      <path d="M8580 4175 c-30 -12 -90 -34 -133 -50 -43 -15 -88 -37 -98 -49 -29 -31 -176 -326 -253 -508 -219 -517 -361 -1052 -437 -1648 -23 -181 -37 -650 -22 -752 l8 -58 121 78 c222 142 416 291 621 475 129 115 120 88 82 255 -58 255 -84 506 -83 812 1 445 59 809 209 1308 26 85 45 155 43 156 -2 2 -28 -7 -58 -19z"/>
      <path d="M8059 4056 c-2 -2 -60 -9 -129 -16 -69 -6 -135 -13 -147 -16 -39 -8 -241 -294 -408 -579 -458 -782 -763 -1667 -834 -2420 -18 -194 -25 -435 -13 -435 22 0 287 99 446 166 87 37 227 102 310 144 l151 77 -1 39 c0 21 -5 118 -12 214 -42 602 117 1486 395 2195 66 168 171 411 223 515 48 97 55 120 37 120 -7 0 -16 -2 -18 -4z"/>
    </g>
  </svg>
);

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  isMinimal, 
  setIsMinimal, 
  onClose 
}: SidebarProps) {
  
  const [isMinimalHovered, setIsMinimalHovered] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'dashboard', 
      label: 'Gösterge Paneli',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1"></rect>
          <rect x="14" y="3" width="7" height="5" rx="1"></rect>
          <rect x="14" y="12" width="7" height="9" rx="1"></rect>
          <rect x="3" y="16" width="7" height="5" rx="1"></rect>
        </svg>
      )
    },
    { 
      id: 'homeContent', 
      label: 'Anasayfa İçeriği',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    { 
      id: 'categories', 
      label: 'Kategoriler',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      )
    },
    { 
      id: 'products', 
      label: 'Ürünler',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      )
    },
    { 
      id: 'services', 
      label: 'Hizmetler',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
        </svg>
      )
    },
    { 
      id: 'guides', 
      label: 'Rehberler',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      )
    },
    { 
      id: 'contactInfo', 
      label: 'İletişim Bilgileri',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      )
    },
    { 
      id: 'inbox', 
      label: 'Gelen Kutusu',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 5-8-5.7"></path>
        </svg>
      )
    },
    { 
      id: 'campaigns', 
      label: 'Kampanyalar',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
        </svg>
      )
    },
    { 
      id: 'visitors', 
      label: 'Site Ziyaretçileri',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    { 
      id: 'security', 
      label: 'Gizlilik ve Güvenlik',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      )
    },
    {
      id: 'googleAds',
      label: 'Google Ads',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      )
    }
  ];

  return (
    <aside style={{ 
      backgroundColor: '#0F1820', 
      borderRight: '1px solid rgba(189, 149, 75, 0.15)',
      padding: isMinimal ? '2rem 0.5rem' : '2rem 1.2rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      userSelect: 'none',
      transition: 'width 0.2s ease, padding 0.2s ease'
    }}>
      {/* Sidebar Header Title with inline SVG logo and Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2.5rem',
        borderBottom: '1px solid rgba(189, 149, 75, 0.15)',
        paddingBottom: '1.5rem',
        position: 'relative',
        width: '100%',
        marginTop: '-0.5rem'
      }}>
        {isMinimal ? (
          /* Minimal Mode: Logo icon by default, turns into expand arrow on hover */
          <button 
            onClick={() => setIsMinimal(false)}
            onMouseEnter={() => setIsMinimalHovered(true)}
            onMouseLeave={() => setIsMinimalHovered(false)}
            title="Genişlet"
            style={{
              background: 'rgba(189, 149, 75, 0.05)',
              border: '1px solid rgba(189, 149, 75, 0.25)',
              borderRadius: '8px',
              color: 'var(--color-accent)',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(189, 149, 75, 0.15)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(189, 149, 75, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.25)';
            }}
          >
            {isMinimalHovered ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <LogoIcon size={26} style={{ color: 'var(--color-accent)' }} />
            )}
          </button>
        ) : (
          /* Expanded Mode: Logo on top, Title below, Controls in the top-right */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative', paddingTop: '1.2rem' }}>
            {/* Controls in top-right */}
            <div style={{ position: 'absolute', top: '-0.8rem', right: '0rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {/* Toggle Minimal Width Button */}
              <button 
                onClick={() => setIsMinimal(true)}
                title="Daralt"
                style={{
                  background: 'rgba(189, 149, 75, 0.05)',
                  border: '1px solid rgba(189, 149, 75, 0.25)',
                  borderRadius: '6px',
                  color: 'var(--color-accent)',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(189, 149, 75, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(189, 149, 75, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.25)';
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Close Sidebar Completely Button */}
              <button 
                onClick={onClose}
                title="Kapat"
                style={{
                  background: 'rgba(255, 75, 75, 0.05)',
                  border: '1px solid rgba(255, 75, 75, 0.2)',
                  borderRadius: '6px',
                  color: '#FF6B6B',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 75, 75, 0.15)';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 75, 75, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 75, 75, 0.2)';
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Logo Icon on top */}
            <LogoIcon size={56} className="sidebar-logo-svg" style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 4px 12px rgba(189, 149, 75, 0.25))' }} />

            {/* Title text below */}
            <div style={{ 
              fontFamily: "'La Fleur Grande', 'La Fleur', var(--font-serif)", 
              fontSize: '1.6rem', 
              color: 'var(--color-accent)',
              letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
              fontWeight: 'normal',
              lineHeight: 1,
              marginTop: '1.2rem',
              textAlign: 'center'
            }}>
              LALE PERDE
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isMinimal ? item.label : undefined}
            style={{ 
              background: activeTab === item.id ? 'linear-gradient(90deg, rgba(189, 149, 75, 0.15), transparent)' : 'transparent',
              color: activeTab === item.id ? 'var(--color-accent)' : '#A3B3C2',
              border: 'none',
              borderLeft: activeTab === item.id ? '3px solid var(--color-accent)' : '3px solid transparent',
              padding: isMinimal ? '0.8rem 0' : '0.8rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMinimal ? 'center' : 'flex-start',
              gap: isMinimal ? '0' : '0.8rem',
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer',
              fontWeight: activeTab === item.id ? 600 : 400,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            {item.icon}
            {!isMinimal && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        title={isMinimal ? "Oturumu Kapat" : undefined}
        style={{ 
          marginTop: 'auto',
          background: 'rgba(255, 75, 75, 0.1)',
          color: '#FF6B6B',
          border: '1px solid rgba(255, 75, 75, 0.2)',
          padding: isMinimal ? '0.8rem 0' : '0.8rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMinimal ? '0' : '0.5rem',
          transition: 'all 0.2s ease',
          width: '100%'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 75, 75, 0.2)'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)'; }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {!isMinimal && <span>Oturumu Kapat</span>}
      </button>
    </aside>
  );
}
