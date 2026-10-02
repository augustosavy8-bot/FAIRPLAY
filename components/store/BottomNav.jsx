'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Search, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from './StoreProvider';

export default function BottomNav() {
  const { bagCount, bagOpen, setBagOpen, searchOpen, setSearchOpen } = useStore();
  const path = usePathname();
  if (path.startsWith('/producto/')) return null;

  const idle = !bagOpen && !searchOpen;
  return (
    <nav className="s-bnav" aria-label="Navegación">
      <Link href="/" className={`s-bnav-it s-press${idle && path === '/' ? ' on' : ''}`} aria-label="Inicio">
        <House size={21} strokeWidth={1.75} />
      </Link>
      <button className={`s-bnav-it s-press${searchOpen ? ' on' : ''}`} onClick={() => setSearchOpen(true)} aria-label="Buscar">
        <Search size={21} strokeWidth={1.75} />
      </button>
      <Link href="/favoritos" className={`s-bnav-it s-press${idle && path === '/favoritos' ? ' on' : ''}`} aria-label="Favoritos">
        <Heart size={21} strokeWidth={1.75} />
      </Link>
      <button className={`s-bnav-it s-press${bagOpen ? ' on' : ''}`} onClick={() => setBagOpen(true)} aria-label={`Bolsa (${bagCount})`}>
        <ShoppingBag size={21} strokeWidth={1.75} />
        {bagCount > 0 && <span className="s-dot" />}
      </button>
    </nav>
  );
}
