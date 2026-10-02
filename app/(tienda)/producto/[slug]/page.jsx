import { notFound } from 'next/navigation';
import { getProducto, getProductos } from '@/lib/catalog';
import { SITE_URL, fotoPrincipal, tienePrecio } from '@/lib/product';
import ProductDetail from '@/components/store/ProductDetail';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProductos();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const p = await getProducto(params.slug);
  if (!p) return { title: 'Producto no encontrado — Fair Play' };
  const description = (p.descripcion || `${p.nombre} en Fair Play — Vida Deportiva.`).slice(0, 160);
  const img = fotoPrincipal(p);
  return {
    title: `${p.nombre} — Fair Play`,
    description,
    alternates: { canonical: `${SITE_URL}/producto/${p.slug}` },
    openGraph: {
      title: p.nombre,
      description,
      url: `${SITE_URL}/producto/${p.slug}`,
      siteName: 'Fair Play',
      type: 'website',
      images: img ? [{ url: img }] : [],
    },
    twitter: { card: 'summary_large_image', title: p.nombre, description, images: img ? [img] : [] },
  };
}

export default async function ProductoPage({ params }) {
  const p = await getProducto(params.slug);
  if (!p) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    image: p.fotos,
    description: p.descripcion || undefined,
    brand: { '@type': 'Brand', name: 'Fair Play' },
    ...(tienePrecio(p) && {
      offers: { '@type': 'Offer', priceCurrency: 'ARS', price: p.precio, availability: 'https://schema.org/InStock', url: `${SITE_URL}/producto/${p.slug}` },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductDetail p={p} />
    </>
  );
}
