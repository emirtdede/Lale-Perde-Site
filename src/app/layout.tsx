import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ConsentBanner from '../components/ConsentBanner';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Lale Perde',
  description: 'Lale Perde - Evinize zarafet katan modern lüks perde tasarımları. Tül, fon, stor ve akıllı motorlu perde çözümleriyle İskandinav minimalizmi ve editorial estetiği bir araya getiren premium koleksiyonlar.',
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
          <ConsentBanner />
        </Providers>
        {Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string} />
        )}
      </body>
    </html>
  );
}
