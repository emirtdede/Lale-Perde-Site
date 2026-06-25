'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDb } from '@/context/DbContext';
import { supabase } from '@/lib/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface GA4Stats {
  activeUsers: number;
  screenPageViews: number;
  sessions: number;
  whatsappClicks: number;
  mapsClicks: number;
  formSubmits: number;
  daily: Array<{
    date: string;
    activeUsers: number;
    screenPageViews: number;
    sessions: number;
    whatsappClicks?: number;
    mapsClicks?: number;
    formSubmits?: number;
  }>;
}

export default function DashboardTab() {
  const { inbox, visitorLogs, campaigns } = useDb();
  const { t, language } = useLanguage();
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    supabase.from('products').select('*', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count !== null) setProductCount(count);
      });
  }, []);
  
  // GA4 states
  const [ga4Data, setGa4Data] = useState<GA4Stats>({
    activeUsers: 0,
    screenPageViews: 0,
    sessions: 0,
    whatsappClicks: 0,
    mapsClicks: 0,
    formSubmits: 0,
    daily: []
  });
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form Interactions
  const [formStartedCount, setFormStartedCount] = useState(0);
  const [formCompletedCount, setFormCompletedCount] = useState(0);

  // View States
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');
  const [selectedChartMetric, setSelectedChartMetric] = useState<'activeUsers' | 'screenPageViews' | 'sessions' | 'whatsappClicks' | 'mapsClicks' | 'formSubmits'>('activeUsers');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hasFullHistoryLoaded, setHasFullHistoryLoaded] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const manualSyncControllerRef = useRef<AbortController | null>(null);

  const parseGA4Data = (data: any): GA4Stats => {
    if (!data) return {
      activeUsers: 0,
      screenPageViews: 0,
      sessions: 0,
      whatsappClicks: 0,
      mapsClicks: 0,
      formSubmits: 0,
      daily: []
    };
    return {
      activeUsers: Number(data.activeUsers) || 0,
      screenPageViews: Number(data.screenPageViews) || 0,
      sessions: Number(data.sessions) || 0,
      whatsappClicks: Number(data.whatsappClicks) || 0,
      mapsClicks: Number(data.mapsClicks) || 0,
      formSubmits: Number(data.formSubmits) || 0,
      daily: Array.isArray(data.daily) && data.daily.length > 0 ? data.daily.map((d: any) => ({
        date: d.date,
        activeUsers: Number(d.activeUsers) || 0,
        screenPageViews: Number(d.screenPageViews) || 0,
        sessions: Number(d.sessions) || 0,
        whatsappClicks: Number(d.whatsappClicks) || 0,
        mapsClicks: Number(d.mapsClicks) || 0,
        formSubmits: Number(d.formSubmits) || 0
      })) : []
    };
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchGA4Cache = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics/sync', { signal: controller.signal });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data) {
            setGa4Data(parseGA4Data(body.data));
            setLastUpdated(body.updatedAt);
            setQuotaExceeded(body.quotaExceeded || false);
            setFormStartedCount(body.formStartedCount || 0);
            setFormCompletedCount(body.formCompletedCount || 0);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error fetching GA4 cache:', err.message || err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGA4Cache();
    return () => {
      controller.abort();
      if (manualSyncControllerRef.current) {
        manualSyncControllerRef.current.abort();
      }
    };
  }, []);

  // Lazy load history when date range is expanded
  useEffect(() => {
    const isHistoricalRange = ['90days', '180days', '365days', '5years', 'custom'].includes(timeRange);
    if (isHistoricalRange && !hasFullHistoryLoaded && !loadingHistory) {
      const controller = new AbortController();
      const loadFullHistory = async () => {
        try {
          setLoadingHistory(true);
          const res = await fetch('/api/analytics/sync?range=full', { signal: controller.signal });
          if (res.ok) {
            const body = await res.json();
            if (body.success && body.data) {
              setGa4Data(parseGA4Data(body.data));
              setHasFullHistoryLoaded(true);
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn('Error fetching full GA4 history:', err.message || err);
          }
        } finally {
          setLoadingHistory(false);
        }
      };
      loadFullHistory();
      return () => {
        controller.abort();
      };
    }
  }, [timeRange, hasFullHistoryLoaded, loadingHistory]);

  const handleManualSync = async () => {
    if (syncing) return;

    // Cooldown check (60 seconds)
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const lastSyncStr = localStorage.getItem('lale_perde_last_sync_timestamp');
    if (lastSyncStr) {
      const lastSync = parseInt(lastSyncStr, 10);
      const diff = (now - lastSync) / 1000;
      if (diff < 60) {
        const remaining = Math.ceil(60 - diff);
        showToast(language === 'tr' 
          ? `Lütfen tekrar senkronize etmeden önce ${remaining} saniye bekleyin.` 
          : `Please wait ${remaining} seconds before syncing again.`, true);
        return;
      }
    }

    if (manualSyncControllerRef.current) {
      manualSyncControllerRef.current.abort();
    }
    const controller = new AbortController();
    manualSyncControllerRef.current = controller;

    setSyncing(true);
    setToastMessage(null);
    try {
      const res = await fetch('/api/analytics/sync', { method: 'POST', signal: controller.signal });
      const body = await res.json();
      
      if (body.success) {
        // Save current timestamp to localStorage
        // eslint-disable-next-line react-hooks/purity
        localStorage.setItem('lale_perde_last_sync_timestamp', Date.now().toString());
        setGa4Data(parseGA4Data(body.data));
        setLastUpdated(body.updatedAt);
        setQuotaExceeded(false);
        setFormStartedCount(body.formStartedCount || 0);
        setFormCompletedCount(body.formCompletedCount || 0);
        setHasFullHistoryLoaded(true);
        if (body.warning) {
          showToast(language === 'tr' ? 'Google Analytics (GA4) API kimlik bilgileri eksik. Önbellekteki veriler gösteriliyor.' : 'Google Analytics (GA4) API credentials are missing. Showing cached data.', true);
        } else {
          showToast(t('admin.dashboard.alerts.syncSuccess'), false);
        }
      } else {
        if (body.quotaExceeded) {
          setQuotaExceeded(true);
          setGa4Data(parseGA4Data(body.data)); // Keep existing data
          setLastUpdated(body.updatedAt);
          setFormStartedCount(body.formStartedCount || 0);
          setFormCompletedCount(body.formCompletedCount || 0);
          showToast(t('admin.dashboard.alerts.quotaExceeded'), true);
        } else {
          showToast(body.error || t('admin.dashboard.alerts.syncFailed'), true);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Error syncing GA4:', err.message || err);
        showToast(t('admin.dashboard.alerts.connectionError'), true);
      }
    } finally {
      if (manualSyncControllerRef.current === controller) {
        setSyncing(false);
      }
    }
  };

  const showToast = (text: string, isError: boolean) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Calculations
  const stats = useMemo(() => {
    const uniqueVisCount = Array.from(new Set(visitorLogs.map(v => v.ip))).length;
    return {
      products: productCount,
      unreadMessages: inbox.filter(m => !m.isRead).length,
      totalVisitors: uniqueVisCount,
      campaignsActive: campaigns.filter((c: any) => c.isActive).length
    };
  }, [productCount, inbox, visitorLogs, campaigns]);

  const abandonmentRate = useMemo(() => {
    if (formStartedCount === 0) return 0;
    const rate = ((formStartedCount - formCompletedCount) / formStartedCount) * 100;
    return Math.max(0, Math.round(rate));
  }, [formStartedCount, formCompletedCount]);

  const statCards = [
    { label: t('admin.dashboard.totalProducts'), value: stats.products, color: '#4CAF50', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ) },
    { label: t('admin.dashboard.unreadMessages'), value: stats.unreadMessages, color: '#FF9800', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ) },
    { label: t('admin.dashboard.totalVisitors'), value: stats.totalVisitors, color: '#2196F3', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ) },
    { label: t('admin.dashboard.activeCampaigns'), value: stats.campaignsActive, color: '#E91E63', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ) }
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export handlers
  const exportCSV = () => {
    const rows = [
      ['Metrik', 'Deger'],
      ['Aktif Kullanıcılar (30 Gun)', ga4Data.activeUsers],
      ['Sayfa Goruntuleme (30 Gun)', ga4Data.screenPageViews],
      ['Oturumlar (30 Gun)', ga4Data.sessions],
      ['WhatsApp Tiklamalari', ga4Data.whatsappClicks],
      ['Harita Yonlendirmeleri', ga4Data.mapsClicks],
      ['Form Gonderimleri (GA4)', ga4Data.formSubmits],
      ['Form Baslatma (Supabase)', formStartedCount],
      ['Form Tamamlama (Supabase)', formCompletedCount],
      ['Form Terk Etme Orani (%)', abandonmentRate]
    ];

    if (ga4Data.daily && ga4Data.daily.length > 0) {
      rows.push([]);
      rows.push(['Gunluk Detay - Tarih', 'Aktif Kullanicilar', 'Sayfa Goruntuleme', 'Oturumlar']);
      ga4Data.daily.forEach(d => {
        rows.push([d.date, d.activeUsers, d.screenPageViews, d.sessions]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + rows.map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lale_perde_analiz_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    const exportData = {
      totals: {
        activeUsers: ga4Data.activeUsers,
        screenPageViews: ga4Data.screenPageViews,
        sessions: ga4Data.sessions,
        whatsappClicks: ga4Data.whatsappClicks,
        mapsClicks: ga4Data.mapsClicks,
        formSubmits: ga4Data.formSubmits,
        formStarted: formStartedCount,
        formCompleted: formCompletedCount,
        abandonmentRate: `${abandonmentRate}%`
      },
      daily: ga4Data.daily || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `lale_perde_analiz_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Genel Ozet">
  <Table>
   <Row><Cell><Data ss:Type="String">Metrik</Data></Cell><Cell><Data ss:Type="String">Deger</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Aktif Kullanıcılar</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.activeUsers}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Sayfa Goruntuleme</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.screenPageViews}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Oturumlar</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.sessions}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">WhatsApp Tiklamalari</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.whatsappClicks}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Harita Yonlendirmeleri</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.mapsClicks}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Form Gonderimleri (GA4)</Data></Cell><Cell><Data ss:Type="Number">${ga4Data.formSubmits}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Form Baslatma (Supabase)</Data></Cell><Cell><Data ss:Type="Number">${formStartedCount}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Form Tamamlama (Supabase)</Data></Cell><Cell><Data ss:Type="Number">${formCompletedCount}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Form Terk Etme Orani</Data></Cell><Cell><Data ss:Type="String">${abandonmentRate}%</Data></Cell></Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Gunluk Detay">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Tarih</Data></Cell>
    <Cell><Data ss:Type="String">Aktif Kullanıcılar</Data></Cell>
    <Cell><Data ss:Type="String">Sayfa Goruntuleme</Data></Cell>
    <Cell><Data ss:Type="String">Oturumlar</Data></Cell>
   </Row>`;
    
    ga4Data.daily?.forEach(d => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${d.date}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.activeUsers}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.screenPageViews}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.sessions}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lale_perde_analiz_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Filtered daily data based on chosen timeRange
  const filteredDailyData = useMemo(() => {
    const dailyData = ga4Data.daily || [];
    if (dailyData.length === 0) return [];
    
    const now = new Date();
    const cutOffDate = new Date();
    
    if (timeRange === '7days') {
      cutOffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30days') {
      cutOffDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90days') {
      cutOffDate.setDate(now.getDate() - 90);
    } else if (timeRange === '180days') {
      cutOffDate.setDate(now.getDate() - 180);
    } else if (timeRange === '365days') {
      cutOffDate.setDate(now.getDate() - 365);
    } else if (timeRange === '5years') {
      cutOffDate.setDate(now.getDate() - 1825);
    } else if (timeRange === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      return dailyData.filter(d => {
        const itemDate = new Date(d.date);
        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
      });
    }
    
    const cutOffStr = cutOffDate.toISOString().split('T')[0];
    return dailyData.filter(d => d.date >= cutOffStr);
  }, [ga4Data.daily, timeRange, customStartDate, customEndDate]);

  // Max/Min values calculations
  const chartSummary = useMemo(() => {
    if (filteredDailyData.length === 0) return null;
    let maxVal = -1;
    let maxDate = '';
    let minVal = Infinity;
    let minDate = '';
    
    filteredDailyData.forEach(d => {
      const val = d[selectedChartMetric] || 0;
      if (val > maxVal) {
        maxVal = val;
        maxDate = d.date;
      }
      if (val < minVal) {
        minVal = val;
        minDate = d.date;
      }
    });
    
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };
    
    return {
      maxVal,
      maxDate: formatDateStr(maxDate),
      minVal: minVal === Infinity ? 0 : minVal,
      minDate: minVal === Infinity ? '' : formatDateStr(minDate)
    };
  }, [filteredDailyData, selectedChartMetric]);

  const renderedChart = useMemo(() => {
    if (filteredDailyData.length === 0) {
      return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#A3B3C2', fontSize: '0.9rem' }}>
          {t('admin.dashboard.chartInfo.noData')}
        </div>
      );
    }

    const chartData = filteredDailyData.map(d => {
      const parts = d.date.split('-');
      const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;
      return {
        name: label,
        value: d[selectedChartMetric] || 0,
        fullDate: d.date
      };
    });

    // eslint-disable-next-line react-hooks/static-components
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div style={{
            backgroundColor: '#0A1118',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            padding: '8px 12px',
            borderRadius: '6px',
            color: '#FFF',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <p style={{ margin: 0, color: '#A3B3C2', marginBottom: '4px', fontSize: '0.75rem' }}>{payload[0].payload.fullDate}</p>
            <p style={{ margin: 0, fontWeight: 600, color: '#D4AF37' }}>
              {t('admin.dashboard.chartInfo.value')} {payload[0].value.toLocaleString('tr-TR')}
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div>
        <div style={{ width: '100%', height: '320px', minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 25, right: 40, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="#8E9AA6" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                stroke="#A3B3C2" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => value.toLocaleString('tr-TR')}
              />
              {/* eslint-disable-next-line react-hooks/static-components */}
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212, 175, 55, 0.3)', strokeWidth: 1, strokeDasharray: '2 2' }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#D4AF37" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, fill: '#D4AF37', stroke: '#0F1820', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Min / Max Info Summary Bar */}
        {chartSummary && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1.2rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            color: '#8E9AA6',
            fontSize: '0.8rem',
            letterSpacing: '0.03em'
          }}>
            <div>
              <span>{t('admin.dashboard.chartInfo.highest')} </span>
              <strong style={{ color: 'var(--color-accent)' }}>{chartSummary.maxVal.toLocaleString('tr-TR')}</strong>
              {chartSummary.maxDate && <span style={{ opacity: 0.8 }}> ({chartSummary.maxDate})</span>}
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div>
              <span>{t('admin.dashboard.chartInfo.lowest')} </span>
              <strong style={{ color: 'rgba(212, 175, 55, 0.7)' }}>{chartSummary.minVal.toLocaleString('tr-TR')}</strong>
              {chartSummary.minDate && <span style={{ opacity: 0.8 }}> ({chartSummary.minDate})</span>}
            </div>
          </div>
        )}
      </div>
    );
  }, [filteredDailyData, selectedChartMetric, chartSummary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toastMessage.isError ? '#D32F2F' : '#2E7D32',
          color: '#FFF',
          padding: '0.8rem 1.5rem',
          borderRadius: '6px',
          zIndex: 100000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.3s ease'
        }}>
          {toastMessage.isError ? '⚠️ ' : '✓ '} {toastMessage.text}
        </div>
      )}

      {/* Quota warning banner */}
      {quotaExceeded && (
        <div style={{
          backgroundColor: 'rgba(211, 47, 47, 0.15)',
          border: '1px solid #D32F2F',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          color: '#FF6B6B',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <span>⚠️</span>
          <strong>{t('admin.dashboard.alerts.quotaExceeded')}</strong>
        </div>
      )}

      {/* Header and Controls Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#0F1820',
        padding: '1.2rem 2rem',
        borderRadius: '8px',
        border: '1px solid rgba(189, 149, 75, 0.15)'
      }}>
        <div>
          <h2 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: 0 }}>
            {t('admin.dashboard.title')}
          </h2>
          {lastUpdated && (
            <span style={{ color: '#A3B3C2', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
              {t('admin.dashboard.lastUpdated')} {formatDate(lastUpdated)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Export Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                backgroundColor: 'rgba(189, 149, 75, 0.1)',
                border: '1px solid rgba(189, 149, 75, 0.3)',
                color: 'var(--color-accent)',
                padding: '0.5rem 1.2rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(189, 149, 75, 0.18)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(189, 149, 75, 0.1)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{t('admin.dashboard.exportBtn')}</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>▼</span>
            </button>
            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: '#0F1820',
                border: '1px solid rgba(189, 149, 75, 0.3)',
                borderRadius: '6px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                width: '150px'
              }}>
                <button onClick={exportExcel} style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', color: '#E0E6ED', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', transition: 'background 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>Excel (.xlsx)</button>
                <button onClick={exportCSV} style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', color: '#E0E6ED', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', transition: 'background 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>CSV (.csv)</button>
                <button onClick={exportJSON} style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', color: '#E0E6ED', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', transition: 'background 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>JSON (.json)</button>
              </div>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={syncing}
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #A17E3B)',
              color: '#0A1118',
              border: 'none',
              padding: '0.6rem 1.5rem',
              borderRadius: '6px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: syncing ? 0.7 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 0 0px rgba(212, 175, 55, 0)'
            }}
            onMouseOver={(e) => {
              if (!syncing) {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.45)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {syncing ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #0A1118',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>{t('admin.dashboard.syncingBtn')}</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>{t('admin.dashboard.syncBtn')}</span>
              </>
            )}
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(80%) sepia(30%) saturate(800%) hue-rotate(5deg) brightness(90%) contrast(90%);
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
        `}} />
      </div>

      {/* Database General Stats */}
      <div>
        <h3 style={{ color: '#E0E6ED', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 500, letterSpacing: '0.03em' }}>
          {t('admin.dashboard.generalStats')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {statCards.map((card, idx) => (
            <div key={idx} style={{
              backgroundColor: '#0F1820',
              border: '1px solid rgba(189, 149, 75, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
                {card.icon}
              </div>
              <span style={{ color: card.color, fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                {card.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Google Analytics 4 Stats Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h3 style={{ color: '#E0E6ED', fontSize: '1.05rem', margin: 0, fontWeight: 500, letterSpacing: '0.03em' }}>
            {t('admin.dashboard.analyticsTitle')}
          </h3>
          
          {/* Toggle View Mode Switch */}
          <div style={{
            backgroundColor: '#0F1820',
            border: '1px solid rgba(189, 149, 75, 0.3)',
            borderRadius: '20px',
            padding: '3px',
            display: 'flex',
            gap: '2px'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'cards' ? '#0A1118' : '#A3B3C2',
                border: 'none',
                padding: '0.3rem 1rem',
                borderRadius: '17px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>{t('admin.dashboard.cardView')}</span>
            </button>
            <button
              onClick={() => setViewMode('charts')}
              style={{
                backgroundColor: viewMode === 'charts' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'charts' ? '#0A1118' : '#A3B3C2',
                border: 'none',
                padding: '0.3rem 1rem',
                borderRadius: '17px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>{t('admin.dashboard.chartView')}</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ color: '#A3B3C2', fontSize: '0.9rem', padding: '4rem', textAlign: 'center', backgroundColor: '#0F1820', borderRadius: '12px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
            {t('admin.dashboard.loadingAnalytics')}
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Traffic Stats Group */}
                <div>
                  <h4 style={{ color: '#8E9AA6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 600 }}>
                    {t('admin.dashboard.trafficStatsTitle')}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Active Users */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.activeUsers')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <polyline points="16 11 18 13 22 9" />
                        </svg>
                      </div>
                      <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.activeUsers.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Screen Page Views */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.pageViews')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.screenPageViews.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Sessions */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.sessions')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.sessions.toLocaleString('tr-TR')}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Conversion & Engagement Group */}
                <div>
                  <h4 style={{ color: '#8E9AA6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem', fontWeight: 600 }}>
                    {t('admin.dashboard.conversionStatsTitle')}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* WhatsApp Click Event */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.whatsappClicks')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </div>
                      <span style={{ color: '#4CAF50', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.whatsappClicks.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Maps Redirections */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.mapsClicks')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                          <line x1="9" y1="3" x2="9" y2="18" />
                          <line x1="15" y1="6" x2="15" y2="21" />
                        </svg>
                      </div>
                      <span style={{ color: '#2196F3', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.mapsClicks.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* GA4 Form Submits */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.formSubmitsGA4')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <span style={{ color: 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        {ga4Data.formSubmits.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Form Abandonment Rate */}
                    <div style={{ backgroundColor: '#0F1820', border: '1px solid rgba(189, 149, 75, 0.15)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#A3B3C2', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('admin.dashboard.formAbandonmentRate')}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={abandonmentRate > 40 ? '#FF6B6B' : 'var(--color-accent)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <span style={{ color: abandonmentRate > 40 ? '#FF6B6B' : 'var(--color-accent)', fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                        %{abandonmentRate}
                      </span>
                      <span style={{ color: '#8E9AA6', fontSize: '0.75rem', marginTop: '-6px' }}>
                        {t('admin.dashboard.formProcess')}: {formCompletedCount} / {formStartedCount} Form
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              // Chart View Mode
              <div style={{
                backgroundColor: '#0F1820',
                border: '1px solid rgba(189, 149, 75, 0.15)',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  {/* Metric Tabs */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'activeUsers', label: t('admin.dashboard.metrics.activeUsers') },
                      { key: 'screenPageViews', label: t('admin.dashboard.metrics.screenPageViews') },
                      { key: 'sessions', label: t('admin.dashboard.metrics.sessions') },
                      { key: 'whatsappClicks', label: t('admin.dashboard.metrics.whatsappClicks') },
                      { key: 'mapsClicks', label: t('admin.dashboard.metrics.mapsClicks') },
                      { key: 'formSubmits', label: t('admin.dashboard.metrics.formSubmits') }
                    ].map(metric => (
                      <button
                        key={metric.key}
                        onClick={() => setSelectedChartMetric(metric.key as any)}
                        style={{
                          backgroundColor: selectedChartMetric === metric.key ? 'rgba(212,175,55,0.15)' : 'transparent',
                          border: '1px solid',
                          borderColor: selectedChartMetric === metric.key ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                          color: selectedChartMetric === metric.key ? 'var(--color-accent)' : '#A3B3C2',
                          padding: '0.4rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        {metric.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Filter Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      style={{
                        backgroundColor: '#0A1118',
                        border: '1px solid rgba(189, 149, 75, 0.4)',
                        color: 'var(--color-accent)',
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="7days">{t('admin.dashboard.dateRanges.days7')}</option>
                      <option value="30days">{t('admin.dashboard.dateRanges.days30')}</option>
                      <option value="90days">{t('admin.dashboard.dateRanges.days90')}</option>
                      <option value="180days">{t('admin.dashboard.dateRanges.days180')}</option>
                      <option value="365days">{t('admin.dashboard.dateRanges.days365')}</option>
                      <option value="5years">{t('admin.dashboard.dateRanges.years5')}</option>
                      <option value="custom">{t('admin.dashboard.dateRanges.custom')}</option>
                    </select>

                    {timeRange === 'custom' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          style={{
                            backgroundColor: '#0A1118',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#E0E6ED',
                            padding: '0.35rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                        <span style={{ color: '#8E9AA6', fontSize: '0.8rem' }}>-</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          style={{
                            backgroundColor: '#0A1118',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#E0E6ED',
                            padding: '0.35rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Rendered Chart */}
                {loadingHistory ? (
                  <div style={{
                    padding: '6rem 2rem',
                    textAlign: 'center',
                    color: 'var(--color-accent)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span className="spinner" style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      border: '2px solid rgba(212, 175, 55, 0.2)',
                      borderTopColor: 'var(--color-accent)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span>{t('admin.dashboard.loadingHistory')}</span>
                  </div>
                ) : (
                  renderedChart
                )}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
