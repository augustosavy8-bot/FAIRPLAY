'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { Ic } from '@/components/Icons';
import { signOut } from './login/actions';
import { Spin, Toast, DCATS } from './_components/ui';

import ADash from './_components/Dashboard';
import AProds from './_components/Productos';
import ACats from './_components/Categorias';
import AHero from './_components/Hero';
import ACards from './_components/Tarjetas';
import ATicker from './_components/Ticker';
import ACfg from './_components/Config';

// ── Admin Panel ───────────────────────────────────────────────
export default function AdminPanel({ userEmail }) {
  const [sec,        setSec]        = useState('dashboard');
  const [products,   setProducts]   = useState([]);
  const [heros,      setHeros]      = useState([]);
  const [cats,       setCats]       = useState(DCATS);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const sb = getSupabaseBrowser();
      const [pr, hr, cr] = await Promise.all([
        sb.from('productos').select('*').order('created_at', { ascending:false }),
        sb.from('hero_slides').select('*').order('created_at', { ascending:false }),
        sb.from('categorias').select('*').order('orden', { ascending:true }),
      ]);
      if (pr.error) throw new Error(pr.error.message);
      if (pr.data)        setProducts(pr.data);
      if (hr.data)        setHeros(hr.data);
      if (cr.data?.length) setCats(cr.data);
    } catch (e) {
      console.error('admin fetchAll:', e);
      setFetchError(e.message || 'Error de conexión con Supabase');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const NAV = [
    { id:'dashboard',  n:'hm', label:'Dashboard'    },
    { id:'productos',  n:'pk', label:'Productos'     },
    { id:'categorias', n:'tg', label:'Categorías'    },
    { id:'hero',       n:'im', label:'Hero Posters'  },
    { id:'cards',      n:'st', label:'Tarjetas'      },
    { id:'ticker',     n:'st', label:'Ticker'        },
    { id:'config',     n:'sg', label:'Configuración' },
  ];

  return (
    <div className="aw">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* Sidebar — oculto en <1024px por CSS */}
      <aside className="asb">
        <div style={{ padding:'18px 14px 14px',borderBottom:'1px solid rgba(255,255,255,.07)' }}>
          <Image src="/logo.png" alt="FP" width={120} height={40} style={{ height:32,width:'auto',objectFit:'contain' }} />
          <p style={{ fontSize:9,color:'#22c55e',fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',marginTop:4,fontFamily:"var(--fd)" }}>Admin Panel</p>
        </div>
        <nav style={{ flex:1,padding:'10px 0' }}>
          {NAV.map((n) => (
            <button key={n.id} className={`ani${sec === n.id ? ' on' : ''}`} onClick={() => setSec(n.id)}>
              <Ic n={n.n} s={16} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:14,borderTop:'1px solid rgba(255,255,255,.07)' }}>
          <a href="/" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'9px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"var(--fb)",textDecoration:'none',borderRadius:4 }}>
            ← Volver a la tienda
          </a>
          <form action={signOut} style={{ marginTop:8 }}>
            <button type="submit" style={{ width:'100%',padding:'9px',background:'none',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"var(--fb)",borderRadius:4 }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="amn">
        {/* Nav horizontal de pills — visible siempre, único menú en mobile/tablet */}
        <div style={{ display:'flex',gap:8,overflowX:'auto',padding:'0 0 16px',marginBottom:8,borderBottom:'1px solid #e5e7eb',WebkitOverflowScrolling:'touch' }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setSec(n.id)}
              style={{ padding:'8px 16px',border:'none',borderRadius:100,cursor:'pointer',whiteSpace:'nowrap',fontFamily:"var(--fb)",fontSize:13,fontWeight:600,background:sec===n.id?'#0a0a0a':'#f3f4f6',color:sec===n.id?'#fff':'#374151',flexShrink:0,transition:'all .15s' }}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Error de conexión */}
        {fetchError && (
          <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
            <div>
              <p style={{ fontSize:14,fontWeight:700,color:'#dc2626' }}>Sin conexión con Supabase</p>
              <p style={{ fontSize:12,color:'#ef4444',marginTop:2 }}>{fetchError}</p>
            </div>
            <button onClick={fetchAll} className="btn-k" style={{ padding:'8px 16px',fontSize:12,flexShrink:0 }}>Reintentar</button>
          </div>
        )}

        {/* Contenido de la sección activa */}
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 0' }}><Spin g /></div>
        ) : (
          <>
            {sec === 'dashboard'  && <ADash   products={products} heros={heros} cats={cats} />}
            {sec === 'productos'  && <AProds  products={products} setProducts={setProducts} cats={cats} toast={showToast} refresh={fetchAll} />}
            {sec === 'categorias' && <ACats   cats={cats} setCats={setCats} toast={showToast} refresh={fetchAll} />}
            {sec === 'hero'       && <AHero   heros={heros} setHeros={setHeros} toast={showToast} refresh={fetchAll} />}
            {sec === 'cards'      && <ACards   cats={cats} toast={showToast} />}
            {sec === 'ticker'     && <ATicker  toast={showToast} />}
            {sec === 'config'     && <ACfg userEmail={userEmail} toast={showToast} />}
          </>
        )}
      </main>
    </div>
  );
}
