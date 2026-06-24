import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { HomePageContent, Category } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePageContentTab() {
  const { homeContent: dbHomeContent, categories: dbCategories, updateHomeContent } = useDb();
  const { t } = useLanguage();
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saved, setSaved] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbHomeContent) setContent(dbHomeContent);
  }, [dbHomeContent]);

  useEffect(() => {
    if (dbCategories) setCategories(dbCategories);
  }, [dbCategories]);

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

  const handleSave = async () => {
    if (content) {
      await updateHomeContent(content);
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

      {renderInputGroup(t('admin.homeContent.sections.philosophyTitle'), 'philosophyTitleTr', 'philosophyTitleEn')}
      {renderInputGroup(t('admin.homeContent.sections.philosophyDesc'), 'philosophyDescTr', 'philosophyDescEn', true)}
      
      {renderInputGroup(t('admin.homeContent.sections.craftTitle'), 'craftTitleTr', 'craftTitleEn')}
      {renderInputGroup(t('admin.homeContent.sections.craftDesc'), 'craftDescTr', 'craftDescEn', true)}
      
      {renderInputGroup(t('admin.homeContent.sections.collectionsTitle'), 'collectionsTitleTr', 'collectionsTitleEn')}
      {renderInputGroup(t('admin.homeContent.sections.collectionsDesc'), 'collectionsDescTr', 'collectionsDescEn', true)}

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
                  {/* Checkbox */}
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

                  {/* Category image */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0,
                    backgroundImage: cat.image ? `url(${cat.image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#1A242C',
                    border: '1px solid rgba(189,149,75,0.15)',
                  }} />

                  {/* Category name */}
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
    </div>
  );
}
