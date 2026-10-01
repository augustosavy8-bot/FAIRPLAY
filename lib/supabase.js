import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession:     false,
          autoRefreshToken:   false,
          detectSessionInUrl: false,
        },
        realtime: {
          params: { eventsPerSecond: -1 },
        },
        global: {
          headers: { 'x-my-custom-header': 'fairplay' },
        },
      }
    );
  }
  return _client;
}

// Proxy lazy — no llama a createClient en tiempo de módulo (seguro en build estático)
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabaseClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

// ── Data fetchers ─────────────────────────────────────────────

export async function getProductos() {
  const { data, error } = await getSupabaseClient()
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('getProductos:', error); return []; }
  return data || [];
}

export async function getHeroSlides() {
  const { data, error } = await getSupabaseClient()
    .from('hero_slides')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getHeroSlides:', error); return []; }
  return data || [];
}

export async function getCategorias() {
  const { data, error } = await getSupabaseClient()
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true });
  if (error) { console.error('getCategorias:', error); return []; }
  return data || [];
}

export async function getBannerCards() {
  const { data, error } = await getSupabaseClient()
    .from('banner_cards')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error) { console.error('getBannerCards:', error); return []; }
  return data || [];
}
