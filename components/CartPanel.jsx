'use client';
import { Ic } from './Icons';

const WA_NUM = process.env.NEXT_PUBLIC_WA_NUMBER || '5493471510863';

export default function CartPanel({ items, onRemove, onClose }) {
  const send = () => {
    if (!items.length) return;
    const txt = items.map((x, i) => `${i + 1}. *${x.nombre}* — Talle: ${x.talleSeleccionado}`).join('\n');
    const msg = encodeURIComponent(`¡Hola Fair Play! 👋\n\nQuiero consultar:\n\n${txt}\n\n¿Pueden confirmarme stock y envío? ¡Gracias!`);
    window.open(`https://wa.me/${WA_NUM}?text=${msg}`, '_blank');
  };

  return (
    <>
      <div className="cart-ov" onClick={onClose} />
      <div className="cart-p">
        <div style={{ padding:'18px 18px 14px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <h2 style={{ fontFamily:"var(--fd)",fontSize:19,fontWeight:900,letterSpacing:'.04em',textTransform:'uppercase' }}>Bolsa de consulta</h2>
            <p style={{ fontSize:12,color:'#6b7280',marginTop:2 }}>{items.length} prenda{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} style={{ width:34,height:34,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280' }}>
            <Ic n="x" />
          </button>
        </div>

        <div style={{ flex:1,overflowY:'auto',padding:'14px 18px' }}>
          {!items.length ? (
            <div style={{ textAlign:'center',padding:'56px 0',color:'#9ca3af' }}>
              <Ic n="bag" s={36} />
              <p style={{ marginTop:10,fontSize:14,fontWeight:600 }}>Tu bolsa está vacía</p>
            </div>
          ) : items.map((x, i) => (
            <div key={i} style={{ display:'flex',gap:10,marginBottom:12,paddingBottom:12,borderBottom:'1px solid #f3f4f6' }}>
              <img src={x.imagen_url || ''} style={{ width:56,height:72,objectFit:'cover',flexShrink:0,background:'#f3f4f6' }} onError={(e) => (e.target.style.display = 'none')} />
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:14,fontWeight:700,color:'#0a0a0a',fontFamily:"var(--fd)",letterSpacing:'.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{x.nombre}</p>
                <p style={{ fontSize:12,color:'#16a34a',fontWeight:600,marginTop:2 }}>Talle: {x.talleSeleccionado}</p>
              </div>
              <button onClick={() => onRemove(i)} style={{ width:26,height:26,border:'none',background:'#fee2e2',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Ic n="tr" s={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding:'14px 18px 20px',borderTop:'1px solid #f3f4f6' }}>
          <button onClick={send} disabled={!items.length} className="btn-k"
            style={{ width:'100%',justifyContent:'center',opacity:items.length?1:.5,cursor:items.length?'pointer':'not-allowed',fontSize:14,padding:13 }}>
            <Ic n="wa" s={17} /> ENVIAR POR WHATSAPP
          </button>
          <p style={{ marginTop:7,fontSize:11,color:'#9ca3af',textAlign:'center' }}>Abre WhatsApp con tu lista</p>
        </div>
      </div>
    </>
  );
}
