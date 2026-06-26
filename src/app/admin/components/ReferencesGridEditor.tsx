'use client';

import React, { useState, useRef, useEffect } from 'react';

interface GridItem {
  id: string;
  image: string;
  titleTr: string;
  titleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  gridColumnStart?: number;
  gridColumnEnd?: number;
  gridRowStart?: number;
  gridRowEnd?: number;
}

interface ReferencesConfig {
  layoutType: string;
  items: GridItem[];
}

interface ReferencesGridEditorProps {
  initialConfig?: ReferencesConfig;
  onChange: (config: ReferencesConfig) => void;
  language: string;
}

const PRESET_LAYOUTS = [
  {
    id: 'preset1',
    nameTr: '3 Eşit Sütun',
    nameEn: '3 Equal Columns',
    items: [
      { 
        id: '1', 
        image: '/assets/scandi.png', 
        titleTr: 'Zekeriyaköy Villa Projesi', 
        titleEn: 'Zekeriyaköy Villa Project', 
        descriptionTr: 'Salon ve yatak odalarında keten tül ve motorlu kadife fon perde uygulamaları.', 
        descriptionEn: 'Linen tulle and motorized velvet drapery applications in living room and bedrooms.', 
        gridColumnStart: 1, 
        gridColumnEnd: 5, 
        gridRowStart: 1, 
        gridRowEnd: 3 
      },
      { 
        id: '2', 
        image: '/assets/fabric.png', 
        titleTr: 'Göktürk Rezidans Penthouse', 
        titleEn: 'Göktürk Residence Penthouse', 
        descriptionTr: 'Minimalist dekorasyona uygun ahşap jaluzi ve modern dalga tül perdeler.', 
        descriptionEn: 'Wooden venetian blinds and modern wave tulle curtains matching minimalist decor.', 
        gridColumnStart: 5, 
        gridColumnEnd: 9, 
        gridRowStart: 1, 
        gridRowEnd: 3 
      },
      { 
        id: '3', 
        image: '/assets/hero.png', 
        titleTr: 'Tarabya Yalı Dairesi', 
        titleEn: 'Tarabya Bosphorus Apartment', 
        descriptionTr: 'Boğaz manzarasına eşlik eden premium ipek fon perdeler ve motorlu stor sistemler.', 
        descriptionEn: 'Premium silk draperies and motorized roller systems accompanying the Bosphorus view.', 
        gridColumnStart: 9, 
        gridColumnEnd: 13, 
        gridRowStart: 1, 
        gridRowEnd: 3 
      },
      { 
        id: '4', 
        image: '/assets/fabric.png', 
        titleTr: 'Bebek Sahil Evi', 
        titleEn: 'Bebek Coastal House', 
        descriptionTr: 'Lüks salon alanı için ipek keten tül ve modern katlamalı perde tasarımları.', 
        descriptionEn: 'Silk-linen tulle and modern roman shade designs for the luxury living area.', 
        gridColumnStart: 1, 
        gridColumnEnd: 5, 
        gridRowStart: 3, 
        gridRowEnd: 5 
      },
      { 
        id: '5', 
        image: '/assets/scandi.png', 
        titleTr: 'Kemerburgaz Konakları', 
        titleEn: 'Kemerburgaz Mansions', 
        descriptionTr: 'Yüksek tavanlı salonlar için akustik özellikli kadife fon perdeler.', 
        descriptionEn: 'Acoustic velvet draperies tailored for high-ceiling living spaces.', 
        gridColumnStart: 5, 
        gridColumnEnd: 9, 
        gridRowStart: 3, 
        gridRowEnd: 5 
      },
      { 
        id: '6', 
        image: '/assets/hero.png', 
        titleTr: 'Şişli Modern Ofis', 
        titleEn: 'Şişli Modern Office', 
        descriptionTr: 'Çalışma alanları için motorlu dikey stor ve jaluzi perde otomasyonu.', 
        descriptionEn: 'Motorized vertical roller and venetian blind automation systems for work environments.', 
        gridColumnStart: 9, 
        gridColumnEnd: 13, 
        gridRowStart: 3, 
        gridRowEnd: 5 
      },
    ]
  },
  {
    id: 'preset2',
    nameTr: '2 Sütun (Sağ Bölünmüş)',
    nameEn: '2 Columns (Right Split)',
    items: [
      { id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 7, gridRowStart: 1, gridRowEnd: 3 },
      { id: '2', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 7, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 2 },
      { id: '3', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 7, gridColumnEnd: 13, gridRowStart: 2, gridRowEnd: 3 },
    ]
  },
  {
    id: 'preset3',
    nameTr: '3x2 Eşit Izgara',
    nameEn: '3x2 Equal Grid',
    items: [
      { id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 2 },
      { id: '2', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 5, gridColumnEnd: 9, gridRowStart: 1, gridRowEnd: 2 },
      { id: '3', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 9, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 2 },
      { id: '4', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 2, gridRowEnd: 3 },
      { id: '5', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 5, gridColumnEnd: 9, gridRowStart: 2, gridRowEnd: 3 },
      { id: '6', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 9, gridColumnEnd: 13, gridRowStart: 2, gridRowEnd: 3 },
    ]
  },
  {
    id: 'preset4',
    nameTr: '3 Sütun (Orta Boylu)',
    nameEn: '3 Columns (Middle Tall)',
    items: [
      { id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 2 },
      { id: '2', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 5, gridColumnEnd: 9, gridRowStart: 1, gridRowEnd: 3 },
      { id: '3', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 9, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 2 },
      { id: '4', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 2, gridRowEnd: 3 },
      { id: '5', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 9, gridColumnEnd: 13, gridRowStart: 2, gridRowEnd: 3 },
    ]
  },
  {
    id: 'preset5',
    nameTr: '2 Sütun (Sol Bölünmüş)',
    nameEn: '2 Columns (Left Split)',
    items: [
      { id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 7, gridRowStart: 1, gridRowEnd: 2 },
      { id: '2', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 7, gridRowStart: 2, gridRowEnd: 3 },
      { id: '3', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 7, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 3 },
    ]
  },
  {
    id: 'preset6',
    nameTr: 'Asimetrik Modern',
    nameEn: 'Asymmetric Modern',
    items: [
      { id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 9, gridRowStart: 1, gridRowEnd: 2 },
      { id: '2', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 9, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 2 },
      { id: '3', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 2, gridRowEnd: 3 },
      { id: '4', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 5, gridColumnEnd: 13, gridRowStart: 2, gridRowEnd: 3 },
    ]
  }
];

