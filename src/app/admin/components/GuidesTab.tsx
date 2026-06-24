import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { GuideItem } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';

const EditIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

interface ImageCropModalProps {
  imageSrc: string;
  onCrop: (croppedWebp: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, onCrop, onCancel }) => {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initSize, setInitSize] = useState({ w: 400, h: 200 });
  const imgRef = useRef<HTMLImageElement>(null);

  const containerWidth = 400;
  const containerHeight = 200;

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
    const canvasWidth = 800;
    const canvasHeight = 400;
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
          {t('admin.guides.crop.title')}
        </h3>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
          {t('admin.guides.crop.info')}
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
            {t('admin.guides.crop.saveBtn')}
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
            {t('admin.guides.crop.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GuidesTab() {
  const { guides: dbGuides, addGuide, updateGuide, deleteGuide } = useDb();
  const { t } = useLanguage();
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GuideItem>>({});
  const [isConverting, setIsConverting] = useState(false);
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

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

    const list = [...guides];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setGuides(updatedList);
    for (const g of updatedList) {
      await updateGuide(g);
    }
    setDraggedIndex(null);
  };

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbGuides) {
      setGuides([...dbGuides].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [dbGuides]);

  const handleEdit = (guide: GuideItem) => {
    setEditingId(guide.id);
    setEditForm(guide);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      id: `gd-${Date.now()}`,
      titleTr: '',
      titleEn: '',
      summaryTr: '',
      summaryEn: '',
      contentTr: '',
      contentEn: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      displayOrder: guides.length + 1
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.guides.alerts.confirmDelete'))) return;
    await deleteGuide(id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
      const url = await fileToDataUrl(files[0]);
      setCropQueue([url]);
    } catch (err) {
      console.error('Error reading file:', err);
      alert(t('admin.guides.alerts.fileReadError'));
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedWebp: string) => {
    setEditForm(prev => ({
      ...prev,
      image: croppedWebp
    }));
    setCropQueue([]);
  };

  const handleCropCancel = () => {
    setCropQueue([]);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const finalForm = { ...editForm, id: editForm.id || `gd-${Date.now()}` } as GuideItem;
    if (isAddingNew || editingId === 'new') {
      await addGuide(finalForm);
    } else {
      await updateGuide(finalForm);
    }
    handleCancel();
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem', fontWeight: 500 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.9rem' };

  return (
    <div>
      {portalTarget && !editingId && createPortal(
        <button
          onClick={handleAddNew}
          style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {t('admin.guides.addNew')}
        </button>,
        portalTarget
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.guides.addNewTitle') : t('admin.guides.editTitle')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Image Upload Area */}
            <div>
              <label style={labelStyle}>{t('admin.guides.coverImageLabel')}</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: '180px', height: '90px',
                  backgroundColor: '#1A242C', borderRadius: '6px',
                  backgroundImage: editForm.image ? `url(${editForm.image})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(189,149,75,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#A3B3C2', fontSize: '0.8rem'
                }}>
                  {!editForm.image && t('admin.guides.noImage')}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent', color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent)', padding: '0.5rem 1rem',
                    borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                  }}
                >
                  {isConverting ? t('admin.guides.uploading') : t('admin.guides.selectImage')}
                </button>
                {editForm.image && (
                  <button
                    onClick={() => setEditForm({ ...editForm, image: '' })}
                    style={{
                      background: 'transparent', color: '#FF6B6B',
                      border: '1px solid #FF6B6B', padding: '0.5rem 1rem',
                      borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    {t('admin.guides.removeImage')}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.guides.titleTr')}</label>
                <input type="text" name="titleTr" value={editForm.titleTr || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.guides.titleEn')}</label>
                <input type="text" name="titleEn" value={editForm.titleEn || ''} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.guides.summaryTr')}</label>
                <textarea name="summaryTr" value={editForm.summaryTr || ''} onChange={handleChange} rows={2} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.guides.summaryEn')}</label>
                <textarea name="summaryEn" value={editForm.summaryEn || ''} onChange={handleChange} rows={2} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.guides.contentTr')}</label>
                <textarea name="contentTr" value={editForm.contentTr || ''} onChange={handleChange} rows={6} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.guides.contentEn')}</label>
                <textarea name="contentEn" value={editForm.contentEn || ''} onChange={handleChange} rows={6} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.guides.publishDate')}</label>
                <input type="date" name="date" value={editForm.date || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.guides.displayOrder')}</label>
                <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={(e) => setEditForm({...editForm, displayOrder: parseInt(e.target.value, 10) || 1})} style={inputStyle} min={1} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.guides.status')}</label>
                <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                  <option value="active">{t('admin.guides.statusActive')}</option>
                  <option value="passive">{t('admin.guides.statusPassive')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.guides.save')}</button>
              <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.guides.cancel')}</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.guides.table.image')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.guides.table.title')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.guides.table.date')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.guides.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.guides.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {guides.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.guides.table.noData')}</td></tr>
              ) : (
                guides.map((guide, idx) => (
                  <tr 
                    key={guide.id} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: draggedIndex === idx ? 'rgba(189, 149, 75, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '1rem', color: 'rgba(189, 149, 75, 0.6)', cursor: 'grab', userSelect: 'none', textAlign: 'center' }}>
                      ☰
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '45px', 
                        backgroundColor: '#1A242C', 
                        borderRadius: '4px', 
                        backgroundImage: `url(${guide.image})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        border: '1px solid rgba(189,149,75,0.15)'
                      }} />
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {guide.titleTr} <span style={{ color: '#A3B3C2', fontSize: '0.85rem', display: 'block', marginTop: '0.2rem' }}>{guide.titleEn}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#A3B3C2' }}>
                      {new Date(guide.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        backgroundColor: guide.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', 
                        color: guide.status === 'active' ? '#4CAF50' : '#FF9800' 
                      }}>
                        {guide.status === 'active' ? t('admin.guides.statusPublished') : t('admin.guides.statusPassive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(guide)}
                        title={t('admin.guides.edit')}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(189, 149, 75, 0.3)',
                          color: 'var(--color-accent)',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.5rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189,149,75,0.1)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(189,149,75,0.3)'; }}
                      >
                        <EditIcon />
                      </button>

                      <button
                        onClick={() => handleDelete(guide.id)}
                        title={t('admin.guides.delete')}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255, 75, 75, 0.3)',
                          color: '#FF6B6B',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,75,75,0.1)'; e.currentTarget.style.borderColor = '#FF6B6B'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(255,75,75,0.3)'; }}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {cropQueue.length > 0 && (
        <ImageCropModal
          imageSrc={cropQueue[0]}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
