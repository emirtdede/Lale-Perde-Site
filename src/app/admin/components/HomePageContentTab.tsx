import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { HomePageContent, Category } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';
import ReferencesGridEditor from './ReferencesGridEditor';

export default function HomePageContentTab() {
  const { 
    homeContent: dbHomeContent, 
    categories: dbCategories, 
    updateHomeContent, 
    settings: dbSettings, 
    updateSettings,
    addCategory,
    updateCategory
  } = useDb();
  
  const { t, language } = useLanguage();
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saved, setSaved] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Logo Physics Configuration state
  const [logoConfig, setLogoConfig] = useState({
    theme: 'gold',
    interactionRadius: 30,
    returnSpeed: 0.001,
    friction: 0.86,
    scatterPower: 30
  });

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbHomeContent) setContent(dbHomeContent);
  }, [dbHomeContent]);

  useEffect(() => {
    if (dbCategories) {
      // Sort categories initially by carouselOrder (falling back to displayOrder)
      const sorted = [...dbCategories].sort((a, b) => {
        const oA = (a as any).carouselOrder ?? a.displayOrder ?? 0;
        const oB = (b as any).carouselOrder ?? b.displayOrder ?? 0;
        return oA - oB;
      });
      setCategories(sorted);
    }
  }, [dbCategories]);

  useEffect(() => {
    if (dbSettings && dbSettings.logoConfig) {
      setLogoConfig(dbSettings.logoConfig as any);
    }
  }, [dbSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!content) return;
    setContent({ ...content, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleToggleFeaturedCategory = (catId: string) => {
    if (!content) return;
    const current = content.featuredCategoryIds || [];
    const updated = current.includes(catId)
      ? current.filter(id => id !== catId)
      : [...current, catId];
    setContent({ ...content, featuredCategoryIds: updated });
    setSaved(false);
  };

  // Reordering carousel categories via Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...categories];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      carouselOrder: idx
    }));

    setCategories(updatedList);
    setSaved(false);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (content) {
      // 1. Save Home Content
      await updateHomeContent(content);

      // 2. Save Logo Physics settings back to site_settings
      if (dbSettings) {
        await updateSettings({
          ...dbSettings,
          logoConfig: logoConfig as any
        });
      }

      // 3. Save category carousel order sequentially
      await Promise.all(
        categories.map((cat) => {
          return updateCategory(cat);
        })
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!content) return <div style={{ color: '#E0E6ED' }}>{t('admin.homeContent.loading')}</div>;

  const renderInputGroup = (title: string, nameTr: keyof HomePageContent, nameEn: keyof HomePageContent, isTextArea = false) => (
    <div style={{ marginBottom: '2rem', backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
      <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>{t('admin.homeContent.langTr')}</label>
          {isTextArea ? (
            <textarea
              name={nameTr}
              value={content[nameTr] as string}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          ) : (
            <input
              type="text"
              name={nameTr}
              value={content[nameTr] as string}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>{t('admin.homeContent.langEn')}</label>
          {isTextArea ? (
            <textarea
              name={nameEn}
              value={content[nameEn] as string}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          ) : (
            <input
              type="text"
              name={nameEn}
              value={content[nameEn] as string}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const activeCategories = categories.filter(c => c.status === 'active');
  const featuredIds = content.featuredCategoryIds || [];

  return (
    <div>
      {portalTarget && createPortal(
        <button 
          onClick={handleSave}
          style={{ 
            background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
            color: '#FFF', 
            border: 'none', 
            padding: '0.6rem 1.5rem', 
            borderRadius: '6px', 
            fontWeight: 600, 
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {saved ? t('admin.homeContent.savedBtn') : t('admin.homeContent.saveBtn')}
        </button>,
        portalTarget
      )}

      {/* A. LOGO PHYSICS & THEME GLOBAL CONFIGURATION SETTINGS */}
      <div style={{ marginBottom: '2rem', backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {language === 'tr' ? 'Parçacık Logosu Fizik & Tema Ayarları' : 'Particles Logo Physics & Theme Config'}
        </h4>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          {language === 'tr' 
            ? 'Canvas fizik motorunda bulunan parçacıkların tema renkleri ve fiziksel spring (yay) limit katsayılarını özelleştirin.'
            : 'Configure color theme and spring physics parameters for the Canvas kinetic logo.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
              {language === 'tr' ? 'Renk Teması' : 'Color Theme'}
            </label>
            <select
              value={logoConfig.theme}
              onChange={(e) => {
                setLogoConfig({ ...logoConfig, theme: e.target.value });
                setSaved(false);
              }}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            >
              <option value="gold">Gold (Marka Altın - #BD954B)</option>
              <option value="ruby">Ruby (Yakut Kırmızı - #E0115F)</option>
              <option value="emerald">Emerald (Zümrüt Yeşil - #50C878)</option>
              <option value="sapphire">Sapphire (Safir Mavi - #0F52BA)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
              {language === 'tr' ? 'Etkileşim Çapı (interactionRadius)' : 'Interaction Radius'}
            </label>
            <input
              type="number"
              value={logoConfig.interactionRadius}
              onChange={(e) => {
                setLogoConfig({ ...logoConfig, interactionRadius: Number(e.target.value) });
                setSaved(false);
              }}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
              {language === 'tr' ? 'Geri Dönüş Hızı (Spring returnSpeed)' : 'Return Speed'}
            </label>
            <input
              type="number"
              step="0.0001"
              value={logoConfig.returnSpeed}
              onChange={(e) => {
                setLogoConfig({ ...logoConfig, returnSpeed: Number(e.target.value) });
                setSaved(false);
              }}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
              {language === 'tr' ? 'Sürtünme Katsayısı (friction)' : 'Friction'}
            </label>
            <input
              type="number"
              step="0.01"
              value={logoConfig.friction}
              onChange={(e) => {
                setLogoConfig({ ...logoConfig, friction: Number(e.target.value) });
                setSaved(false);
              }}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
              {language === 'tr' ? 'Saçılma Gücü (scatterPower)' : 'Scatter Power'}
            </label>
            <input
              type="number"
              value={logoConfig.scatterPower}
              onChange={(e) => {
                setLogoConfig({ ...logoConfig, scatterPower: Number(e.target.value) });
                setSaved(false);
              }}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* B. COLLECTIONS 3D WHEEL LIST ORDER MANAGEMENT (DRAG/DROP SIMULATOR) */}
      <div style={{ marginBottom: '2rem', backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {language === 'tr' ? '3D Çark Koleksiyon Sıralaması' : '3D Wheel Collection Order'}
        </h4>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          {language === 'tr' 
            ? '3D çarkta koleksiyonların dizilim sırasını yukarı/aşağı butonları ile düzenleyebilirsiniz.'
            : 'Reorder collection wheel items using the up/down placement actions.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 1rem',
                background: draggedIndex === idx ? 'rgba(189, 149, 75, 0.1)' : 'rgba(15, 24, 32, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                cursor: 'grab',
                transition: 'background-color 0.2s'
              }}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'rgba(189, 149, 75, 0.6)', cursor: 'grab', userSelect: 'none', fontSize: '1.15rem' }} title="Sürükle bırak ile sırala">
                  ☰
                </span>
                <div 
                  style={{
                    width: '32px', height: '32px', borderRadius: '4px', 
                    backgroundImage: cat.image ? `url(${cat.image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(189,149,75,0.15)'
                  }} 
                />
                <span style={{ color: '#FFF' }}>{cat.nameTr}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Categories Selection */}
      <div style={{ marginBottom: '2rem', backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {t('admin.homeContent.featured.title')}
        </h4>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          {t('admin.homeContent.featured.desc')}
        </p>

        {activeCategories.length === 0 ? (
          <p style={{ color: '#FF9800', fontSize: '0.9rem' }}>
            {t('admin.homeContent.featured.noActive')}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {activeCategories.map(cat => {
              const isSelected = featuredIds.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleToggleFeaturedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
                    background: isSelected ? 'rgba(189,149,75,0.08)' : 'rgba(15,24,32,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(189,149,75,0.4)';
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${isSelected ? 'var(--color-accent)' : '#A3B3C2'}`,
                    background: isSelected ? 'var(--color-accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A1118" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>

                  <div style={{
                    width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0,
                    backgroundImage: cat.image ? `url(${cat.image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#1A242C',
                    border: '1px solid rgba(189,149,75,0.15)',
                  }} />

                  <div>
                    <div style={{ color: '#E0E6ED', fontWeight: 500, fontSize: '0.9rem' }}>{cat.nameTr}</div>
                    <div style={{ color: '#A3B3C2', fontSize: '0.75rem' }}>{cat.nameEn}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {featuredIds.length > 0 && (
          <p style={{ color: 'var(--color-accent)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 500 }}>
            {featuredIds.length} {t('admin.homeContent.featured.selectedCount')}
          </p>
        )}
      </div>

      {/* C. REFERANSLAR (TAMAMLANAN ÇALIŞMALAR) CRDU PANEL */}
      <div style={{ marginBottom: '2rem', backgroundColor: '#0F1820', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          {language === 'tr' ? 'Tamamlanan Referans Çalışmalarımız (Izgara & CRUD)' : 'Completed References Works (Grid & CRUD)'}
        </h4>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          {language === 'tr' 
            ? 'Anasayfadaki "Tamamlanan Seçkin Çalışmalarımız" galerisinin ızgara yerleşimini ve içeriklerini yönetin.'
            : 'Configure references gallery grid layouts and content on the home page.'}
        </p>
        <ReferencesGridEditor
          initialConfig={content.references}
          onChange={(newReferencesConfig) => {
            setContent({ ...content, references: newReferencesConfig });
            setSaved(false);
          }}
          language={language}
        />
      </div>
    </div>
  );
}
