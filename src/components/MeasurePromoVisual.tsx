'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export default function MeasurePromoVisual() {
  const { language } = useLanguage();
  const router = useRouter();

  // Local state independent of localStorage
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(220);
  const [windowWidth, setWindowWidth] = useState<number>(260);
  const [windowHeight, setWindowHeight] = useState<number>(180);
  const [showWindow, setShowWindow] = useState<boolean>(true);

  // Dragging states
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Limits
  const min_width = 40;
  const max_width = 600;
  const min_height = 60;
  const max_height = 350;

  // Percentage scaling
  const curtainWidthPercent = Math.max(20, Math.min(90, (width / max_width) * 78));
  const curtainHeightPercent = Math.max(20, Math.min(90, (height / max_height) * 78));
  const windowWidthPercent = Math.max(15, Math.min(90, (windowWidth / max_width) * 78));
  const windowHeightPercent = Math.max(15, Math.min(90, (windowHeight / max_height) * 78));

  // Pointer dragging logic
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingWidth && !isDraggingHeight) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      
      if (isDraggingWidth) {
        const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = relativeX / rect.width;
        const newWidth = Math.round(min_width + (percentage * (max_width - min_width)));
        setWidth(Math.max(min_width, Math.min(max_width, newWidth)));
      }

      if (isDraggingHeight) {
        const relativeY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const percentage = relativeY / rect.height;
        const newHeight = Math.round(min_height + (percentage * (max_height - min_height)));
        setHeight(Math.max(min_height, Math.min(max_height, newHeight)));
      }
    };

    const handlePointerUp = () => {
      setIsDraggingWidth(false);
      setIsDraggingHeight(false);
    };

    if (isDraggingWidth || isDraggingHeight) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingWidth, isDraggingHeight]);

  const handleStartWizard = () => {
    // Send dimensions to the wizard page via URL query parameters
    router.push(`/olcu-sihirbazi?width=${width}&height=${height}&winWidth=${windowWidth}&winHeight=${windowHeight}&showWin=${showWindow}`);
  };

  return (
    <div style={{
      background: 'rgba(26, 46, 64, 0.3)',
      border: '1px solid rgba(189, 149, 75, 0.2)',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(4px)',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      boxSizing: 'border-box'
    }}>
      {/* Interactive 2D visual preview container */}
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          backgroundColor: '#0a111a', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flex: 1,
          minHeight: '420px', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          touchAction: 'none',
          overflow: 'visible'
        }}
      >
        {/* Window Mockup behind curtain */}
        {showWindow && (
          <div style={{
            position: 'absolute',
            width: `${windowWidthPercent}%`,
            height: `${windowHeightPercent}%`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: '6px solid #162435',
            borderRadius: '4px',
            backgroundColor: '#a3c6e4',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '4px',
            zIndex: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: isDraggingWidth || isDraggingHeight ? 'none' : 'all 0.3s ease-out'
          }}>
            <div style={{ backgroundColor: '#a5c4dd', opacity: 0.95 }} />
            <div style={{ backgroundColor: '#a5c4dd', opacity: 0.95 }} />
            <div style={{ backgroundColor: '#a5c4dd', opacity: 0.95 }} />
            <div style={{ backgroundColor: '#a5c4dd', opacity: 0.95 }} />
          </div>
        )}

        {/* Semi-transparent wavy curtain preview */}
        <div style={{
          position: 'absolute',
          width: `${curtainWidthPercent}%`,
          height: `${curtainHeightPercent}%`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'repeating-linear-gradient(90deg, rgba(245, 245, 247, 0.6) 0px, rgba(255, 255, 255, 0.8) 12px, rgba(245, 245, 247, 0.6) 24px, rgba(200, 200, 200, 0.3) 30px, rgba(245, 245, 247, 0.6) 36px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 2,
          transition: isDraggingWidth || isDraggingHeight ? 'none' : 'all 0.3s ease-out'
        }}>
          {/* Width indicators */}
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '0',
            right: '0',
            height: '2px',
            borderTop: '2px dashed #BD954B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', left: 0, top: '-5px', borderTop: '5px transparent solid', borderBottom: '5px transparent solid', borderRight: '7px solid #BD954B' }} />
            <div style={{ position: 'absolute', right: 0, top: '-5px', borderTop: '5px transparent solid', borderBottom: '5px transparent solid', borderLeft: '7px solid #BD954B' }} />
            <div style={{ backgroundColor: '#0F172A', color: '#BD954B', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #BD954B', transform: 'translateY(-1px)', whiteSpace: 'nowrap' }}>A: {width} cm</div>
          </div>

          {/* Height indicators */}
          <div style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            right: '-25px',
            width: '2px',
            borderLeft: '2px dashed #BD954B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', top: '0', left: '-5px', borderLeft: '5px transparent solid', borderRight: '5px transparent solid', borderBottom: '7px solid #BD954B' }} />
            <div style={{ position: 'absolute', bottom: '0', left: '-5px', borderLeft: '5px transparent solid', borderRight: '5px transparent solid', borderTop: '7px solid #BD954B' }} />
            <div style={{ position: 'absolute', backgroundColor: '#0F172A', color: '#BD954B', padding: '4px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #BD954B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: '1.1', left: '10px', whiteSpace: 'nowrap' }}>
              <span>B:</span>
              <span>{height}</span>
              <span>cm</span>
            </div>
          </div>

          {/* Width resizing drag handle */}
          <div 
            onPointerDown={(e) => { e.preventDefault(); setIsDraggingWidth(true); }} 
            style={{ position: 'absolute', top: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'ew-resize', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '16px', height: '16px', backgroundColor: '#BD954B', border: '2px solid #FFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
          </div>

          {/* Height resizing drag handle */}
          <div 
            onPointerDown={(e) => { e.preventDefault(); setIsDraggingHeight(true); }} 
            style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'ns-resize', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '16px', height: '16px', backgroundColor: '#BD954B', border: '2px solid #FFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
          </div>
      </div>
    </div>
  </div>
  );
}

