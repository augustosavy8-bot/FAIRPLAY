import { esNuevo, pctOff } from '@/lib/product';

export default function Badges({ p, dias }) {
  const off = pctOff(p);
  const nuevo = esNuevo(p, dias);
  if (!off && !nuevo) return null;
  return (
    <div className="s-badges">
      {nuevo && <span className="s-bdg s-bdg-new">Nuevo</span>}
      {off > 0 && <span className="s-bdg s-bdg-off">-{off}%</span>}
    </div>
  );
}
