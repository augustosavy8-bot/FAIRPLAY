import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
    .order('created_at', { ascending: false });
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

// ── Upload image to Supabase Storage ─────────────────────────

export async function uploadImage(file, bucket = 'imagenes') {
  console.log('[uploadImage] archivo:', file.name, '| tipo:', file.type, '| tamaño:', file.size, 'bytes | bucket:', bucket);

  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, 'jpg');
  const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const sb   = getSupabaseClient();

  const { data: uploadData, error } = await sb.storage
    .from(bucket)
    .upload(path, file, {
      upsert:      true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('[uploadImage] error al subir:', error.message, error);
    throw new Error(error.message || 'Error al subir la imagen a Supabase Storage');
  }

  console.log('[uploadImage] subida OK:', uploadData);

  const { data } = sb.storage.from(bucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error('[uploadImage] No se obtuvo URL pública. Verificá que el bucket "' + bucket + '" sea público.');
  }

  console.log('[uploadImage] URL pública:', data.publicUrl);
  return data.publicUrl;
}
