'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/context/DbContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CommentsTab() {
  const { comments: dbComments, addComment, updateComment, deleteComment, fetchCommentsLazy } = useDb();
  const { t, language } = useLanguage();

  const [comments, setComments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('admin-tab-actions'));
    fetchCommentsLazy?.();
  }, [fetchCommentsLazy]);

  useEffect(() => {
    if (dbComments) {
      setComments([...dbComments].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [dbComments]);

  const handleEdit = (comment: any) => {
    setEditingId(comment.id);
    setEditForm(comment);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setEditForm({
      id: `comm-${Date.now()}`,
      author: '',
      contentTr: '',
      contentEn: '',
      rating: 5,
      isActive: true,
      displayOrder: comments.length + 1
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'tr' ? 'Bu yorumu silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this comment?')) return;
    await deleteComment(id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAddingNew(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: val });
  };

  const handleSave = async () => {
    if (!editingId) return;
    const finalForm = { ...editForm, id: editForm.id || `comm-${Date.now()}` };
    if (isAddingNew || editingId === 'new') {
      await addComment(finalForm);
    } else {
      await updateComment(finalForm);
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
          {language === 'tr' ? 'Yeni Yorum Ekle' : 'Add New Comment'}
        </button>,
        portalTarget
      )}

      {editingId ? (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFF', marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            {isAddingNew ? (language === 'tr' ? 'Yeni Yorum Ekle' : 'Add New Comment') : (language === 'tr' ? 'Yorum Düzenle' : 'Edit Comment')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{language === 'tr' ? 'Yazar / Müşteri Adı' : 'Author / Customer Name'}</label>
                <input type="text" name="author" value={editForm.author || ''} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>{language === 'tr' ? 'Puan (1-5)' : 'Rating (1-5)'}</label>
                <select name="rating" value={editForm.rating || 5} onChange={(e) => setEditForm({...editForm, rating: parseInt(e.target.value)})} style={inputStyle}>
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★</option>
                  <option value={3}>3 ★★★</option>
                  <option value={2}>2 ★★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{language === 'tr' ? 'Yorum İçeriği (Türkçe)' : 'Comment Content (Turkish)'}</label>
                <textarea name="contentTr" value={editForm.contentTr || ''} onChange={handleChange} rows={4} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>{language === 'tr' ? 'Yorum İçeriği (İngilizce)' : 'Comment Content (English)'}</label>
                <textarea name="contentEn" value={editForm.contentEn || ''} onChange={handleChange} rows={4} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>{language === 'tr' ? 'Sıralama' : 'Display Order'}</label>
                <input type="number" name="displayOrder" value={editForm.displayOrder || 1} onChange={(e) => setEditForm({...editForm, displayOrder: parseInt(e.target.value) || 1})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem' }}>
                <label style={{ color: '#E0E6ED', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" checked={!!editForm.isActive} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#BD954B' }} />
                  {language === 'tr' ? 'Yorum Aktif (Anasayfada Göster)' : 'Comment Active (Show on Home Page)'}
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #BD954B, #A57E3B)', color: '#FFF', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{language === 'tr' ? 'Kaydet' : 'Save'}</button>
              <button onClick={handleCancel} style={{ background: 'transparent', color: '#A3B3C2', border: '1px solid #A3B3C2', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer' }}>{language === 'tr' ? 'İptal' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{language === 'tr' ? 'Yazar' : 'Author'}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{language === 'tr' ? 'Yorum' : 'Comment'}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{language === 'tr' ? 'Puan' : 'Rating'}</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>{language === 'tr' ? 'Durum' : 'Status'}</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>{language === 'tr' ? 'Yorum bulunamadı.' : 'No comments found.'}</td></tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{comment.author}</td>
                    <td style={{ padding: '1rem', color: '#A3B3C2', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {language === 'tr' ? comment.contentTr : comment.contentEn}
                    </td>
                    <td style={{ padding: '1rem', color: '#BD954B' }}>{Array.from({ length: comment.rating }).map(() => '★')}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: comment.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: comment.isActive ? '#10B981' : '#EF4444'
                      }}>
                        {comment.isActive ? (language === 'tr' ? 'Aktif' : 'Active') : (language === 'tr' ? 'Pasif' : 'Passive')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEdit(comment)}
                          style={{ background: 'rgba(189, 149, 75, 0.1)', border: '1px solid rgba(189,149,75,0.2)', color: 'var(--color-accent)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          {language === 'tr' ? 'Düzenle' : 'Edit'}
                        </button>
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          {language === 'tr' ? 'Sil' : 'Delete'}
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
