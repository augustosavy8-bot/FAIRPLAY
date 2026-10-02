'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useStore } from './StoreProvider';
import HeroCarousel from './HeroCarousel';
import PromoCards from './PromoCards';
import ProductCard, { FeaturedCard } from './ProductCard';
import { catLabel } from '@/lib/product';

const GENEROS = [['todos', 'Todos'], ['hombre', 'Hombre'], ['mujer', 'Mujer'], ['unisex', 'Unisex'], ['niños', 'Niños']];
const PAGE = 24;

export default function HomeClient({ heros, bannerCards }) {
  const { products, cats } = useStore();
  const params = useSearchParams();
  const [cat, setCat] = useState('todos');
  const [gen, setGen] = useState('todos');
  const [limit, setLimit] = useState(PAGE);
  const catalogRef = useRef(null);

  // Filtro por URL (?cat=) desde el buscador
  useEffect(() => {
    const c = params.get('cat');
    if (c) { setCat(c); setGen('todos'); setTimeout(scrollToCatalog, 60); }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToCatalog = () => {
    const el = catalogRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  };

  const featured = useMemo(() => {
    const d = products.filter((p) => p.destacado);
    return (d.length ? d : products).slice(0, 10);
  }, [products]);

  const generos = useMemo(() => GENEROS.filter(([v]) => v === 'todos' || products.some((p) => p.categoria === v)), [products]);
  const usedCats = useMemo(() => cats.filter((c) => products.some((p) => p.tipo === c.id)), [cats, products]);

  const filtered = useMemo(() => products.filter((p) =>
    (cat === 'todos' || p.tipo === cat) && (gen === 'todos' || p.categoria === gen)
  ), [products, cat, gen]);

  useEffect(() => { setLimit(PAGE); }, [cat, gen]);

  const fromPromo = (categoria) => { if (categoria) { setCat(categoria); setGen('todos'); } scrollToCatalog(); };

  return (
    <>
      <HeroCarousel slides={heros} onCta={scrollToCatalog} />

      {featured.length > 0 && (
        <section className="s-sec">
          <div className="s-wrap s-sec-h">
            <h2>Lo más buscado</h2>
            <button className="s-link s-press" onClick={() => { setCat('todos'); setGen('todos'); scrollToCatalog(); }}>
              Ver todo <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="s-row">
            {featured.map((p) => <FeaturedCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <PromoCards cards={bannerCards.filter((c) => c.bloque === 1 || !c.bloque)} onFilter={fromPromo} />

      <section className="s-sec" id="catalogo" ref={catalogRef}>
        <div className="s-wrap s-sec-h">
          <h2>Catálogo</h2>
          <span className="s-sub">{filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}</span>
        </div>

        <div className="s-chips" role="tablist" aria-label="Categorías">
          <button className={`s-chip s-press${cat === 'todos' ? ' on' : ''}`} onClick={() => setCat('todos')}>Todo</button>
          {usedCats.map((c) => (
            <button key={c.id} className={`s-chip s-press${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
              {catLabel({ tipo: c.id }, cats)}
            </button>
          ))}
        </div>

        {generos.length > 2 && (
          <div className="s-chips s-chips-sm" aria-label="Género">
            {generos.map(([v, l]) => (
              <button key={v} className={`s-chip s-chip-ol s-press${gen === v ? ' on' : ''}`} onClick={() => setGen(v)}>{l}</button>
            ))}
          </div>
        )}

        <div className="s-wrap">
          {filtered.length ? (
            <>
              <div className="s-grid">
                {filtered.slice(0, limit).map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
              </div>
              {filtered.length > limit && (
                <div className="s-more">
                  <button className="s-cta s-cta-ol s-press" onClick={() => setLimit((l) => l + PAGE)}>
                    Ver más productos ({filtered.length - limit})
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="s-empty">
              <p className="s-empty-t">Sin resultados</p>
              <p className="s-empty-s">Probá con otra categoría.</p>
              <button className="s-cta s-cta-sm s-press" onClick={() => { setCat('todos'); setGen('todos'); }}>Ver todo</button>
            </div>
          )}
        </div>
      </section>

      <PromoCards cards={bannerCards.filter((c) => c.bloque === 2)} onFilter={fromPromo} />
    </>
  );
}
