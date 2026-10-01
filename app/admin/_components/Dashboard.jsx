'use client';
import { Ic } from '@/components/Icons';

// ── Dashboard ─────────────────────────────────────────────────
export default function ADash({ products, heros, cats }) {
  const active   = products.filter((p) => p.activo !== false).length;
  const heroOn   = heros.find((h) => h.activo);
  const byCat    = cats.map((c) => ({ ...c, count: products.filter((p) => p.tipo === c.id).length })).filter((c) => c.count > 0);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Dashboard</h1>
        <p style={{ color:'#6b7280',fontSize:13,marginTop:3 }}>Resumen de la tienda Fair Play</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14,marginBottom:28 }}>
        {[{n:'pk',label:'Productos activos',val:active,c:'#16a34a'},{n:'tg',label:'Categorías',val:cats.length,c:'#3b82f6'},{n:'im',label:'Hero posters',val:heros.length,c:'#f59e0b'}].map((s) => (
          <div key={s.label} className="scrd">
            <div style={{ width:42,height:42,borderRadius:9,background:s.c+'18',display:'flex',alignItems:'center',justifyContent:'center',color:s.c }}><Ic n={s.n} s={20} /></div>
            <div>
              <p style={{ fontSize:26,fontWeight:900,fontFamily:"var(--fd)",letterSpacing:'.02em',color:'#0a0a0a',lineHeight:1 }}>{s.val}</p>
              <p style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginTop:1 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      {heroOn && (
        <div className="ac" style={{ marginBottom:20 }}>
          <p style={{ fontSize:10,color:'#16a34a',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10 }}>● Hero actualmente activo</p>
          <div style={{ display:'flex',gap:14,alignItems:'center' }}>
            <img src={heroOn.url_archivo} style={{ width:110,height:64,objectFit:'cover',borderRadius:5,flexShrink:0 }} onError={(e) => (e.target.style.display='none')} />
            <div>
              <p style={{ fontSize:16,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:'.04em' }}>{heroOn.titulo || 'Sin título'}</p>
              <p style={{ fontSize:12,color:'#6b7280',marginTop:2 }}>{heroOn.subtitulo}</p>
            </div>
          </div>
        </div>
      )}
      <div className="ac">
        <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Stock por categoría</h3>
        {byCat.map((c) => (
          <div key={c.id} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
            <span style={{ fontSize:18,width:28,textAlign:'center' }}>{c.icon}</span>
            <span style={{ fontSize:14,fontWeight:600,flex:1 }}>{c.label}</span>
            <div style={{ flex:2,background:'#f3f4f6',height:6,borderRadius:3,overflow:'hidden' }}>
              <div style={{ height:'100%',background:'#16a34a',borderRadius:3,width:`${Math.min(100,c.count/active*100)}%`,transition:'width .5s' }} />
            </div>
            <span style={{ fontSize:13,fontWeight:700,color:'#6b7280',width:28,textAlign:'right' }}>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
