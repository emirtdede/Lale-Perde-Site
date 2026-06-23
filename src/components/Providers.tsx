'use client';

import React, { useEffect } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { DbProvider, useDb } from '../context/DbContext';
import { VisitorLog } from '../context/dbTypes';

const VisitorTracker: React.FC = () => {
  const { addVisitorLog, updateVisitorLogDwellTime } = useDb();

  useEffect(() => {
    let currentLogId = '';
    let startTime = Date.now();

    const handleUnload = () => {
      if (currentLogId) {
        const dwellTime = Math.floor((Date.now() - startTime) / 1000);
        updateVisitorLogDwellTime(currentLogId, dwellTime);
        localStorage.setItem('lale_perde_last_dwell', dwellTime.toString());
      }
    };

    const logVisitor = async () => {
      let localVisitorStr = localStorage.getItem('lale_perde_client_visitor');
      let localVisitor;
      
      if (localVisitorStr) {
        try {
          localVisitor = JSON.parse(localVisitorStr);
        } catch (e) {
          localVisitor = null;
        }
      }

      if (!localVisitor) {
        try {
          const res = await fetch('/api/log-visitor');
          if (res.ok) {
            const data = await res.json();
            localVisitor = {
              ip: '', // Raw IP is not saved client side anymore
              ipHash: data.ipHash,
              city: data.city
            };
            localStorage.setItem('lale_perde_client_visitor', JSON.stringify(localVisitor));
          }
        } catch (e) {
          console.error('Visitor logging API failed', e);
          localVisitor = {
            ip: '',
            ipHash: 'unknown',
            city: 'Unknown'
          };
        }
      }

      const userAgent = navigator.userAgent;
      const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);
      
      const sessionLogged = sessionStorage.getItem('lale_perde_logged_session');
      if (!sessionLogged && localVisitor) {
        currentLogId = `vis-${Date.now()}`;
        const newLog: VisitorLog = {
          id: currentLogId,
          city: localVisitor.city,
          ip: localVisitor.ipHash,
          userAgent,
          timestamp: new Date().toISOString(),
          duration: 0,
          isBot
        };

        await addVisitorLog(newLog);
        sessionStorage.setItem('lale_perde_logged_session', currentLogId);
      } else {
        currentLogId = sessionLogged || '';
      }
    };

    logVisitor();
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [addVisitorLog, updateVisitorLogDwellTime]);

  return null;
};

import { GoogleAdsProvider } from '../context/GoogleAdsContext';
import GoogleAdsTracker from './GoogleAdsTracker';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DbProvider>
      <GoogleAdsProvider>
        <LanguageProvider>
          <ThemeProvider>
            <VisitorTracker />
            <GoogleAdsTracker />
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </GoogleAdsProvider>
    </DbProvider>
  );
};