export default function ReferencesGridEditor({ initialConfig, onChange, language }: ReferencesGridEditorProps) {
  const [config, setConfig] = useState<ReferencesConfig>({
    layoutType: initialConfig?.layoutType || 'preset1',
    items: initialConfig?.items || JSON.parse(JSON.stringify(PRESET_LAYOUTS[0].items))
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [cropModalItem, setCropModalItem] = useState<GridItem | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cropper states
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialConfig && initialConfig.items && initialConfig.items.length > 0) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const updateConfig = (newConfig: ReferencesConfig) => {
    setConfig(newConfig);
    onChange(newConfig);
  };

  const handleLayoutTypeChange = (type: string) => {
    let newItems: GridItem[] = [];
    if (type === 'custom') {
      newItems = config.items.map((item, idx) => ({
        ...item,
        gridColumnStart: item.gridColumnStart || 1,
        gridColumnEnd: item.gridColumnEnd || 5,
        gridRowStart: item.gridRowStart || 1,
        gridRowEnd: item.gridRowEnd || 2,
      }));
      if (newItems.length === 0) {
        newItems = [{ id: '1', image: '', titleTr: '', titleEn: '', descriptionTr: '', descriptionEn: '', gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 2 }];
      }
    } else {
      const preset = PRESET_LAYOUTS.find(p => p.id === type);
      if (preset) {
        // Keep existing titles, descriptions and images if indexes match
        newItems = preset.items.map((presetItem, idx) => {
          const existing = config.items[idx];
          return {
            ...presetItem,
            image: existing?.image || '',
            titleTr: existing?.titleTr || '',
            titleEn: existing?.titleEn || '',
            descriptionTr: existing?.descriptionTr || '',
            descriptionEn: existing?.descriptionEn || '',
          };
        });
      }
    }
    const updated = { layoutType: type, items: newItems };
    updateConfig(updated);
    setSelectedItemId(newItems[0]?.id || null);
  };

  const handleItemPropertyChange = (itemId: string, field: keyof GridItem, value: any) => {
    const updatedItems = config.items.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateConfig({ ...config, items: updatedItems });
  };

  const handleAddNewItem = () => {
    const maxId = config.items.reduce((max, item) => Math.max(max, parseInt(item.id) || 0), 0);
    const newItem: GridItem = {
      id: String(maxId + 1),
      image: '',
      titleTr: '',
      titleEn: '',
      descriptionTr: '',
      descriptionEn: '',
      gridColumnStart: 1,
      gridColumnEnd: 5,
      gridRowStart: 1,
      gridRowEnd: 2
    };
    const updated = { ...config, items: [...config.items, newItem] };
    updateConfig(updated);
    setSelectedItemId(newItem.id);
  };

  const handleDeleteItem = (itemId: string) => {
    if (config.items.length <= 1) return;
    const updatedItems = config.items.filter(item => item.id !== itemId);
    const updated = { ...config, items: updatedItems };
    updateConfig(updated);
    if (selectedItemId === itemId) {
      setSelectedItemId(updatedItems[0].id);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, item: GridItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setCropModalItem(item);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  // Crop Canvas Logic
  const handleSaveCrop = async () => {
    if (!cropModalItem || !tempImageSrc || !imgRef.current || !containerRef.current) return;

    setIsUploading(true);

    try {
      const img = imgRef.current;
      const container = containerRef.current;

      const colSpan = (cropModalItem.gridColumnEnd || 5) - (cropModalItem.gridColumnStart || 1);
      const rowSpan = (cropModalItem.gridRowEnd || 2) - (cropModalItem.gridRowStart || 1);

      // Define target resolution maintaining aspect ratio of the grid area
      const targetWidth = colSpan * 300;
      const targetHeight = rowSpan * 300;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Clear background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Aspect ratios
        const containerAspect = container.clientWidth / container.clientHeight;
        const imgNaturalAspect = img.naturalWidth / img.naturalHeight;

        let displayWidth = container.clientWidth;
        let displayHeight = container.clientHeight;

        if (imgNaturalAspect > containerAspect) {
          // Image is wider than container
          displayHeight = container.clientHeight;
          displayWidth = displayHeight * imgNaturalAspect;
        } else {
          // Image is taller than container
          displayWidth = container.clientWidth;
          displayHeight = displayWidth / imgNaturalAspect;
        }

        // Apply zoom
        displayWidth *= zoom;
        displayHeight *= zoom;

        // Render positions in container space
        const displayX = (container.clientWidth - displayWidth) / 2 + offset.x;
        const displayY = (container.clientHeight - displayHeight) / 2 + offset.y;

        // Convert container space positions to canvas space (scale factor)
        const scaleFactor = targetWidth / container.clientWidth;

        ctx.drawImage(
          img,
          displayX * scaleFactor,
          displayY * scaleFactor,
          displayWidth * scaleFactor,
          displayHeight * scaleFactor
        );

        const base64 = canvas.toDataURL('image/webp', 0.85);

        // Upload to server
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64,
            folder: 'references'
          })
        });

        const resData = await response.json();
        if (resData.success && resData.url) {
          handleItemPropertyChange(cropModalItem.id, 'image', resData.url);
          setCropModalItem(null);
          setTempImageSrc(null);
        } else {
          alert('Görsel yüklenemedi: ' + (resData.error || 'Bilinmeyen hata'));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Kırpma ve yükleme sırasında hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const activeItem = config.items.find(item => item.id === selectedItemId) || config.items[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Layout Selection */}
      <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {language === 'tr' ? '1. Izgara Yerleşimi Seçimi' : '1. Select Grid Layout'}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {PRESET_LAYOUTS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLayoutTypeChange(preset.id)}
              style={{
                padding: '1rem',
                borderRadius: '6px',
                border: `1px solid ${config.layoutType === preset.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
                background: config.layoutType === preset.id ? 'rgba(189,149,75,0.12)' : 'rgba(15,24,32,0.6)',
                color: '#FFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {language === 'tr' ? preset.nameTr : preset.nameEn}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#A3B3C2', marginTop: '0.4rem' }}>
                {preset.items.length} {language === 'tr' ? 'Görsel Alanı' : 'Image Areas'}
              </div>
            </button>
          ))}
          <button
            onClick={() => handleLayoutTypeChange('custom')}
            style={{
              padding: '1rem',
              borderRadius: '6px',
              border: `1px solid ${config.layoutType === 'custom' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
              background: config.layoutType === 'custom' ? 'rgba(189,149,75,0.12)' : 'rgba(15,24,32,0.6)',
              color: '#FFF',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-accent)' }}>
              {language === 'tr' ? '✦ Özel Serbest Izgara' : '✦ Custom Free Grid'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#A3B3C2', marginTop: '0.4rem' }}>
              {language === 'tr' ? 'Kendi boyut ve konumlarınızı ayarlayın' : 'Define your own positions & sizes'}
            </div>
          </button>
        </div>
      </div>

      {/* Visual Editor Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left: Interactive Grid Map */}
        <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h4 style={{ color: '#E0E6ED', margin: 0 }}>
              {language === 'tr' ? '2. Görsel Alan Önizleme Haritası' : '2. Image Area Preview Map'}
            </h4>
            {config.layoutType === 'custom' && (
              <button
                onClick={handleAddNewItem}
                style={{
                  background: 'rgba(189, 149, 75, 0.2)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(189,149,75,0.4)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                + {language === 'tr' ? 'Yeni Dörtgen Ekle' : 'Add New Rectangle'}
              </button>
            )}
          </div>

          {/* 12-Column Responsive CSS Grid Canvas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: '120px',
            gap: '8px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px dashed rgba(255,255,255,0.1)',
            minHeight: '300px',
            position: 'relative'
          }}>
            {config.items.map((item, idx) => {
              const isSelected = item.id === selectedItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  style={{
                    gridColumnStart: item.gridColumnStart,
                    gridColumnEnd: item.gridColumnEnd,
                    gridRowStart: item.gridRowStart,
                    gridRowEnd: item.gridRowEnd,
                    backgroundColor: isSelected ? 'rgba(189,149,75,0.18)' : 'rgba(255,255,255,0.03)',
                    border: `2px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    position: 'relative',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    backgroundImage: item.image ? `url(${item.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Backdrop Overlay if has image */}
                  {item.image && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      zIndex: 1
                    }} />
                  )}

                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      background: isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? '#000' : '#FFF',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#FFF', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {language === 'tr' ? item.titleTr || '(Başlıksız)' : item.titleEn || '(Untitled)'}
                    </span>
                  </div>

                  {config.layoutType === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        cursor: 'pointer',
                        zIndex: 3
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Rectangle Properties (Title, Desc, Upload, Custom Dimensions) */}
        <div style={{ backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
          <h4 style={{ color: '#E0E6ED', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            {language === 'tr' ? '3. Alan İçerik ve Boyut Ayarları' : '3. Area Content & Sizing'}
          </h4>

          {activeItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Image Upload Area */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? 'Referans Fotoğrafı' : 'Reference Photo'}
                </label>
                
                {activeItem.image ? (
                  <div style={{ position: 'relative', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(189,149,75,0.3)', marginBottom: '0.6rem' }}>
                    <img src={activeItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => handleItemPropertyChange(activeItem.id, 'image', '')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {language === 'tr' ? 'Resmi Kaldır' : 'Remove Image'}
                    </button>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.8rem',
                    border: '1px dashed rgba(189,149,75,0.4)',
                    borderRadius: '4px',
                    background: 'rgba(15,24,32,0.8)',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {language === 'tr' ? 'Dosya Seç & Kırp' : 'Select File & Crop'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, activeItem)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Title & Desc Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A3B3C2', marginBottom: '0.4rem' }}>
                    {language === 'tr' ? 'Başlık (Türkçe)' : 'Title (TR)'}
                  </label>
                  <input
                    type="text"
                    value={activeItem.titleTr}
                    onChange={(e) => handleItemPropertyChange(activeItem.id, 'titleTr', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A3B3C2', marginBottom: '0.4rem' }}>
                    {language === 'tr' ? 'Başlık (İngilizce)' : 'Title (EN)'}
                  </label>
                  <input
                    type="text"
                    value={activeItem.titleEn}
                    onChange={(e) => handleItemPropertyChange(activeItem.id, 'titleEn', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A3B3C2', marginBottom: '0.4rem' }}>
                    {language === 'tr' ? 'Açıklama (Türkçe)' : 'Description (TR)'}
                  </label>
                  <textarea
                    value={activeItem.descriptionTr}
                    onChange={(e) => handleItemPropertyChange(activeItem.id, 'descriptionTr', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#A3B3C2', marginBottom: '0.4rem' }}>
                    {language === 'tr' ? 'Açıklama (İngilizce)' : 'Description (EN)'}
                  </label>
                  <textarea
                    value={activeItem.descriptionEn}
                    onChange={(e) => handleItemPropertyChange(activeItem.id, 'descriptionEn', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Custom Layout Position Controls (Only for custom mode) */}
              {config.layoutType === 'custom' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                    {language === 'tr' ? 'Dörtgen Koordinat Ayarları' : 'Rectangle Grid Coordinates'}
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#A3B3C2', marginBottom: '0.2rem' }}>
                        {language === 'tr' ? `Yatay Başlangıç (Sütun): ${activeItem.gridColumnStart || 1}` : `Column Start: ${activeItem.gridColumnStart || 1}`}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={activeItem.gridColumnStart || 1}
                        onChange={(e) => {
                          const start = Number(e.target.value);
                          const end = Math.max(start + 1, activeItem.gridColumnEnd || 5);
                          handleItemPropertyChange(activeItem.id, 'gridColumnStart', start);
                          handleItemPropertyChange(activeItem.id, 'gridColumnEnd', end);
                        }}
                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#A3B3C2', marginBottom: '0.2rem' }}>
                        {language === 'tr' ? `Yatay Bitiş (Sütun): ${activeItem.gridColumnEnd || 5}` : `Column End: ${activeItem.gridColumnEnd || 5}`}
                      </label>
                      <input
                        type="range"
                        min={(activeItem.gridColumnStart || 1) + 1}
                        max="13"
                        value={activeItem.gridColumnEnd || 5}
                        onChange={(e) => handleItemPropertyChange(activeItem.id, 'gridColumnEnd', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#A3B3C2', marginBottom: '0.2rem' }}>
                        {language === 'tr' ? `Dikey Başlangıç (Satır): ${activeItem.gridRowStart || 1}` : `Row Start: ${activeItem.gridRowStart || 1}`}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={activeItem.gridRowStart || 1}
                        onChange={(e) => {
                          const start = Number(e.target.value);
                          const end = Math.max(start + 1, activeItem.gridRowEnd || 2);
                          handleItemPropertyChange(activeItem.id, 'gridRowStart', start);
                          handleItemPropertyChange(activeItem.id, 'gridRowEnd', end);
                        }}
                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#A3B3C2', marginBottom: '0.2rem' }}>
                        {language === 'tr' ? `Dikey Bitiş (Satır): ${activeItem.gridRowEnd || 2}` : `Row End: ${activeItem.gridRowEnd || 2}`}
                      </label>
                      <input
                        type="range"
                        min={(activeItem.gridRowStart || 1) + 1}
                        max="7"
                        value={activeItem.gridRowEnd || 2}
                        onChange={(e) => handleItemPropertyChange(activeItem.id, 'gridRowEnd', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#A3B3C2', fontSize: '0.9rem', textAlign: 'center' }}>
              {language === 'tr' ? 'Düzenlemek için sol haritadan bir alan seçin.' : 'Select an area from the preview map to configure.'}
            </p>
          )}
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModalItem && tempImageSrc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#0A1118',
            border: '1px solid rgba(189,149,75,0.3)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#FFF', margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
                {language === 'tr' ? 'Görseli Alana Göre Kırp' : 'Crop Image to Fit Area'}
              </h3>
              <button
                onClick={() => {
                  setCropModalItem(null);
                  setTempImageSrc(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#A3B3C2', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Crop Window Container */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                position: 'relative',
                height: '350px',
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Highlight Overlay representing Grid Aspect Ratio */}
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '2px solid var(--color-accent)',
                boxShadow: '0 0 0 999px rgba(0,0,0,0.5)',
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'var(--color-accent)', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {language === 'tr' ? 'Kırpma Alanı (Önizleme)' : 'Crop Area (Preview)'}
                </span>
              </div>

              {/* Cropping Target Image */}
              <img
                ref={imgRef}
                src={tempImageSrc}
                alt="To Crop"
                onMouseDown={handleMouseDown}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  userSelect: 'none',
                  pointerEvents: 'auto'
                }}
              />
            </div>

            {/* Slider / Scale Controls */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
                {language === 'tr' ? `Yakınlaştır: ${Math.round(zoom * 100)}%` : `Zoom: ${Math.round(zoom * 100)}%`}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => {
                  setCropModalItem(null);
                  setTempImageSrc(null);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#A3B3C2',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveCrop}
                disabled={isUploading}
                style={{
                  background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                  border: 'none',
                  color: '#FFF',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '6px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: isUploading ? 0.7 : 1
                }}
              >
                {isUploading ? (language === 'tr' ? 'Yükleniyor...' : 'Uploading...') : (language === 'tr' ? 'Kırp ve Kaydet' : 'Crop & Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
