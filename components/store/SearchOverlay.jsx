'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useStore } from './StoreProvider';
import { catLabel, formatPrecio, tienePrecio } from '@/lib/product';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function SearchOverlay() {
  const { products, cats, searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => input.current?.focus(), 50);
    const fn = (e) => e.key === 'Escape' && setSearchOpen(false);
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { clearTimeout(t); window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const t = norm(q.trim());
    if (t.length < 2) return [];
    return products.filter((p) => norm(`${p.nombre} ${catLabel(p, cats)} ${p.categoria}`).includes(t)).slice(0, 30);
  }, [q, products, cats]);

  if (!searchOpen) return null;
  const close = () => { setSearchOpen(false); setQ(''); };

  return (
    <div className="s-search" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="s-wrap s-search-top">
        <label className="s-search-box">
          <Search size={19} strokeWidth={1.75} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar remeras, buzos, calzas…" enterKeyHint="search" />
          {q && <button onClick={() => setQ('')} aria-label="Borrar"><X size={16} strokeWidth={2} /></button>}
        </label>
        <button className="s-search-cancel s-press" onClick={close}>Cancelar</button>
      </div>
      <div className="s-wrap s-search-res">
        {q.trim().length < 2 ? (
          <>
            <p className="s-search-lbl">Categorías</p>
            <div className="s-chips-wrap">
              {cats.map((c) => (
                <Link key={c.id} href={`/?cat=${encodeURIComponent(c.id)}#catalogo`} className="s-chip s-press" onClick={close}>
                  {catLabel({ tipo: c.id }, cats)}
                </Link>
              ))}
            </div>
          </>
        ) : results.length ? results.map((p) => (
          <Link key={p.id} href={`/producto/${p.slug}`} className="s-res s-press" onClick={close}>
            <span className="s-thumb s-thumb-sm">{p.fotos[0] && <img src={p.fotos[0]} alt="" loading="lazy" />}</span>
            <span className="s-res-info">
              <strong>{p.nombre}</strong>
              <span className="s-sub">{catLabel(p, cats)}{tienePrecio(p) ? ` · ${formatPrecio(p.precio)}` : ''}</span>
            </span>
          </Link>
        )) : (
          <p className="s-empty-s" style={{ padding: '32px 0', textAlign: 'center' }}>Sin resultados para “{q}”.</p>
        )}
      </div>
    </div>
  );
}
