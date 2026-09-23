// src/app/layout.tsx – Server component that delegates UI to ClientProvider
import './globals.css';
import ClientProvider from '@/app/ClientProvider';

export const metadata = {
  title: 'Fuel Monitoring System',
  description: 'Dashboard monitoring bahan bakar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientProvider>{children}</ClientProvider>;
}
