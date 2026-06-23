'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { useDb } from '../../context/DbContext';
import { Category, Product } from '../../context/dbTypes';

interface MeasureWizardClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

function MeasureWizardContent({ initialProducts, initialCategories }: MeasureWizardClientProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard state: 1 = Category, 2 = Product, 3 = Measurement Customizer
  const [step, setStep] = useState<number>(1);

  const { settings } = useDb();

  const categories = React.useMemo(() => {
    return initialCategories
      .filter(c => c.status === 'active')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [initialCategories]);

  const products = React.useMemo(() => {
    return initialProducts.filter(p => p.status === 'active');
  }, [initialProducts]);

  // Selections
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Width (A) and Height (B) in cm
  const [width, setWidth] = useState<number>(600);
  const [height, setHeight] = useState<number>(267);

  // Dragging states for 2D preview
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle query param for product pre-selection
    const prodId = searchParams.get('product');
    if (prodId && products.length > 0 && categories.length > 0) {
      const matchedProd = products.find(p => p.id === prodId);
      if (matchedProd) {
        const matchedCat = categories.find(c => c.id === matchedProd.categoryId);
        if (matchedCat) {
          setSelectedCat(matchedCat);
          setSelectedProduct(matchedProd);
          setStep(3);
        }
      }
    }
  }, [searchParams, products, categories]);

  // Handle pointer events for 2D dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingWidth && !isDraggingHeight) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      
      if (isDraggingWidth) {
        const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = relativeX / rect.width;
        // Map 10% - 90% to 50cm - 400cm
        const newWidth = Math.round(50 + (percentage * 350));
        setWidth(Math.max(50, Math.min(800, newWidth)));
      }

      if (isDraggingHeight) {
        const relativeY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const percentage = relativeY / rect.height;
        // Map 10% - 90% to 100cm - 350cm
        const newHeight = Math.round(100 + (percentage * 250));
        setHeight(Math.max(100, Math.min(400, newHeight)));
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

  const estimatedPrice = React.useMemo(() => {
    if (!selectedProduct) return null;
    return Math.round(width * height * selectedProduct.priceMultiplier);
  }, [width, height, selectedProduct]);

  const handleWhatsAppQuote = () => {
    if (!settings || !selectedProduct) return;
    
    const catName = language === 'tr' ? selectedProduct.categoryTr : selectedProduct.categoryEn;
    const prodName = language === 'tr' ? selectedProduct.nameTr : selectedProduct.nameEn;
    
    const text = `Merhaba, ${catName} / ${prodName} ürünü için kendi aldığım ölçülerle fiyat teklifi almak istiyorum. \n\n*ÖLÇÜLER*\nEn (A): ${width} cm\nBoy (B): ${height} cm\n\nLütfen net fiyat ve keşif için dönüş yapar mısınız?`;
    
    const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
    const wpUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(wpUrl, '_blank');
  };

  const getStepColor = (currentStep: number) => {
    return step === currentStep ? 'var(--color-accent)' : (step > currentStep ? '#A3B3C2' : '#5C6C7C');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 5rem', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem', alignItems: 'start' }}>
      
      {/* Left Sidebar Layout */}
      <aside style={{ position: 'sticky', top: '100px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.1 }}>
          {language === 'tr' ? 'Ölçü Sihirbazı' : 'Measure Wizard'}
        </h1>
        <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '3rem' }}>
          {language === 'tr' 
            ? 'Pencereleriniz için doğru perde ölçüsünü adım adım hesaplayın.' 
            : 'Calculate the right curtain size for your windows step by step.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(1), marginBottom: '0.3rem', fontWeight: 600 }}>ADIM 01</div>
            <div style={{ fontSize: '1rem', color: step >= 1 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>1. KATEGORİ SEÇİMİ</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(2), marginBottom: '0.3rem', fontWeight: 600 }}>ADIM 02</div>
            <div style={{ fontSize: '1rem', color: step >= 2 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>2. ÜRÜN SEÇİMİ</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(3), marginBottom: '0.3rem', fontWeight: 600 }}>ADIM 03</div>
            <div style={{ fontSize: '1rem', color: step >= 3 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>3. ÖLÇÜ GİRİŞİ</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div>
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>
              {language === 'tr' ? 'Kategori Seçin' : 'Select a Category'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  style={{ 
                    backgroundColor: 'var(--color-card-bg)', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                    transition: 'transform 0.3s ease'
                  }} 
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => {
                    setSelectedCat(cat);
                    setStep(2);
                  }}
                >
                  <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                    <Image 
                      src={cat.image || '/assets/hero.png'} 
                      alt={language === 'tr' ? cat.nameTr : cat.nameEn}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', margin: 0 }}>
                      {language === 'tr' ? cat.nameTr : cat.nameEn}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedCat && (
          <div>
            <button 
              onClick={() => setStep(1)}
              style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '20px', padding: '0.4rem 1rem', cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              ← Kategori Seçimine Dön
            </button>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem', textAlign: 'center' }}>
              {language === 'tr' ? selectedCat.nameTr : selectedCat.nameEn} Ürünleri
            </h2>

            {products.filter(p => p.categoryId === selectedCat.id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                {language === 'tr' ? 'Bu kategoride henüz ürün bulunmuyor.' : 'No products found.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {products.filter(p => p.categoryId === selectedCat.id).map(prod => (
                  <div 
                    key={prod.id} 
                    style={{ 
                      backgroundColor: 'var(--color-card-bg)', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      border: '1px solid var(--color-border)',
                      transition: 'transform 0.3s ease'
                    }} 
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setStep(3);
                    }}
                  >
                    <div style={{ position: 'relative', height: '250px', width: '100%' }}>
                      <Image 
                        src={prod.coverImage || (prod.images.length > 0 ? prod.images[0] : '/assets/hero.png')} 
                        alt={language === 'tr' ? prod.nameTr : prod.nameEn}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        {language === 'tr' ? prod.nameTr : prod.nameEn}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && selectedProduct && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: '2rem' }}>
              <button 
                onClick={() => setStep(2)}
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '20px', padding: '0.4rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ← Ürün Seçimine Dön
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', fontWeight: 600 }}>
                  {language === 'tr' ? selectedProduct.categoryTr : selectedProduct.categoryEn}
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-text)', margin: '0.3rem 0 0' }}>
                  {language === 'tr' ? selectedProduct.nameTr : selectedProduct.nameEn}
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
              
              {/* LEFT: 2D Interactive Preview */}
              <div 
                ref={containerRef}
                style={{ 
                  position: 'relative', 
                  backgroundColor: 'var(--color-neutral)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--color-border)',
                  height: '500px', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  touchAction: 'none'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: `${Math.max(30, (width / 800) * 100)}%`,
                  height: `${Math.max(30, (height / 400) * 100)}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 100%',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: isDraggingWidth || isDraggingHeight ? 'none' : 'all 0.3s ease-out'
                }}>
                  {/* Width Label (A) */}
                  <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1A1A1A', color: '#F2C94C', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #F2C94C' }}>
                    A: {width} cm
                  </div>
                  {/* Height Label (B) */}
                  <div style={{ position: 'absolute', top: '50%', right: '-65px', transform: 'translateY(-50%)', backgroundColor: '#1A1A1A', color: '#F2C94C', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #F2C94C' }}>
                    B: <br/>{height}<br/>cm
                  </div>

                  {/* Drag Handle - Width (Right edge) */}
                  <div 
                    onPointerDown={(e) => { e.preventDefault(); setIsDraggingWidth(true); }}
                    style={{
                      position: 'absolute',
                      top: '0',
                      right: '-12px',
                      height: '100%',
                      width: '24px',
                      cursor: 'ew-resize',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      zIndex: 10
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#F2C94C', border: '3px solid #FFF', borderRadius: '50%', marginTop: '-10px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                    <div style={{ width: '2px', flex: 1, backgroundColor: '#F2C94C', borderLeft: '1px dashed #FFF' }} />
                  </div>

                  {/* Drag Handle - Height (Bottom edge) */}
                  <div 
                    onPointerDown={(e) => { e.preventDefault(); setIsDraggingHeight(true); }}
                    style={{
                      position: 'absolute',
                      bottom: '-12px',
                      left: '0',
                      width: '100%',
                      height: '24px',
                      cursor: 'ns-resize',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      zIndex: 10
                    }}
                  >
                    <div style={{ height: '20px', width: '20px', backgroundColor: '#F2C94C', border: '3px solid #FFF', borderRadius: '50%', marginRight: '-10px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                    <div style={{ height: '2px', flex: 1, backgroundColor: '#F2C94C', borderTop: '1px dashed #FFF', position: 'absolute', width: '100%', left: 0 }} />
                  </div>
                </div>
              </div>

              {/* RIGHT: Specs & Quote Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* How to measure guide hint */}
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--color-accent)', marginTop: '2px' }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {language === 'tr' ? 'PROFESYONEL İPUCU' : 'PROFESSIONAL TIP'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.6 }}>
                        {language === 'tr' 
                          ? 'Perde siparişi ederken pencerenizin değil, korniş ya da rayınızın genişliğini (En) ölçün. Boy ölçüsü için ise kornişten perdenin bitmesini istediğiniz yere kadar dikey ölçü alın.' 
                          : 'When ordering curtains, measure the width of your cornice or track, not your window. For height, measure vertically from the cornice to where you want the curtain to end.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>RAY GENİŞLİĞİ (A) - CM</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        value={width} 
                        onChange={(e) => setWidth(Number(e.target.value))}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1.2rem', outline: 'none' }}
                      />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.9rem' }}>cm</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>PERDE YÜKSEKLİĞİ (B) - CM</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => setHeight(Number(e.target.value))}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1.2rem', outline: 'none' }}
                      />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.9rem' }}>cm</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleWhatsAppQuote}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', padding: '1rem', backgroundColor: '#25D366', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 2C6.49 2 2 6.48 2 12.01c0 1.77.46 3.49 1.34 5.01L2 22l5.12-1.34c1.47.8 3.12 1.22 4.9 1.22 5.54 0 10.03-4.48 10.03-10.01C22.05 6.48 17.56 2 12.03 2zm4.8 13.86c-.27.76-1.34 1.39-1.85 1.49-.46.09-.94.13-2.93-.68-2.54-1.04-4.18-3.62-4.31-3.79-.12-.17-.99-1.32-.99-2.51 0-1.2.62-1.78.84-2.03.22-.25.47-.31.62-.31.15 0 .31 0 .44.01.14 0 .32-.05.5.38.18.43.62 1.51.68 1.63.06.12.1.26.02.43-.08.17-.12.28-.25.43-.12.15-.26.33-.37.45-.12.13-.25.27-.11.51.14.24.63 1.03 1.36 1.68.93.83 1.72 1.09 1.97 1.21.25.12.39.1.53-.06.14-.17.62-.72.79-.97.17-.25.34-.21.58-.12.24.09 1.51.71 1.77.84.26.13.43.19.49.3.06.11.06.66-.21 1.42z"/>
                    </svg>
                    {language === 'tr' ? "WhatsApp'tan Teklif Al" : "Get Quote via WhatsApp"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeasureWizardClient(props: MeasureWizardClientProps) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(189, 149, 75, 0.2)', borderTopColor: '#BD954B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    }>
      <MeasureWizardContent {...props} />
    </Suspense>
  );
}
