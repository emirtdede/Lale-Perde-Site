'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useGoogleAds } from '../context/GoogleAdsContext';

export default function GoogleAdsTracker() {
  const { config, isReady } = useGoogleAds();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReady || !config.adsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${config.adsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.adsId}');
        `}
      </Script>
    </>
  );
}
