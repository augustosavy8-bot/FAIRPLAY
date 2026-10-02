import { Barlow, Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.fairplayvidadeportiva.com.ar'),
  title: 'Fair Play — Vida Deportiva',
  description: 'Indumentaria deportiva premium. Remeras, buzos, camperas, mochilas y más.',
  openGraph: {
    title: 'Fair Play — Vida Deportiva',
    description: 'Indumentaria deportiva premium.',
    siteName: 'Fair Play',
  },
};

export const viewport = {
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
