import React, { useEffect, useState } from 'react';
import { useDb } from '@/context/DbContext';
import { Campaign, SystemSettings } from '@/context/dbTypes';
import { useLanguage } from '@/context/LanguageContext';

const emptyCampaign: Omit<Campaign, 'id'> = {
  titleTr: '',
  titleEn: '',
  descriptionTr: '',
  descriptionEn: '',
  isActive: true,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  displayOrder: 1,
  duration: 8,
};

export default function CampaignsTab() {
  const { campaigns: dbCampaigns, settings: dbSettings, updateSettings, addCampaign, updateCampaign, deleteCampaign } = useDb();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // CRUD states
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<Omit<Campaign, 'id'>>(emptyCampaign);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (dbSettings) {
      setSettings(dbSettings);
    }
  }, [dbSettings]);

  useEffect(() => {
    if (dbCampaigns) {
      setCampaigns([...dbCampaigns].sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1)));
    }
  }, [dbCampaigns]);

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

    const list = [...campaigns];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const updatedList = list.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setCampaigns(updatedList);
    for (const c of updatedList) {
      await updateCampaign(c);
    }
    setDraggedIndex(null);
  };

  const handleBannerSave = () => {
    if (settings) {
      updateSettings(settings);
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3000);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      ...emptyCampaign,
      displayOrder: campaigns.length + 1
    });
    setShowForm(true);
  };

  const handleOpenEdit = (camp: Campaign) => {
    setEditingCampaign(camp);
    setFormData({
      titleTr: camp.titleTr,
      titleEn: camp.titleEn,
      descriptionTr: camp.descriptionTr,
      descriptionEn: camp.descriptionEn,
      isActive: camp.isActive,
      startDate: camp.startDate,
      endDate: camp.endDate,
      displayOrder: camp.displayOrder || 1,
      duration: camp.duration || 8,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCampaign(null);
    setFormData(emptyCampaign);
  };

  const handleFormSave = async () => {
    if (!formData.titleTr.trim()) return;
    setSaving(true);

    if (editingCampaign) {
      await updateCampaign({ ...formData, id: editingCampaign.id });
    } else {
      const newId = `camp-${Date.now()}`;
      await addCampaign({ ...formData, id: newId });
    }

    setSaving(false);
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    setDeleteConfirmId(null);
  };

  const handleToggleActive = async (camp: Campaign) => {
    await updateCampaign({ ...camp, isActive: !camp.isActive });
  };

  if (!settings) return null;

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
    fontWeight: 500,
  };

  return (
    <div>
      {/* Campaigns List */}
      <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <h3 style={{ color: '#E0E6ED' }}>{t('admin.campaigns.title')}</h3>
          <button 
            onClick={handleOpenCreate}
            style={{ 
              background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
              color: '#FFF', 
              border: 'none', 
              padding: '0.6rem 1.5rem', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {t('admin.campaigns.newBtn')}
          </button>
        </div>

        {/* Campaigns Table */}
        {campaigns.length === 0 ? (
          !showForm ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#A3B3C2' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('admin.campaigns.noData')}</p>
              <p style={{ fontSize: '0.8rem' }}>{t('admin.campaigns.noDataHint')}</p>
            </div>
          ) : null
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', width: '40px' }}></th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.campaigns.table.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.campaigns.table.name')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.campaigns.table.order')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('admin.campaigns.table.duration')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.campaigns.table.start')}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('admin.campaigns.table.end')}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('admin.campaigns.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, idx) => (
                <tr 
                  key={camp.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: draggedIndex === idx ? 'rgba(189, 149, 75, 0.1)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  draggable={!showForm}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                >
                  <td style={{ padding: '1rem', color: 'rgba(189, 149, 75, 0.6)', cursor: showForm ? 'default' : 'grab', userSelect: 'none', textAlign: 'center' }}>
                    ☰
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                       onClick={() => handleToggleActive(camp)}
                       style={{ 
                         padding: '0.3rem 0.6rem', 
                         borderRadius: '4px', 
                         fontSize: '0.8rem', 
                         backgroundColor: camp.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                         color: camp.isActive ? '#4CAF50' : '#A3B3C2',
                         border: `1px solid ${camp.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                         cursor: 'pointer',
                         transition: 'all 0.2s'
                       }}
                    >
                      {camp.isActive ? t('admin.campaigns.statusActive') : t('admin.campaigns.statusPassive')}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{camp.titleTr}</div>
                    {camp.descriptionTr && <div style={{ fontSize: '0.8rem', color: '#A3B3C2', marginTop: '0.2rem' }}>{camp.descriptionTr}</div>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{camp.displayOrder || 1}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{camp.duration || 8}</td>
                  <td style={{ padding: '1rem' }}>{new Date(camp.startDate).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '1rem' }}>{new Date(camp.endDate).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(camp)}
                        title={t('admin.campaigns.edit')}
                        style={{
                          background: 'rgba(189, 149, 75, 0.1)',
                          color: 'var(--color-accent)',
                          border: '1px solid rgba(189, 149, 75, 0.3)',
                          padding: '0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                      </button>

                      {deleteConfirmId === camp.id ? (
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            onClick={() => handleDelete(camp.id)}
                            style={{
                              background: 'rgba(255, 75, 75, 0.15)',
                              color: '#FF6B6B',
                              border: '1px solid rgba(255, 75, 75, 0.4)',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            {t('admin.campaigns.confirmDelete')}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            style={{
                              background: 'transparent',
                              color: '#A3B3C2',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            {t('admin.campaigns.cancelDelete')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(camp.id)}
                          title={t('admin.campaigns.delete')}
                          style={{
                            background: 'rgba(255, 75, 75, 0.08)',
                            color: '#FF6B6B',
                            border: '1px solid rgba(255, 75, 75, 0.2)',
                            padding: '0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Create / Edit Form */}
        <div style={{
          maxHeight: showForm ? '600px' : '0',
          opacity: showForm ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.35s ease-in-out',
          marginTop: showForm ? '1.5rem' : '0'
        }}>
          {showForm && (
            <div style={{
              background: 'rgba(15, 24, 32, 0.95)',
              border: '1px solid var(--color-accent)',
              borderRadius: '6px',
              padding: '1.5rem',
            }}>
              <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                {editingCampaign ? t('admin.campaigns.formTitleEdit') : t('admin.campaigns.formTitleAdd')}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.nameTr')}</label>
                  <input type="text" value={formData.titleTr} onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.nameEn')}</label>
                  <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.descTr')}</label>
                  <input type="text" value={formData.descriptionTr} onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.descEn')}</label>
                  <input type="text" value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.startDate')}</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.endDate')}</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.durationSec')}</label>
                  <input 
                    type="number" 
                    min="2" 
                    max="60" 
                    value={formData.duration || 8} 
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 8 })} 
                    style={inputStyle} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>{t('admin.campaigns.displayOrder')}</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.displayOrder || 1} 
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })} 
                    style={inputStyle} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.8rem' }}>
                  <label style={{ color: '#A3B3C2', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                      style={{ accentColor: '#BD954B', width: '16px', height: '16px' }}
                    />
                    {t('admin.campaigns.statusLabel')}
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleFormSave}
                  disabled={saving || !formData.titleTr.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: saving || !formData.titleTr.trim() ? 0.6 : 1,
                  }}
                >
                  {saving ? t('admin.campaigns.saving') : editingCampaign ? t('admin.campaigns.update') : t('admin.campaigns.save')}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'transparent',
                    color: '#A3B3C2',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {t('admin.campaigns.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
