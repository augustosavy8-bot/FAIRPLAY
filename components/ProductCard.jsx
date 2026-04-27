'use client';
import { useState } from 'react';
import { Ic } from './Icons';

export default function ProductCard({ p, onAdd, cats = [], onOpen }) {
  const [talle, setTalle] = useState(null);
  const [added, setAdded] = useState(false);
  const [shake, setShake] = useState(false);

  const talles    = Array.isArray(p.talles_disponibles) ? p.talles_disponibles : [];
  const cat       = cats.find((c) => c.id === p.tipo);
  const firstPhoto = Array.isArray(p.fotos) && p.fotos.length > 0
    ? p.fotos[0]
    : p.imagen_url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80';
  const hasMulti  = Array.isArray(p.fotos) && p.fotos.length > 1;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (talles.length > 0 && !talle) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    onAdd({ ...p, talleSeleccionado: talle || 'Único' });
    setAdded(true);
    setTimeout(() => { setAdded(false); setTalle(null); }, 1800);
  };

  return (
    <div className="pcard" onClick={() => onOpen?.(p)}>
      <div className="pcard-img">
        <img
          src={firstPhoto} alt={p.nombre}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'; }}
        />
        <div className="pcard-badge">{cat?.icon || ''} {cat?.label || p.tipo}</div>
        {hasMulti && (
          <div style={{ position:'absolute',top:10,right:10,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:100,fontFamily:"var(--fd)",letterSpacing:'.06em' }}>
            +{p.fotos.length} fotos
          </div>
        )}
        <button
          className="pcard-quick"
          onClick={handleAdd}
          style={{ background: added ? '#16a34a' : shake ? '#dc2626' : '#0a0a0a', animation: shake ? 'shake .4s' : 'none' }}
        >
          {added ? '✓ AGREGADO' : shake ? 'ELEGÍ UN TALLE' : 'AGREGAR A CONSULTA'}
        </button>
      </div>

      <div className="pcard-body">
        <p style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:3,textTransform:'capitalize' }}>{p.categoria || ''}</p>
        <p style={{ fontSize:15,fontWeight:800,color:'#0a0a0a',fontFamily:"var(--fd)",letterSpacing:'-.01em',lineHeight:1.2,marginBottom:8 }}>{p.nombre}</p>
        {talles.length > 0 && (
          <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
            {talles.map((t) => (
              <button
                key={t}
                className={`tchip${talle === t ? ' sel' : ''}`}
                onClick={(e) => { e.stopPropagation(); setTalle(t); }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
