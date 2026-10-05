'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronsRight } from 'lucide-react';

const FALLBACK = [{ id: 'f', url_archivo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80', tipo_archivo: 'image', titulo: 'Nueva colección', subtitulo: 'Indumentaria deportiva premium' }];
const MQ_DESKTOP = '(min-width: 768px)';

// Cards negras con radio 24, scroll-snap con "peek" de la siguiente, guion = activo.
// Efecto 3D: si el slide tiene recorte (persona con fondo transparente), la card es 20% más alta
// que el marco negro y el recorte ocupa toda la card, así la persona sobresale por arriba.
export default function HeroCarousel({ slides, onCta }) {
  const list = slides?.length ? slides : FALLBACK;
  const track = useRef(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fn = () => {
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      let best = 0, bestDist = Infinity;
      [...el.children].forEach((card, i) => {
        const rel = (card.offsetLeft - el.offsetLeft - pad - el.scrollLeft) / (card.offsetWidth || 1);
        if (Math.abs(rel) < bestDist) { bestDist = Math.abs(rel); best = i; }
        // Parallax leve del recorte respecto del marco
        if (!reduce) card.style.setProperty('--p', Math.max(-1, Math.min(1, rel)).toFixed(3));
      });
      setIdx(best);
    };
    fn();
    el.addEventListener('scroll', fn, { passive: true });
    window.addEventListener('resize', fn);
    return () => { el.removeEventListener('scroll', fn); window.removeEventListener('resize', fn); };
  }, [list.length]);

  const go = (i) => {
    const el = track.current;
    const card = el?.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: 'smooth' });
  };

  return (
    <section className="s-hero" aria-label="Destacados de temporada">
      <div className="s-hero-track" ref={track}>
        {list.map((h, i) => {
          const eager = i === 0;
          const popD = h.url_recorte || null;
          const popM = h.url_recorte_mobile || null;
          return (
            <article key={h.id || i} className={`s-hero-card${popM ? ' pop-m' : ''}${popD ? ' pop-d' : ''}`}>
              <div className="s-hero-frame">
                {h.tipo_archivo === 'video' ? (
                  <video src={h.url_archivo} autoPlay muted loop playsInline preload="metadata" />
                ) : (
                  <picture>
                    {h.url_archivo_mobile && <source media="(max-width: 767px)" srcSet={h.url_archivo_mobile} />}
                    <img src={h.url_archivo} alt="" fetchPriority={eager ? 'high' : 'auto'} loading={eager ? 'eager' : 'lazy'} decoding="async" />
                  </picture>
                )}
                <div className="s-hero-shade" />
              </div>

              {(popD || popM) && (
                <picture className="s-hero-pop" aria-hidden="true">
                  {/* srcset vacío no es válido: si falta una versión, esa breakpoint oculta el recorte por CSS */}
                  <source media={MQ_DESKTOP} srcSet={popD || popM} />
                  <img src={popM || popD} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
                </picture>
              )}

              <div className="s-hero-body">
                <h2>{h.titulo || 'Nueva colección'}</h2>
                {h.subtitulo && <p>{h.subtitulo}</p>}
              </div>
              <button className="s-hero-cta s-press" onClick={onCta}>Ver más <ChevronsRight size={16} strokeWidth={2} /></button>
            </article>
          );
        })}
      </div>
      {list.length > 1 && (
        <div className="s-dots" role="tablist">
          {list.map((h, i) => (
            <button key={h.id || i} className={i === idx ? 'on' : ''} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} aria-selected={i === idx} role="tab" />
          ))}
        </div>
      )}
    </section>
  );
}
