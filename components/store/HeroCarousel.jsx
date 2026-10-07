'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronsRight } from 'lucide-react';

const FALLBACK = [{ id: 'f', url_archivo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80', tipo_archivo: 'image', titulo: 'Nueva colección', subtitulo: 'Indumentaria deportiva premium' }];
const MQ_DESKTOP = '(min-width: 768px)';

// Si el recorte es más ancho que la card (no respeta 2:3 / 40:21), se escala por altura ("cover")
// para que la persona igual llegue a la franja superior y sobresalga. Si es más alto, "contain".
function fitPop(e) {
  const img = e.currentTarget;
  if (!img.naturalWidth || !img.clientHeight) return;
  const wider = img.naturalWidth / img.naturalHeight > img.clientWidth / img.clientHeight + 0.01;
  img.dataset.fit = wider ? 'cover' : 'contain';
}

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
    // Indicador activo: se calcula como mucho una vez por frame (el swipe dispara muchos eventos de scroll)
    let raf = 0;
    const update = () => {
      raf = 0;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      let best = 0, bestDist = Infinity;
      [...el.children].forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - el.offsetLeft - pad - el.scrollLeft);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setIdx(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // Los recortes pueden haber cargado antes de hidratar (onLoad no llega): ajustarlos acá y al rotar/cambiar de tamaño
    const fitAll = () => el.querySelectorAll('.s-hero-pop img').forEach((img) => img.complete && fitPop({ currentTarget: img }));
    const onResize = () => { onScroll(); fitAll(); };
    update(); fitAll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
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
                    <img src={h.url_archivo} alt="" fetchPriority={eager ? 'high' : 'low'} loading="eager" decoding="async" />
                  </picture>
                )}
                <div className="s-hero-shade" />
              </div>

              {(popD || popM) && (
                <picture className="s-hero-pop" aria-hidden="true">
                  {/* srcset vacío no es válido: si falta una versión, esa breakpoint oculta el recorte por CSS */}
                  <source media={MQ_DESKTOP} srcSet={popD || popM} />
                  {/* Todos eager: así el recorte del slide siguiente ya está cargado al deslizar */}
                  <img src={popM || popD} alt="" loading="eager" fetchPriority={eager ? 'high' : 'low'} decoding={eager ? 'sync' : 'async'} onLoad={fitPop} />
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
