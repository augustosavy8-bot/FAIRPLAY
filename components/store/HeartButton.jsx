'use client';
import { Heart } from 'lucide-react';
import { useStore } from './StoreProvider';

// variant: 'dark' (círculo negro) | 'light' (círculo blanco) | 'outline'
export default function HeartButton({ id, variant = 'dark', size = 40, className = '' }) {
  const { isFav, toggleFav, notify } = useStore();
  const on = isFav(id);
  return (
    <button
      className={`s-heart s-heart-${variant} s-press${on ? ' on' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(id); notify(on ? 'Quitado de favoritos' : 'Guardado en favoritos'); }}
      aria-label={on ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={on}
    >
      <Heart size={Math.round(size * 0.45)} strokeWidth={1.75} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}
