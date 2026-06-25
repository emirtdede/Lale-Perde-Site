'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// Extend Window type for gtag
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

interface GoogleAdsConfig {
  adsId: string | null;
  labelWhatsapp: string | null;
  labelContact: string | null;
}

interface GoogleAdsContextType {
  config: GoogleAdsConfig;
  trackConversion: (type: 'whatsapp' | 'contact') => void;
  isReady: boolean;
}

const GoogleAdsContext = createContext<GoogleAdsContextType>({
  config: { adsId: null, labelWhatsapp: null, labelContact: null },
  trackConversion: () => {},
  isReady: false,
});

export function GoogleAdsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GoogleAdsConfig>({
    adsId: null,
    labelWhatsapp: null,
    labelContact: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchAdsConfig() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('google_ads_id, ads_label_whatsapp, ads_label_contact')
          .eq('id', 'main_settings')
          .single();

        if (!error && data) {
          setConfig({
            adsId: data.google_ads_id || null,
            labelWhatsapp: data.ads_label_whatsapp || null,
            labelContact: data.ads_label_contact || null,
          });
        }
      } catch (err) {
        console.warn('Google Ads yapılandırması yüklenirken hata:', err);
      } finally {
        setIsReady(true);
      }
    }

    fetchAdsConfig();
  }, []);

  const trackConversion = useCallback(
    (type: 'whatsapp' | 'contact') => {
      if (!config.adsId) return;

      const label = type === 'whatsapp' ? config.labelWhatsapp : config.labelContact;
      if (!label) return;

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const sendTo = `${config.adsId}/${label}`;
        window.gtag('event', 'conversion', {
          send_to: sendTo,
        });
      }
    },
    [config]
  );

  const contextValue = React.useMemo(
    () => ({ config, trackConversion, isReady }),
    [config, trackConversion, isReady]
  );

  return (
    <GoogleAdsContext.Provider value={contextValue}>
      {children}
    </GoogleAdsContext.Provider>
  );
}

export function useGoogleAds() {
  const context = useContext(GoogleAdsContext);
  if (!context) {
    throw new Error('useGoogleAds must be used within a GoogleAdsProvider');
  }
  return context;
}
