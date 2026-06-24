import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { Category } from '@/context/dbTypes';
import CurtainTypesSubTab from './CurtainTypesSubTab';
import FabricTypesSubTab from './FabricTypesSubTab';
import MountingTypesSubTab from './MountingTypesSubTab';
import { useLanguage } from '@/context/LanguageContext';

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

interface ImageCropModalProps {
  imageSrc: string;
  onCrop: (croppedWebp: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initSize, setInitSize] = useState({ w: 326, h: 500 });
  const imgRef = useRef<HTMLImageElement>(null);

  const containerWidth = 326;
  const containerHeight = 500;

  const clampOffset = (x: number, y: number, currentZoom: number) => {
    const W_render = initSize.w * currentZoom;
    const H_render = initSize.h * currentZoom;

    const maxBoundX = Math.max(0, (W_render - containerWidth) / 2);
    const minBoundX = Math.min(0, (containerWidth - W_render) / 2);

    const maxBoundY = Math.max(0, (H_render - containerHeight) / 2);
    const minBoundY = Math.min(0, (containerHeight - H_render) / 2);

    return {
      x: Math.max(minBoundX, Math.min(maxBoundX, x)),
      y: Math.max(minBoundY, Math.min(maxBoundY, y))
    };
  };

  useEffect(() => {
    setOffset(prev => clampOffset(prev.x, prev.y, zoom));
  }, [zoom, initSize]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = containerWidth / containerHeight;

    let w = containerWidth;
    let h = containerHeight;
    if (imageRatio > containerRatio) {
      w = containerHeight * imageRatio;
      h = containerHeight;
    } else {
      w = containerWidth;
      h = containerWidth / imageRatio;
    }
    setInitSize({ w, h });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const rawX = e.touches[0].clientX - dragStart.x;
    const rawY = e.touches[0].clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, zoom));
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const canvasWidth = 652;
    const canvasHeight = 1000;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W_render = initSize.w * zoom;
    const H_render = initSize.h * zoom;
    const Left = (containerWidth - W_render) / 2 + offset.x;
    const Top = (containerHeight - H_render) / 2 + offset.y;

    const scaleFactor = 2;
    const dw = W_render * scaleFactor;
    const dh = H_render * scaleFactor;
    const dx = Left * scaleFactor;
    const dy = Top * scaleFactor;

    ctx.drawImage(img, dx, dy, dw, dh);
    const webpData = canvas.toDataURL('image/webp', 0.85);
    onCrop(webpData);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 10, 15, 0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0F1820',
        border: '1px solid var(--color-accent)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: '#E0E6ED', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Görseli Kırp ve Dönüştür
        </h3>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
          Görseli sürükleyerek hizalayın. Zoom kaydırıcı ile boyutu ayarlayın.
        </p>

        {/* Cropper Viewport Container */}
        <div 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{
            position: 'relative',
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            overflow: 'hidden',
            borderRadius: '6px',
            border: '2px solid var(--color-accent)',
            cursor: 'move',
            backgroundColor: '#050B0F',
            userSelect: 'none'
          }}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Kırpılacak görsel"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${initSize.w}px`,
              height: `${initSize.h}px`,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#A3B3C2', fontSize: '0.8rem' }}>Zoom:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{
              flex: 1,
              accentColor: 'var(--color-accent)',
              height: '6px',
              borderRadius: '3px',
              background: '#1A2530',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ color: '#E0E6ED', fontSize: '0.8rem', minWidth: '30px' }}>{Math.round(zoom * 100)}%</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
          <button 
            onClick={handleCrop} 
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
              color: '#FFF',
              border: 'none',
              padding: '0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Kırp & Kaydet
          </button>
          <button 
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'transparent',
              color: '#A3B3C2',
              border: '1px solid #A3B3C2',
              padding: '0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#FFF'; e.currentTarget.style.borderColor = '#FFF'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#A3B3C2'; e.currentTarget.style.borderColor = '#A3B3C2'; }}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

const convertToWebP = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('Canvas context error'); return; }
        ctx.drawImage(img, 0, 0);
        const webpData = canvas.toDataURL('image/webp', 0.85);
        resolve(webpData);
      };
      img.onerror = () => reject('Image load error');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('File read error');
    reader.readAsDataURL(file);
  });
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  background: 'rgba(15,24,32,0.8)',
  border: '1px solid rgba(189,149,75,0.3)',
  borderRadius: '4px',
  color: '#FFF',
  outline: 'none',
  fontSize: '0.9rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#A3B3C2',
  marginBottom: '0.5rem',
};

