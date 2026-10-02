'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronsRight } from 'lucide-react';

const FALLBACK = [{ id: 'f', url_archivo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80', tipo_archivo: 'image', titulo: 'Nueva colección', subtitulo: 'Indumentaria deportiva premium' }];

// Cards negras con radio 24, scroll-snap con "peek" de la siguiente, guion = activo
export default function HeroCarousel({ slides, onCta }) {
  const list = slides?.length ? slides : FALLBACK;
  const track = useRef(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const fn = () => {
      const card = el.firstElementChild;
      if (!card) return;
      const w = card.getBoundingClientRect().width + 12;
      setIdx(Math.min(list.length - 1, Math.round(el.scrollLeft / w)));
    };
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, [list.length]);

  const go = (i) => {
    const el = track.current;
    const card = el?.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: 'smooth' });
  };

  return (
    <section className="s-hero" aria-label="Destacados de temporada">
      <div className="s-hero-track" ref={track}>
        {list.map((h, i) => (
          <article key={h.id || i} className="s-hero-card">
            {h.tipo_archivo === 'video' ? (
              <video src={h.url_archivo} autoPlay muted loop playsInline preload="metadata" />
            ) : (
              <img src={h.url_archivo} alt="" fetchPriority={i === 0 ? 'high' : 'auto'} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            )}
            <div className="s-hero-shade" />
            <div className="s-hero-body">
              <h2>{h.titulo || 'Nueva colección'}</h2>
              {h.subtitulo && <p>{h.subtitulo}</p>}
            </div>
            <button className="s-hero-cta s-press" onClick={onCta}>Ver más <ChevronsRight size={16} strokeWidth={2} /></button>
          </article>
        ))}
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
