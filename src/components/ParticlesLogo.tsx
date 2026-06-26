'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  heightFraction: number;
  uniqueOffset: number;
}

interface ParticlesLogoProps {
  theme?: 'gold' | 'ruby' | 'emerald' | 'sapphire';
  interactionRadius?: number;
  returnSpeed?: number;
  friction?: number;
  scatterPower?: number;
}

const PALETTES = {
  gold: { light: '#F1D299', mid: '#BD954B', dark: '#593F16' },
  ruby: { light: '#FFA0B4', mid: '#E0115F', dark: '#6E0827' },
  emerald: { light: '#A3F5B8', mid: '#50C878', dark: '#1F5731' },
  sapphire: { light: '#99C2FF', mid: '#0F52BA', dark: '#0A316E' }
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 189, g: 149, b: 75 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.floor(val)));
  return "#" + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
};

const interpolateColor = (color1: string, color2: string, color3: string, fraction: number) => {
  let r, g, b;
  if (fraction < 0.5) {
    const t = fraction * 2;
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    r = c1.r + (c2.r - c1.r) * t;
    g = c1.g + (c2.g - c1.g) * t;
    b = c1.b + (c2.b - c1.b) * t;
  } else {
    const t = (fraction - 0.5) * 2;
    const c2 = hexToRgb(color2);
    const c3 = hexToRgb(color3);
    r = c2.r + (c3.r - c2.r) * t;
    g = c2.g + (c3.g - c2.g) * t;
    b = c2.b + (c3.b - c2.b) * t;
  }
  return rgbToHex(r, g, b);
};