export default function CategoriesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'sectors' | 'curtains' | 'fabrics' | 'mountings'>('sectors');
  
  const { categories: dbCategories, addCategory, updateCategory, deleteCategory } = useDb();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...categories];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setCategories(updatedList);
    for (const c of updatedList) {
      await updateCategory(c);
    }
    setDraggedIndex(null);
  };

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbCategories) {
      setCategories([...dbCategories].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [dbCategories]);

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({
      ...cat,
      images: cat.images && cat.images.length > 0 ? cat.images : (cat.image ? [cat.image] : [])
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      id: `cat-${Date.now()}`,
      nameTr: '',
      nameEn: '',
      image: '',
      images: [],
      status: 'active',
      displayOrder: categories.length + 1,
      descriptionTr: '',
      descriptionEn: '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'displayOrder') {
      setEditForm({ ...editForm, [name]: parseInt(value, 10) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject('File read error');
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsConverting(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await fileToDataUrl(files[i]);
        urls.push(url);
      }
      setCropQueue(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Error reading files:', err);
      alert('Dosyalar okunurken bir hata oluştu.');
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedWebp: string) => {
    setEditForm(prev => ({
      ...prev,
      images: [...(prev.images || []), croppedWebp]
    }));
    setCropQueue(prev => prev.slice(1));
  };

  const handleCropCancel = () => {
    setCropQueue(prev => prev.slice(1));
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...(editForm.images || [])];
    updated.splice(index, 1);
    setEditForm({ ...editForm, images: updated });
  };

  const handleSave = async () => {
    if (!editForm.id || !editForm.nameTr || !editForm.nameEn) {
      alert(t('admin.categories.alerts.fillNames'));
      return;
    }

    const finalForm = {
      ...editForm,
      image: editForm.images?.[0] || '',
    } as Category;

    if (isAddingNew) {
      await addCategory(finalForm);
    } else {
      await updateCategory(finalForm);
    }
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.categories.alerts.confirmDelete'))) {
      await deleteCategory(id);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat) {
      const updatedCat = {
        ...cat,
        status: cat.status === 'active' ? 'passive' as const : 'active' as const
      };
      await updateCategory(updatedCat);
    }
  };

  return (
    <div>
      {/* Sub Tabs Navigation */}
      {!editingId && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(189, 149, 75, 0.2)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setActiveSubTab('sectors')}
            style={{
              background: activeSubTab === 'sectors' ? 'rgba(189, 149, 75, 0.15)' : 'transparent',
              color: activeSubTab === 'sectors' ? '#BD954B' : '#A3B3C2',
              border: activeSubTab === 'sectors' ? '1px solid #BD954B' : '1px solid transparent',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {t('admin.categories.subTabs.sectors')}
          </button>
          <button 
            onClick={() => setActiveSubTab('curtains')}
            style={{
              background: activeSubTab === 'curtains' ? 'rgba(189, 149, 75, 0.15)' : 'transparent',
              color: activeSubTab === 'curtains' ? '#BD954B' : '#A3B3C2',
              border: activeSubTab === 'curtains' ? '1px solid #BD954B' : '1px solid transparent',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {t('admin.categories.subTabs.curtains')}
          </button>
          <button 
            onClick={() => setActiveSubTab('fabrics')}
            style={{
              background: activeSubTab === 'fabrics' ? 'rgba(189, 149, 75, 0.15)' : 'transparent',
              color: activeSubTab === 'fabrics' ? '#BD954B' : '#A3B3C2',
              border: activeSubTab === 'fabrics' ? '1px solid #BD954B' : '1px solid transparent',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {t('admin.categories.subTabs.fabrics')}
          </button>
          <button 
            onClick={() => setActiveSubTab('mountings')}
            style={{
              background: activeSubTab === 'mountings' ? 'rgba(189, 149, 75, 0.15)' : 'transparent',
              color: activeSubTab === 'mountings' ? '#BD954B' : '#A3B3C2',
              border: activeSubTab === 'mountings' ? '1px solid #BD954B' : '1px solid transparent',
              padding: '0.6rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {t('admin.categories.subTabs.mountings')}
          </button>
        </div>
      )}

      {activeSubTab === 'curtains' && <CurtainTypesSubTab />}
      {activeSubTab === 'fabrics' && <FabricTypesSubTab />}
      {activeSubTab === 'mountings' && <MountingTypesSubTab />}

      {activeSubTab === 'sectors' && (
        <>
          {portalTarget && !editingId && createPortal(
            <button
              onClick={handleAddNew}
              style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              {t('admin.categories.addNewSector')}
            </button>,
            portalTarget
          )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.categories.addNewTitle') : t('admin.categories.editTitle')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>{t('admin.categories.nameTr')}</label>
              <input type="text" name="nameTr" value={editForm.nameTr || ''} onChange={handleChange} style={inputStyle} placeholder="Ör: Tül Perdeler" />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.categories.nameEn')}</label>
              <input type="text" name="nameEn" value={editForm.nameEn || ''} onChange={handleChange} style={inputStyle} placeholder="Eg: Sheer Curtains" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.categories.descTr')}</label>
              <textarea name="descriptionTr" value={editForm.descriptionTr || ''} onChange={handleChange} rows={3} style={inputStyle} placeholder="Kategori açıklaması (Türkçe)" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.categories.descEn')}</label>
              <textarea name="descriptionEn" value={editForm.descriptionEn || ''} onChange={handleChange} rows={3} style={inputStyle} placeholder="Category description (English)" />
            </div>

            {/* Multiple Image Uploads */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.categories.images')}</label>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                {(editForm.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(189,149,75,0.2)' }}>
                    <div style={{ width: '100%', height: '100%', backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      title={t('admin.categories.removeImage')}
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '22px', height: '22px',
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none', borderRadius: '50%',
                        color: '#FF6B6B', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '90px', height: '90px',
                    borderRadius: '6px',
                    border: '2px dashed rgba(189,149,75,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(15,24,32,0.5)',
                    transition: 'border-color 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(189,149,75,0.4)'}
                >
                  {isConverting ? (
                    <span style={{ color: 'var(--color-accent)', fontSize: '0.7rem', textAlign: 'center' }}>{t('admin.categories.converting')}</span>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#A3B3C2', fontSize: '0.7rem' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto 0.2rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {t('admin.categories.addBtn')}
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <p style={{ color: '#A3B3C2', fontSize: '0.8rem', margin: 0 }}>
                {t('admin.categories.imagesInfo')}
              </p>
            </div>

            <div>
              <label style={labelStyle}>{t('admin.categories.displayOrder')}</label>
              <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={handleChange} style={inputStyle} min={1} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.categories.status')}</label>
              <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                <option value="active">{t('admin.categories.statusActive')}</option>
                <option value="passive">{t('admin.categories.statusPassive')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.categories.save')}</button>
            <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.categories.cancel')}</button>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Sırala</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.categories.table.image')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.categories.table.name')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.categories.table.english')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.categories.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.categories.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.categories.table.noData')}</td></tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr 
                    key={cat.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: draggedIndex === idx ? 'rgba(189, 149, 75, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    draggable={!editingId}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                  >
                    <td style={{ padding: '1rem', color: 'rgba(189, 149, 75, 0.6)', cursor: editingId ? 'default' : 'grab', userSelect: 'none', textAlign: 'center', fontSize: '1.2rem' }} title="Sürükle bırak ile sırala">
                      ☰
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        width: '50px', height: '50px', backgroundColor: '#1A242C', borderRadius: '6px',
                        backgroundImage: cat.image ? `url(${cat.image})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        border: '1px solid rgba(189,149,75,0.15)'
                      }} />
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{cat.nameTr}</td>
                    <td style={{ padding: '1rem', color: '#A3B3C2' }}>{cat.nameEn}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span
                        onClick={() => handleToggleStatus(cat.id)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: cat.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                          color: cat.status === 'active' ? '#4CAF50' : '#FF9800',
                          transition: 'all 0.2s'
                        }}
                      >
                        {cat.status === 'active' ? t('admin.categories.statusActive') : t('admin.categories.statusPassive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.4rem', width: 'auto' }}>
                        <button
                          onClick={() => handleEdit(cat)}
                          title={t('admin.categories.edit')}
                          style={{
                            background: 'rgba(189, 149, 75, 0.1)',
                            border: '1px solid rgba(189, 149, 75, 0.3)',
                            color: 'var(--color-accent)',
                            padding: '0.4rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189,149,75,0.2)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.1)'; e.currentTarget.style.borderColor = 'rgba(189,149,75,0.3)'; }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          title={t('admin.categories.delete')}
                          style={{
                            background: 'rgba(255, 75, 75, 0.1)',
                            border: '1px solid rgba(255, 75, 75, 0.3)',
                            color: '#FF6B6B',
                            padding: '0.4rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,75,75,0.2)'; e.currentTarget.style.borderColor = '#FF6B6B'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255,75,75,0.3)'; }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
      {cropQueue.length > 0 && activeSubTab === 'sectors' && (
        <ImageCropModal
          imageSrc={cropQueue[0]}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
