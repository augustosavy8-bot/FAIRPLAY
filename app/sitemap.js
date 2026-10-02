import { getProductos } from '@/lib/catalog';
import { SITE_URL } from '@/lib/product';

export const revalidate = 3600;

export default async function sitemap() {
  const products = await getProductos();
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products.map((p) => ({
      url: `${SITE_URL}/producto/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
