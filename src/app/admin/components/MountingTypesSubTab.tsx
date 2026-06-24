import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { MountingType } from '@/context/dbTypes';
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

export default function MountingTypesSubTab() {
  const { mountingTypes: dbMountings, categories, curtainTypes, addMountingType, updateMountingType, deleteMountingType } = useDb();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MountingType>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCurtainTypeId, setSelectedCurtainTypeId] = useState<string>('all');
  const [items, setItems] = useState<MountingType[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
  }, []);

  useEffect(() => {
    if (dbMountings) {
      let filtered = [...dbMountings];
      if (selectedCategoryId !== 'all') {
        filtered = filtered.filter(m => m.categoryId === selectedCategoryId);
      }
      if (selectedCurtainTypeId !== 'all') {
        filtered = filtered.filter(m => m.curtainTypeId === selectedCurtainTypeId);
      }
      setItems(filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    }
  }, [dbMountings, selectedCategoryId, selectedCurtainTypeId]);

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
    for (const m of updatedList) {
      await updateMountingType(m);
    }
    setDraggedIndex(null);
  };

  const handleEdit = (item: MountingType) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : (categories[0]?.id || ''),
      curtainTypeId: '',
      nameTr: '',
      nameEn: '',
      descriptionTr: '',
      descriptionEn: '',
      status: 'active',
      displayOrder: items.length + 1,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'displayOrder') {
      setEditForm({ ...editForm, [name]: parseInt(value, 10) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!editForm.id || !editForm.nameTr || !editForm.categoryId || !editForm.curtainTypeId) {
      alert(t('admin.mountingTypes.alerts.fillNames'));
      return;
    }

    const finalForm = {
      ...editForm,
    } as MountingType;

    if (isAddingNew) {
      await addMountingType(finalForm);
    } else {
      await updateMountingType(finalForm);
    }
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.mountingTypes.alerts.confirmDelete'))) {
      await deleteMountingType(id);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const m = dbMountings.find(x => x.id === id);
    if (m) {
      const updated = {
        ...m,
        status: m.status === 'active' ? 'passive' as const : 'active' as const
      };
      await updateMountingType(updated);
    }
  };

  return (
    <div>
      {portalTarget && !editingId && createPortal(
        <button
          onClick={handleAddNew}
          style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {t('admin.mountingTypes.addNew')}
        </button>,
        portalTarget
      )}

      {!editingId && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ color: '#A3B3C2' }}>{t('admin.mountingTypes.sectorFilter')}</label>
          <select 
            value={selectedCategoryId} 
            onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedCurtainTypeId('all'); }}
            style={{ ...inputStyle, width: '250px', padding: '0.5rem' }}
          >
            <option value="all">{t('admin.mountingTypes.allSectors')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nameTr}</option>
            ))}
          </select>
          <label style={{ color: '#A3B3C2', marginLeft: '0.5rem' }}>{t('admin.mountingTypes.curtainFilter')}</label>
          <select 
            value={selectedCurtainTypeId} 
            onChange={(e) => setSelectedCurtainTypeId(e.target.value)}
            style={{ ...inputStyle, width: '250px', padding: '0.5rem' }}
            disabled={selectedCategoryId === 'all'}
          >
            <option value="all">{t('admin.mountingTypes.allCurtains')}</option>
            {curtainTypes?.filter(ct => selectedCategoryId === 'all' || ct.categoryId === selectedCategoryId).map(ct => (
              <option key={ct.id} value={ct.id}>{ct.nameTr}</option>
            ))}
          </select>
        </div>
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? t('admin.mountingTypes.addNewTitle') : t('admin.mountingTypes.editTitle')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.parentSector')}</label>
              <select name="categoryId" value={editForm.categoryId || ''} onChange={handleChange} style={inputStyle}>
                <option value="">{t('admin.mountingTypes.select')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nameTr}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.parentCurtain')}</label>
              <select name="curtainTypeId" value={editForm.curtainTypeId || ''} onChange={handleChange} style={inputStyle} disabled={!editForm.categoryId}>
                <option value="">{t('admin.mountingTypes.select')}</option>
                {curtainTypes?.filter(ct => ct.categoryId === editForm.categoryId).map(ct => (
                  <option key={ct.id} value={ct.id}>{ct.nameTr}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.nameTr')}</label>
              <input type="text" name="nameTr" value={editForm.nameTr || ''} onChange={handleChange} style={inputStyle} placeholder="Ör: Korniş Montajı" />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.nameEn')}</label>
              <input type="text" name="nameEn" value={editForm.nameEn || ''} onChange={handleChange} style={inputStyle} placeholder="Eg: Cornice Mount" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.mountingTypes.descTr')}</label>
              <textarea name="descriptionTr" value={editForm.descriptionTr || ''} onChange={handleChange} style={inputStyle} rows={3} placeholder={t('admin.mountingTypes.descPlaceholderTr')} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>{t('admin.mountingTypes.descEn')}</label>
              <textarea name="descriptionEn" value={editForm.descriptionEn || ''} onChange={handleChange} style={inputStyle} rows={3} placeholder={t('admin.mountingTypes.descPlaceholderEn')} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.displayOrder')}</label>
              <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={handleChange} style={inputStyle} min={1} />
            </div>
            <div>
              <label style={labelStyle}>{t('admin.mountingTypes.status')}</label>
              <select name="status" value={editForm.status || 'active'} onChange={handleChange} style={inputStyle}>
                <option value="active">{t('admin.mountingTypes.statusActive')}</option>
                <option value="passive">{t('admin.mountingTypes.statusPassive')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{t('admin.mountingTypes.save')}</button>
            <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{t('admin.mountingTypes.cancel')}</button>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center', width: '80px' }}>Sırala</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.mountingTypes.table.sector')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.mountingTypes.table.curtain')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.mountingTypes.table.name')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.mountingTypes.table.desc')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.mountingTypes.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.mountingTypes.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>{t('admin.mountingTypes.table.noData')}</td></tr>
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
                    <td style={{ padding: '1rem', color: '#A3B3C2' }}>{categories.find(cat => cat.id === item.categoryId)?.nameTr || '-'}</td>
                    <td style={{ padding: '1rem', color: '#A3B3C2', fontWeight: 500 }}>
                      {curtainTypes.find(ct => ct.id === item.curtainTypeId)?.nameTr || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.nameTr}</td>
                    <td style={{ padding: '1rem', color: '#A3B3C2' }}>{item.descriptionTr || '-'}</td>
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
                        {item.status === 'active' ? t('admin.mountingTypes.statusActive') : t('admin.mountingTypes.statusPassive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.4rem', width: '80px' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          title={t('admin.mountingTypes.edit')}
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
                            width: '100%',
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189,149,75,0.2)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.1)'; e.currentTarget.style.borderColor = 'rgba(189,149,75,0.3)'; }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title={t('admin.mountingTypes.delete')}
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
                            width: '100%',
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
