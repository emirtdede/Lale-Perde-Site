import React, { useEffect, useState } from 'react';
import { useDb } from '@/context/DbContext';
import { VisitorLog } from '@/context/dbTypes';

interface Visitor {
  ipHash: string;
  city: string;
  userAgent: string;
  visitCount: number;
  lastSeen: string;
}

export default function VisitorsTab() {
  const { fetchVisitorLogsPaginated } = useDb();
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [loading, setLoading] = useState(false);

  // Load visitor logs dynamically
  const loadData = async () => {
    setLoading(true);
    // Fetch latest 500 logs to perform client-side grouping without crashing browser
    const res = await fetchVisitorLogsPaginated(1, 500);
    setLogs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
    setCurrentPage(1);
  };

  // Group logs to create visitor aggregates
  const visitorsMap: { [key: string]: Visitor } = {};
  logs.forEach(log => {
    // Generate a hash if not present
    const key = log.ip || 'unknown';
    
    // Parse location format safely
    let formattedCity = log.city || 'Bilinmiyor, TR';
    if (!formattedCity.includes('/') && formattedCity.includes(',')) {
      const parts = formattedCity.split(',');
      formattedCity = `${parts[1].trim()} / ${parts[0].trim()}`;
    }

    if (!visitorsMap[key]) {
      visitorsMap[key] = {
        ipHash: key,
        city: formattedCity,
        userAgent: log.userAgent || 'Unknown Device',
        visitCount: 1,
        lastSeen: log.timestamp
      };
    } else {
      visitorsMap[key].visitCount += 1;
      if (new Date(log.timestamp) > new Date(visitorsMap[key].lastSeen)) {
        visitorsMap[key].lastSeen = log.timestamp;
        visitorsMap[key].city = formattedCity;
        visitorsMap[key].userAgent = log.userAgent;
      }
    }
  });

  const uniqueVisitorsList = Object.values(visitorsMap).sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  // Top visited cities calculation
  const cityCounts: { [key: string]: number } = {};
  uniqueVisitorsList.forEach(v => {
    cityCounts[v.city] = (cityCounts[v.city] || 0) + v.visitCount;
  });

  const topCities = Object.entries(cityCounts)
    .map(([name, count]) => {
      // Clean display names to match screenshot (e.g., TR / Diyarbakır -> Bilinmiyor, TR or Diyarbakır, TR)
      let displayName = name;
      if (name.includes('/')) {
        const parts = name.split('/');
        const country = parts[0].trim();
        const city = parts[1].trim();
        displayName = city === 'UNKNOWN_CITY' ? `Bilinmiyor, ${country}` : `${city}, ${country}`;
      }
      return { name: displayName, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Totals calculations
  const totalViews = uniqueVisitorsList.reduce((acc, curr) => acc + curr.visitCount, 0);
  const uniqueVisitors = uniqueVisitorsList.length;

  // Search logic
  const filteredVisitors = uniqueVisitorsList.filter(v => {
    const query = searchTerm.toLowerCase();
    return (
      v.ipHash.toLowerCase().includes(query) ||
      v.city.toLowerCase().includes(query) ||
      v.userAgent.toLowerCase().includes(query)
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage) || 1;
  const paginatedVisitors = filteredVisitors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const parseUserAgent = (ua: string) => {
    if (!ua) return 'Bilinmiyor';
    
    let os = 'Bilinmeyen OS';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Windows NT 6.2') || ua.includes('Windows NT 6.3')) os = 'Windows 8';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    
    let browser = 'Bilinmeyen Tarayıcı';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/') && !ua.includes('Chromium')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';

    return `${os} / ${browser}`;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Analytics Panel Control */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F1820',
        padding: '1rem 2rem',
        borderRadius: '8px',
        border: '1px solid rgba(189, 149, 75, 0.15)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#E0E6ED', fontWeight: 500, fontSize: '1.1rem' }}>Analitik Paneli</span>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              backgroundColor: '#0A1118',
              color: '#FFF',
              border: '1px solid rgba(189, 149, 75, 0.3)',
              borderRadius: '4px',
              padding: '0.4rem 0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="2026-06">Haziran 2026</option>
            <option value="2026-05">Mayıs 2026</option>
            <option value="2026-04">Nisan 2026</option>
          </select>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), #A17E3B)',
            color: '#0A1118',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 10px rgba(189,149,75,0.2)',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Yenile
        </button>
      </div>

      {/* Grid containing Top Cities & Numerical stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Top Cities */}
        <div style={{
          backgroundColor: '#0F1820',
          borderRadius: '8px',
          border: '1px solid rgba(189, 149, 75, 0.15)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', margin: 0 }}>
            🗺️ En Çok Ziyaret Edilen Şehirler
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            {topCities.map((city, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#E0E6ED' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: index < 3 ? 'rgba(189, 149, 75, 0.25)' : 'rgba(255,255,255,0.05)', 
                    color: index < 3 ? 'var(--color-accent)' : '#A3B3C2',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {index + 1}
                  </span>
                  <span>{city.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{city.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Numeric stats */}
        <div style={{
          backgroundColor: '#0F1820',
          borderRadius: '8px',
          border: '1px solid rgba(189, 149, 75, 0.15)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', margin: 0 }}>
            📊 Toplam Sayısal Veriler
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '100%', alignItems: 'center', minHeight: '220px' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(189, 149, 75, 0.1)',
              borderRadius: '8px',
              padding: '2rem 1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.8rem'
            }}>
              <span style={{ color: '#A3B3C2', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>TEKİL ZİYARETÇİ</span>
              <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                {uniqueVisitors}
              </span>
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(189, 149, 75, 0.1)',
              borderRadius: '8px',
              padding: '2rem 1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.8rem'
            }}>
              <span style={{ color: '#A3B3C2', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>GÖRÜNTÜLENME</span>
              <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                {totalViews}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Visitor List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>
            Ziyaretçi Listesi
          </h3>
          <input
            type="text"
            placeholder="IP, Şehir veya Ülke Ara..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0F1820',
              border: '1px solid rgba(189, 149, 75, 0.25)',
              borderRadius: '6px',
              color: '#FFF',
              fontSize: '0.85rem',
              outline: 'none',
              width: '280px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.25)'}
          />
        </div>

        <div style={{ backgroundColor: '#0F1820', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#E0E6ED', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: 'rgba(189, 149, 75, 0.1)', borderBottom: '1px solid rgba(189, 149, 75, 0.2)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Ziyaretçi ID (Hash)</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Konum</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Cihaz</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Ziyaret Sayısı</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Son Görülme</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#A3B3C2' }}>Ziyaretçi kaydı bulunamadı.</td>
                </tr>
              ) : (
                paginatedVisitors.map((visitor, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                      {visitor.ipHash.length > 10 ? `${visitor.ipHash.substring(0, 10)}...` : visitor.ipHash}
                    </td>
                    <td style={{ padding: '1rem' }}>{visitor.city}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#A3B3C2' }} title={visitor.userAgent}>{parseUserAgent(visitor.userAgent)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(189, 149, 75, 0.15)',
                        color: 'var(--color-accent)',
                        fontWeight: 600
                      }}>
                        {visitor.visitCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {formatDate(visitor.lastSeen)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.85rem', color: '#A3B3C2' }}>Sayfa {currentPage} / {totalPages}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.4rem 1rem',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (currentPage !== 1) { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#0A1118'; } }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                >
                  Önceki
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(189, 149, 75, 0.4)',
                    color: 'var(--color-accent)',
                    padding: '0.4rem 1rem',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.backgroundColor = 'var(--color-accent)'; e.currentTarget.style.color = '#0A1118'; } }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* GDPR Warning Banner */}
      <div style={{
        marginTop: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(189, 149, 75, 0.1)',
        padding: '1.2rem',
        fontSize: '0.8rem',
        color: '#A3B3C2',
        lineHeight: '1.5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-accent)' }}>
          🛡️ Veri Saklama ve Gizlilik Politikası (KVKK/GDPR)
        </div>
        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
          <li>Ziyaretçi IP adresleri <strong>HMAC-SHA256</strong> ile şifrelenerek saklanmaktadır. Ham IP tutulmaz.</li>
          <li><strong>90 gün</strong> boyunca işlem yapmayan ziyaretçi kayıtları sistemden otomatik olarak silinir.</li>
          <li>Anonimleştirilmiş şehir istatistikleri, analiz amacıyla <strong>24 ay</strong> saklanır.</li>
        </ul>
      </div>

    </div>
  );
}
