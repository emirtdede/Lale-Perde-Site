'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface CommentItem {
  id: string;
  author: string;
  contentTr: string;
  contentEn: string;
  rating: number;
  isActive: boolean;
  displayOrder: number;
}

interface MarqueeCommentsProps {
  comments: CommentItem[];
}

export default function MarqueeComments({ comments }: MarqueeCommentsProps) {
  const { language } = useLanguage();

  const activeComments = React.useMemo(() => {
    return (comments || [])
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [comments]);

  // Fallback testimonials if none are loaded
  const fallbackComments: CommentItem[] = [
    {
      id: 'f1',
      author: 'Selim Aksoy',
      contentTr: 'Salonumuz için tül ve fon perde siparişi vermiştik. Keten liflerinin dokusu harika, işçilik kusursuz.',
      contentEn: 'We ordered sheer and background curtains for our living room. The linen texture is amazing, craftsmanship is perfect.',
      rating: 5,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 'f2',
      author: 'Ayla Yılmaz',
      contentTr: 'Ölçü sihirbazı sayesinde pencerelerimizin net ölçülerini aldık, gelen perdeler tam milimetrik oturdu.',
      contentEn: 'Thanks to the measuring wizard we got precise measurements, the curtains fit down to the millimeter.',
      rating: 5,
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 'f3',
      author: 'Caner Demir',
      contentTr: 'Motorlu perde sistemleri akıllı evimize mükemmel entegre oldu. Sessiz ve son derece lüks.',
      contentEn: 'Motorized curtain systems integrated perfectly with our smart home. Silent and highly luxurious.',
      rating: 5,
      isActive: true,
      displayOrder: 3,
    },
    {
      id: 'f4',
      author: 'Melis Şen',
      contentTr: 'Showroomdaki ilgi ve evde ücretsiz keşif hizmetinden çok memnun kaldık. Teşekkürler Lale Perde.',
      contentEn: 'Highly satisfied with the showroom service and free in-house discovery. Thank you Lale Perde.',
      rating: 5,
      isActive: true,
      displayOrder: 4,
    }
  ];

  const list = activeComments.length > 0 ? activeComments : fallbackComments;

  // Split into two sets for opposite scrolling directions
  const row1 = list.slice(0, Math.ceil(list.length / 2));
  const row2 = list.slice(Math.ceil(list.length / 2));

  // Double the rows for infinite marquee illusion
  const doubledRow1 = [...row1, ...row1, ...row1];
  const doubledRow2 = [...row2, ...row2, ...row2];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#BD954B' : 'rgba(255,255,255,0.2)', marginRight: '2px' }}>
        ★
      </span>
    ));
  };

  return (
    <div 
      className="marquee-section-container"
      style={{
        position: 'relative',
        width: '100%',
        padding: '3rem 0',
        background: '#0A141D',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic styling for infinite keyframe marquee animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-forward {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-backward {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          gap: 20px;
          padding: 10px 0;
        }
        .marquee-track-forward {
          animation: marquee-forward 35s linear infinite;
        }
        .marquee-track-backward {
          animation: marquee-backward 35s linear infinite;
        }
        .marquee-wrap:hover .marquee-track {
          animation-play-state: paused;
        }
        .marquee-section-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0; width: 120px;
          background: linear-gradient(to right, #0A141D, transparent);
          z-index: 2;
          pointer-events: none;
        }
        .marquee-section-container::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; width: 120px;
          background: linear-gradient(to left, #0A141D, transparent);
          z-index: 2;
          pointer-events: none;
        }
      `}} />

      {/* Row 1 - Left to Right scrolling */}
      <div className="marquee-wrap" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div className="marquee-track marquee-track-forward">
          {doubledRow1.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="comment-card"
              style={{
                width: '320px',
                padding: '1.5rem',
                background: 'rgba(26, 46, 64, 0.4)',
                border: '1px solid rgba(189, 149, 75, 0.15)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ marginBottom: '0.5rem' }}>{renderStars(item.rating)}</div>
                <p 
                  style={{ 
                    color: 'rgba(255,255,255,0.85)', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    fontWeight: 300
                  }}
                >
                  "{language === 'tr' ? item.contentTr : item.contentEn}"
                </p>
              </div>
              <h4 style={{ color: '#BD954B', fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500 }}>
                - {item.author}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 - Right to Left scrolling */}
      <div className="marquee-wrap" style={{ overflow: 'hidden' }}>
        <div className="marquee-track marquee-track-backward">
          {doubledRow2.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="comment-card"
              style={{
                width: '320px',
                padding: '1.5rem',
                background: 'rgba(26, 46, 64, 0.4)',
                border: '1px solid rgba(189, 149, 75, 0.15)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ marginBottom: '0.5rem' }}>{renderStars(item.rating)}</div>
                <p 
                  style={{ 
                    color: 'rgba(255,255,255,0.85)', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    fontWeight: 300
                  }}
                >
                  "{language === 'tr' ? item.contentTr : item.contentEn}"
                </p>
              </div>
              <h4 style={{ color: '#BD954B', fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500 }}>
                - {item.author}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
