// src/app/ClientProvider.tsx – Client‑only wrapper for SWR, token refresh, and UI layout
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useUIStore } from '@/store/uiStore';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import './globals.css';
import { SWRConfig } from 'swr';
import { tryRefreshToken } from '@/lib/refresh';

// Global fetcher that always sends cookies
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const isLoginPage = pathname === '/login';

  // Background component used on every page (kept exactly as before)
  const GlobalBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <img
        src="/login-bg-industrial.jpg"
        alt=""
        className="w-full h-full object-cover object-center opacity-30 transition-opacity duration-1000"
        onError={(e) => {
          e.currentTarget.parentElement!.style.background =
            'radial-gradient(circle at top right, #e0f2fe, #f8f9ff 50%, #f1f5f9 100%)';
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#f8f9ff] via-[#f8f9ff]/40 to-transparent" />
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-[0.05]">
        <defs>
          <pattern id="global-industrial-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00A2E8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#global-industrial-grid)" />
      </svg>
    </div>
  );

  if (isLoginPage) {
    return (
      <html lang="id" className="h-full" suppressHydrationWarning>
        <body className="h-full bg-[#f8f9ff] text-[#0b1c30] antialiased relative" suppressHydrationWarning>
          <QueryClientProvider client={queryClient}>
            <GlobalBackground />
            <div className="relative z-10">{mounted ? children : <div className="min-h-screen" />}</div>
          </QueryClientProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-[#f8f9ff] text-[#0b1c30] antialiased relative" suppressHydrationWarning>
        <SWRConfig
          value={{
            fetcher,
            onErrorRetry: async (error, key, config, revalidate, { retryCount }) => {
              if (error?.message?.includes('401') && retryCount === 0) {
                const refreshed = await tryRefreshToken();
                if (refreshed) revalidate();
              }
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <GlobalBackground />
            <Toaster position="top-right" reverseOrder={false} />
            <React.Suspense fallback={null}>
              <Topbar />
            </React.Suspense>
            <div className="flex min-h-screen relative pt-20">
              <Sidebar />
              <main
                className={cn(
                  "flex-1 px-6 py-6 transition-all duration-300 ease-in-out relative z-10",
                  isSidebarCollapsed ? "pl-6" : "pl-[272px]"
                )}
              >
                {mounted ? (
                  <div className="w-full h-full animate-in fade-in duration-500">{children}</div>
                ) : (
                  <div className="w-full h-full bg-transparent" />
                )}
              </main>
            </div>
          </QueryClientProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
