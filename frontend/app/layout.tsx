import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { cookies } from 'next/headers';
import { getLanguageDirection, isLanguageCode } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Idara Management System',
  description: 'Multi-tenant SaaS platform for Madarsa/Idara management',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get('app_language')?.value || 'en';
  const language = isLanguageCode(languageCookie) ? languageCookie : 'en';
  const direction = getLanguageDirection(language);

  return (
    <html lang={language} dir={direction} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
