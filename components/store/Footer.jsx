import Image from 'next/image';
import Link from 'next/link';
import { WA_NUMBER } from '@/lib/product';

export default function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-wrap s-footer-in">
        <Link href="/admin" className="s-footer-logo" aria-label="Fair Play">
          <Image src="/logo.png" alt="Fair Play" width={120} height={40} />
        </Link>
        <div className="s-footer-links">
          <a href="https://instagram.com/fairplay_vidadeportiva" target="_blank" rel="noreferrer">Instagram</a>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <Link href="/favoritos">Favoritos</Link>
        </div>
        <div className="s-footer-cr">
          <span>© {new Date().getFullYear()} Fair Play — Vida Deportiva</span>
          <span className="s-footer-by">by <img src="/LOGO_FOKO.png" alt="Foko" /></span>
        </div>
      </div>
    </footer>
  );
}
