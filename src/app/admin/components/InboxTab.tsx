import React, { useEffect, useState } from 'react';
import { useDb } from '@/context/DbContext';
import { InboxMessage } from '@/context/dbTypes';

export default function InboxTab() {
  const { fetchInboxPaginated, updateInboxMessage } = useDb();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [activeView, setActiveView] = useState<'inbox' | 'archive'>('inbox');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const [archivePage, setArchivePage] = useState(1);
  const [inboxPage, setInboxPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchInboxPaginated(1, 500);
    setMessages(res.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAsRead = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      const updatedMsg = { ...msg, isRead: true };
      await updateInboxMessage(updatedMsg);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updatedMsg);
      }
    }
  };

  const toggleResolved = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      const updatedMsg = { ...msg, isResolved: !msg.isResolved };
      await updateInboxMessage(updatedMsg);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updatedMsg);
      }
    }
  };

  const archiveMessage = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      if (!msg.isResolved) {
        setAlert({
          message: 'Durumu "Bekliyor" olan içerikler çözülmeden arşivlenemez!',
          type: 'warning'
        });
        setTimeout(() => setAlert(null), 5000);
        return;
      }
      const updatedMsg = { ...msg, isArchived: true };
      await updateInboxMessage(updatedMsg);
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null); // Close if archived
      }
      setAlert({
        message: 'İçerik başarıyla arşivlendi.',
        type: 'success'
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const restoreMessage = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      const updatedMsg = { ...msg, isArchived: false };
      await updateInboxMessage(updatedMsg);
      setAlert({
        message: 'İçerik tekrar gelen kutusuna taşındı.',
        type: 'success'
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const openMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  const activeMessages = messages.filter(m => !m.isArchived);
  const archivedMessages = messages.filter(m => m.isArchived);

  // Pagination for Active Messages (10 per page)
  const totalInboxPages = Math.ceil(activeMessages.length / 10) || 1;
  const paginatedInbox = activeMessages.slice((inboxPage - 1) * 10, inboxPage * 10);

  // Pagination for Archived Messages (10 per page)
  const totalArchivePages = Math.ceil(archivedMessages.length / 10) || 1;
  const paginatedArchived = archivedMessages.slice((archivePage - 1) * 10, archivePage * 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Alert Component */}
      {alert && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          backgroundColor: alert.type === 'warning' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(76, 175, 80, 0.15)',
          border: `1px solid ${alert.type === 'warning' ? '#FF6B6B' : '#4CAF50'}`,
          color: alert.type === 'warning' ? '#FF6B6B' : '#81C784',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.95rem',
          fontWeight: 500,
          transition: 'all 0.3s ease'
        }}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
        </div>
      )}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(189, 149, 75, 0.2)', paddingBottom: '1rem' }}>
        <button
          onClick={() => { setActiveView('inbox'); setSelectedMessage(null); }}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            background: activeView === 'inbox' ? 'var(--color-accent)' : 'transparent',
            color: activeView === 'inbox' ? '#0A1118' : 'var(--color-accent)',
            border: '1px solid var(--color-accent)'
          }}
        >
          Gelen Kutusu ({activeMessages.length})
        </button>
        <button
          onClick={() => { setActiveView('archive'); setSelectedMessage(null); }}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            background: activeView === 'archive' ? 'var(--color-accent)' : 'transparent',
            color: activeView === 'archive' ? '#0A1118' : 'var(--color-accent)',
            border: '1px solid var(--color-accent)'
          }}
        >
          Arşivlenmiş İletiler ({archivedMessages.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 400px' : '1fr', gap: '2rem' }}>
        <div>
          <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
              <thead style={{ backgroundColor: 'rgba(189, 149, 75, 0.1)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Durum</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Gönderen</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Tür</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Konu</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Tarih</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {activeView === 'inbox' ? (
                  paginatedInbox.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#A3B3C2' }}>Gelen kutusu boş.</td>
                    </tr>
                  ) : (
                    paginatedInbox.map(msg => (
                      <tr 
                        key={msg.id} 
                        onClick={() => openMessage(msg)}
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          cursor: 'pointer',
                          backgroundColor: selectedMessage?.id === msg.id ? 'rgba(189, 149, 75, 0.05)' : msg.isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
                          fontWeight: msg.isRead ? 'normal' : 'bold'
                        }}
                      >
                        <td style={{ padding: '1rem' }}>
                          {!msg.isRead && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50', marginRight: '8px' }} />}
                          {msg.isResolved ? 'Çözüldü' : 'Bekliyor'}
                        </td>
                        <td style={{ padding: '1rem' }}>{msg.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            backgroundColor: msg.type === 'appointment' ? 'rgba(189, 149, 75, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                            color: msg.type === 'appointment' ? 'var(--color-accent)' : '#2196F3'
                          }}>
                            {msg.type === 'appointment' ? 'Randevu' : 'Form'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{msg.subject}</td>
                        <td style={{ padding: '1rem' }}>{new Date(msg.date).toLocaleDateString('tr-TR')}</td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openMessage(msg); }}
                            style={{ background: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#0A1118'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                          >
                            İncele
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); archiveMessage(msg.id); }}
                            style={{ background: 'none', border: '1px solid #FF6B6B', color: '#FF6B6B', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FF6B6B'; e.currentTarget.style.color = '#FFF'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FF6B6B'; }}
                          >
                            Arşivle
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  paginatedArchived.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#A3B3C2' }}>Arşivlenmiş öğe bulunamadı.</td>
                    </tr>
                  ) : (
                    paginatedArchived.map(msg => (
                      <tr 
                        key={msg.id} 
                        onClick={() => openMessage(msg)}
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          cursor: 'pointer',
                          backgroundColor: selectedMessage?.id === msg.id ? 'rgba(189, 149, 75, 0.05)' : 'transparent',
                          opacity: 0.85
                        }}
                      >
                        <td style={{ padding: '1rem' }}>{msg.isResolved ? 'Çözüldü' : 'Bekliyor'}</td>
                        <td style={{ padding: '1rem' }}>{msg.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            backgroundColor: msg.type === 'appointment' ? 'rgba(189, 149, 75, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                            color: msg.type === 'appointment' ? 'var(--color-accent)' : '#2196F3'
                          }}>
                            {msg.type === 'appointment' ? 'Randevu' : 'Form'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{msg.subject}</td>
                        <td style={{ padding: '1rem' }}>{new Date(msg.date).toLocaleDateString('tr-TR')}</td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openMessage(msg); }}
                            style={{ background: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#0A1118'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                          >
                            İncele
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); restoreMessage(msg.id); }}
                            style={{ background: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#0A1118'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                          >
                            Geri Yükle
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {activeView === 'inbox' && totalInboxPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <button
                  disabled={inboxPage === 1}
                  onClick={() => setInboxPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: inboxPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: inboxPage === 1 ? 0.4 : 1,
                    fontSize: '0.8rem'
                  }}
                >
                  Önceki Sayfa
                </button>
                <span style={{ fontSize: '0.85rem', color: '#A3B3C2' }}>Sayfa {inboxPage} / {totalInboxPages}</span>
                <button
                  disabled={inboxPage === totalInboxPages}
                  onClick={() => setInboxPage(prev => Math.min(prev + 1, totalInboxPages))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: inboxPage === totalInboxPages ? 'not-allowed' : 'pointer',
                    opacity: inboxPage === totalInboxPages ? 0.4 : 1,
                    fontSize: '0.8rem'
                  }}
                >
                  Sonraki Sayfa
                </button>
              </div>
            )}

            {activeView === 'archive' && totalArchivePages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <button
                  disabled={archivePage === 1}
                  onClick={() => setArchivePage(prev => Math.max(prev - 1, 1))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: archivePage === 1 ? 'not-allowed' : 'pointer',
                    opacity: archivePage === 1 ? 0.4 : 1,
                    fontSize: '0.8rem'
                  }}
                >
                  Önceki Sayfa
                </button>
                <span style={{ fontSize: '0.85rem', color: '#A3B3C2' }}>Sayfa {archivePage} / {totalArchivePages}</span>
                <button
                  disabled={archivePage === totalArchivePages}
                  onClick={() => setArchivePage(prev => Math.min(prev + 1, totalArchivePages))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '4px',
                    cursor: archivePage === totalArchivePages ? 'not-allowed' : 'pointer',
                    opacity: archivePage === totalArchivePages ? 0.4 : 1,
                    fontSize: '0.8rem'
                  }}
                >
                  Sonraki Sayfa
                </button>
              </div>
            )}

          </div>
        </div>

        {selectedMessage && (
          <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.3)', padding: '1.5rem', alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Mesaj Detayı</h3>
              <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', color: '#A3B3C2', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ color: '#E0E6ED', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#A3B3C2', display: 'block', marginBottom: '0.2rem' }}>Gönderen:</strong>
                {selectedMessage.name}
              </div>
              <div>
                <strong style={{ color: '#A3B3C2', display: 'block', marginBottom: '0.2rem' }}>İletişim:</strong>
                {selectedMessage.email} <br />
                {selectedMessage.phone}
              </div>
              {selectedMessage.type === 'appointment' && (
                <div style={{ backgroundColor: 'rgba(189, 149, 75, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(189, 149, 75, 0.2)' }}>
                  <strong style={{ color: 'var(--color-accent)', display: 'block', marginBottom: '0.2rem' }}>Randevu Bilgileri:</strong>
                  Tarih: {selectedMessage.appointmentDate} <br />
                  Saat: {selectedMessage.appointmentTime} <br />
                  Adres: {selectedMessage.address}
                </div>
              )}
              <div>
                <strong style={{ color: '#A3B3C2', display: 'block', marginBottom: '0.2rem' }}>Konu:</strong>
                {selectedMessage.subject}
              </div>
              <div>
                <strong style={{ color: '#A3B3C2', display: 'block', marginBottom: '0.2rem' }}>Mesaj:</strong>
                <p style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', lineHeight: '1.5', margin: 0 }}>
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => toggleResolved(selectedMessage.id)}
                style={{ 
                  flex: 1, 
                  padding: '0.8rem', 
                  backgroundColor: selectedMessage.isResolved ? 'transparent' : '#4CAF50', 
                  border: selectedMessage.isResolved ? '1px solid #4CAF50' : 'none',
                  color: selectedMessage.isResolved ? '#4CAF50' : '#FFF', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {selectedMessage.isResolved ? 'Çözüldü İşaretini Kaldır' : 'Çözüldü Olarak İşaretle'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
