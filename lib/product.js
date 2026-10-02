// Helpers de producto compartidos entre server y client.

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5493471510863';
export const SITE_URL  = 'https://www.fairplayvidadeportiva.com.ar';

const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const formatPrecio = (n) => (n == null ? '' : ars.format(n));

export const tienePrecio = (p) => p?.precio != null && p.precio > 0;

// % de descuento solo si hay precio anterior mayor al actual
export function pctOff(p) {
  if (!tienePrecio(p) || !p.precio_anterior || p.precio_anterior <= p.precio) return 0;
  return Math.round((1 - p.precio / p.precio_anterior) * 100);
}

export function esNuevo(p, dias = 30) {
  if (!p?.created_at) return false;
  return Date.now() - new Date(p.created_at).getTime() < dias * 86400000;
}

export const fotoPrincipal = (p) => p?.fotos?.[0] || p?.imagen_url || null;

export function catLabel(p, cats = []) {
  const c = cats.find((x) => x.id === p.tipo);
  const label = c?.label || p.tipo || '';
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

export const generoLabel = (g) => (g ? g.charAt(0).toUpperCase() + g.slice(1) : '');

export const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
