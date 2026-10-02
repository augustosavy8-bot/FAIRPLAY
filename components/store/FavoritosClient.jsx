'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from './StoreProvider';
import ProductCard from './ProductCard';

export default function FavoritosClient() {
  const { products, favs } = useStore();
  const list = products.filter((p) => favs.includes(p.id));

  return (
    <section className="s-sec s-wrap">
      <div className="s-sec-h s-sec-h-flush">
        <h1>Favoritos</h1>
        {list.length > 0 && <span className="s-sub">{list.length} {list.length === 1 ? 'producto' : 'productos'}</span>}
      </div>
      {list.length ? (
        <div className="s-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="s-empty">
          <div className="s-empty-ic"><Heart size={28} strokeWidth={1.5} /></div>
          <p className="s-empty-t">Todavía no guardaste nada</p>
          <p className="s-empty-s">Tocá el corazón en los productos que te gusten.</p>
          <Link href="/" className="s-cta s-cta-sm s-press">Explorar la tienda</Link>
        </div>
      )}
    </section>
  );
}
