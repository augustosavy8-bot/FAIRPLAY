'use client';
import { useState } from 'react';

function PromoCard({ card, onFilter }) {
  const [hover, setHover] = useState(false);
  if (!card?.imagen_url) return null;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position:'relative', overflow:'hidden', cursor:'pointer', width:'100%', height:'100%' }}
    >
      <img
        src={card.imagen_url}
        alt={card.titulo || ''}
        style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform .6s ease',
          opacity: .88,
        }}
        onError={(e) => (e.target.style.display = 'none')}
      />
      <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,rgba(0,0,0,.1) 50%,transparent 100%)' }} />
      <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'20px 24px 24px' }}>
        {card.etiqueta && (
          <div style={{ display:'inline-block',background:'#16a34a',color:'#fff',fontFamily:"var(--fd)",fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',padding:'3px 10px',marginBottom:8 }}>
            {card.etiqueta}
          </div>
        )}
        {card.titulo && (
          <h3 style={{ fontFamily:"var(--fd)",fontSize:'clamp(18px,2.5vw,28px)',fontWeight:900,color:'#fff',letterSpacing:'.02em',textTransform:'uppercase',lineHeight:1.1,marginBottom:6 }}>
            {card.titulo}
          </h3>
        )}
        {card.subtitulo && (
          <p style={{ fontSize:13,color:'rgba(255,255,255,.75)',lineHeight:1.5,marginBottom:12 }}>
            {card.subtitulo}
          </p>
        )}
        {card.cta && (
          <div
            onClick={() => onFilter && onFilter(card.categoria)}
            style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#fff',color:'#0a0a0a',fontFamily:"var(--fd)",fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',padding:'8px 18px' }}
          >
            {card.cta} →
          </div>
        )}
      </div>
    </div>
  );
}

export default function BannerCards({ cards, onFilter }) {
  const visible = (cards || []).filter((c) => c.activo !== false && c.imagen_url);
  if (!visible.length) return null;

  const sectionStyle = {
    padding: '64px clamp(16px,4vw,48px) 56px',
    width: '100%',
  };

  if (visible.length === 3) return (
    <section className="sr" style={sectionStyle}>
      <div style={{ display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:12,height:'clamp(400px,55vw,620px)' }}>
        <PromoCard card={visible[0]} onFilter={onFilter} />
        <div style={{ display:'grid',gridTemplateRows:'1fr 1fr',gap:12 }}>
          <PromoCard card={visible[1]} onFilter={onFilter} />
          <PromoCard card={visible[2]} onFilter={onFilter} />
        </div>
      </div>
    </section>
  );

  return (
    <section className="sr" style={sectionStyle}>
      <div style={{ display:'grid',gridTemplateColumns:visible.length===1?'1fr':'1fr 1fr',gap:12,height:'clamp(320px,45vw,520px)' }}>
        {visible.slice(0, 4).map((c, i) => (
          <PromoCard key={c.id || i} card={c} onFilter={onFilter} />
        ))}
      </div>
    </section>
  );
}
