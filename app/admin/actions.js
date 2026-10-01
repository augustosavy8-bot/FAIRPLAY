'use server';
import { revalidatePath } from 'next/cache';
import { getAdmin } from '@/lib/auth';

// Columnas que el admin puede escribir en cada tabla. Cualquier otra se descarta.
const COLUMNS = {
  productos:    ['nombre', 'tipo', 'categoria', 'talles_disponibles', 'imagen_url', 'fotos', 'descripcion', 'activo'],
  categorias:   ['id', 'label', 'icon', 'orden'],
  hero_slides:  ['url_archivo', 'tipo_archivo', 'titulo', 'subtitulo', 'activo'],
  banner_cards: ['titulo', 'subtitulo', 'etiqueta', 'cta', 'imagen_url', 'bloque', 'orden', 'activo', 'categoria'],
  ticker_items: ['texto', 'activo', 'orden'],
};

const BUCKET = 'imagenes';

function pick(table, row) {
  const cols = COLUMNS[table];
  if (!cols) throw new Error(`Tabla no permitida: ${table}`);
  return Object.fromEntries(Object.entries(row || {}).filter(([k]) => cols.includes(k)));
}

// Ejecuta fn solo si hay sesión de admin. Devuelve { data, error } serializable.
async function asAdmin(fn) {
  const { sb, user } = await getAdmin();
  if (!user) return { data: null, error: { message: 'Sesión vencida o sin permisos. Volvé a ingresar.' } };
  try {
    const { data, error } = await fn(sb);
    if (error) return { data: null, error: { message: error.message } };
    revalidatePath('/');
    return { data: data ?? null, error: null };
  } catch (e) {
    return { data: null, error: { message: e.message || 'Error inesperado' } };
  }
}

export async function adminInsert(table, row) {
  return asAdmin((sb) => sb.from(table).insert(pick(table, row)).select().single());
}

export async function adminUpdate(table, id, patch) {
  return asAdmin((sb) => sb.from(table).update(pick(table, patch)).eq('id', id));
}

export async function adminUpsert(table, row) {
  return asAdmin((sb) => sb.from(table).upsert(pick(table, row)));
}

export async function adminDelete(table, id) {
  pick(table, {});
  return asAdmin((sb) => sb.from(table).delete().eq('id', id));
}

export async function setHeroActivo(id) {
  return asAdmin(async (sb) => {
    const off = await sb.from('hero_slides').update({ activo: false }).neq('id', id);
    if (off.error) return off;
    return sb.from('hero_slides').update({ activo: true }).eq('id', id);
  });
}

// Genera una URL firmada para que el navegador del admin suba un archivo directo a Storage.
export async function createUploadUrl(fileName, contentType) {
  if (!/^(image|video)\//.test(contentType || '')) {
    return { data: null, error: { message: 'Solo se permiten imágenes o videos' } };
  }
  const ext  = ((fileName || '').split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { sb, user } = await getAdmin();
  if (!user) return { data: null, error: { message: 'Sesión vencida o sin permisos. Volvé a ingresar.' } };
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { data: null, error: { message: error.message } };
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { data: { path: data.path, token: data.token, publicUrl: pub.publicUrl }, error: null };
}
