'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from './StoreProvider';

export default function Header() {
  const { bagCount, setBagOpen, setSearchOpen, favs } = useStore();
  const path = usePathname();

  return (
    <header className="s-header">
      <div className="s-wrap s-header-in">
        <Link href="/" className="s-logo" aria-label="Fair Play — Inicio">
          <Image src="/logo.png" alt="Fair Play" width={120} height={40} priority />
        </Link>

        <nav className="s-dnav" aria-label="Principal">
          <Link href="/" className={`s-navlink s-press${path === '/' ? ' on' : ''}`}>Inicio</Link>
          <button className="s-navlink s-press" onClick={() => setSearchOpen(true)}>
            <Search size={18} strokeWidth={1.75} /> Buscar
          </button>
          <Link href="/favoritos" className={`s-navlink s-press${path === '/favoritos' ? ' on' : ''}`}>
            <Heart size={18} strokeWidth={1.75} /> Favoritos{favs.length > 0 && <span className="s-navcount">{favs.length}</span>}
          </Link>
        </nav>

        <button className="s-iconbtn s-press" onClick={() => setBagOpen(true)} aria-label={`Bolsa (${bagCount})`}>
          <ShoppingBag size={20} strokeWidth={1.75} />
          {bagCount > 0 && <span className="s-count">{bagCount}</span>}
        </button>
      </div>
    </header>
  );
}
