import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Data fetchers ─────────────────────────────────────────────

export async function getProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('getProductos:', error); return []; }
  return data || [];
}

export async function getHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getHeroSlides:', error); return []; }
  return data || [];
}

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true });
  if (error) { console.error('getCategorias:', error); return []; }
  return data || [];
}

export async function getBannerCards() {
  const { data, error } = await supabase
    .from('banner_cards')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error) { console.error('getBannerCards:', error); return []; }
  return data || [];
}

// ── Upload image to Supabase Storage ─────────────────────────

export async function uploadImage(file, bucket = 'imagenes') {
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
