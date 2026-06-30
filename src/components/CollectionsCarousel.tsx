'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';
import { Category } from '../context/dbTypes';

interface CollectionsCarouselProps {
  categories: Category[];
}

export default function CollectionsCarousel({ categories }: CollectionsCarouselProps) {
  const router = useRouter();
  const { language } = useLanguage();
  
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const rotationRef = useRef(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // State for zero-error render & load-complete logic
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  const startX = useRef(0);
  const startRotation = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(0);
  const lastX = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageLoad = (id: string) => {
    setImagesLoaded((prev) => ({ ...prev, [id]: true }));
  };

  const activeCategories = React.useMemo(() => {
    return categories
      .filter((c) => c.status === 'active')
      .sort((a, b) => {
        const orderA = (a as any).carouselOrder ?? a.displayOrder ?? 0;
        const orderB = (b as any).carouselOrder ?? b.displayOrder ?? 0;
        return orderA - orderB;
      });
  }, [categories]);

  const count = activeCategories.length;
  const angleStep = 360 / (count || 1);

  const applyRotation = (newRot: number) => {
    rotationRef.current = newRot;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotateY(${newRot}deg)`;
    }
    
    if (count > 0) {
      let normalizedRotation = -newRot % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      const index = Math.round(normalizedRotation / angleStep) % count;
      setActiveIndex(prev => prev !== index ? index : prev);
    }
  };

  useEffect(() => {
    const updatePhysics = () => {
      if (!isDragging && Math.abs(velocity.current) > 0.05) {
        applyRotation(rotationRef.current + velocity.current);
        velocity.current *= 0.95;
      }
      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDragging, count, angleStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startRotation.current = rotationRef.current;
    velocity.current = 0;
    lastX.current = e.clientX;
    lastTime.current = performance.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    
    const sensitivity = 0.25;
    const newRot = startRotation.current + dx * sensitivity;
    applyRotation(newRot);

    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 4) {
      const rawVelocity = ((e.clientX - lastX.current) * sensitivity) / (dt / 16.666);
      velocity.current = Math.max(-20, Math.min(20, rawVelocity));
    }
    
    lastX.current = e.clientX;
    lastTime.current = now;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    startRotation.current = rotationRef.current;
    velocity.current = 0;
    lastX.current = e.touches[0].clientX;
    lastTime.current = performance.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    
    const sensitivity = 0.4;
    const newRot = startRotation.current + dx * sensitivity;
    applyRotation(newRot);

    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 4) {
      const rawVelocity = ((e.touches[0].clientX - lastX.current) * sensitivity) / (dt / 16.666);
      velocity.current = Math.max(-20, Math.min(20, rawVelocity));
    }
    
    lastX.current = e.touches[0].clientX;
    lastTime.current = now;
  };

  const selectCategory = (index: number) => {
    if (isDragging) return;
    
    const targetBase = -index * angleStep;
    let diff = (targetBase - rotationRef.current) % 360;
    
    // Normalize diff to be between -180 and 180
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    velocity.current = 0;
    applyRotation(rotationRef.current + diff);
  };

  if (count === 0) return null;

  return (
    <div 
      className="kinetic-carousel-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '580px',
        overflow: 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
        perspective: '2000px',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(26, 46, 64, 0.1) 0%, rgba(10, 20, 29, 0.8) 100%)',
        borderRadius: '16px',
        padding: '2rem 0'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
    >
      <div
        ref={wheelRef}
        className="kinetic-carousel-wheel"
        style={{
          position: 'relative',
          width: '302px',   // 280px * 1.08
          height: '453px',  // 420px * 1.08
          margin: '0 auto',
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {activeCategories.map((cat, idx) => {
          const itemAngle = idx * angleStep;
          const zDepth = isMobile
            ? Math.max(140, 90 + count * 15)
            : Math.max(300, 160 + count * 40);
          const isActive = idx === activeIndex;
          const diff = Math.abs(idx - activeIndex);
          const distance = Math.min(diff, count - diff);
          const isNeighbor = distance === 1;
          const isVisible = isActive || isNeighbor;

          return (
            <Link
              key={cat.id}
              href={`/urunler?category=${cat.id}`}
              onClick={(e) => {
                if (!isVisible) {
                  e.preventDefault();
                  return;
                }
                if (!isActive) {
                  e.preventDefault();
                  selectCategory(idx);
                } else if (isDragging) {
                  e.preventDefault();
                }
              }}
              onAuxClick={(e) => {
                if (!isActive || !isVisible || isDragging) {
                  e.preventDefault();
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: `rotateY(${itemAngle}deg) translateZ(${zDepth}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transition: 'opacity 0.4s, filter 0.4s, transform 0.4s, visibility 0.4s',
                opacity: isActive ? 1 : (isNeighbor ? 0.25 : 0),
                visibility: isVisible ? 'visible' : 'hidden',
                pointerEvents: isVisible ? 'auto' : 'none',
                filter: isActive ? 'none' : 'brightness(0.65)',
                zIndex: isActive ? 10 : 1,
                display: 'block',
                textDecoration: 'none'
              }}
            >
              {/* Card Container (Image only, 85% height of outer container) */}
              <div
                className="collection-3d-card"
                style={{
                  width: '100%',
                  height: '85%',
                  background: 'rgba(26, 46, 64, 0.85)',
                  border: isActive ? '2px solid #BD954B' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: isActive 
                    ? '0 15px 35px rgba(189, 149, 75, 0.45)' 
                    : '0 8px 24px rgba(0, 0, 0, 0.4)',
                  transform: isActive ? 'scale(1) translateZ(0)' : 'scale(0.88) translateZ(0)',
                  transition: 'all 0.4s ease',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  {!imagesLoaded[cat.id] && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,46,64,0.5)' }}>
                       <span style={{ color: '#BD954B' }}>Yükleniyor...</span>
                    </div>
                  )}
                  <Image
                    src={cat.image || '/assets/scandi.png'}
                    alt={language === 'tr' ? cat.nameTr : cat.nameEn}
                    fill
                    sizes="400px"
                    priority={true}
                    quality={100}
                    onLoad={() => handleImageLoad(cat.id)}
                    style={{
                      objectFit: 'cover',
                      transition: 'opacity 0.4s ease',
                      opacity: imagesLoaded[cat.id] ? 1 : 0
                    }}
                    className="carousel-image"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(10, 20, 29, 0.6))' }} />
                </div>
              </div>

              {/* Title under the Card */}
              <div 
                style={{
                  height: '15%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  paddingTop: '0.8rem',
                  transition: 'all 0.4s ease',
                  transform: isActive ? 'scale(1) translateZ(0)' : 'scale(0.88) translateZ(0)',
                }}
              >
                <h3 
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: isActive ? '#BD954B' : '#ffffff',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    margin: 0,
                    transition: 'color 0.3s',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {language === 'tr' ? cat.nameTr : cat.nameEn}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Left Navigation Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const prevIdx = (activeIndex - 1 + count) % count;
          selectCategory(prevIdx);
        }}
        className="carousel-nav-btn prev"
      >
        ‹
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const nextIdx = (activeIndex + 1) % count;
          selectCategory(nextIdx);
        }}
        className="carousel-nav-btn next"
      >
        ›
      </button>
    </div>
  );
}
