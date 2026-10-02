'use client';
import { ChevronRight } from 'lucide-react';

// Tarjetas promocionales (banner_cards). Al tocar el CTA filtran el catálogo por categoría.
export default function PromoCards({ cards, onFilter }) {
  const visible = (cards || []).filter((c) => c.activo !== false && c.imagen_url).slice(0, 4);
  if (!visible.length) return null;

  return (
    <section className={`s-wrap s-promos s-promos-${Math.min(visible.length, 3)}`}>
      {visible.map((c, i) => (
        <button key={c.id || i} className="s-promo s-press" onClick={() => onFilter?.(c.categoria)}>
          <img src={c.imagen_url} alt={c.titulo || ''} loading="lazy" decoding="async" />
          <div className="s-promo-shade" />
          <div className="s-promo-body">
            {c.etiqueta && <span className="s-bdg s-bdg-light">{c.etiqueta}</span>}
            {c.titulo && <h3>{c.titulo}</h3>}
            {c.subtitulo && <p>{c.subtitulo}</p>}
            {c.cta && <span className="s-promo-cta">{c.cta} <ChevronRight size={15} strokeWidth={2} /></span>}
          </div>
        </button>
      ))}
    </section>
  );
}
