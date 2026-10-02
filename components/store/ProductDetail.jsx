'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, ShoppingBag } from 'lucide-react';
import { useStore } from './StoreProvider';
import HeartButton from './HeartButton';
import Badges from './Badges';
import Price from './Price';
import Stepper from './Stepper';
import { catLabel, generoLabel, tienePrecio, waLink } from '@/lib/product';

export default function ProductDetail({ p }) {
  const router = useRouter();
  const { cats, ajustes, addToBag, setBagOpen, notify } = useStore();
  const [foto, setFoto] = useState(0);
  const [talle, setTalle] = useState(null);
  const [qty, setQty] = useState(1);
  const [shake, setShake] = useState(false);

  const talles = Array.isArray(p.talles_disponibles) ? p.talles_disponibles : [];
  const sub = [catLabel(p, cats), generoLabel(p.categoria)].filter(Boolean).join(' · ');

  const back = () => {
    if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) router.back();
    else router.push('/');
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.nombre, text: `${p.nombre} — Fair Play`, url });
      else { await navigator.clipboard.writeText(url); notify('Link copiado'); }
    } catch {}
  };

  const needTalle = () => {
    if (talles.length > 0 && !talle) {
      setShake(true); setTimeout(() => setShake(false), 450);
      return true;
    }
    return false;
  };

  const add = () => {
    if (needTalle()) return;
    addToBag(p, talle, qty);
    setBagOpen(true);
  };

  const consultar = () => {
    if (needTalle()) return;
    window.open(waLink(`¡Hola Fair Play! 👋 Quiero consultar disponibilidad de: *${p.nombre}* - Talle: ${talle || 'Único'} - Cantidad: ${qty}`), '_blank');
  };

  return (
    <div className="s-pd">
      <div className="s-pd-media">
        <div className="s-pd-photo">
          {p.fotos[foto] && <img key={foto} src={p.fotos[foto]} alt={p.nombre} fetchPriority="high" />}
        </div>
        <button className="s-round s-pd-back s-press" onClick={back} aria-label="Volver"><ArrowLeft size={20} strokeWidth={1.75} /></button>
        <button className="s-round s-pd-share s-press" onClick={share} aria-label="Compartir"><Share2 size={19} strokeWidth={1.75} /></button>
        {p.fotos.length > 1 && (
          <div className="s-pd-thumbs">
            {p.fotos.map((f, i) => (
              <button key={f} className={`s-press${i === foto ? ' on' : ''}`} onClick={() => setFoto(i)} aria-label={`Foto ${i + 1}`}>
                <img src={f} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="s-pd-panel">
        <Badges p={p} dias={ajustes.nuevoDias} />
        <div className="s-pd-title">
          <div>
            <h1>{p.nombre}</h1>
            {sub && <p className="s-sub">{sub}</p>}
          </div>
          <HeartButton id={p.id} variant="outline" size={44} />
        </div>

        {p.descripcion && <p className="s-pd-desc">{p.descripcion}</p>}

        {talles.length > 0 && (
          <div className={`s-pd-block${shake ? ' s-shake' : ''}`}>
            <div className="s-pd-lbl">
              <span>Elegí tu talle{talle && <b> · {talle}</b>}</span>
            </div>
            <div className="s-sizes">
              {talles.map((t) => (
                <button key={t} className={`s-size s-press${talle === t ? ' on' : ''}`} onClick={() => setTalle(t === talle ? null : t)} aria-pressed={talle === t}>
                  {t}
                </button>
              ))}
            </div>
            {shake && <p className="s-warn">Elegí un talle para continuar</p>}
          </div>
        )}

        <div className="s-pd-block s-pd-qty">
          <span className="s-pd-lbl">Cantidad</span>
          <Stepper value={qty} onChange={setQty} />
        </div>

        {tienePrecio(p) && (
          <div className="s-pd-total">
            <span className="s-sub">Total</span>
            <Price p={p} qty={qty} size="lg" />
          </div>
        )}

        <div className="s-pd-bar">
          <button className="s-cta s-press" onClick={add}>
            <ShoppingBag size={20} strokeWidth={1.75} /> Agregar a la bolsa
          </button>
          <button className="s-link s-pd-wa s-press" onClick={consultar}>o consultá por WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
