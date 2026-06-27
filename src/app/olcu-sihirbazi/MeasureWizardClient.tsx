'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { useDb } from '../../context/DbContext';
import { Category, Product } from '../../context/dbTypes';
import { useGoogleAds } from '../../context/GoogleAdsContext';

interface MeasureWizardClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

// Category limits definition
export const CATEGORY_LIMITS: Record<string, { label: string; labelEn: string; min_width: number; max_width: number; min_height: number; max_height: number }> = {
  "ev": { label: "Ev", labelEn: "Home", min_width: 40, max_width: 600, min_height: 60, max_height: 350 },
  "ofis": { label: "Ofis / Kurumsal", labelEn: "Office / Corporate", min_width: 50, max_width: 400, min_height: 100, max_height: 400 },
  "cami": { label: "Cami / İbadethane", labelEn: "Mosque / Place of Worship", min_width: 60, max_width: 300, min_height: 200, max_height: 1000 },
  "sahne": { label: "Sahne / Konferans", labelEn: "Stage / Conference", min_width: 300, max_width: 3000, min_height: 250, max_height: 1000 },
  "hastane": { label: "Hastane / Klinik", labelEn: "Hospital / Clinic", min_width: 150, max_width: 800, min_height: 150, max_height: 300 },
  "otel": { label: "Otel / Konaklama", labelEn: "Hotel / Lodging", min_width: 100, max_width: 800, min_height: 200, max_height: 400 },
  "dis_mekan": { label: "Dış Mekan / Teras", labelEn: "Outdoor / Terrace", min_width: 100, max_width: 600, min_height: 100, max_height: 400 },
  "endustriyel": { label: "Endüstriyel (PVC)", labelEn: "Industrial (PVC)", min_width: 80, max_width: 1000, min_height: 200, max_height: 600 },
  "karavan_tekne": { label: "Karavan / Tekne", labelEn: "RV / Boat", min_width: 20, max_width: 200, min_height: 20, max_height: 150 }
};

// Simple SVG Icons for step 1
const getCategoryIcon = (key: string) => {
  switch (key) {
    case 'ev':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
    case 'ofis':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    case 'cami':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H7M12 5a5 5 0 0 1 5 5v12H7V10a5 5 0 0 1 5-5z"></path></svg>;
    case 'sahne':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 22h20M12 2a10 10 0 0 0-10 10v10h20V12A10 10 0 0 0 12 2z"></path><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path></svg>;
    case 'hastane':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>;
    case 'otel':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 21h18M10 9h4M10 13h4M12 17v4"></path></svg>;
    case 'dis_mekan':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M12 20v2M17.66 17.66l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"></path></svg>;
    case 'endustriyel':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    case 'karavan_tekne':
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 18H2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z"></path><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M10 7v4h4V7"></path></svg>;
    default:
      return <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
  }
};

