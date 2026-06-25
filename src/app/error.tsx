'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js App level error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#faf9f6] text-[#2c2b29]">
      <div className="max-w-md w-full p-8 bg-white border border-[#e5e2dd] rounded-lg shadow-sm">
        <div className="w-16 h-16 bg-[#f7efe5] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#a38a6a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3 font-serif tracking-tight">Bir Şeyler Yanlış Gitti</h2>
        <p className="text-sm text-[#706c64] mb-8 leading-relaxed">
          Aradığınız sayfa yüklenirken beklenmedik bir sunucu hatası oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#2c2b29] hover:bg-[#403e3a] text-white text-sm font-medium rounded transition-all duration-200"
          >
            Yeniden Dene
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-[#c8c5be] hover:border-[#2c2b29] text-[#2c2b29] text-sm font-medium rounded transition-all duration-200"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