const LOGO_PATHS = [
  "M4815 9870 c-71 -5 -143 -11 -159 -12 l-29 -3 2 -85 c5 -224 49 -599 102 -863 200 -1012 610 -1891 1244 -2667 492 -602 1273 -1234 1733 -1400 56 -21 74 -22 175 -17 105 6 257 24 266 33 2 2 -110 115 -248 251 -258 252 -341 342 -542 589 -404 496 -748 1107 -989 1753 -236 634 -394 1430 -429 2159 -5 106 -12 196 -14 199 -8 8 -243 40 -382 53 -167 15 -574 20 -730 10z",
  "M4251 9805 c-1201 -213 -2327 -909 -3048 -1885 -368 -499 -623 -1034 -772 -1620 -60 -237 -89 -399 -123 -685 -21 -177 -17 -833 5 -1015 73 -585 213 -1048 476 -1570 418 -831 1090 -1528 1939 -2014 505 -289 1082 -498 1628 -590 189 -32 204 -32 129 3 -206 95 -499 314 -720 536 -137 137 -221 242 -333 410 -230 345 -368 677 -513 1227 -83 319 -159 529 -251 698 -97 178 -309 468 -497 680 -563 632 -762 1042 -871 1794 -11 77 -22 141 -24 143 -6 6 -61 -236 -85 -367 -46 -259 -56 -389 -56 -740 0 -257 5 -374 18 -500 42 -381 136 -769 274 -1130 68 -179 249 -550 334 -685 151 -239 327 -463 514 -650 114 -115 96 -107 -65 29 -505 425 -885 925 -1140 1496 -402 901 -485 1860 -245 2820 121 482 361 1008 647 1419 241 344 592 706 945 974 390 295 841 532 1298 680 230 75 496 140 664 162 l53 7 -6 67 c-3 36 -8 111 -11 166 -7 119 -13 165 -23 164 -4 0 -67 -11 -141 -24z",
  "M6163 9613 c16 -402 97 -986 191 -1375 132 -545 300 -1003 526 -1433 349 -663 791 -1230 1354 -1738 60 -54 124 -110 143 -124 l34 -26 120 48 c65 26 119 50 119 53 0 2 -22 34 -48 71 -328 451 -651 1210 -835 1961 -161 655 -235 1281 -225 1891 l5 279 -96 56 c-296 174 -782 368 -1136 453 -71 18 -136 34 -144 37 -12 4 -13 -20 -8 -153z",
  "M7755 8856 c-4 -123 -3 -231 1 -239 5 -8 77 -69 159 -135 704 -563 1222 -1366 1464 -2273 144 -539 177 -1100 100 -1669 -48 -353 -164 -772 -300 -1083 -126 -289 -345 -658 -524 -882 l-56 -70 6 -65 c11 -104 66 -474 72 -480 20 -20 365 421 520 665 617 972 845 2050 678 3210 -109 752 -421 1495 -891 2120 -53 72 -131 171 -172 220 -110 131 -449 466 -582 575 -182 148 -434 330 -457 330 -7 0 -13 -85 -18 -224z",
  "M7784 8274 c3 -22 10 -93 16 -159 53 -582 187 -1178 401 -1777 138 -384 358 -824 567 -1128 35 -52 66 -97 68 -99 10 -12 227 131 367 243 l87 70 0 47 c0 60 -24 249 -51 396 -78 438 -249 911 -461 1283 -90 156 -274 430 -374 555 -148 185 -461 492 -605 593 -21 14 -21 14 -15 -24z",
  "M3146 8083 c-92 -92 -276 -342 -336 -455 l-35 -66 125 -129 c69 -70 160 -172 203 -225 43 -54 81 -98 86 -98 5 0 24 19 43 42 54 69 216 248 291 321 65 64 69 70 64 103 -12 72 -177 313 -318 466 -40 43 -75 78 -79 78 -4 0 -24 -17 -44 -37z",
  "M1940 7805 c0 -3 20 -42 44 -88 25 -45 61 -129 80 -187 94 -283 87 -553 -28 -1105 -20 -93 -41 -217 -47 -275 -25 -230 14 -464 109 -655 149 -300 527 -571 849 -608 l43 -5 -59 65 c-112 125 -192 293 -237 498 -25 111 -24 421 1 555 25 140 80 329 131 455 39 95 161 340 220 442 l19 32 -44 63 c-247 353 -608 633 -1028 797 -29 11 -53 18 -53 16z",
  "M4330 7766 c-305 -131 -503 -266 -726 -491 -217 -221 -349 -406 -494 -695 -163 -325 -230 -582 -230 -880 0 -292 69 -490 225 -645 189 -189 364 -211 640 -80 161 77 331 214 434 353 146 195 219 460 208 752 -6 149 -13 197 -72 500 -55 284 -68 403 -62 585 9 249 42 366 175 628 7 14 -23 6 -98 -27z",
  "M5105 5873 c-51 -397 -119 -606 -273 -843 -107 -166 -215 -291 -483 -565 -217 -221 -240 -247 -321 -353 -321 -427 -433 -875 -338 -1352 49 -246 103 -406 208 -620 56 -113 67 -130 69 -105 22 254 72 446 165 630 85 168 200 332 421 599 297 360 422 565 531 872 102 288 146 532 153 859 6 253 -8 417 -52 635 -24 119 -64 282 -70 288 -2 2 -6 -18 -10 -45z",
  "M9245 5129 c-103 -78 -301 -203 -410 -257 -322 -160 -627 -244 -991 -271 -145 -11 -176 -20 -217 -59 -40 -38 -57 -74 -57 -122 0 -89 58 -156 146 -168 55 -8 264 2 373 18 418 62 796 212 1122 447 l77 55 7 155 c4 85 4 172 -1 193 l-9 39 -40 -30z",
  "M3013 4088 c5 -609 16 -795 62 -1126 74 -529 253 -1036 494 -1405 406 -619 967 -1018 1588 -1129 186 -33 516 -33 722 1 141 22 395 82 409 95 7 7 19 210 21 343 l1 72 -102 -35 c-278 -93 -578 -136 -808 -114 -242 23 -428 74 -639 176 -417 201 -754 538 -1004 1004 -280 520 -387 1155 -387 2286 l0 404 -181 0 -181 0 5 -572z",
  "M9065 4385 c-125 -74 -163 -101 -176 -128 -23 -44 -121 -357 -159 -504 -61 -242 -88 -407 -115 -698 -19 -210 -19 -204 3 -174 26 35 140 219 201 327 135 237 270 587 351 912 58 233 80 361 63 360 -5 -1 -80 -43 -168 -95z",
  "M8580 4175 c-30 -12 -90 -34 -133 -50 -43 -15 -88 -37 -98 -49 -29 -31 -176 -326 -253 -508 -219 -517 -361 -1052 -437 -1648 -23 -181 -37 -650 -22 -752 l8 -58 121 78 c222 142 416 291 621 475 129 115 120 88 82 255 -58 255 -84 506 -83 812 1 445 59 809 209 1308 26 85 45 155 43 156 -2 2 -28 -7 -58 -19z",
  "M8059 4056 c-2 -2 -60 -9 -129 -16 -69 -6 -135 -13 -147 -16 -39 -8 -241 -294 -408 -579 -458 -782 -763 -1667 -834 -2420 -18 -194 -25 -435 -13 -435 22 0 287 99 446 166 87 37 227 102 310 144 l151 77 -1 39 c0 21 -5 118 -12 214 -42 602 117 1486 395 2195 66 168 171 411 223 515 48 97 55 120 37 120 -7 0 -16 -2 -18 -4z"
];

