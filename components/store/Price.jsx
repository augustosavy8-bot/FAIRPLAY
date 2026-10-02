import { formatPrecio, pctOff, tienePrecio } from '@/lib/product';

// No renderiza nada mientras el producto no tenga precio cargado
export default function Price({ p, qty = 1, size = 'md' }) {
  if (!tienePrecio(p)) return null;
  const off = pctOff(p);
  return (
    <div className={`s-price s-price-${size}`}>
      <span className="s-price-now">{formatPrecio(p.precio * qty)}</span>
      {off > 0 && <span className="s-price-old">{formatPrecio(p.precio_anterior * qty)}</span>}
    </div>
  );
}
