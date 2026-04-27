'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Ic } from './Icons';

export default function Carousel({ title, items, cats, onAdd, onOpen, autoPlay = true, interval = 3500 }) {
  const [idx,     setIdx]  = useState(0);
  const timerRef           = useRef(null);
  const [perView, setPV]   = useState(4);

  useEffect(() => {
    const update = () => setPV(window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 4);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const max  = Math.max(0, items.length - perView);
  const pct  = 100 / perView;
  const next = useCallback(() => setIdx((i) => (i >= max ? 0 : i + 1)), [max]);
  const prev = () => setIdx((i) => (i <= 0 ? max : i - 1));

  useEffect(() => {
    if (!autoPlay || items.length <= perView) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, next, items.length, perView]);

  const pause  = () => clearInterval(timerRef.current);
  const resume = () => { if (autoPlay) timerRef.current = setInterval(next, interval); };

  if (!items.length) return null;

  return (
    <div style={{ marginBottom:56 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
        <h2 style={{ fontFamily:"var(--fd)",fontSize:'clamp(20px,2.5vw,30px)',fontWeight:900,letterSpacing:'.04em',textTransform:'uppercase' }}>{title}</h2>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ display:'flex',gap:4,marginRight:4 }}>
            {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
              <div key={i} onClick={() => setIdx(Math.min(i, max))}
                style={{ width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?'#0a0a0a':'#e5e7eb',cursor:'pointer',transition:'all .3s' }} />
            ))}
          </div>
          <button className="cbtn" onClick={() => { pause(); prev(); }} style={{ width:36,height:36 }}><Ic n="cl" s={14} /></button>
          <button className="cbtn" onClick={() => { pause(); next(); }} style={{ width:36,height:36 }}><Ic n="cr" s={14} /></button>
        </div>
      </div>

      <div style={{ overflow:'hidden' }} onMouseEnter={pause} onMouseLeave={resume}>
        <div style={{ display:'flex',transition:'transform .5s cubic-bezier(.25,.46,.45,.94)',transform:`translateX(-${idx * pct}%)` }}>
          {items.map((p, i) => (
            <div key={p.id || i} style={{ flex:`0 0 ${pct}%`,paddingRight:16 }}>
              <ProductCard p={p} onAdd={onAdd} cats={cats} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