export default function ParticlesLogo({
  theme = 'gold',
  interactionRadius = 30,
  returnSpeed = 0.001,
  friction = 0.86,
  scatterPower = 6.0,
}: ParticlesLogoProps) {
  const { theme: appTheme } = useTheme();
  
  // Real-time Physics Parameters States (controlled by the control panel UI)
  const [physics, setPhysics] = useState({
    interactionRadius: 30,
    scatterPower: 6.0,
    returnSpeed: 0.001,
    friction: 0.86,
    colorTheme: theme as 'gold' | 'ruby' | 'emerald' | 'sapphire'
  });

  const [panelOpen, setPanelOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    lastX: -1000,
    lastY: -1000,
    vx: 0,
    vy: 0,
    active: false,
    lastTime: 0
  });

  // Re-generate particles whenever theme context or colorTheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // SVG paths to points sampling using virtual SVGPathElement
    const totalPoints = 1100;
    const pointsPerPath = Math.floor(totalPoints / LOGO_PATHS.length);
    const sampledParticles: Particle[] = [];

    LOGO_PATHS.forEach(pPath => {
      try {
        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", pPath);
        const pathLength = pathEl.getTotalLength();

        for (let i = 0; i < pointsPerPath; i++) {
          const d = (i / pointsPerPath) * pathLength;
          const pt = pathEl.getPointAtLength(d);

          // Correct the SVG coordinate layout (flipped Y coordinate alignment)
          const flippedY = 10000 - pt.y;

          // Scale coordinates to fit our 300x300 bounding box
          const x = pt.x * (300 / 10000);
          const y = flippedY * (300 / 10000);

          sampledParticles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            color: '',
            heightFraction: 0,
            uniqueOffset: Math.random() * Math.PI * 2
          });
        }
      } catch (err) {
        console.error("SVG Path sampling error:", err);
      }
    });

    // Normalize height fractions and assign colors
    let minY = Infinity;
    let maxY = -Infinity;
    sampledParticles.forEach(p => {
      if (p.originY < minY) minY = p.originY;
      if (p.originY > maxY) maxY = p.originY;
    });

    sampledParticles.forEach(p => {
      const fraction = (p.originY - minY) / (maxY - minY || 1);
      p.heightFraction = fraction;

      // Assign theme color gradient
      const pal = PALETTES[physics.colorTheme] || PALETTES.gold;
      p.color = appTheme === 'light' 
        ? '#1A2E40' 
        : interpolateColor(pal.dark, pal.mid, pal.light, fraction);
    });

    setParticles(sampledParticles);
  }, [appTheme, physics.colorTheme]);

  // Main Canvas Render Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width, canvas.height) / 285;
      const offsetX = (canvas.width - 300 * scale) / 2;
      const offsetY = (canvas.height - 300 * scale) / 2;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;
      const mouseVx = mouseRef.current.vx;
      const mouseVy = mouseRef.current.vy;
      const mouseSpeed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);

      const time = performance.now() * 0.0015;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Subtle breathing wobble effect when idle
        const idleX = Math.sin(time + p.originY * 0.05) * 1.2;
        const idleY = Math.cos(time + p.originX * 0.05) * 1.2;

        const targetX = p.originX * scale + offsetX + idleX;
        const targetY = p.originY * scale + offsetY + idleY;

        // A. Spring Pull Back Force
        p.vx += (targetX - p.x) * physics.returnSpeed;
        p.vy += (targetY - p.y) * physics.returnSpeed;

        // B. Cursor Interaction
        if (mouseActive) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const distSq = mdx * mdx + mdy * mdy;
          const dist = Math.sqrt(distSq);
          const maxRadius = physics.interactionRadius * scale;

          if (dist < maxRadius) {
            const angle = Math.atan2(mdy, mdx);
            
            // Yumuşatma (smooth force ratio)
            const forceRatio = (maxRadius - dist) / maxRadius;
            const smoothForce = Math.sin(forceRatio * Math.PI * 0.5);

            // Merkezkaç patlama gücü (center power)
            const centerPower = 1.0 + (8.0 / (dist + 2.0));
            const basePush = smoothForce * physics.scatterPower * centerPower;

            p.vx += Math.cos(angle) * basePush * 0.45;
            p.vy += Math.sin(angle) * basePush * 0.45;

            // İmleç Kaydırma Gücü (Swipe Transfer)
            const swipeInfluence = smoothForce * Math.min(mouseSpeed, 35) * (physics.scatterPower * 0.03);
            p.vx += mouseVx * swipeInfluence * 0.5;
            p.vy += mouseVy * swipeInfluence * 0.5;

            // Spiral Girdap Efekti (Orbit Swirl)
            const swirlDir = (p.uniqueOffset > Math.PI) ? 1.0 : -1.0;
            const tangentAngle = angle + (Math.PI / 2) * swirlDir;
            const swirlInfluence = smoothForce * (physics.scatterPower * 0.4);
            p.vx += Math.cos(tangentAngle) * swirlInfluence * 0.35;
            p.vy += Math.sin(tangentAngle) * swirlInfluence * 0.35;
          }
        }

        // C. Friction & Position Updates
        p.vx *= physics.friction;
        p.vy *= physics.friction;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.fillStyle = appTheme === 'light' ? '#1A2E40' : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, scale * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Calculate mouse speed decay
      mouseRef.current.vx *= 0.85;
      mouseRef.current.vy *= 0.85;

      animationFrameId = requestAnimationFrame(render);
    };

    if (particles.length > 0) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particles, physics, appTheme]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();
    const dt = now - mouseRef.current.lastTime;

    if (dt > 0 && mouseRef.current.lastX !== -1000) {
      mouseRef.current.vx = (x - mouseRef.current.lastX) / (dt / 16.666);
      mouseRef.current.vy = (y - mouseRef.current.lastY) / (dt / 16.666);
    }

    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
    mouseRef.current.lastTime = now;
    mouseRef.current.active = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
    mouseRef.current.lastX = -1000;
    mouseRef.current.lastY = -1000;
  };

  const resetToDefaults = () => {
    setPhysics({
      interactionRadius: 30,
      scatterPower: 6.0,
      returnSpeed: 0.001,
      friction: 0.86,
      colorTheme: theme as 'gold' | 'ruby' | 'emerald' | 'sapphire'
    });
  };

  return (
    <div ref={containerRef} className="particles-logo-container" style={{ width: '100%', height: '480px', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
      />

      {/* Floating Control Panel Toggle Button */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          zIndex: 200,
          background: 'rgba(26, 46, 64, 0.85)',
          border: '1px solid rgba(189, 149, 75, 0.4)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#BD954B',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          fontSize: '1.1rem'
        }}
        title="Fizik Kontrol Paneli"
      >
        ⚙️
      </button>

      {/* Sliding Control Panel UI */}
      {panelOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '65px',
            right: '15px',
            zIndex: 200,
            width: '280px',
            background: 'rgba(10, 20, 29, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(189, 149, 75, 0.3)',
            borderRadius: '16px',
            padding: '1.2rem',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, color: '#BD954B', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '1px' }}>FİZİK MOTORU AYARLARI</h4>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#BD954B', cursor: 'pointer', fontSize: '1rem' }}>×</button>
          </div>

          {/* Slider 1: interactionRadius */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span>İmleç Etki Alanı:</span>
              <span style={{ color: '#BD954B', fontWeight: 'bold' }}>{physics.interactionRadius}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="160"
              step="5"
              value={physics.interactionRadius}
              onChange={(e) => setPhysics({ ...physics, interactionRadius: parseInt(e.target.value) })}
              style={{ accentColor: '#BD954B', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 2: scatterPower */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span>Saçılma Şiddeti:</span>
              <span style={{ color: '#BD954B', fontWeight: 'bold' }}>{physics.scatterPower.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.1"
              value={physics.scatterPower}
              onChange={(e) => setPhysics({ ...physics, scatterPower: parseFloat(e.target.value) })}
              style={{ accentColor: '#BD954B', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 3: returnSpeed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span>Geri Dönüş Hızı:</span>
              <span style={{ color: '#BD954B', fontWeight: 'bold' }}>{physics.returnSpeed.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.015"
              step="0.0005"
              value={physics.returnSpeed}
              onChange={(e) => setPhysics({ ...physics, returnSpeed: parseFloat(e.target.value) })}
              style={{ accentColor: '#BD954B', cursor: 'pointer' }}
            />
          </div>

          {/* Slider 4: friction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
              <span>Sürtünme / Akışkanlık:</span>
              <span style={{ color: '#BD954B', fontWeight: 'bold' }}>%{(physics.friction * 100).toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="0.86"
              max="0.98"
              step="0.01"
              value={physics.friction}
              onChange={(e) => setPhysics({ ...physics, friction: parseFloat(e.target.value) })}
              style={{ accentColor: '#BD954B', cursor: 'pointer' }}
            />
          </div>

          {/* Color theme selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ opacity: 0.9 }}>Renk Teması:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {(['gold', 'ruby', 'emerald', 'sapphire'] as const).map(cTheme => (
                <button
                  key={cTheme}
                  onClick={() => setPhysics({ ...physics, colorTheme: cTheme })}
                  style={{
                    background: physics.colorTheme === cTheme ? 'rgba(189, 149, 75, 0.35)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${physics.colorTheme === cTheme ? '#BD954B' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    padding: '0.4rem 0',
                    color: physics.colorTheme === cTheme ? '#BD954B' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cTheme === 'gold' ? 'Gold' : cTheme === 'ruby' ? 'Ruby' : cTheme === 'emerald' ? 'Emerald' : 'Saph'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={resetToDefaults}
            style={{
              marginTop: '0.5rem',
              background: '#BD954B',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 0',
              color: '#101D29',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'background 0.3s',
              fontSize: '0.75rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5C07B'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#BD954B'}
          >
            Varsayılana Sıfırla
          </button>
        </div>
      )}
    </div>
  );
}
