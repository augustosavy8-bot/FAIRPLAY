'use client';
import { useState, memo } from 'react';

function ProductCard({ p, onAdd, cats = [], onOpen }) {
  const [talle, setTalle] = useState(null);
  const [added, setAdded] = useState(false);
  const [shake, setShake] = useState(false);

  const talles    = Array.isArray(p.talles_disponibles) ? p.talles_disponibles : [];
  const cat       = cats.find((c) => c.id === p.tipo);
  const firstPhoto = Array.isArray(p.fotos) && p.fotos.length > 0
    ? p.fotos[0]
    : p.imagen_url || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80';
  const extraFotos = Array.isArray(p.fotos) && p.fotos.length > 1 ? p.fotos.length : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (talles.length > 0 && !talle) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    onAdd({ ...p, talleSeleccionado: talle || 'Único' });
    setAdded(true);
    setTimeout(() => { setAdded(false); setTalle(null); }, 1800);
  };

  const genero = p.categoria
    ? p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase()
    : '';
  const catLabel = cat?.label || p.tipo || '';

  return (
    <div className="pcard" onClick={() => onOpen?.(p)}>

      {/* ── Imagen ── */}
      <div className="pcard-img">
        <img
          src={firstPhoto}
          alt={p.nombre}
          loading="lazy"
          decoding="async"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'; }}
        />

        {/* Badge de fotos — esquina inferior derecha, sutil */}
        {extraFotos > 0 && (
          <span style={{
            position:'absolute', bottom:8, right:8,
            background:'rgba(0,0,0,.52)', color:'#fff',
            fontSize:10, fontWeight:700, letterSpacing:'.04em',
            padding:'3px 7px', fontFamily:"var(--fd)",
            pointerEvents:'none',
          }}>
            +{extraFotos}
          </span>
        )}

        {/* Quick add */}
        <button
          className="pcard-quick"
          onClick={handleAdd}
          style={{
            background: added ? '#16a34a' : shake ? '#dc2626' : '#0a0a0a',
            animation: shake ? 'shake .4s' : 'none',
          }}
        >
          {added ? '✓ AGREGADO' : shake ? 'ELEGÍ UN TALLE' : 'AGREGAR A CONSULTA'}
        </button>
      </div>

      {/* ── Card body ── */}
      <div className="pcard-body">
        {/* Nombre */}
        <p style={{
          fontSize: 15, fontWeight: 800, color: '#0a0a0a',
          fontFamily: "var(--fd)", letterSpacing: '.04em',
          textTransform: 'uppercase', lineHeight: 1.15,
          marginBottom: 3,
        }}>
          {p.nombre}
        </p>

        {/* Género · Categoría */}
        <p style={{
          fontSize: 11, color: '#9ca3af', fontWeight: 500,
          marginBottom: talles.length > 0 ? 8 : 0,
          textTransform: 'lowercase', letterSpacing: '.01em',
        }}>
          {[genero, catLabel].filter(Boolean).join(' · ')}
        </p>

        {/* Talles */}
        {talles.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {talles.map((t) => (
              <button
                key={t}
                className={`tchip${talle === t ? ' sel' : ''}`}
                onClick={(e) => { e.stopPropagation(); setTalle(talle === t ? null : t); }}
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

export default memo(ProductCard);
