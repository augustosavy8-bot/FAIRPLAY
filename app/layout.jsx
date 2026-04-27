import './globals.css';

export const metadata = {
  title: 'Fair Play — Vida Deportiva',
  description: 'Indumentaria deportiva premium. Remeras, buzos, camperas, mochilas y más.',
  openGraph: {
    title: 'Fair Play — Vida Deportiva',
    description: 'Indumentaria deportiva premium.',
    siteName: 'Fair Play',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
