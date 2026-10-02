'use client';
import { memo } from 'react';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import HeartButton from './HeartButton';
import Badges from './Badges';
import Price from './Price';
import { catLabel, generoLabel } from '@/lib/product';

// Card de la grilla: foto sobre gris, nombre bold, categoría y precio
function ProductCard({ p, priority = false }) {
  const { cats, ajustes } = useStore();
  const foto = p.fotos[0];
  const sub = [catLabel(p, cats), generoLabel(p.categoria)].filter(Boolean).join(' · ');

  return (
    <Link href={`/producto/${p.slug}`} className="s-card s-press">
      <div className="s-card-img">
        {foto && <img src={foto} alt={p.nombre} loading={priority ? 'eager' : 'lazy'} decoding="async" />}
        <Badges p={p} dias={ajustes.nuevoDias} />
        <HeartButton id={p.id} variant="light" size={36} className="s-card-heart" />
      </div>
      <div className="s-card-body">
        <h3>{p.nombre}</h3>
        <span className="s-sub">{sub}</span>
        <Price p={p} size="sm" />
      </div>
    </Link>
  );
}

export default memo(ProductCard);

// Card grande para "Lo más buscado": corazón negro y franja translúcida con blur
export function FeaturedCard({ p }) {
  const { cats } = useStore();
  return (
    <Link href={`/producto/${p.slug}`} className="s-fcard s-press">
      {p.fotos[0] && <img src={p.fotos[0]} alt={p.nombre} loading="lazy" decoding="async" />}
      <HeartButton id={p.id} variant="dark" size={40} className="s-fcard-heart" />
      <div className="s-fcard-strip">
        <strong>{p.nombre}</strong>
        <span>{catLabel(p, cats)}</span>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="s-card">
      <div className="s-card-img s-skel" />
      <div className="s-card-body"><span className="s-skel s-skel-line" /><span className="s-skel s-skel-line short" /></div>
    </div>
  );
}
