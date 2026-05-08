import StoreClient from '@/components/StoreClient';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function sbFetch(table, params = '') {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function StorePage() {
  const [rawProducts, heros, cats, bannerCards, tickerItems] = await Promise.all([
    sbFetch('productos',    'activo=eq.true&order=created_at.desc&limit=50'),
    sbFetch('hero_slides',  'order=created_at.desc'),
    sbFetch('categorias',   'order=orden.asc'),
    sbFetch('banner_cards', 'activo=eq.true&order=orden.asc'),
    sbFetch('ticker_items', 'activo=eq.true&select=id,texto&order=orden.asc'),
  ]);

  // Excluir base64 — solo pasar URLs de Storage al HTML pre-renderizado
  const products = rawProducts.map((p) => ({
    ...p,
    fotos:      (p.fotos || []).filter((f) => typeof f === 'string' && f.startsWith('http')),
    imagen_url: typeof p.imagen_url === 'string' && p.imagen_url.startsWith('data:') ? '' : p.imagen_url,
  }));

  return (
    <StoreClient
      initialProducts={products}
      initialHeros={heros}
      initialCats={cats}
      initialBannerCards={bannerCards}
      initialTickerItems={tickerItems}
    />
  );
}
