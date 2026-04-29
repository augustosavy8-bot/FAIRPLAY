'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase';
import ProductCard   from '@/components/ProductCard';
import ProductModal  from '@/components/ProductModal';
import Carousel      from '@/components/Carousel';
import CartPanel     from '@/components/CartPanel';
import BannerCards   from '@/components/BannerCards';
import { Ic }        from '@/components/Icons';

const FALLBACK_HERO   = { url_archivo:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80', titulo:'NUEVA COLECCIÓN', subtitulo:'Otoño 2025', activo:true };
const FALLBACK_TICKER = [
  { id:'f1', texto:'NUEVA COLECCIÓN OTOÑO 2025' },
  { id:'f2', texto:'ENVÍOS A TODO EL PAÍS'       },
  { id:'f3', texto:'@FAIRPLAY_VIDADEPORTIVA'     },
];
const FALLBACK_CATS = [
  {id:'remeras',label:'Remeras',icon:'👕'},{id:'buzos',label:'Buzos',icon:'🧥'},
  {id:'pantalones',label:'Pantalones',icon:'👖'},{id:'camperas',label:'Camperas',icon:'🧤'},
  {id:'calzado',label:'Calzado',icon:'👟'},{id:'mochilas',label:'Mochilas',icon:'🎒'},
  {id:'medias',label:'Medias',icon:'🧦'},{id:'accesorios',label:'Accesorios',icon:'⌚'},
];

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis'); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll('.sr:not(.vis)').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">✓ {msg}</div>;
}

