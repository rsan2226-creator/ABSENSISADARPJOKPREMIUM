import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Import Plus Jakarta Sans for the entire application to set a premium professional typography style
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SADAR - Sistem Administrasi PJOK SD Premium',
  description: 'Sistem Administrasi Premium Pendidikan Jasmani, Olahraga, dan Kesehatan untuk Sekolah Dasar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans`}>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
