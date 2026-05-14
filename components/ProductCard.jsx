'use client';
import { useState, memo } from 'react';

const WA = '5493471510863';

function ProductCard({ p, cats = [], onOpen }) {
  const [talle, setTalle] = useState(null);
  const [shake, setShake] = useState(false);

  const talles     = Array.isArray(p.talles_disponibles) ? p.talles_disponibles : [];
  const cat        = cats.find((c) => c.id === p.tipo);
  const validFotos = (Array.isArray(p.fotos) ? p.fotos : []).filter((f) => f && f.startsWith('http'));
  const imgSrc     = validFotos[0]
    || (p.imagen_url && p.imagen_url.startsWith('http') ? p.imagen_url : null);
  const extraFotos = validFotos.length > 1 ? validFotos.length : 0;

  const handleWA = (e) => {
    e.stopPropagation();
    if (talles.length > 0 && !talle) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const msg = encodeURIComponent(`¡Hola Fair Play! 👋 Quiero consultar disponibilidad de: *${p.nombre}* - Talle: ${talle || 'Único'}`);
    window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
  };

  const genero = p.categoria
    ? p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase()
    : '';
  const catLabel = cat?.label || p.tipo || '';

  return (
    <div className="pcard" onClick={() => onOpen?.(p)}>

      {/* ── Imagen ── */}
      <div className="pcard-img">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.nombre}
            loading="lazy"
            decoding="async"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#f0f0f0'; }}
          />
        ) : null}

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
          onClick={handleWA}
          style={{
            background: shake ? '#dc2626' : '#25D366',
            animation: shake ? 'shake .4s' : 'none',
          }}
        >
          {shake ? 'ELEGÍ UN TALLE' : 'CONSULTAR POR WHATSAPP'}
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