export default function StorePage() {
  const [products,     setProducts]     = useState([]);
  const [heros,        setHeros]        = useState([FALLBACK_HERO]);
  const [cats,         setCats]         = useState(FALLBACK_CATS);
  const [bannerCards,  setBannerCards]  = useState([]);
  const [tickerItems,  setTickerItems]  = useState(FALLBACK_TICKER);
  const [cart,         setCart]         = useState([]);
  const [catF,         setCatF]         = useState('todos');
  const [genF,         setGenF]         = useState('todos');
  const [search,       setSearch]       = useState('');
  const [showSearch,   setShowSearch]   = useState(false);
  const [showCart,     setShowCart]     = useState(false);
  const [showCatDd,    setShowCatDd]    = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const [selected,     setSelected]     = useState(null);

  const [isMobile,      setIsMobile]      = useState(false);
  const [initLoading,   setInitLoading]   = useState(true);
  const [showOverlay,   setShowOverlay]   = useState(true);

  const catDdRef  = useRef(null);
  const catSecRef = useRef(null);

  const showT = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); }, []);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const sb = getSupabaseClient();
        const [pr, hr, cr, bc, tk] = await Promise.all([
          sb.from('productos').select('*').eq('activo', true).order('created_at', { ascending: false }),
          sb.from('hero_slides').select('*').order('created_at', { ascending: false }),
          sb.from('categorias').select('*').order('orden', { ascending: true }),
          sb.from('banner_cards').select('*').eq('activo', true).order('orden', { ascending: true }),
          sb.from('ticker_items').select('id,texto').eq('activo', true).order('orden', { ascending: true }),
        ]);
        if (pr.data?.length)  setProducts(pr.data);
        if (hr.data?.length)  setHeros(hr.data);
        if (cr.data?.length)  setCats(cr.data);
        if (bc.data?.length)  setBannerCards(bc.data);
        if (tk.data?.length)  setTickerItems(tk.data);
      } catch (e) { console.error('load:', e); }
      finally { setInitLoading(false); }
    };
    load();
  }, []);

  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (catDdRef.current && !catDdRef.current.contains(e.target)) setShowCatDd(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const activeH   = heros.find((h) => h.activo) || heros[0];
  const addToCart = (p) => { setCart((c) => [...c, p]); showT(`${p.nombre} agregado`); };

  const filtered = products.filter((p) => {
    if (catF !== 'todos' && p.tipo      !== catF) return false;
    if (genF !== 'todos' && p.categoria !== genF) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byCat    = useMemo(() => {
    const m = {};
    products.forEach((p) => { if (!m[p.tipo]) m[p.tipo] = []; m[p.tipo].push(p); });
    return m;
  }, [products]);

  const featCats = Object.entries(byCat).filter(([, a]) => a.length > 0);
  const scrollCat = () => {
    if (!catSecRef.current) return;
    const yOffset = -80;
    const y = catSecRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const handleBannerFilter = useCallback((categoria) => {
    if (categoria) setCatF(categoria);
    if (!catSecRef.current) return;
    const yOffset = -80;
    const y = catSecRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  // Hero dots
  const setActiveHero = (i) => setHeros((sl) => sl.map((x, j) => ({ ...x, activo: j === i })));

  return (
    <div style={{ fontFamily:"var(--fb)",background:'#fff' }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── LOADING SCREEN ── */}
      {showOverlay && (
        <div
          onTransitionEnd={() => setShowOverlay(false)}
          style={{ position:'fixed',inset:0,zIndex:9999,background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28,opacity:initLoading?1:0,transition:'opacity .45s ease',pointerEvents:initLoading?'auto':'none' }}
        >
          <Image src="/logo.png" alt="Fair Play" width={180} height={60} style={{ height:60,width:'auto',objectFit:'contain' }} priority />
          <div style={{ width:36,height:36,border:'3px solid rgba(22,163,74,.22)',borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin .8s linear infinite' }} />
        </div>
      )}

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-in">
          {[...Array(8)].map((_, i) => (
            <span key={i} style={{ display:'contents' }}>
              {tickerItems.map((item) => (
                <span key={item.id} style={{ display:'contents' }}>
                  <span className="t-item">{item.texto}</span>
                  <span className="t-item">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'sticky',top:0,zIndex:500,background:scrolled?'rgba(255,255,255,.97)':'rgba(10,10,10,.95)',backdropFilter:'blur(16px)',borderBottom:scrolled?'1px solid #f3f4f6':'none',transition:'all .3s',height:58,display:'flex',alignItems:'center',padding:'0 clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth:1400,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:28 }}>
          <a href="/" style={{ flexShrink:0,display:'flex',alignItems:'center' }}>
            <Image src="/logo.png" alt="Fair Play" width={120} height={40} style={{ height:36,width:'auto',objectFit:'contain' }} priority />
          </a>

          <div className="dsk" style={{ display:'flex',gap:22,alignItems:'center',flex:1 }}>
            <button className={`nav-item${scrolled?' dk':''}`} onClick={() => { setGenF('hombre'); setCatF('todos'); scrollCat(); }}>HOMBRE</button>
            <button className={`nav-item${scrolled?' dk':''}`} onClick={() => { setGenF('mujer');  setCatF('todos'); scrollCat(); }}>MUJER</button>
            <div ref={catDdRef} style={{ position:'relative' }}>
              <button className={`nav-item${scrolled?' dk':''}`} onClick={() => setShowCatDd((v) => !v)} style={{ display:'flex',alignItems:'center',gap:4 }}>
                CATEGORÍAS <Ic n="cd" s={11} />
              </button>
              {showCatDd && (
                <div className="cat-dd" onClick={() => setShowCatDd(false)}>
                  <button className="cat-item" onClick={() => { setCatF('todos'); scrollCat(); }}>Todos los productos</button>
                  {cats.map((c) => (
                    <button key={c.id} className="cat-item" onClick={() => { setCatF(c.id); scrollCat(); }}>
                      <span style={{ marginRight:7 }}>{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display:'flex',gap:6,alignItems:'center',marginLeft:'auto' }}>
            {showSearch && (
              <input autoFocus value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  if (v.length > 1) {
                    scrollCat();
                    const lower = v.toLowerCase();
                    const catMatch = cats.find((c) =>
                      c.id.toLowerCase().startsWith(lower) || c.label.toLowerCase().startsWith(lower)
                    );
                    setCatF(catMatch ? catMatch.id : 'todos');
                  } else if (!v) {
                    setCatF('todos');
                  }
                }}
                onBlur={() => { if (!search) setShowSearch(false); }}
                placeholder="Buscar..."
                style={{ width:170,padding:'5px 11px',border:`1px solid ${scrolled?'#e5e7eb':'rgba(255,255,255,.25)'}`,background:scrolled?'#f9fafb':'rgba(255,255,255,.1)',color:scrolled?'#0a0a0a':'#fff',fontSize:13,fontFamily:"var(--fb)",outline:'none',borderRadius:3 }}
              />
            )}
            <button onClick={() => setShowSearch((v) => !v)} style={{ width:36,height:36,border:'none',background:scrolled?'#f3f4f6':'rgba(255,255,255,.1)',color:scrolled?'#0a0a0a':'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:3 }}>
              <Ic n="sr" s={17} />
            </button>
            <button onClick={() => setShowCart(true)} style={{ width:36,height:36,border:'none',background:scrolled?'#f3f4f6':'rgba(255,255,255,.1)',color:scrolled?'#0a0a0a':'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:3,position:'relative' }}>
              <Ic n="bag" s={18} />
              {cart.length > 0 && (
                <div style={{ position:'absolute',top:-4,right:-4,width:17,height:17,borderRadius:'50%',background:'#16a34a',color:'#fff',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',animation:'badgePop .3s ease' }}>{cart.length}</div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ height:'100vh',minHeight:580,position:'relative',overflow:'hidden',background:'#0a0a0a',display:'flex',alignItems:'center' }}>
        {activeH && (
          <img key={activeH.id || 0} src={activeH.url_archivo || activeH.url}
            alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.52,animation:'heroKen 14s ease both' }} />
        )}
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(110deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.28) 60%,transparent 100%)' }} />
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'25%',background:'linear-gradient(to top,rgba(10,10,10,.55),transparent)' }} />

        <div style={{ position:'relative',zIndex:1,padding:'0 clamp(20px,7vw,96px)',maxWidth:1400,margin:'0 auto',width:'100%',animation:'fadeUp .8s ease .15s both' }}>
          <div style={{ display:'inline-block',background:'var(--g)',color:'#fff',fontFamily:"var(--fd)",fontSize:11,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',padding:'4px 13px',marginBottom:18 }}>
            Nueva Temporada
          </div>
          <h1 className="hh1" style={{ fontFamily:"var(--fd)",fontWeight:900,fontSize:'clamp(50px,9vw,116px)',color:'#fff',lineHeight:.9,letterSpacing:'-.01em',marginBottom:18,textTransform:'uppercase' }}>
            {(activeH?.titulo || 'NUEVA COLECCIÓN').split(' ').slice(0, 2).join(' ')}<br />
            <span style={{ color:'var(--gl)' }}>{(activeH?.titulo || 'OTOÑO 2025').split(' ').slice(2).join(' ') || activeH?.subtitulo || 'OTOÑO 2025'}</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.68)',fontSize:'clamp(14px,1.8vw,17px)',maxWidth:460,lineHeight:1.7,marginBottom:32 }}>
            Equipate para la temporada con lo mejor en indumentaria y accesorios deportivos.
          </p>
          <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
            <button className="btn-w" onClick={scrollCat}>VER COLECCIÓN</button>
            <button className="btn-ol" onClick={() => { setGenF('mujer'); scrollCat(); }}>PARA ELLA</button>
          </div>
        </div>

        {heros.length > 1 && (
          <div style={{ position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',display:'flex',gap:7,zIndex:2 }}>
            {heros.map((h, i) => (
              <div key={h.id || i} onClick={() => setActiveHero(i)}
                style={{ width:h.activo?30:7,height:3,background:h.activo?'#22c55e':'rgba(255,255,255,.35)',transition:'all .4s',cursor:'pointer',borderRadius:2 }} />
            ))}
          </div>
        )}
      </section>

      {/* ── BANNER CARDS BLOQUE 1 ── */}
      <BannerCards cards={bannerCards.filter((c) => c.bloque === 1 || !c.bloque)} onFilter={handleBannerFilter} />

      {/* ── CAROUSELES ── */}
      {catF === 'todos' && genF === 'todos' && featCats.length > 0 && (
        <section style={{ padding:'0 clamp(16px,4vw,48px) 24px',maxWidth:1400,margin:'0 auto' }}>
          {featCats.slice(0, 5).map(([tipo, items]) => {
            const cat = cats.find((c) => c.id === tipo);
            return (
              <div key={tipo} className="sr">
                <Carousel
                  title={`${cat?.icon || ''} ${cat?.label || tipo}`}
                  items={items} cats={cats}
                  onAdd={addToCart} onOpen={setSelected}
                />
              </div>
            );
          })}
        </section>
      )}

      {/* ── BANNER CARDS BLOQUE 2 ── */}
      <BannerCards cards={bannerCards.filter((c) => c.bloque === 2)} onFilter={handleBannerFilter} />

      {/* ── CATÁLOGO ── */}
      <section ref={catSecRef} style={{ padding:'16px clamp(16px,4vw,48px) 80px',maxWidth:1400,margin:'0 auto' }}>
        <div className="sr" style={{ marginBottom:24,display:'flex',alignItems:'baseline',gap:14,flexWrap:'wrap' }}>
          <h2 style={{ fontFamily:"var(--fd)",fontSize:'clamp(22px,4vw,42px)',fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>CATÁLOGO COMPLETO</h2>
          <span style={{ fontSize:13,fontWeight:600,color:'#9ca3af' }}>{filtered.length} prendas</span>
        </div>

        {/* ── FILTROS MOBILE: dos filas horizontales scrolleables ── */}
        {isMobile && (
          <div style={{ marginBottom:16,display:'flex',flexDirection:'column',gap:8 }}>
            {/* Fila 1: Género */}
            <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:4,WebkitOverflowScrolling:'touch' }}>
              {[['todos','Todos'],['hombre','Hombre'],['mujer','Mujer'],['unisex','Unisex'],['niños','Niños']].map(([v,l]) => (
                <button key={v} onClick={() => setGenF(v)} style={{ flexShrink:0,padding:'7px 14px',border:'none',background:genF===v?'#0a0a0a':'#f3f4f6',color:genF===v?'#fff':'#374151',cursor:'pointer',fontSize:13,fontWeight:genF===v?700:600,fontFamily:"var(--fb)",borderRadius:100,transition:'all .15s',whiteSpace:'nowrap' }}>
                  {l}
                </button>
              ))}
            </div>
            {/* Fila 2: Categorías */}
            <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:4,WebkitOverflowScrolling:'touch' }}>
              <button onClick={() => setCatF('todos')} style={{ flexShrink:0,padding:'7px 14px',border:'none',background:catF==='todos'?'#0a0a0a':'#f3f4f6',color:catF==='todos'?'#fff':'#374151',cursor:'pointer',fontSize:13,fontWeight:catF==='todos'?700:600,fontFamily:"var(--fb)",borderRadius:100,transition:'all .15s',whiteSpace:'nowrap' }}>
                Todos
              </button>
              {cats.map((c) => (
                <button key={c.id} onClick={() => setCatF(c.id)} style={{ flexShrink:0,padding:'7px 14px',border:'none',background:catF===c.id?'#0a0a0a':'#f3f4f6',color:catF===c.id?'#fff':'#374151',cursor:'pointer',fontSize:13,fontWeight:catF===c.id?700:600,fontFamily:"var(--fb)",borderRadius:100,transition:'all .15s',whiteSpace:'nowrap' }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {(catF !== 'todos' || genF !== 'todos') && (
              <button onClick={() => { setCatF('todos'); setGenF('todos'); setSearch(''); }} style={{ alignSelf:'flex-start',padding:'6px 14px',border:'1.5px solid #e5e7eb',background:'transparent',color:'#6b7280',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"var(--fb)",borderRadius:100 }}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        )}

        <div style={{ display:'flex',gap:28,alignItems:'flex-start' }}>

          {/* ── SIDEBAR FILTROS DESKTOP ── */}
          {!isMobile && (
            <aside style={{ width:200,flexShrink:0,position:'sticky',top:80,display:'flex',flexDirection:'column',gap:0 }}>

              {/* Género */}
              <div style={{ marginBottom:28 }}>
                <p style={{ fontSize:11,fontWeight:700,color:'#9ca3af',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12 }}>Género</p>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  {[['todos','Todos'],['hombre','Hombre'],['mujer','Mujer'],['unisex','Unisex'],['niños','Niños']].map(([v,l]) => (
                    <button key={v} onClick={() => setGenF(v)}
                      style={{ textAlign:'left',padding:'8px 12px',border:'none',background:genF===v?'#0a0a0a':'transparent',color:genF===v?'#fff':'#374151',cursor:'pointer',fontSize:14,fontWeight:genF===v?700:400,fontFamily:"var(--fb)",borderRadius:6,transition:'all .15s' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height:1,background:'#f3f4f6',marginBottom:28 }}/>

              {/* Categorías */}
              <div>
                <p style={{ fontSize:11,fontWeight:700,color:'#9ca3af',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12 }}>Categoría</p>
                <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                  <button onClick={() => setCatF('todos')}
                    style={{ textAlign:'left',padding:'8px 12px',border:'none',background:catF==='todos'?'#0a0a0a':'transparent',color:catF==='todos'?'#fff':'#374151',cursor:'pointer',fontSize:14,fontWeight:catF==='todos'?700:400,fontFamily:"var(--fb)",borderRadius:6,transition:'all .15s' }}>
                    Todos
                  </button>
                  {cats.map((c) => (
                    <button key={c.id} onClick={() => setCatF(c.id)}
                      style={{ textAlign:'left',padding:'8px 12px',border:'none',background:catF===c.id?'#0a0a0a':'transparent',color:catF===c.id?'#fff':'#374151',cursor:'pointer',fontSize:14,fontWeight:catF===c.id?700:400,fontFamily:"var(--fb)",borderRadius:6,transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8 }}>
                      <span>{c.label}</span>
                      {catF===c.id && <span style={{ fontSize:10,background:'var(--g)',color:'#fff',borderRadius:100,padding:'1px 7px',fontWeight:700 }}>{filtered.length}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {(catF !== 'todos' || genF !== 'todos') && (
                <button onClick={() => { setCatF('todos'); setGenF('todos'); setSearch(''); }}
                  style={{ marginTop:20,width:'100%',padding:'8px',border:'1.5px solid #e5e7eb',background:'transparent',color:'#6b7280',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:"var(--fb)",borderRadius:6,transition:'all .15s' }}>
                  ✕ Limpiar filtros
                </button>
              )}
            </aside>
          )}

          {/* ── GRID PRODUCTOS ── */}
          <div style={{ flex:1,minWidth:0,width:isMobile?'100%':undefined }}>
            {filtered.length > 0 ? (
              <div style={{ display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(auto-fill,minmax(200px,1fr))',gap:isMobile?12:18 }}>
                {filtered.map((p, i) => (
                  <div key={p.id} className={`sr d${(i % 4) + 1}`}>
                    <ProductCard p={p} onAdd={addToCart} cats={cats} onOpen={setSelected} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center',padding:'72px 0',color:'#9ca3af' }}>
                <div style={{ fontSize:52,marginBottom:14 }}>🔍</div>
                <p style={{ fontFamily:"var(--fd)",fontSize:20,fontWeight:700,letterSpacing:'.04em',textTransform:'uppercase',color:'#6b7280' }}>SIN RESULTADOS</p>
                <button className="btn-k" style={{ marginTop:14,padding:'9px 22px' }} onClick={() => { setCatF('todos'); setGenF('todos'); setSearch(''); }}>VER TODO</button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background:'#0a0a0a',padding:'72px clamp(16px,4vw,48px)',textAlign:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(22,163,74,.13) 0%,transparent 65%)' }} />
        <div style={{ position:'relative',zIndex:1 }}>
          <p className="sr" style={{ fontFamily:"var(--fd)",fontSize:10,fontWeight:700,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--gl)',marginBottom:10 }}>FAIR PLAY — VIDA DEPORTIVA</p>
          <h2 className="sr d1" style={{ fontFamily:"var(--fd)",fontSize:'clamp(32px,6vw,68px)',fontWeight:900,color:'#fff',letterSpacing:'-.01em',textTransform:'uppercase',lineHeight:.93,marginBottom:20 }}>
            TU CONSULTA,<br /><span style={{ color:'var(--gl)' }}>UN MENSAJE</span>
          </h2>
          <p className="sr d2" style={{ color:'rgba(255,255,255,.55)',fontSize:15,maxWidth:380,margin:'0 auto 28px',lineHeight:1.7 }}>
            Agregá productos a tu bolsa y te respondemos por WhatsApp con stock y precios.
          </p>
          <button className="sr d3 btn-g" style={{ fontSize:14,padding:'14px 36px' }} onClick={() => setShowCart(true)}>
            <Ic n="wa" s={17} /> CONSULTAR AHORA
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0a0a0a',padding:'32px clamp(16px,4vw,48px) 24px',borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14 }}>
          {/* Logo en footer abre admin */}
          <a href="/admin" style={{ display:'flex',alignItems:'center' }}>
            <Image src="/logo.png" alt="Fair Play" width={120} height={40} style={{ height:30,width:'auto',objectFit:'contain' }} />
          </a>
          <div style={{ display:'flex',gap:10,alignItems:'center' }}>
            <a href="https://instagram.com/fairplay_vidadeportiva" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,.4)',fontSize:11,fontWeight:700,textDecoration:'none',fontFamily:"var(--fd)",letterSpacing:'.1em',textTransform:'uppercase' }}>INSTAGRAM</a>
            <span style={{ color:'rgba(255,255,255,.15)' }}>·</span>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '5493471510863'}`} target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,.4)',fontSize:11,fontWeight:700,textDecoration:'none',fontFamily:"var(--fd)",letterSpacing:'.1em',textTransform:'uppercase' }}>WHATSAPP</a>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:7 }}>
            <p style={{ fontSize:10,color:'rgba(255,255,255,.2)',fontFamily:"var(--fd)",letterSpacing:'.1em',textTransform:'uppercase' }}>© 2025 FAIR PLAY.</p>
            <span style={{ fontSize:10,color:'rgba(255,255,255,.15)',fontFamily:"var(--fd)" }}>by</span>
            <Image
              src="/LOGO_FOKO.png" alt="Foko" width={60} height={22}
              style={{ height:22,width:'auto',filter:'grayscale(1) opacity(0.35)',transition:'filter .25s' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'grayscale(1) opacity(0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'grayscale(1) opacity(0.35)'; }}
            />
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a href="https://wa.me/5493471510863" target="_blank" rel="noreferrer"
        style={{ position:'fixed',bottom:90,right:22,zIndex:799,width:54,height:54,background:'#25D366',borderRadius:'50%',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 18px rgba(37,211,102,.45)',textDecoration:'none' }}>
        <Ic n="wa" s={26} />
      </a>

      {/* ── FLOATING CART ── */}
      {cart.length > 0 && !showCart && (
        <button onClick={() => setShowCart(true)} style={{ position:'fixed',bottom:22,right:22,zIndex:800,width:54,height:54,background:'#0a0a0a',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(0,0,0,.3)',animation:'badgePop .3s ease' }}>
          <Ic n="bag" s={21} />
          <div style={{ position:'absolute',top:-4,right:-4,width:19,height:19,borderRadius:'50%',background:'var(--g)',color:'#fff',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff' }}>{cart.length}</div>
        </button>
      )}

      {showCart   && <CartPanel items={cart} onRemove={(i) => setCart((c) => c.filter((_, idx) => idx !== i))} onClose={() => setShowCart(false)} />}
      {selected   && <ProductModal p={selected} cats={cats} onAdd={addToCart} onClose={() => setSelected(null)} />}
    </div>
  );
}