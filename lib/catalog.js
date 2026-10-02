import 'server-only';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lecturas públicas por REST con ISR (revalidate 60s). La RLS solo expone lo activo.
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

const PRODUCT_COLS = 'id,slug,nombre,tipo,categoria,talles_disponibles,imagen_url,fotos,descripcion,precio,precio_anterior,destacado,created_at';

// Solo URLs http (nunca base64) y la foto principal primero
function normalize(p) {
  const fotos = (p.fotos || []).filter((f) => typeof f === 'string' && f.startsWith('http'));
  const main  = p.imagen_url && p.imagen_url.startsWith('http') ? p.imagen_url : null;
  return {
    ...p,
    fotos: fotos.length ? fotos : (main ? [main] : []),
    imagen_url: main || fotos[0] || null,
    precio: p.precio != null ? Number(p.precio) : null,
    precio_anterior: p.precio_anterior != null ? Number(p.precio_anterior) : null,
  };
}

export async function getProductos() {
  const rows = await sbFetch('productos', `select=${PRODUCT_COLS}&activo=eq.true&order=created_at.desc&limit=500`);
  return rows.map(normalize);
}

export async function getProducto(slug) {
  const rows = await sbFetch('productos', `select=${PRODUCT_COLS}&activo=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return rows[0] ? normalize(rows[0]) : null;
}

export async function getCategorias() {
  return sbFetch('categorias', 'select=id,label,icon,orden&order=orden.asc');
}

export async function getHome() {
  const [heros, bannerCards, tickerItems] = await Promise.all([
    sbFetch('hero_slides',  'order=activo.desc,created_at.desc'),
    sbFetch('banner_cards', 'activo=eq.true&order=orden.asc'),
    sbFetch('ticker_items', 'activo=eq.true&select=id,texto&order=orden.asc'),
  ]);
  return { heros, bannerCards, tickerItems };
}

export async function getAjustes() {
  const rows = await sbFetch('ajustes', 'select=clave,valor');
  const a = Object.fromEntries(rows.map((r) => [r.clave, r.valor]));
  return { nuevoDias: Number(a.nuevo_dias) || 30 };
}
