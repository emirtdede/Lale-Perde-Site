import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { Product, Category } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';
import { uploadImageToServer } from '@/utils/uploadImage';


const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const EditIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

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

interface ImageCropModalProps {
  imageSrc: string;
  type: 'cover' | 'detail';
  onCrop: (croppedWebp: string) => void;
  onCancel: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, type, onCrop, onCancel }) => {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerWidth = type === 'cover' ? 300 : 400;
  const containerHeight = type === 'cover' ? 400 : 300;

  const [initSize, setInitSize] = useState({ w: containerWidth, h: containerHeight });
  const imgRef = useRef<HTMLImageElement>(null);

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
    const canvasWidth = type === 'cover' ? 600 : 800;
    const canvasHeight = type === 'cover' ? 800 : 600;
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
          {type === 'cover' ? t('admin.products.crop.titleCover') : t('admin.products.crop.titleDetail')}
        </h3>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
          {t('admin.products.crop.info')}
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
            {t('admin.products.crop.saveBtn')}
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
            {t('admin.products.crop.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.8rem',
  background: 'rgba(15,24,32,0.8)',
  border: '1px solid rgba(189,149,75,0.3)',
  borderRadius: '4px', color: '#FFF', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem',
};

const namedColors = [
  { hex: '#000000', tr: 'Siyah', en: 'Black' },
  { hex: '#FFFFFF', tr: 'Beyaz', en: 'White' },
  { hex: '#FF0000', tr: 'Kırmızı', en: 'Red' },
  { hex: '#00FF00', tr: 'Yeşil', en: 'Green' },
  { hex: '#0000FF', tr: 'Mavi', en: 'Blue' },
  { hex: '#FFFF00', tr: 'Sarı', en: 'Yellow' },
  { hex: '#00FFFF', tr: 'Turkuaz Mavisi', en: 'Cyan' },
  { hex: '#FF00FF', tr: 'Eflatun', en: 'Magenta' },
  { hex: '#C0C0C0', tr: 'Açık Gümüş', en: 'Silver' },
  { hex: '#808080', tr: 'Gri', en: 'Grey' },
  { hex: '#A9A9A9', tr: 'Koyu Gri', en: 'Dark Grey' },
  { hex: '#800000', tr: 'Bordo', en: 'Maroon' },
  { hex: '#808000', tr: 'Zeytin', en: 'Olive' },
  { hex: '#008000', tr: 'Koyu Yeşil', en: 'Green' },
  { hex: '#800080', tr: 'Mor', en: 'Purple' },
  { hex: '#008080', tr: 'Teal Yeşil', en: 'Teal' },
  { hex: '#000080', tr: 'Lacivert', en: 'Navy' },
  { hex: '#F5F5DC', tr: 'Bej', en: 'Beige' },
  { hex: '#E6DFD3', tr: 'Kum Beji', en: 'Sand Beige' },
  { hex: '#FAF0E6', tr: 'Kırık Beyaz', en: 'Off-White' },
  { hex: '#FFFDD0', tr: 'Krem', en: 'Cream' },
  { hex: '#FFFFF0', tr: 'Fildişi', en: 'Ivory' },
  { hex: '#F5DEB3', tr: 'Buğday', en: 'Wheat' },
  { hex: '#FFD700', tr: 'Altın', en: 'Gold' },
  { hex: '#FFDB58', tr: 'Hardal', en: 'Mustard' },
  { hex: '#CD7F32', tr: 'Bronz', en: 'Bronze' },
  { hex: '#50C878', tr: 'Zümrüt Yeşili', en: 'Emerald Green' },
  { hex: '#36454F', tr: 'Kömür Grisi', en: 'Charcoal' },
  { hex: '#383E42', tr: 'Antrasit', en: 'Anthracite' },
  { hex: '#98FF98', tr: 'Nane Yeşili', en: 'Mint' },
  { hex: '#B76E79', tr: 'Gül Altın', en: 'Rose Gold' },
  { hex: '#FFC0CB', tr: 'Pembe', en: 'Pink' },
  { hex: '#FFDAB9', tr: 'Şeftali', en: 'Peach' },
  { hex: '#FA8072', tr: 'Somon', en: 'Salmon' },
  { hex: '#E2725B', tr: 'Kiremit', en: 'Terracotta' },
  { hex: '#7B3F00', tr: 'Çikolata', en: 'Chocolate' },
  { hex: '#964B00', tr: 'Kahverengi', en: 'Brown' },
  { hex: '#E6E6FA', tr: 'Lavanta', en: 'Lavender' },
  { hex: '#4B0082', tr: 'İndigo', en: 'Indigo' },
  { hex: '#40E0D0', tr: 'Turkuaz', en: 'Turquoise' },
  { hex: '#FFE4E1', tr: 'Pudra Pembe', en: 'Misty Rose' },
  { hex: '#D2B48C', tr: 'Tababa', en: 'Tan' },
  { hex: '#F0E68C', tr: 'Haki', en: 'Khaki' },
  { hex: '#B22222', tr: 'Kiremit Kırmızısı', en: 'Firebrick' },
  { hex: '#FF4500', tr: 'Turuncu', en: 'Orange' },
  { hex: '#FF8C00', tr: 'Koyu Turuncu', en: 'Dark Orange' },
  { hex: '#DA70D6', tr: 'Orkide', en: 'Orchid' },
  { hex: '#BA55D3', tr: 'Açık Mor', en: 'Medium Orchid' },
  { hex: '#4682B4', tr: 'Çelik Mavisi', en: 'Steel Blue' },
  { hex: '#87CEEB', tr: 'Açık Mavi', en: 'Sky Blue' },
  { hex: '#00BFFF', tr: 'Gök Mavisi', en: 'Deep Sky Blue' },
  { hex: '#1E90FF', tr: 'Harp Mavisi', en: 'Dodger Blue' },
  { hex: '#4169E1', tr: 'Kraliyet Mavisi', en: 'Royal Blue' },
  { hex: '#8B4513', tr: 'Koyu Kahve', en: 'Saddle Brown' },
  { hex: '#A0522D', tr: 'Sienna', en: 'Sienna' },
  { hex: '#BC8F8F', tr: 'Gül Kurusu', en: 'Rosy Brown' },
  { hex: '#DCDCDC', tr: 'Hafif Gri', en: 'Gainsboro' },
  { hex: '#F5F5F5', tr: 'Duman Beyazı', en: 'White Smoke' },
  { hex: '#F0F8FF', tr: 'Buz Mavisi', en: 'Alice Blue' },
  { hex: '#F8F8FF', tr: 'Hayalet Beyazı', en: 'Ghost White' },
  { hex: '#F0FFF0', tr: 'Çiğ Beyazı', en: 'Honeydew' },
  { hex: '#F5FFFA', tr: 'Nane Beyazı', en: 'Mint Cream' },
  { hex: '#F0FFFF', tr: 'Azure', en: 'Azure' },
  { hex: '#DFD3C3', tr: 'Kum Beji', en: 'Sand' },
  { hex: '#C7B198', tr: 'Koyu Bej', en: 'Warm Taupe' },
  { hex: '#8D7B68', tr: 'Taupe', en: 'Taupe' },
  { hex: '#F1DEC9', tr: 'Keten Beji', en: 'Linen' },
  { hex: '#D0C9C0', tr: 'Taş Grisi', en: 'Pebble Grey' },
  { hex: '#A0B2A6', tr: 'Adaçayı Yeşili', en: 'Sage Green' },
  { hex: '#EAE3D2', tr: 'Pirinç Kabuğu', en: 'Oatmeal' },
  { hex: '#707070', tr: 'Füme', en: 'Slate Grey' },
  { hex: '#4A4A4A', tr: 'Kurşuni Gri', en: 'Dim Grey' }
];

const hexToRgb = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return { r, g, b };
};

const getNearestColor = (hex: string) => {
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return { hex, tr: '', en: '' };
  }
  const target = hexToRgb(hex);
  let minDistance = Infinity;
  let nearest = namedColors[0];

  for (const nc of namedColors) {
    const current = hexToRgb(nc.hex);
    const distance = Math.sqrt(
      Math.pow(target.r - current.r, 2) +
      Math.pow(target.g - current.g, 2) +
      Math.pow(target.b - current.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = nc;
    }
  }
  return nearest;
};

export default function ProductsTab() {
  const { fetchProductsPaginated, categories: dbCategories, addProduct, updateProduct, deleteProduct, curtainTypes, fabricTypes, mountingTypes } = useDb();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [cropQueue, setCropQueue] = useState<{ url: string; type: 'cover' | 'detail' }[]>([]);
  const [newColorTr, setNewColorTr] = useState('');
  const [newColorEn, setNewColorEn] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    const res = await fetchProductsPaginated(1, 1000); // Admin can see up to 1000 products for reordering easily
    setProducts(res.data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

    const list = [...products];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setProducts(updatedList);
    for (const p of updatedList) {
      await updateProduct(p);
    }
    setDraggedIndex(null);
  };

  const handleHexChange = (hex: string) => {
    setNewColorHex(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const nearest = getNearestColor(hex);
      setNewColorTr(nearest.tr);
      setNewColorEn(nearest.en);
    }
  };

  const handleAddColor = () => {
    if (!newColorTr.trim() || !newColorEn.trim()) {
      showError(t('admin.products.alerts.fillColorNames'));
      return;
    }
    const colorObj = {
      nameTr: newColorTr.trim(),
      nameEn: newColorEn.trim(),
      hex: newColorHex
    };
    setEditForm(prev => ({
      ...prev,
      colors: [...(prev.colors || []), colorObj]
    }));
    setNewColorTr('');
    setNewColorEn('');
    setNewColorHex('#FFFFFF');
  };

  const handleRemoveColor = (idx: number) => {
    const currentColors = [...(editForm.colors || [])];
    currentColors.splice(idx, 1);
    setEditForm(prev => ({
      ...prev,
      colors: currentColors
    }));
  };

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbCategories) {
      setCategories(dbCategories);
    }
  }, [dbCategories]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm(product);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    const maxOrder = products.reduce((max, p) => (p.displayOrder > max ? p.displayOrder : max), 0);
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      id: `prod-${Date.now()}`,
      nameTr: '', nameEn: '',
      categoryTr: '', categoryEn: '', categoryId: categories[0]?.id || '1',
      descriptionTr: '', descriptionEn: '',
      priceMultiplier: 0,
      popularity: 50,
      status: 'active',
      images: [],
      coverImage: '',
      colors: [],
      techSpecsTr: [],
      techSpecsEn: [],
      fabricTypeTr: '', fabricTypeEn: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayOrder: maxOrder + 1
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'curtainTypeId') {
      setEditForm(prev => ({ ...prev, curtainTypeId: value, mountingTypeIds: [] }));
    } else if (name === 'categoryId') {
      setEditForm(prev => ({ ...prev, categoryId: value, curtainTypeId: '', mountingTypeIds: [] }));
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleMountingTypeToggle = (id: string) => {
    const currentIds = editForm.mountingTypeIds || [];
    if (currentIds.includes(id)) {
      setEditForm(prev => ({
        ...prev,
        mountingTypeIds: currentIds.filter(x => x !== id)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        mountingTypeIds: [...currentIds, id]
      }));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploadType: 'cover' | 'detail') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsConverting(true);
    try {
      const items: { url: string; type: 'cover' | 'detail' }[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await fileToDataUrl(files[i]);
        items.push({ url, type: uploadType });
      }
      setCropQueue(prev => [...prev, ...items]);
    } catch (err) {
      console.warn('Error reading files:', err);
      showError(t('admin.products.alerts.fileReadError'));
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedWebp: string) => {
    const currentCrop = cropQueue[0];
    if (!currentCrop) return;

    try {
      setIsConverting(true);
      const uploadedUrl = await uploadImageToServer(croppedWebp, 'products');
      
      if (currentCrop.type === 'cover') {
        setEditForm(prev => ({
          ...prev,
          coverImage: uploadedUrl
        }));
      } else {
        setEditForm(prev => ({
          ...prev,
          images: [...(prev.images || []), uploadedUrl]
        }));
      }
    } catch (error) {
      showError(t('admin.products.alerts.fileReadError'));
    } finally {
      setIsConverting(false);
      setCropQueue(prev => prev.slice(1));
    }
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
    if (!editForm.id) return;

    // Sync category names based on selected ID
    const cat = categories.find(c => c.id === editForm.categoryId);
    const finalForm = {
      ...editForm,
      categoryTr: cat?.nameTr || editForm.categoryTr,
      categoryEn: cat?.nameEn || editForm.categoryEn,
      updatedAt: new Date().toISOString()
    } as Product;

    if (isAddingNew) {
      const success = await addProduct(finalForm);
      if (success) {
        setIsAddingNew(false);
        setEditingId(finalForm.id);
        await loadData();
      }
    } else {
      const success = await updateProduct(finalForm);
      if (success) {
        await loadData();
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.products.alerts.confirmDelete'))) {
      await deleteProduct(id);
    }
  };

  return (
    <div>
      {portalTarget && !editingId && createPortal(
        <button
          onClick={handleAddNew}
          style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {t('admin.products.addNew')}
        </button>,
        portalTarget
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', padding: '1rem', borderRadius: '4px', border: '1px solid #DC2626', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {saveSuccess && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '1rem', borderRadius: '4px', border: '1px solid #10B981', marginBottom: '1.5rem' }}>
          Ürün başarıyla kaydedildi!
        </div>
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.products.addNewTitle') : t('admin.products.editTitle')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>{t('admin.products.nameTr')}</label>
              <input type="text" name="nameTr" value={editForm.nameTr || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.products.nameEn')}</label>
              <input type="text" name="nameEn" value={editForm.nameEn || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.products.parentSector')}</label>
              <select name="categoryId" value={editForm.categoryId || ''} onChange={handleChange} style={inputStyle}>
                <option value="">{t('admin.products.select')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTr}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>{t('admin.products.parentCurtain')}</label>
              <select 
                name="curtainTypeId" 
                value={editForm.curtainTypeId || ''} 
                onChange={handleChange} 
                style={inputStyle}
                disabled={!editForm.categoryId}
              >
                <option value="">{editForm.categoryId ? t('admin.products.select') : t('admin.products.selectSectorFirst')}</option>
                {curtainTypes?.filter(c => c.categoryId === editForm.categoryId).map(c => (
                  <option key={c.id} value={c.id}>{c.nameTr}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('admin.products.parentFabric')}</label>
              <select 
                name="fabricTypeId" 
                value={editForm.fabricTypeId || ''} 
                onChange={handleChange} 
                style={inputStyle}
                disabled={!editForm.categoryId}
              >
                <option value="">{editForm.categoryId ? t('admin.products.select') : t('admin.products.selectSectorFirst')}</option>
                {fabricTypes?.filter(f => f.categoryId === editForm.categoryId).map(f => (
                  <option key={f.id} value={f.id}>{f.nameTr}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('admin.products.status')}</label>
              <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                <option value="active">{t('admin.products.statusActive')}</option>
                <option value="draft">{t('admin.products.statusDraft')}</option>
                <option value="archived">{t('admin.products.statusArchived')}</option>
              </select>
            </div>
            {/* Mounting Types Checklist */}
            <div style={{ gridColumn: 'span 2', border: '1px solid rgba(189,149,75,0.2)', padding: '1.5rem', borderRadius: '6px', backgroundColor: 'rgba(15,24,32,0.4)', marginBottom: '1rem' }}>
              <label style={{ ...labelStyle, fontSize: '0.95rem', fontWeight: 600, color: '#FFF', marginBottom: '1rem' }}>{t('admin.products.mountingTypesLabel')}</label>
              {!editForm.categoryId ? (
                <p style={{ color: '#A3B3C2', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>{t('admin.products.mountingTypesSectorWarning')}</p>
              ) : !editForm.curtainTypeId ? (
                <p style={{ color: '#A3B3C2', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>{t('admin.products.mountingTypesCurtainWarning')}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {mountingTypes?.filter(m => m.categoryId === editForm.categoryId && m.curtainTypeId === editForm.curtainTypeId && m.status === 'active').map(m => {
                    const isChecked = (editForm.mountingTypeIds || []).includes(m.id);
                    return (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E0E6ED', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleMountingTypeToggle(m.id)}
                          style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{m.nameTr}</span>
                      </label>
                    );
                  })}
                  {mountingTypes?.filter(m => m.categoryId === editForm.categoryId && m.curtainTypeId === editForm.curtainTypeId && m.status === 'active').length === 0 && (
                    <p style={{ color: '#A3B3C2', fontSize: '0.9rem', margin: 0, gridColumn: 'span 3', fontStyle: 'italic' }}>{t('admin.products.mountingTypesNoData')}</p>
                  )}
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.products.descTr')}</label>
              <textarea name="descriptionTr" value={editForm.descriptionTr || ''} onChange={handleChange} rows={3} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.products.descEn')}</label>
              <textarea name="descriptionEn" value={editForm.descriptionEn || ''} onChange={handleChange} rows={3} style={inputStyle} />
            </div>

            {/* Color Palette Management */}
            <div style={{ gridColumn: 'span 2', border: '1px solid rgba(189,149,75,0.2)', padding: '1.5rem', borderRadius: '6px', backgroundColor: 'rgba(15,24,32,0.4)', marginBottom: '1rem' }}>
              <label style={{ ...labelStyle, fontSize: '0.95rem', fontWeight: 600, color: '#FFF', marginBottom: '1rem' }}>{t('admin.products.colorsLabel')}</label>

              {/* Existing colors list */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {(editForm.colors || []).map((color, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(189,149,75,0.3)', backgroundColor: 'rgba(15,24,32,0.8)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                    <span style={{ fontSize: '0.85rem', color: '#E0E6ED' }}>{color.nameTr} ({color.nameEn})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      style={{ background: 'none', border: 'none', color: '#FF6B6B', cursor: 'pointer', padding: '0 0.2rem', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                      title={t('admin.products.colorsDelete')}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(editForm.colors || []).length === 0 && (
                  <span style={{ color: '#A3B3C2', fontSize: '0.85rem', fontStyle: 'italic' }}>{t('admin.products.colorsNoData')}</span>
                )}
              </div>

              {/* Add color form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '0.3rem' }}>{t('admin.products.colorNameTr')}</label>
                  <input
                    type="text"
                    value={newColorTr}
                    onChange={(e) => setNewColorTr(e.target.value)}
                    placeholder="Ör: Kırık Beyaz"
                    style={{ ...inputStyle, padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '0.3rem' }}>{t('admin.products.colorNameEn')}</label>
                  <input
                    type="text"
                    value={newColorEn}
                    onChange={(e) => setNewColorEn(e.target.value)}
                    placeholder="Ör: Off-White"
                    style={{ ...inputStyle, padding: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem', marginBottom: '0.3rem' }}>{t('admin.products.colorHex')}</label>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: '4px', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      style={{ ...inputStyle, padding: '0.5rem', width: '80px', fontSize: '0.8rem', textAlign: 'center' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  style={{
                    background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                    color: '#FFF', border: 'none', padding: '0.6rem 1.2rem',
                    borderRadius: '4px', cursor: 'pointer', fontWeight: 600, height: '36px', display: 'flex', alignItems: 'center'
                  }}
                >
                  {t('admin.products.colorAddBtn')}
                </button>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.products.coverImageLabel')}</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '90px', height: '120px',
                  backgroundColor: '#1A242C', borderRadius: '6px',
                  backgroundImage: editForm.coverImage ? `url(${editForm.coverImage})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(189,149,75,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#A3B3C2', fontSize: '0.8rem',
                  flexShrink: 0
                }}>
                  {!editForm.coverImage && t('admin.products.coverNoImage')}
                </div>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  style={{
                    background: 'transparent', color: 'var(--color-accent)',
                    border: '1px solid var(--color-accent)', padding: '0.5rem 1rem',
                    borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                  }}
                >
                  {t('admin.products.coverSelect')}
                </button>
                {editForm.coverImage && (
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, coverImage: '' })}
                    style={{
                      background: 'transparent', color: '#FF6B6B',
                      border: '1px solid #FF6B6B', padding: '0.5rem 1rem',
                      borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    {t('admin.products.coverRemove')}
                  </button>
                )}
              </div>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
                style={{ display: 'none' }}
              />
            </div>

            {/* Multiple Image Uploads */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.products.detailImagesLabel')}</label>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                {(editForm.images || []).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(189,149,75,0.2)' }}>
                    <div style={{ width: '100%', height: '100%', backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      title="Görseli Kaldır"
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

                {/* Add image button */}
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
                    <span style={{ color: 'var(--color-accent)', fontSize: '0.7rem', textAlign: 'center' }}>{t('admin.products.converting')}</span>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#A3B3C2', fontSize: '0.7rem' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto 0.2rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {t('admin.products.addBtn')}
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'detail')}
                style={{ display: 'none' }}
              />
              <p style={{ color: '#A3B3C2', fontSize: '0.8rem', margin: 0 }}>
                {t('admin.products.detailImagesInfo')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
            <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.products.save')}</button>
            <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.products.cancel')}</button>
            {saveSuccess && (
              <span style={{ color: '#4CAF50', fontSize: '0.9rem', fontWeight: 600, marginLeft: '1rem' }}>
                {t('admin.products.saveSuccess')}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Sırala</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.products.table.image')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.products.table.name')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.products.table.category')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.products.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.products.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.products.table.noData')}</td></tr>
              ) : (
                products.map((product, idx) => (
                  <tr
                    key={product.id}
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
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#1A242C', borderRadius: '4px', backgroundImage: `url(${product.coverImage || product.images?.[0] || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{product.nameTr}</td>
                    <td style={{ padding: '1rem' }}>{product.categoryTr}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: product.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', color: product.status === 'active' ? '#4CAF50' : '#FF9800' }}>
                        {product.status === 'active' ? t('admin.products.statusActive') : product.status === 'draft' ? t('admin.products.statusDraft') : t('admin.products.statusArchived')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.4rem', width: 'auto' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          title={t('admin.products.editTitle')}
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
                          onClick={() => handleDelete(product.id)}
                          title={t('admin.products.table.actions')}
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
      {cropQueue.length > 0 && (
        <ImageCropModal
          imageSrc={cropQueue[0].url}
          type={cropQueue[0].type}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
