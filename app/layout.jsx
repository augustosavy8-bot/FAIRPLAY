import { Barlow, Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';

// Barlow es la fuente de texto del admin: no se precarga, así no compite con las imágenes de la tienda
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-barlow',
  display: 'swap',
  preload: false,
});

// Títulos grandes (tienda y admin): solo los pesos que se usan
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const SUPABASE_ORIGIN = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;

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
      <head>
        {/* Las fotos vienen de Supabase Storage: abrir la conexión antes de que el HTML pida la primera */}
        <link rel="preconnect" href={SUPABASE_ORIGIN} />
        <link rel="dns-prefetch" href={SUPABASE_ORIGIN} />
      </head>
      <body>{children}</body>
    </html>
  );
}