function MeasureWizardContent({ initialProducts, initialCategories }: MeasureWizardClientProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackConversion } = useGoogleAds();

  // Wizard state: 1 = Category selection (Usage Area), 2 = Product Selection, 3 = Mechanism / Sub-type Selection, 4 = Width (A) Entry, 5 = Height (B) Entry
  const [step, setStep] = useState<number>(1);
  const { settings, mountingTypes, fabricTypes } = useDb();

  const categories = React.useMemo(() => {
    return initialCategories
      .filter(c => c.status === 'active')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [initialCategories]);

  const products = React.useMemo(() => {
    return initialProducts.filter(p => p.status === 'active');
  }, [initialProducts]);

  // Selections
  const [selectedUsage, setSelectedUsage] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);

  // Width (A) and Height (B) in cm
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(200);

  // Window width and height in cm for preview estimation
  const [windowWidth, setWindowWidth] = useState<number>(240);
  const [windowHeight, setWindowHeight] = useState<number>(180);

  // Toggle info display state
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Toggle window visualization display
  const [showWindow, setShowWindow] = useState<boolean>(true);

  // Dragging states for 2D preview
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);

  // Fabric filtering in Step 2
  const [selectedFabricTypeId, setSelectedFabricTypeId] = useState<string>('all');

  // Local storage state loading
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const hasRestored = useRef(false);
  const hasInitializedProduct = useRef(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (hasRestored.current) return;

    try {
      const prodId = searchParams.get('product');
      if (prodId) {
        hasRestored.current = true;
        setIsLoaded(true);
        return;
      }

      const savedStep = localStorage.getItem('measure_wizard_step');
      const savedUsage = localStorage.getItem('measure_wizard_usage');
      const savedCatId = localStorage.getItem('measure_wizard_cat_id');
      const savedProductId = localStorage.getItem('measure_wizard_product_id');
      const savedSubtype = localStorage.getItem('measure_wizard_subtype');
      const savedWidth = localStorage.getItem('measure_wizard_width');
      const savedHeight = localStorage.getItem('measure_wizard_height');
      const savedWindowWidth = localStorage.getItem('measure_wizard_window_width');
      const savedWindowHeight = localStorage.getItem('measure_wizard_window_height');
      const savedShowWindow = localStorage.getItem('measure_wizard_show_window');
      const savedFabricTypeId = localStorage.getItem('measure_wizard_fabric_type_id');

      if (savedUsage) setSelectedUsage(savedUsage);
      if (savedCatId && categories.length > 0) {
        const cat = categories.find(c => c.id === savedCatId);
        if (cat) setSelectedCat(cat);
      }
      if (savedProductId && products.length > 0) {
        const prod = products.find(p => p.id === savedProductId);
        if (prod) setSelectedProduct(prod);
      }
      if (savedSubtype) setSelectedSubtype(savedSubtype);
      if (savedWidth) setWidth(Number(savedWidth));
      if (savedHeight) setHeight(Number(savedHeight));
      if (savedWindowWidth) setWindowWidth(Number(savedWindowWidth));
      if (savedWindowHeight) setWindowHeight(Number(savedWindowHeight));
      if (savedShowWindow) setShowWindow(savedShowWindow === 'true');
      if (savedFabricTypeId) setSelectedFabricTypeId(savedFabricTypeId);
      if (savedStep) setStep(Number(savedStep));
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
    hasRestored.current = true;
    setIsLoaded(true);
  }, [categories, products, searchParams]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('measure_wizard_step', String(step));
      if (selectedUsage) localStorage.setItem('measure_wizard_usage', selectedUsage);
      else localStorage.removeItem('measure_wizard_usage');

      if (selectedCat) localStorage.setItem('measure_wizard_cat_id', selectedCat.id);
      else localStorage.removeItem('measure_wizard_cat_id');

      if (selectedProduct) localStorage.setItem('measure_wizard_product_id', selectedProduct.id);
      else localStorage.removeItem('measure_wizard_product_id');

      if (selectedSubtype) localStorage.setItem('measure_wizard_subtype', selectedSubtype);
      else localStorage.removeItem('measure_wizard_subtype');

      localStorage.setItem('measure_wizard_width', String(width));
      localStorage.setItem('measure_wizard_height', String(height));
      localStorage.setItem('measure_wizard_window_width', String(windowWidth));
      localStorage.setItem('measure_wizard_window_height', String(windowHeight));
      localStorage.setItem('measure_wizard_show_window', String(showWindow));
      localStorage.setItem('measure_wizard_fabric_type_id', selectedFabricTypeId);
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [step, selectedUsage, selectedCat, selectedProduct, selectedSubtype, width, height, windowWidth, windowHeight, showWindow, selectedFabricTypeId, isLoaded]);

  // Load URL parameter pre-selection
  useEffect(() => {
    const prodId = searchParams.get('product');
    if (!prodId) return;
    if (hasInitializedProduct.current) return;

    if (products.length > 0 && categories.length > 0) {
      const matchedProd = products.find(p => p.id === prodId);
      if (matchedProd) {
        const matchedCat = categories.find(c => c.id === matchedProd.categoryId);
        if (matchedCat) {
          hasInitializedProduct.current = true;
          setSelectedUsage("ev"); // default usage to ev
          setSelectedCat(matchedCat);
          setSelectedProduct(matchedProd);
          
          // Set initial measurements to fit the category limits
          const limits = CATEGORY_LIMITS["ev"];
          setWidth(Math.round((limits.min_width + limits.max_width) / 2));
          setHeight(Math.round((limits.min_height + limits.max_height) / 2));
          
          setStep(3); // skip to sub-type selection
        }
      }
    }
  }, [searchParams, products, categories]);

  // Limits based on selected usage
  const limits = React.useMemo(() => {
    if (!selectedUsage) return { min_width: 40, max_width: 600, min_height: 60, max_height: 350 };
    return CATEGORY_LIMITS[selectedUsage];
  }, [selectedUsage]);

  // Fabric types for the selected category
  const categoryFabricTypes = React.useMemo(() => {
    if (!selectedCat || !fabricTypes) return [];
    return fabricTypes.filter(f => f.categoryId === selectedCat.id && f.status === 'active');
  }, [selectedCat, fabricTypes]);

  // Filtered products list for Step 2
  const filteredProducts = React.useMemo(() => {
    if (!selectedCat) return [];
    let list = products.filter(p => p.categoryId === selectedCat.id);
    if (selectedFabricTypeId !== 'all') {
      list = list.filter(p => p.fabricTypeId === selectedFabricTypeId);
    }
    return list;
  }, [products, selectedCat, selectedFabricTypeId]);

  // Dynamic mounting types based on selected product and category
  const productMountingTypes = React.useMemo(() => {
    if (!selectedProduct || !mountingTypes) return [];
    const ids = selectedProduct.mountingTypeIds || [];
    let list = mountingTypes.filter(m => ids.includes(m.id) && m.status === 'active');
    if (list.length === 0) {
      list = mountingTypes.filter(m => m.categoryId === selectedProduct.categoryId && m.curtainTypeId === selectedProduct.curtainTypeId && m.status === 'active');
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [selectedProduct, mountingTypes]);

  // Reset fabric type filter when selected category changes
  useEffect(() => {
    setSelectedFabricTypeId('all');
  }, [selectedCat]);

  // Ensure measurements are within category limits when usage area changes
  useEffect(() => {
    if (selectedUsage) {
      const currentLimits = CATEGORY_LIMITS[selectedUsage];
      if (width < currentLimits.min_width) setWidth(currentLimits.min_width);
      if (width > currentLimits.max_width) setWidth(currentLimits.max_width);
      if (height < currentLimits.min_height) setHeight(currentLimits.min_height);
      if (height > currentLimits.max_height) setHeight(currentLimits.max_height);
    }
  }, [selectedUsage]);

  // Handle pointer events for 2D dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingWidth && !isDraggingHeight) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      
      if (isDraggingWidth) {
        const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = relativeX / rect.width;
        // Map 10% - 90% to category limits
        const newWidth = Math.round(limits.min_width + (percentage * (limits.max_width - limits.min_width)));
        setWidth(Math.max(limits.min_width, Math.min(limits.max_width, newWidth)));
      }

      if (isDraggingHeight) {
        const relativeY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const percentage = relativeY / rect.height;
        // Map 10% - 90% to category limits
        const newHeight = Math.round(limits.min_height + (percentage * (limits.max_height - limits.min_height)));
        setHeight(Math.max(limits.min_height, Math.min(limits.max_height, newHeight)));
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
  }, [isDraggingWidth, isDraggingHeight, limits]);

  const handleWhatsAppQuote = () => {
    if (!settings || !selectedProduct || !selectedUsage) return;
    
    const catName = language === 'tr' ? selectedProduct.categoryTr : selectedProduct.categoryEn;
    const prodName = language === 'tr' ? selectedProduct.nameTr : selectedProduct.nameEn;
    const usageLabel = language === 'tr' ? CATEGORY_LIMITS[selectedUsage].label : CATEGORY_LIMITS[selectedUsage].labelEn;
    const subtypeLabel = selectedSubtype || (language === 'tr' ? 'Standart' : 'Standard');
    
    const text = `Merhaba, ${catName} / ${prodName} ürünü için kendi aldığım ölçülerle fiyat teklifi almak istiyorum. \n\n*BİLGİLER*\nKullanım Alanı: ${usageLabel}\nAlt Tip / Mekanizma: ${subtypeLabel}\n\n*ÖLÇÜLER*\nPencere Ölçüsü: ${windowWidth}x${windowHeight} cm\nİstenen Perde Ölçüsü: ${width}x${height} cm (En x Boy)\n\nLütfen net fiyat ve keşif için dönüş yapar mısınız?`;
    
    const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
    const wpUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    
    // Track Google Ads Conversion
    trackConversion('whatsapp');
    window.open(wpUrl, '_blank');
  };

  const getStepColor = (currentStep: number) => {
    return step === currentStep ? 'var(--color-accent)' : (step > currentStep ? '#A3B3C2' : '#5C6C7C');
  };

  const setDefaultMeasurements = () => {
    setWindowWidth(Math.round(limits.min_width * 1.5));
    setWindowHeight(Math.round(limits.min_height * 1.5));
  };

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(189, 149, 75, 0.2)', borderTopColor: '#BD954B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', alignItems: 'start' }}>
      
      {/* Left Sidebar Layout */}
      <aside style={{ position: 'sticky', top: '100px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          {language === 'tr' ? 'Ölçü Sihirbazı' : 'Measure Wizard'}
        </h1>
        <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '3rem' }}>
          {language === 'tr' 
            ? 'Pencereleriniz için doğru perde ölçüsünü adım adım hesaplayın.' 
            : 'Calculate the right curtain size for your windows step by step.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div 
            onClick={() => setStep(1)}
            style={{ cursor: 'pointer', opacity: step === 1 ? 1 : 0.7, transition: 'opacity 0.2s' }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(1), marginBottom: '0.3rem', fontWeight: 600 }}>{t('wizard.stepLabel')} 01</div>
            <div style={{ fontSize: '1rem', color: step >= 1 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>1. {t('wizard.step1Name')}</div>
            {selectedUsage && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.2rem', fontWeight: 500 }}>
                ✓ {CATEGORY_LIMITS[selectedUsage]?.label || selectedUsage}
              </div>
            )}
          </div>
          <div 
            onClick={() => { if (selectedUsage) setStep(2) }}
            style={{ cursor: selectedUsage ? 'pointer' : 'not-allowed', opacity: step === 2 ? 1 : 0.7, transition: 'opacity 0.2s' }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(2), marginBottom: '0.3rem', fontWeight: 600 }}>{t('wizard.stepLabel')} 02</div>
            <div style={{ fontSize: '1rem', color: step >= 2 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>2. {t('wizard.step2Name')}</div>
            {selectedProduct && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.2rem', fontWeight: 500 }}>
                ✓ {language === 'tr' ? selectedProduct.nameTr : selectedProduct.nameEn}
              </div>
            )}
          </div>
          <div 
            onClick={() => { if (selectedProduct) setStep(3) }}
            style={{ cursor: selectedProduct ? 'pointer' : 'not-allowed', opacity: step === 3 ? 1 : 0.7, transition: 'opacity 0.2s' }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(3), marginBottom: '0.3rem', fontWeight: 600 }}>{t('wizard.stepLabel')} 03</div>
            <div style={{ fontSize: '1rem', color: step >= 3 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>3. {t('wizard.step3Name')}</div>
            {selectedSubtype && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.2rem', fontWeight: 500 }}>
                ✓ {selectedSubtype}
              </div>
            )}
          </div>
          <div 
            onClick={() => { if (selectedSubtype) setStep(4) }}
            style={{ cursor: selectedSubtype ? 'pointer' : 'not-allowed', opacity: step === 4 ? 1 : 0.7, transition: 'opacity 0.2s' }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getStepColor(4), marginBottom: '0.3rem', fontWeight: 600 }}>{t('wizard.stepLabel')} 04</div>
            <div style={{ fontSize: '1rem', color: step >= 4 ? 'var(--color-text)' : '#5C6C7C', fontWeight: 500, textTransform: 'uppercase' }}>4. {t('wizard.step4Name')}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div>
        {/* STEP 1: Usage Area Selection */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>
              {language === 'tr' ? 'Kullanım Alanını Seçin' : 'Select Usage Area'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(CATEGORY_LIMITS).map(([key, data]) => (
                <div 
                  key={key} 
                  style={{ 
                    backgroundColor: 'var(--color-card-bg)', 
                    borderRadius: '8px', 
                    padding: '2rem 1.5rem',
                    cursor: 'pointer',
                    border: selectedUsage === key ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'center'
                  }} 
                  onMouseOver={(e) => {
                    if (selectedUsage !== key) e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    if (selectedUsage !== key) e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                  onClick={() => {
                    setSelectedUsage(key);
                    setStep(2);
                  }}
                >
                  <div style={{ color: selectedUsage === key ? 'var(--color-accent)' : 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    {getCategoryIcon(key)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                      {language === 'tr' ? data.label : data.labelEn}
                    </h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>
                      {language === 'tr' 
                        ? `En: ${data.min_width}-${data.max_width}cm | Boy: ${data.min_height}-${data.max_height}cm`
                        : `W: ${data.min_width}-${data.max_width}cm | H: ${data.min_height}-${data.max_height}cm`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Product Category & Fabric/Product Selection */}
        {step === 2 && (
          <div>
            {!selectedCat ? (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '2rem' }}>
                  {language === 'tr' ? 'Perde Türünü Seçin' : 'Select Curtain Type'}
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
                      onClick={() => setSelectedCat(cat)}
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
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>
                    {language === 'tr' ? selectedCat.nameTr : selectedCat.nameEn}
                  </h2>
                  <button 
                    onClick={() => setSelectedCat(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {language === 'tr' ? '(Farklı Bir Tür Seç)' : '(Select Different Type)'}
                  </button>
                </div>

                {/* Fabric Type Filter Selection */}
                {categoryFabricTypes.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={() => setSelectedFabricTypeId('all')}
                      style={{
                        background: selectedFabricTypeId === 'all' ? 'var(--color-accent)' : 'transparent',
                        color: selectedFabricTypeId === 'all' ? '#000' : '#A3B3C2',
                        border: selectedFabricTypeId === 'all' ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.15)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {language === 'tr' ? 'Tümü' : 'All'}
                    </button>
                    {categoryFabricTypes.map(ft => (
                      <button
                        key={ft.id}
                        onClick={() => setSelectedFabricTypeId(ft.id)}
                        style={{
                          background: selectedFabricTypeId === ft.id ? 'var(--color-accent)' : 'transparent',
                          color: selectedFabricTypeId === ft.id ? '#000' : '#A3B3C2',
                          border: selectedFabricTypeId === ft.id ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.15)',
                          padding: '0.5rem 1.2rem',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        {language === 'tr' ? ft.nameTr : ft.nameEn}
                      </button>
                    ))}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                    {language === 'tr' ? 'Seçtiğiniz kumaş türüne uygun ürün bulunmuyor.' : 'No products match the selected fabric type.'}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                    {filteredProducts.map(prod => (
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
                          
                          // Set default dimensions within limits
                          const currentLimits = CATEGORY_LIMITS[selectedUsage || 'ev'];
                          setWidth(Math.round((currentLimits.min_width + currentLimits.max_width) / 2));
                          setHeight(Math.round((currentLimits.min_height + currentLimits.max_height) / 2));
                          
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
                          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-primary)', margin: 0 }}>
                            {language === 'tr' ? prod.nameTr : prod.nameEn}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Sub-type / Mechanism Selection */}
        {step === 3 && selectedProduct && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              {language === 'tr' ? 'Montaj Tipi Seçimi' : 'Mounting Type Selection'}
            </h2>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              {language === 'tr' 
                ? 'Perdeniz için en uygun montaj tipini seçin.' 
                : 'Select the most suitable mounting type for your curtain.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              {productMountingTypes.map(opt => {
                const labelStr = language === 'tr' ? opt.nameTr : (opt.nameEn || opt.nameTr);
                const descStr = language === 'tr' ? opt.descriptionTr : (opt.descriptionEn || opt.descriptionTr);
                return (
                  <div 
                    key={opt.id}
                    style={{
                      backgroundColor: 'var(--color-card-bg)',
                      borderRadius: '12px',
                      padding: '2rem 1.5rem',
                      cursor: 'pointer',
                      border: selectedSubtype === labelStr ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      if (selectedSubtype !== labelStr) e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      if (selectedSubtype !== labelStr) e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                    onClick={() => {
                      setSelectedSubtype(labelStr);
                      setStep(4);
                    }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-text)', margin: '0 0 0.8rem' }}>
                      {labelStr}
                    </h3>
                    {descStr && (
                      <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
                        {descStr}
                      </p>
                    )}
                  </div>
                );
              })}
              {productMountingTypes.length === 0 && (
                <div style={{ color: '#A3B3C2', gridColumn: 'span 3', textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                  {language === 'tr' ? 'Bu ürün için tanımlanmış montaj tipi bulunamadı.' : 'No mounting types found for this product.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Interactive Sizing & Preview Form */}
        {step === 4 && selectedProduct && selectedUsage && (() => {
          const maxLimitWidth = limits.max_width;
          const maxLimitHeight = limits.max_height;

          const WindowIcon = () => (
            <svg width="18" height="18" fill="none" stroke="var(--color-accent)" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline-block' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          );

          const RulerIcon = () => (
            <svg width="18" height="18" fill="none" stroke="var(--color-accent)" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline-block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 4v16M5 4v16M5 12h14M5 8h6M5 16h6M13 8h6M13 16h6" />
            </svg>
          );

          const usageLabel = CATEGORY_LIMITS[selectedUsage]?.label ? (language === 'tr' ? CATEGORY_LIMITS[selectedUsage].label : CATEGORY_LIMITS[selectedUsage].labelEn) : selectedUsage;
          const productLabel = language === 'tr' ? selectedProduct.nameTr : selectedProduct.nameEn;
          const subtypeLabel = selectedSubtype || '';

          // Curtain sizing percentages relative to max limits (scaled to 78% to leave room for labels/handles)
          const curtainWidthPercent = Math.max(20, Math.min(90, (width / maxLimitWidth) * 78));
          const curtainHeightPercent = Math.max(20, Math.min(90, (height / maxLimitHeight) * 78));

          // Window sizing percentages relative to max limits
          const windowWidthPercent = Math.max(15, Math.min(90, (windowWidth / maxLimitWidth) * 78));
          const windowHeightPercent = Math.max(15, Math.min(90, (windowHeight / maxLimitHeight) * 78));

          return (
            <div>
              {/* Prominent Active Selection Trail Header */}
              <div 
                className="step4-active-selection-header"
                style={{ 
                  marginBottom: '1.8rem', 
                  padding: '1rem 1.5rem', 
                  backgroundColor: 'rgba(26, 46, 64, 0.75)', 
                  border: '1px solid var(--color-accent)', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: '0.8rem', 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <span 
                  onClick={() => setStep(1)} 
                  style={{ color: 'var(--color-accent)', cursor: 'pointer', transition: 'opacity 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  title={language === 'tr' ? '1. Adıma Git (Kullanım Alanı)' : 'Go to Step 1'}
                >
                  🏷️ {usageLabel}
                </span>
                <span style={{ color: '#5C6C7C', fontWeight: 300 }}>&gt;</span>
                <span 
                  onClick={() => setStep(2)} 
                  style={{ color: 'var(--color-accent)', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  title={language === 'tr' ? '2. Adıma Git (Ürün Seçimi)' : 'Go to Step 2'}
                >
                  {productLabel}
                </span>
                {subtypeLabel && (
                  <>
                    <span style={{ color: '#5C6C7C', fontWeight: 300 }}>&gt;</span>
                    <span 
                      onClick={() => setStep(3)} 
                      style={{ color: 'var(--color-accent)', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      title={language === 'tr' ? '3. Adıma Git (Montaj Tipi)' : 'Go to Step 3'}
                    >
                      {subtypeLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Grid aligning heights between columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 380px', gap: '2.5rem', alignItems: 'stretch' }}>
                
                {/* LEFT: 2D Interactive Preview */}
                <div 
                  ref={containerRef}
                  style={{ 
                    position: 'relative', 
                    backgroundColor: '#0a111a', 
                    borderRadius: '12px', 
                    border: '1px solid var(--color-border)',
                    height: '100%', 
                    minHeight: '520px', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    touchAction: 'none',
                    overflow: 'visible'
                  }}
                >
                  {/* Window Background (centered behind curtain, dynamically sized, conditionally rendered) */}
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

                  {/* Semi-transparent Wavy Curtain */}
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
                    {/* Width dashed line and arrows (A) */}
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
                      {/* Left Arrow */}
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '-5px',
                        borderTop: '5px transparent solid',
                        borderBottom: '5px transparent solid',
                        borderRight: '7px solid #BD954B',
                      }} />
                      {/* Right Arrow */}
                      <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '-5px',
                        borderTop: '5px transparent solid',
                        borderBottom: '5px transparent solid',
                        borderLeft: '7px solid #BD954B',
                      }} />
                      {/* Width Label A */}
                      <div style={{
                        backgroundColor: '#0F172A',
                        color: '#BD954B',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #BD954B',
                        transform: 'translateY(-1px)',
                        whiteSpace: 'nowrap'
                      }}>
                        A: {width} cm
                      </div>
                    </div>

                    {/* Height dashed line and arrows (B) */}
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
                      {/* Top Arrow */}
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '-5px',
                        borderLeft: '5px transparent solid',
                        borderRight: '5px transparent solid',
                        borderBottom: '7px solid #BD954B',
                      }} />
                      {/* Bottom Arrow */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '-5px',
                        borderLeft: '5px transparent solid',
                        borderRight: '5px transparent solid',
                        borderTop: '7px solid #BD954B',
                      }} />
                      {/* Height Label B */}
                      <div style={{
                        position: 'absolute',
                        backgroundColor: '#0F172A',
                        color: '#BD954B',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #BD954B',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        lineHeight: '1.1',
                        left: '10px',
                        whiteSpace: 'nowrap'
                      }}>
                        <span>B:</span>
                        <span>{height}</span>
                        <span>cm</span>
                      </div>
                    </div>

                    {/* Drag Handle - Width (Top Right) */}
                    <div 
                      onPointerDown={(e) => { e.preventDefault(); setIsDraggingWidth(true); }}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '24px',
                        height: '24px',
                        cursor: 'ew-resize',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '16px', height: '16px', backgroundColor: '#BD954B', border: '2px solid #FFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                    </div>

                    {/* Drag Handle - Height (Bottom Right) */}
                    <div 
                      onPointerDown={(e) => { e.preventDefault(); setIsDraggingHeight(true); }}
                      style={{
                        position: 'absolute',
                        bottom: '-10px',
                        right: '-10px',
                        width: '24px',
                        height: '24px',
                        cursor: 'ns-resize',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '16px', height: '16px', backgroundColor: '#BD954B', border: '2px solid #FFF', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  {/* Info Icon Dialog Overlay (Bottom Left interactive tooltip) */}
                  {showInfo && (
                    <div style={{
                      position: 'absolute',
                      bottom: '45px',
                      left: '15px',
                      backgroundColor: 'rgba(10, 17, 26, 0.95)',
                      border: '1px solid var(--color-accent)',
                      color: '#E0E6ED',
                      padding: '1.2rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      maxWidth: '300px',
                      zIndex: 20,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      lineHeight: '1.5',
                      backdropFilter: 'blur(8px)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                          {language === 'tr' ? '💡 Nasıl Kullanılır?' : '💡 How to Use?'}
                        </span>
                        <span 
                          onClick={() => setShowInfo(false)} 
                          style={{ cursor: 'pointer', opacity: 0.5, fontSize: '1.1rem' }}
                        >
                          ×
                        </span>
                      </div>
                      {language === 'tr' 
                        ? 'Perde boyutlarını değiştirmek için sağ üst veya sağ alttaki turuncu yuvarlakları sürükleyebilir, ya da sağdaki panelden doğrudan değerleri girebilirsiniz. Pencere ölçülerini değiştirerek perdenin pencerede nasıl duracağını simüle edebilirsiniz.'
                        : 'You can drag the orange circles at the top-right or bottom-right to change curtain dimensions, or enter them directly in the panel on the right. Modify window dimensions to simulate how the curtain fits.'}
                    </div>
                  )}

                   {/* Info Icon (Bottom Left - Trigger button) */}
                  <div 
                    onClick={() => setShowInfo(!showInfo)}
                    style={{ 
                      position: 'absolute', 
                      bottom: '15px', 
                      left: '15px', 
                      backgroundColor: showInfo ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.05)',
                      color: showInfo ? '#000' : 'var(--color-accent)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer', 
                      zIndex: 25, 
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                    title={language === 'tr' ? 'Yardım & İpuçları' : 'Help & Tips'}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>

                {/* RIGHT: Specs & Input Fields */}
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

                  {/* Sizing Input Panel */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Window Size Section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#A3B3C2', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <WindowIcon />
                          {language === 'tr' ? 'PENCERE ÖLÇÜLERİ' : 'WINDOW DIMENSIONS'}
                        </h4>
                        
                        <div 
                          onClick={() => setShowWindow(!showWindow)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                        >
                          <input 
                            type="checkbox" 
                            checked={showWindow} 
                            onChange={() => {}} 
                            style={{ accentColor: 'var(--color-accent)', cursor: 'pointer' }} 
                          />
                          <span style={{ fontSize: '0.75rem', color: '#A3B3C2', userSelect: 'none', fontWeight: 500 }}>
                            {language === 'tr' ? 'Pencereyi Göster' : 'Show Window'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: '#A3B3C2', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                            {language === 'tr' ? 'Genişlik (En)' : 'Width'}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              value={windowWidth} 
                              onChange={(e) => setWindowWidth(Number(e.target.value))}
                              style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
                            />
                            <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>cm</span>
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: '#A3B3C2', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                            {language === 'tr' ? 'Yükseklik (Boy)' : 'Height'}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              value={windowHeight} 
                              onChange={(e) => setWindowHeight(Number(e.target.value))}
                              style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
                            />
                            <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>cm</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

                    {/* Curtain Size Section */}
                    <div>
                      <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RulerIcon />
                        {language === 'tr' ? 'İSTENEN PERDE ÖLÇÜLERİ' : 'REQUESTED CURTAIN SIZES'}
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-accent)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                            {language === 'tr' ? 'Genişlik (En) (A)' : 'Width (A)'}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              value={width} 
                              onChange={(e) => setWidth(Number(e.target.value))}
                              style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
                            />
                            <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>cm</span>
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-accent)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                            {language === 'tr' ? 'Yükseklik (Boy) (B)' : 'Height (B)'}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              value={height} 
                              onChange={(e) => setHeight(Number(e.target.value))}
                              style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', fontSize: '1rem', outline: 'none' }}
                            />
                            <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>cm</span>
                          </div>
                        </div>
                      </div>

                      {/* Width Limit Warnings */}
                      {(width < limits.min_width || width > limits.max_width) && (
                        <div style={{ color: '#FF4C4C', fontSize: '0.8rem', marginTop: '0.8rem', fontWeight: 500 }}>
                          {language === 'tr'
                            ? `Genişlik en az ${limits.min_width} cm, en fazla ${limits.max_width} cm olmalıdır.`
                            : `Width must be between ${limits.min_width} cm and ${limits.max_width} cm.`}
                        </div>
                      )}

                      {/* Height Limit Warnings */}
                      {(height < limits.min_height || height > limits.max_height) && (
                        <div style={{ color: '#FF4C4C', fontSize: '0.8rem', marginTop: '0.8rem', fontWeight: 500 }}>
                          {language === 'tr'
                            ? `Yükseklik en az ${limits.min_height} cm, en fazla ${limits.max_height} cm olmalıdır.`
                            : `Height must be between ${limits.min_height} cm and ${limits.max_height} cm.`}
                        </div>
                      )}
                    </div>

                    {/* WhatsApp Action Button */}
                    <button 
                      disabled={width < limits.min_width || width > limits.max_width || height < limits.min_height || height > limits.max_height}
                      onClick={handleWhatsAppQuote}
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.8rem', 
                        padding: '1rem', 
                        backgroundColor: (width < limits.min_width || width > limits.max_width || height < limits.min_height || height > limits.max_height) ? '#1E6B38' : '#25D366', 
                        color: '#FFF', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        cursor: (width < limits.min_width || width > limits.max_width || height < limits.min_height || height > limits.max_height) ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s' 
                      }}
                      onMouseOver={(e) => {
                        if (width >= limits.min_width && width <= limits.max_width && height >= limits.min_height && height <= limits.max_height) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
          );
        })()}
      </div>
    </div>
  );
}

export default function MeasureWizardClient(props: MeasureWizardClientProps) {
  return <MeasureWizardContent {...props} />;
}
