'use client';
import { useState, useRef, useEffect } from 'react';
import { Ic } from './Icons';

export default function ProductModal({ p, cats, onAdd, onClose }) {
  const [talle,    setTalle]    = useState(null);
  const [added,    setAdded]    = useState(false);
  const [shake,    setShake]    = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [zoomed,   setZoomed]   = useState(false);
  const touchStartX = useRef(null);

  const talles = Array.isArray(p.talles_disponibles) ? p.talles_disponibles : [];
  const cat    = cats.find((c) => c.id === p.tipo);
  const fotos  = Array.isArray(p.fotos) && p.fotos.length > 0
    ? p.fotos
    : p.imagen_url ? [p.imagen_url] : [];

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') { if (zoomed) setZoomed(false); else onClose(); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, zoomed]);

  const handleAdd = () => {
    if (talles.length > 0 && !talle) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    onAdd({ ...p, talleSeleccionado: talle || 'Único' });
    setAdded(true);
    setTimeout(() => { setAdded(false); setTalle(null); }, 1800);
  };

  const prev = () => setPhotoIdx((i) => (i <= 0 ? fotos.length - 1 : i - 1));
  const next = () => setPhotoIdx((i) => (i >= fotos.length - 1 ? 0 : i + 1));

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:9600,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)',animation:'fadeIn .2s' }}
    >
      <div style={{ background:'#fff',width:'min(900px,100%)',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',animation:'scaleIn .22s ease',position:'relative',boxShadow:'0 32px 80px rgba(0,0,0,.4)' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute',top:12,right:12,width:36,height:36,background:'rgba(0,0,0,.6)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10,borderRadius:'50%' }}>
          <Ic n="x" s={16} />
        </button>

        <div className="pm-inner" style={{ display:'flex',flex:1,overflow:'hidden' }}>

          {/* Gallery */}
          <div className="pm-gallery" style={{ flex:'0 0 55%',position:'relative',background:'#f8f8f8',overflow:'hidden',display:'flex',flexDirection:'column' }}>
            <div style={{ flex:1,position:'relative',minHeight:300 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {fotos.length > 0 ? (
                <img
                  key={photoIdx}
                  src={fotos[photoIdx]} alt={p.nombre}
                  onClick={() => setZoomed(true)}
                  style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',animation:'fadeIn .2s',cursor:'zoom-in' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'; }}
                />
              ) : (
                <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#ccc',fontSize:48 }}>📦</div>
              )}

              {fotos.length > 1 && (
                <>
                  <button onClick={prev} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,.2)',zIndex:2 }}>
                    <Ic n="cl" s={14} />
                  </button>
                  <button onClick={next} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:36,height:36,background:'rgba(255,255,255,.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,.2)',zIndex:2 }}>
                    <Ic n="cr" s={14} />
                  </button>
                  <div style={{ position:'absolute',bottom:12,right:12,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:100,fontFamily:"var(--fd)",letterSpacing:'.06em' }}>
                    {photoIdx + 1} / {fotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div style={{ display:'flex',gap:6,padding:'8px 10px',overflowX:'auto',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0 }}>
                {fotos.map((f, i) => (
                  <img key={i} src={f} alt="" loading="lazy" onClick={() => setPhotoIdx(i)}
                    style={{ width:56,height:56,objectFit:'cover',cursor:'pointer',flexShrink:0,border:i===photoIdx?'2px solid #0a0a0a':'2px solid transparent',opacity:i===photoIdx?1:.6,transition:'all .15s' }}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex:1,display:'flex',flexDirection:'column',overflowY:'auto',padding:'28px 28px 24px' }}>
            {cat && (
              <div style={{ display:'inline-flex',alignItems:'center',gap:5,background:'#f0fdf4',color:'#16a34a',border:'1px solid #86efac',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',padding:'3px 10px',marginBottom:12,alignSelf:'flex-start' }}>
                {cat.icon} {cat.label}
              </div>
            )}

            <h2 style={{ fontFamily:"var(--fd)",fontSize:'clamp(22px,3vw,32px)',fontWeight:900,letterSpacing:'-.01em',lineHeight:1.1,color:'#0a0a0a',marginBottom:6 }}>{p.nombre}</h2>

            {p.categoria && (
              <p style={{ fontSize:13,color:'#6b7280',textTransform:'capitalize',fontWeight:500,marginBottom:16 }}>{p.categoria}</p>
            )}

            {p.descripcion && (
              <p style={{ fontSize:14,color:'#4b5563',lineHeight:1.7,marginBottom:20,borderTop:'1px solid #f3f4f6',paddingTop:16 }}>{p.descripcion}</p>
            )}

            <div style={{ width:'100%',height:1,background:'#f3f4f6',margin:'4px 0 20px' }} />

            {/* Talles */}
            {talles.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:12,fontWeight:700,color:'#0a0a0a',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:10 }}>
                  TALLE {talle && <span style={{ color:'#16a34a',marginLeft:6 }}>{talle}</span>}
                </p>
                <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                  {talles.map((t) => (
                    <button key={t} onClick={() => setTalle(t === talle ? null : t)}
                      style={{ minWidth:44,height:44,fontSize:14,fontWeight:700,border:talle===t?'2px solid #0a0a0a':'2px solid #e5e7eb',background:talle===t?'#0a0a0a':'#fff',color:talle===t?'#fff':'#0a0a0a',cursor:'pointer',fontFamily:"var(--fb)",transition:'all .15s',borderRadius:4,padding:'0 12px' }}>
                      {t}
                    </button>
                  ))}
                </div>
                {shake && <p style={{ fontSize:12,color:'#dc2626',fontWeight:600,marginTop:8,animation:'shake .4s' }}>⚠ Seleccioná un talle</p>}
              </div>
            )}

            {/* CTA */}
            <div style={{ marginTop:'auto',paddingTop:20 }}>
              <button onClick={handleAdd}
                style={{ width:'100%',padding:15,border:'none',background:added?'#16a34a':'#0a0a0a',color:'#fff',fontFamily:"var(--fd)",fontSize:15,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                {added ? <><Ic n="ok" s={16} /> AGREGADO A LA BOLSA</> : <><Ic n="bag" s={16} /> AGREGAR A CONSULTA</>}
              </button>
              <p style={{ fontSize:11,color:'#9ca3af',textAlign:'center',marginTop:8,lineHeight:1.5 }}>Consultá disponibilidad y precio por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
      {/* ── ZOOM OVERLAY ── */}
      {zoomed && fotos.length > 0 && (
        <div
          onClick={() => setZoomed(false)}
          style={{ position:'fixed',inset:0,zIndex:9700,background:'rgba(0,0,0,.92)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .18s',cursor:'zoom-out' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
            style={{ position:'absolute',top:16,right:16,width:40,height:40,background:'rgba(255,255,255,.12)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',zIndex:1 }}
          >
            <Ic n="x" s={18} />
          </button>
          <img
            src={fotos[photoIdx]} alt={p.nombre}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth:'95vw',maxHeight:'95vh',objectFit:'contain',animation:'scaleIn .2s ease',cursor:'default' }}
          />
        </div>
      )}
    </div>
  );
}
