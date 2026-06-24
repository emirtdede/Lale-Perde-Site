'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { Product, Category, CurtainType, FabricType } from '../../context/dbTypes';

interface ProductsCatalogClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialCurtainTypes: CurtainType[];
  initialFabricTypes: FabricType[];
}

function ProductsCatalogContent({ initialProducts, initialCategories, initialCurtainTypes, initialFabricTypes }: ProductsCatalogClientProps) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const products = React.useMemo(() => {
    return initialProducts.filter(p => p.status === 'active');
  }, [initialProducts]);

  const categories = React.useMemo(() => {
    return initialCategories
      .filter(c => c.status === 'active')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [initialCategories]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurtain, setSelectedCurtain] = useState<string>('all');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('order');
  
  // Accordion state
  const [isCurtainAccordionOpen, setIsCurtainAccordionOpen] = useState(true);
  const [isFabricAccordionOpen, setIsFabricAccordionOpen] = useState(true);

  // Sync state with URL search params
  useEffect(() => {
    const catParam = searchParams.get('category');
    const curParam = searchParams.get('curtain');
    const fabParam = searchParams.get('fabric');
    const searchParam = searchParams.get('search');

    if (catParam) setSelectedCategory(catParam);
    if (curParam) setSelectedCurtain(curParam);
    if (fabParam) setSelectedFabric(fabParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  const updateUrl = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === 'all' || !value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/urunler${query}`, { scroll: false });
  };

  // Extract unique colors & fabrics for filter options
  const uniqueColorsMap = new Map<string, string>();
  products.forEach(p => {
    p.colors.forEach(c => {
      const name = language === 'tr' ? c.nameTr : c.nameEn;
      if (!uniqueColorsMap.has(name)) {
        uniqueColorsMap.set(name, c.hex || '#CCCCCC');
      }
    });
  });
  const colorOptions = Array.from(uniqueColorsMap.entries()).map(([name, hex]) => ({
    name,
    hex
  }));

  const activeCurtainTypes = initialCurtainTypes.filter(c => c.status === 'active' && c.categoryId === selectedCategory);
  const activeFabricTypes = initialFabricTypes.filter(f => f.status === 'active' && f.categoryId === selectedCategory);

  // Filter & Sort logic
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchCurtain = selectedCurtain === 'all' || product.curtainTypeId === selectedCurtain;
    const matchFabric = selectedFabric === 'all' || product.fabricTypeId === selectedFabric;
    
    const matchColor = selectedColor === 'all' || product.colors.some(c => 
      (language === 'tr' ? c.nameTr : c.nameEn) === selectedColor
    );
    
    const nameToSearch = (language === 'tr' ? product.nameTr : product.nameEn).toLowerCase();
    const descToSearch = (language === 'tr' ? product.descriptionTr : product.descriptionEn).toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = query === '' || nameToSearch.includes(query) || descToSearch.includes(query);

    return matchCategory && matchCurtain && matchFabric && matchColor && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'order') {
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'name') {
      const nameA = language === 'tr' ? a.nameTr : a.nameEn;
      const nameB = language === 'tr' ? b.nameTr : b.nameEn;
      return nameA.localeCompare(nameB);
    }
    // Default popularity
    return b.popularity - a.popularity;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 2rem 2rem' }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {t('catalog.title')}
        </h1>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
          {t('catalog.subtitle')}
        </p>
      </header>

      {/* Sorting dropdown at the top right of the whole section before the grid */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', margin: 0, fontWeight: 500 }}>
            {t('catalog.sort')}:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '0.5rem 2rem 0.5rem 0.8rem', 
              border: '1px solid var(--color-border)', 
              borderRadius: '4px', 
              background: 'var(--color-card-bg)', 
              color: 'var(--color-text)', 
              cursor: 'pointer', 
              outline: 'none',
              fontSize: '0.9rem'
            }}
          >
            <option value="order">{language === 'tr' ? 'Varsayılan Sıralama' : 'Default Order'}</option>
            <option value="popular">{t('catalog.sortBy.popular')}</option>
            <option value="newest">{t('catalog.sortBy.newest')}</option>
            <option value="name">{t('catalog.sortBy.name')}</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Filters */}
        <aside style={{ backgroundColor: 'var(--color-neutral)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            {t('catalog.filterTitle')}
          </h3>

          {/* Search filter inside sidebar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
              {t('catalog.search')}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateUrl('search', e.target.value);
              }}
              placeholder={t('nav.searchPlaceholder')}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'transparent', color: 'var(--color-text)' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
              {t('catalog.sector')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCategory(val);
                setSelectedCurtain('all'); // reset sub filters
                setSelectedFabric('all');
                updateUrl('category', val);
                updateUrl('curtain', 'all');
                updateUrl('fabric', 'all');
              }}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-card-bg)', color: 'var(--color-text)' }}
            >
              <option value="all">{t('catalog.all')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {language === 'tr' ? cat.nameTr : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Accordions for Curtain & Fabric Types */}
          {selectedCategory !== 'all' && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-card-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
              
              {/* Curtain Types Accordion */}
              {activeCurtainTypes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div 
                    onClick={() => setIsCurtainAccordionOpen(!isCurtainAccordionOpen)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>Perde Çeşitleri</span>
                    <span style={{ color: 'var(--color-accent)' }}>{isCurtainAccordionOpen ? '−' : '+'}</span>
                  </div>
                  {isCurtainAccordionOpen && (
                    <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: selectedCurtain === 'all' ? 'var(--color-accent)' : '#A3B3C2' }}>
                        <input type="radio" checked={selectedCurtain === 'all'} onChange={() => { setSelectedCurtain('all'); updateUrl('curtain', 'all'); }} style={{ accentColor: 'var(--color-accent)' }} />
                        Tümü
                      </label>
                      {activeCurtainTypes.map(c => (
                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: selectedCurtain === c.id ? 'var(--color-accent)' : '#A3B3C2' }}>
                          <input type="radio" checked={selectedCurtain === c.id} onChange={() => { setSelectedCurtain(c.id); updateUrl('curtain', c.id); }} style={{ accentColor: 'var(--color-accent)' }} />
                          {language === 'tr' ? c.nameTr : c.nameEn}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fabric Types Accordion */}
              {activeFabricTypes.length > 0 && (
                <div>
                  <div 
                    onClick={() => setIsFabricAccordionOpen(!isFabricAccordionOpen)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>Kumaş Türleri</span>
                    <span style={{ color: 'var(--color-accent)' }}>{isFabricAccordionOpen ? '−' : '+'}</span>
                  </div>
                  {isFabricAccordionOpen && (
                    <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: selectedFabric === 'all' ? 'var(--color-accent)' : '#A3B3C2' }}>
                        <input type="radio" checked={selectedFabric === 'all'} onChange={() => { setSelectedFabric('all'); updateUrl('fabric', 'all'); }} style={{ accentColor: 'var(--color-accent)' }} />
                        Tümü
                      </label>
                      {activeFabricTypes.map(f => (
                        <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: selectedFabric === f.id ? 'var(--color-accent)' : '#A3B3C2' }}>
                          <input type="radio" checked={selectedFabric === f.id} onChange={() => { setSelectedFabric(f.id); updateUrl('fabric', f.id); }} style={{ accentColor: 'var(--color-accent)' }} />
                          {language === 'tr' ? f.nameTr : f.nameEn}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Color Filter */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', margin: 0 }}>
                {t('catalog.color')}
              </label>
              {selectedColor !== 'all' && (
                <button 
                  onClick={() => setSelectedColor('all')} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {language === 'tr' ? 'Temizle' : 'Clear'}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', padding: '0.2rem 0' }}>
              {colorOptions.map(({ name, hex }) => {
                const isSelected = selectedColor === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedColor(name)}
                    title={name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isSelected ? '2.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                      backgroundColor: hex,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 10px rgba(189, 149, 75, 0.5)' : 'none',
                      position: 'relative'
                    }}
                  />
                );
              })}
            </div>
            {selectedColor !== 'all' && (
              <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.4rem', opacity: 0.8 }}>
                {selectedColor}
              </span>
            )}
          </div>
        </aside>

        {/* Products Column */}
        <div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                {t('catalog.noProducts')}
              </p>
              <button 
                className="btn-outline" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedColor('all');
                  setSelectedFabric('all');
                  setSearchQuery('');
                  setSortBy('order');
                }}
              >
                {t('catalog.backToCatalog')}
              </button>
            </div>
          ) : (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', display: 'grid' }}>
              {filteredProducts.map(product => {
                const title = language === 'tr' ? product.nameTr : product.nameEn;
                const catName = language === 'tr' ? product.categoryTr : product.categoryEn;
                const coverImage = product.coverImage || (product.images.length > 0 ? product.images[0] : '/assets/scandi.png');
                const desc = language === 'tr' ? product.descriptionTr : product.descriptionEn;
                
                return (
                  <div 
                    key={product.id} 
                    style={{ 
                      backgroundColor: 'var(--color-card-bg)', 
                      borderRadius: '4px', 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--color-border)',
                      transition: 'transform 0.3s ease'
                    }} 
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => router.push(`/urunler/${product.id}`)}
                  >
                    <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden' }}>
                      <Image 
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {catName}
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '0.8rem', lineHeight: 1.3 }}>
                        {title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {desc}
                      </p>
                      
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {product.colors.slice(0, 3).map((color, i) => (
                            <div 
                              key={i} 
                              style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color.hex || '#ccc', border: '1px solid rgba(255,255,255,0.2)' }} 
                            />
                          ))}
                          {product.colors.length > 3 && (
                            <div style={{ fontSize: '0.7rem', opacity: 0.7, display: 'flex', alignItems: 'center' }}>+{product.colors.length - 3}</div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)', fontWeight: 500 }}>
                          {language === 'tr' ? 'KOLEKSİYONU KEŞFET →' : 'EXPLORE COLLECTION →'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsCatalogClient(props: ProductsCatalogClientProps) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(189, 149, 75, 0.2)', borderTopColor: '#BD954B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    }>
      <ProductsCatalogContent {...props} />
    </Suspense>
  );
}
