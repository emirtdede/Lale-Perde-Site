import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { ServiceItem } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';
import { uploadImageToServer } from '@/utils/uploadImage';


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
  const [initSize, setInitSize] = useState({ w: 400, h: 225 });
  const imgRef = useRef<HTMLImageElement>(null);

  const containerWidth = 400;
  const containerHeight = 225;

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
    const canvasHeight = 450;
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
      }}>
        <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', alignSelf: 'flex-start' }}>Görseli Kes</h4>
        <div style={{
          width: `${containerWidth}px`, height: `${containerHeight}px`,
          position: 'relative', overflow: 'hidden', backgroundColor: '#000',
          cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '6px'
        }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={handleImageLoad}
            alt="To crop"
            style={{
              position: 'absolute',
              userSelect: 'none',
              pointerEvents: 'none',
              transform: `translate(-50%, -50%)`,
              left: `calc(50% + ${offset.x}px)`,
              top: `calc(50% + ${offset.y}px)`,
              width: `${initSize.w * zoom}px`,
              height: `${initSize.h * zoom}px`
            }}
          />
        </div>
        <div style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#A3B3C2', fontSize: '0.85rem' }}>{t('admin.services.zoom')}:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-accent)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
          <button onClick={handleCrop} style={{ flex: 1, background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.services.cropAndSave')}</button>
          <button onClick={onCancel} style={{ flex: 1, background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}>{t('admin.services.cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default function ServicesTab() {
  const { services: dbServices, addService, updateService, deleteService } = useDb();
  const { t, language } = useLanguage();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  // Drag and Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

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

    const list = [...services];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setServices(updatedList);
    for (const s of updatedList) {
      await updateService(s);
    }
    setDraggedIndex(null);
  };

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbServices) {
      setServices([...dbServices].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [dbServices]);

  const handleEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditForm({
      ...service,
      focalX: service.focalX !== undefined ? service.focalX : 50,
      focalY: service.focalY !== undefined ? service.focalY : 50
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      id: `srv-${Date.now()}`,
      titleTr: '',
      titleEn: '',
      descriptionTr: '',
      descriptionEn: '',
      icon: 'Ruler',
      status: 'active',
      image: '',
      focalX: 50,
      focalY: 50,
      displayOrder: services.length + 1
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.services.alerts.confirmDelete'))) return;
    await deleteService(id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Focal Point Picker calculation
  const handleFocalPointSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setEditForm(prev => ({
      ...prev,
      focalX: x,
      focalY: y
    }));
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
      console.warn('Error reading file:', err);
      showError(t('admin.services.alerts.fileReadError'));
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedWebp: string) => {
    try {
      setIsConverting(true);
      const uploadedUrl = await uploadImageToServer(croppedWebp, 'services');
      setEditForm(prev => ({
        ...prev,
        image: uploadedUrl
      }));
    } catch (e) {
      console.warn(e);
      showError(t('admin.services.alerts.fileReadError'));
    } finally {
      setIsConverting(false);
      setCropQueue([]);
    }
  };

  const handleCropCancel = () => {
    setCropQueue([]);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const finalForm = { ...editForm, id: editForm.id || `srv-${Date.now()}` } as ServiceItem;
    if (isAddingNew || editingId === 'new') {
      await addService(finalForm);
    } else {
      await updateService(finalForm);
    }
    handleCancel();
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem', fontWeight: 500 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none', fontSize: '0.9rem' };

  return (
    <div>

      {error && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', padding: '1rem', borderRadius: '4px', border: '1px solid #DC2626', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {portalTarget && !editingId && createPortal(
        <button
          onClick={handleAddNew}
          style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {t('admin.services.addNew')}
        </button>,
        portalTarget
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.services.addNewTitle') : t('admin.services.editTitle')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Image Upload and Focal Point Picker */}
            <div>
              <label style={labelStyle}>{t('admin.services.coverImageLabel')}</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                
                {/* Visual Focal Point Selector Board */}
                <div 
                  onClick={editForm.image ? handleFocalPointSelect : undefined}
                  style={{
                    width: '320px', height: '180px',
                    backgroundColor: '#1A242C', borderRadius: '8px',
                    backgroundImage: editForm.image ? `url(${editForm.image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '2px solid rgba(189,149,75,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#A3B3C2', fontSize: '0.85rem',
                    position: 'relative',
                    cursor: editForm.image ? 'crosshair' : 'default',
                    overflow: 'hidden'
                  }}
                >
                  {!editForm.image && t('admin.services.noImage')}
                  
                  {/* Crosshair indicator overlay */}
                  {editForm.image && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${editForm.focalX}%`,
                        top: `${editForm.focalY}%`,
                        width: '24px', height: '24px',
                        border: '2px solid #BD954B',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(26, 46, 64, 0.6)',
                        pointerEvents: 'none',
                        boxShadow: '0 0 8px #BD954B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '4px', height: '4px', backgroundColor: '#BD954B', borderRadius: '50%' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'transparent', color: 'var(--color-accent)',
                      border: '1px solid var(--color-accent)', padding: '0.5rem 1rem',
                      borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                    }}
                  >
                    {isConverting ? t('admin.services.uploading') : t('admin.services.selectImage')}
                  </button>
                  {editForm.image && (
                    <button
                      onClick={() => setEditForm({ ...editForm, image: '', focalX: 50, focalY: 50 })}
                      style={{
                        background: 'transparent', color: '#FF6B6B',
                        border: '1px solid #FF6B6B', padding: '0.5rem 1rem',
                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                      }}
                    >
                      {t('admin.services.removeImage')}
                    </button>
                  )}
                  {editForm.image && (
                    <div style={{ fontSize: '0.8rem', color: '#A3B3C2', marginTop: '0.5rem' }}>
                      Odak Noktası: X: {editForm.focalX}%, Y: {editForm.focalY}%
                    </div>
                  )}
                </div>
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
                <label style={labelStyle}>{t('admin.services.titleTr')}</label>
                <input type="text" name="titleTr" value={editForm.titleTr || ''} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.services.titleEn')}</label>
                <input type="text" name="titleEn" value={editForm.titleEn || ''} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.services.descTr')}</label>
                <textarea name="descriptionTr" value={editForm.descriptionTr || ''} onChange={handleChange} rows={3} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.services.descEn')}</label>
                <textarea name="descriptionEn" value={editForm.descriptionEn || ''} onChange={handleChange} rows={3} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{t('admin.services.icon')}</label>
                <select name="icon" value={editForm.icon || 'Ruler'} onChange={handleChange} style={inputStyle}>
                  <option value="Ruler">{t('admin.services.icons.ruler')}</option>
                  <option value="Palette">{t('admin.services.icons.palette')}</option>
                  <option value="Wrench">{t('admin.services.icons.wrench')}</option>
                  <option value="Lightbulb">{t('admin.services.icons.lightbulb')}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('admin.services.displayOrder')}</label>
                <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={(e) => setEditForm({...editForm, displayOrder: parseInt(e.target.value, 10) || 1})} style={inputStyle} min={1} />
              </div>
              <div>
                <label style={labelStyle}>{t('admin.services.status')}</label>
                <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                  <option value="active">{t('admin.services.statusActive')}</option>
                  <option value="passive">{t('admin.services.statusPassive')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.services.save')}</button>
              <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.services.cancel')}</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.services.table.image')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.services.table.title')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.services.table.desc')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.services.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.services.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.services.table.noData')}</td></tr>
              ) : (
                services.map((service, idx) => (
                  <tr 
                    key={service.id} 
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
                      {service.image ? (
                        <div style={{
                          width: '80px', height: '45px',
                          borderRadius: '4px',
                          backgroundImage: `url(${service.image})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: '1px solid rgba(189,149,75,0.15)'
                        }} />
                      ) : (
                        <div style={{ width: '80px', height: '45px', backgroundColor: '#1A242C', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3B3C2', fontSize: '0.75rem', border: '1px solid rgba(189,149,75,0.1)' }}>
                          {t('admin.services.noImage')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {language === 'tr' ? service.titleTr : service.titleEn}
                    </td>
                    <td style={{ padding: '1rem', color: '#A3B3C2', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {language === 'tr' ? service.descriptionTr : service.descriptionEn}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: service.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: service.status === 'active' ? '#10B981' : '#EF4444'
                      }}>
                        {service.status === 'active' ? t('admin.services.statusActive') : t('admin.services.statusPassive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEdit(service)}
                          style={{ background: 'rgba(189, 149, 75, 0.1)', border: '1px solid rgba(189,149,75,0.2)', color: 'var(--color-accent)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <EditIcon />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
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
