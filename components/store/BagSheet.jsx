'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from './StoreProvider';
import Stepper from './Stepper';
import { formatPrecio, waLink } from '@/lib/product';

export default function BagSheet() {
  const { bag, bagCount, bagOpen, setBagOpen, setQty, removeFromBag } = useStore();

  useEffect(() => {
    if (!bagOpen) return;
    const fn = (e) => e.key === 'Escape' && setBagOpen(false);
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [bagOpen, setBagOpen]);

  if (!bagOpen) return null;

  const allPriced = bag.length > 0 && bag.every((x) => x.precio != null && x.precio > 0);
  const total = allPriced ? bag.reduce((s, x) => s + x.precio * x.cantidad, 0) : null;

  const send = () => {
    if (!bag.length) return;
    const lines = bag.map((x, i) =>
      `${i + 1}. *${x.nombre}* — Talle: ${x.talle || 'Único'} — Cant: ${x.cantidad}${x.precio ? ` — ${formatPrecio(x.precio * x.cantidad)}` : ''}`
    ).join('\n');
    const tot = total ? `\n\nTotal: ${formatPrecio(total)}` : '';
    window.open(waLink(`¡Hola Fair Play! 👋\n\nQuiero consultar:\n\n${lines}${tot}\n\n¿Pueden confirmarme stock y envío? ¡Gracias!`), '_blank');
  };

  return (
    <>
      <div className="s-ov" onClick={() => setBagOpen(false)} />
      <aside className="s-sheet s-bag" role="dialog" aria-modal="true" aria-label="Bolsa">
        <div className="s-sheet-grab" />
        <div className="s-sheet-h">
          <div>
            <h2>Tu bolsa</h2>
            <p>{bagCount} {bagCount === 1 ? 'prenda' : 'prendas'}</p>
          </div>
          <button className="s-iconbtn s-press" onClick={() => setBagOpen(false)} aria-label="Cerrar"><X size={20} strokeWidth={1.75} /></button>
        </div>

        <div className="s-sheet-body">
          {!bag.length ? (
            <div className="s-empty">
              <div className="s-empty-ic"><ShoppingBag size={28} strokeWidth={1.5} /></div>
              <p className="s-empty-t">Tu bolsa está vacía</p>
              <p className="s-empty-s">Elegí tus prendas y consultanos por WhatsApp.</p>
              <button className="s-cta s-cta-sm s-press" onClick={() => setBagOpen(false)}>Seguir mirando</button>
            </div>
          ) : bag.map((x) => (
            <div key={x.key} className="s-bag-it">
              <Link href={`/producto/${x.slug}`} onClick={() => setBagOpen(false)} className="s-thumb">
                {x.foto && <img src={x.foto} alt="" loading="lazy" />}
              </Link>
              <div className="s-bag-info">
                <Link href={`/producto/${x.slug}`} onClick={() => setBagOpen(false)} className="s-bag-name">{x.nombre}</Link>
                <span className="s-sub">Talle {x.talle || 'Único'}</span>
                <div className="s-bag-row">
                  <Stepper value={x.cantidad} min={0} onChange={(n) => setQty(x.key, n)} />
                  {x.precio ? <strong className="s-bag-price">{formatPrecio(x.precio * x.cantidad)}</strong> : null}
                </div>
              </div>
              <button className="s-bag-del s-press" onClick={() => removeFromBag(x.key)} aria-label="Quitar"><Trash2 size={17} strokeWidth={1.75} /></button>
            </div>
          ))}
        </div>

        {bag.length > 0 && (
          <div className="s-sheet-f">
            {total != null && (
              <div className="s-total"><span>Total</span><strong>{formatPrecio(total)}</strong></div>
            )}
            <button className="s-cta s-press" onClick={send}>
              <ShoppingBag size={20} strokeWidth={1.75} /> Enviar pedido por WhatsApp
            </button>
            <p className="s-note">Te respondemos con stock, precio y envío.</p>
          </div>
        )}
      </aside>
    </>
  );
}
