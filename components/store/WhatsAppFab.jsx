'use client';
import { usePathname } from 'next/navigation';
import { WA_NUMBER } from '@/lib/product';
import { Ic } from '@/components/Icons';

export default function WhatsAppFab() {
  const path = usePathname();
  if (path.startsWith('/producto/')) return null;
  return (
    <a className="s-wa s-press" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
      <Ic n="wa" s={24} />
    </a>
  );
}
