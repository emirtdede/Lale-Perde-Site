import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { FabricType, Category } from '@/context/dbTypes';
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

export default function FabricTypesSubTab() {
  const { fabricTypes: dbFabrics, categories, addFabricType, updateFabricType, deleteFabricType } = useDb();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FabricType>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [items, setItems] = useState<FabricType[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbFabrics) {
      let filtered = [...dbFabrics];
      if (selectedCategoryId !== 'all') {
        filtered = filtered.filter(f => f.categoryId === selectedCategoryId);
      }
      setItems(filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    }
  }, [dbFabrics, selectedCategoryId]);

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

    const list = [...items];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setItems(updatedList);
    for (const c of updatedList) {
      await updateFabricType(c);
    }
    setDraggedIndex(null);
  };

  const handleEdit = (item: FabricType) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : (categories[0]?.id || ''),
      nameTr: '',
      nameEn: '',
      slug: '',
      status: 'active',
      displayOrder: items.length + 1,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'displayOrder') {
      setEditForm({ ...editForm, [name]: parseInt(value, 10) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!editForm.categoryId || !editForm.nameTr) {
      showError(t('admin.fabricTypes.alerts.fillNames'));
      return;
    }

    let slug = editForm.slug;
    if (!slug) {
      slug = editForm.nameTr.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    const finalForm = {
      ...editForm,
      slug
    } as FabricType;

    if (isAddingNew) {
      await addFabricType(finalForm);
    } else {
      await updateFabricType(finalForm);
    }
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.fabricTypes.alerts.confirmDelete'))) {
      await deleteFabricType(id);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const f = dbFabrics.find(x => x.id === id);
    if (f) {
      const updated = {
        ...f,
        status: f.status === 'active' ? 'passive' as const : 'active' as const
      };
      await updateFabricType(updated);
    }
  };

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
          {t('admin.fabricTypes.addNew')}
        </button>,
        portalTarget
      )}

      {!editingId && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ color: '#A3B3C2' }}>{t('admin.fabricTypes.sectorFilter')}</label>
          <select 
            value={selectedCategoryId} 
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            style={{ ...inputStyle, width: '250px', padding: '0.5rem' }}
          >
            <option value="all">{t('admin.fabricTypes.allSectors')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nameTr}</option>
            ))}
          </select>
        </div>
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.fabricTypes.addNewTitle') : t('admin.fabricTypes.editTitle')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.parentSector')}</label>
              <select name="categoryId" value={editForm.categoryId || ''} onChange={handleChange} style={inputStyle}>
                <option value="">{t('admin.fabricTypes.select')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTr}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.nameTr')}</label>
              <input type="text" name="nameTr" value={editForm.nameTr || ''} onChange={handleChange} style={inputStyle} placeholder="Ör: Karartma Kumaş" />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.nameEn')}</label>
              <input type="text" name="nameEn" value={editForm.nameEn || ''} onChange={handleChange} style={inputStyle} placeholder="Eg: Blackout Fabric" />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.slug')}</label>
              <input type="text" name="slug" value={editForm.slug || ''} onChange={handleChange} style={inputStyle} placeholder="karartma-kumas" />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.displayOrder')}</label>
              <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={handleChange} style={inputStyle} min={1} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.fabricTypes.status')}</label>
              <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                <option value="active">{t('admin.fabricTypes.statusActive')}</option>
                <option value="passive">{t('admin.fabricTypes.statusPassive')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.fabricTypes.save')}</button>
            <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.fabricTypes.cancel')}</button>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>

                <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Sırala</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.fabricTypes.table.sector')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.fabricTypes.table.name')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.fabricTypes.table.english')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.fabricTypes.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.fabricTypes.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.fabricTypes.table.noData')}</td></tr>
              ) : (
                items.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: draggedIndex === idx ? 'rgba(189, 149, 75, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    draggable={!editingId && selectedCategoryId !== 'all'}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                  >

                    <td style={{ padding: '1rem', color: 'rgba(189, 149, 75, 0.6)', cursor: selectedCategoryId === 'all' || editingId ? 'default' : 'grab', userSelect: 'none', textAlign: 'center', fontSize: '1.2rem' }} title={selectedCategoryId === 'all' ? 'Sıralama için bir sektör filtreleyin' : 'Sürükle bırak ile sırala'}>
                      ☰
                    </td>
                    <td style={{ padding: '1rem', color: '#BD954B', whiteSpace: 'nowrap' }}>{categories.find(cat => cat.id === item.categoryId)?.nameTr}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.nameTr}</td>
                    <td style={{ padding: '1rem', color: '#A3B3C2' }}>{item.nameEn}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span
                        onClick={() => handleToggleStatus(item.id)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: item.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                          color: item.status === 'active' ? '#4CAF50' : '#FF9800',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.status === 'active' ? t('admin.fabricTypes.statusActive') : t('admin.fabricTypes.statusPassive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.4rem', width: 'auto' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          title={t('admin.fabricTypes.edit')}
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
                          onClick={() => handleDelete(item.id)}
                          title={t('admin.fabricTypes.delete')}
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
    </div>
  );
}
