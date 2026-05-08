/*
  ── SQL: tabla ticker_items ─────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS ticker_items (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    texto      text        NOT NULL,
    activo     boolean     NOT NULL DEFAULT true,
    orden      integer     NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  ALTER TABLE ticker_items ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "ticker_select" ON ticker_items FOR SELECT USING (true);
  CREATE POLICY "ticker_insert" ON ticker_items FOR INSERT WITH CHECK (true);
  CREATE POLICY "ticker_update" ON ticker_items FOR UPDATE USING (true);
  CREATE POLICY "ticker_delete" ON ticker_items FOR DELETE USING (true);

  -- Datos de ejemplo
  INSERT INTO ticker_items (texto, activo, orden) VALUES
    ('NUEVA COLECCIÓN OTOÑO 2025', true, 0),
    ('ENVÍOS A TODO EL PAÍS',      true, 1),
    ('@FAIRPLAY_VIDADEPORTIVA',    true, 2);

  ─────────────────────────────────────────────────────────────────────────── */

'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { supabase, getSupabaseClient, uploadImage } from '@/lib/supabase';
import { compressImage } from '@/lib/compress';
import { Ic } from '@/components/Icons';
import ImageUploader from '@/components/ImageUploader';

const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER || 'fairplayadmin';
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'fairplay2026';

const DCATS = [
  {id:'remeras',label:'Remeras',icon:'👕'},{id:'buzos',label:'Buzos',icon:'🧥'},
  {id:'pantalones',label:'Pantalones',icon:'👖'},{id:'camperas',label:'Camperas',icon:'🧤'},
  {id:'calzado',label:'Calzado',icon:'👟'},{id:'mochilas',label:'Mochilas',icon:'🎒'},
  {id:'medias',label:'Medias',icon:'🧦'},{id:'accesorios',label:'Accesorios',icon:'⌚'},
];

function Spin({ g }) { return <span className={g ? 'spin spin-g' : 'spin'} />; }

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">✓ {msg}</div>;
}

// ── Login ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err,  setErr]  = useState('');
  const [shk,  setShk]  = useState(false);

  const go = () => {
    if (u === ADMIN_USER && p === ADMIN_PASS) { onLogin(); }
    else { setErr('Credenciales incorrectas'); setShk(true); setTimeout(() => setShk(false), 500); }
  };

  return (
    <div style={{ minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#fff',width:'min(360px,95%)',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.5)' }}>
        <div style={{ background:'#0a0a0a',padding:'28px 28px 22px',textAlign:'center',position:'relative' }}>
          <Image src="/logo.png" alt="Fair Play" width={100} height={40} style={{ height:48,width:'auto',marginBottom:10 }} />
          <div style={{ fontSize:10,color:'#22c55e',fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',fontFamily:"var(--fd)" }}>Panel Administrador</div>
        </div>
        <div style={{ padding:'22px',display:'flex',flexDirection:'column',gap:12,animation:shk?'shake .4s':'none' }}>
          <div>
            <label className="albl">Usuario</label>
            <input className="ai" value={u} onChange={(e) => { setU(e.target.value); setErr(''); }}
              onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="fairplayadmin" autoComplete="username" />
          </div>
          <div>
            <label className="albl">Contraseña</label>
            <div style={{ position:'relative' }}>
              <input className="ai" type={show?'text':'password'} value={p}
                onChange={(e) => { setP(e.target.value); setErr(''); }}
                onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="••••••••" style={{ paddingRight:40 }} autoComplete="current-password" />
              <button onClick={() => setShow((v) => !v)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',display:'flex',alignItems:'center' }}>
                <Ic n={show?'eo':'ey'} s={15} />
              </button>
            </div>
          </div>
          {err && <div style={{ background:'#fef2f2',border:'1px solid #fecaca',padding:'7px 11px',fontSize:13,color:'#dc2626',fontWeight:600,borderRadius:6 }}>{err}</div>}
          <button onClick={go} className="btn-k" style={{ width:'100%',justifyContent:'center',padding:13,marginTop:2 }}>Ingresar al panel</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function ADash({ products, heros, cats }) {
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

// ── Productos ─────────────────────────────────────────────────
function AProds({ products, setProducts, cats, toast, refresh }) {
  const [search,         setSearch]         = useState('');
  const [catF,           setCatF]           = useState('todos');
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError,     setPhotoError]     = useState(null);
  const EMPTY = { nombre:'',tipo:cats[0]?.id||'remeras',categoria:'hombre',talles_disponibles:[],imagen_url:'',fotos:[],descripcion:'',activo:true };
  const [form, setForm] = useState(EMPTY);

  const filtered = products.filter((p) => {
    if (catF !== 'todos' && p.tipo !== catF) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew  = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p, fotos: Array.isArray(p.fotos) ? p.fotos : (p.imagen_url ? [p.imagen_url] : []) }); setEditing(p.id); setShowForm(true); };
  const togT     = (t) => setForm((f) => { const a = f.talles_disponibles || []; return { ...f, talles_disponibles: a.includes(t) ? a.filter((x) => x !== t) : [...a, t] }; });

  const save = async () => {
    if (!form.nombre) { setSaveError('El nombre del producto es requerido'); return; }
    setSaving(true);
    setSaveError(null);

    // Strip base64 — only keep Supabase Storage URLs
    const fotosClean = (form.fotos || []).filter((f) => typeof f === 'string' && f.startsWith('https://'));
    const rawMain    = form.fotos?.length > 0 ? form.fotos[0] : (form.imagen_url || '');
    const imagen_url = rawMain.startsWith('https://') ? rawMain : (fotosClean[0] || '');
    const dropped    = (form.fotos || []).length - fotosClean.length;
    if (dropped > 0) {
      setSaveError(`${dropped} foto(s) no se subieron a Supabase Storage y fueron descartadas. Solo se guardarán las URLs válidas.`);
    }

    const row = { nombre:form.nombre, tipo:form.tipo, categoria:form.categoria, talles_disponibles:form.talles_disponibles, imagen_url, fotos:fotosClean, descripcion:form.descripcion||'', activo:form.activo!==false };
    console.log('[AProds save] payload:', row, '| editing:', editing);
    if (editing) {
      const { error } = await supabase.from('productos').update(row).eq('id', editing);
      console.log('[AProds save] update result:', { error });
      if (error) { setSaveError(error.message); }
      else { await refresh(); toast('Producto actualizado'); setShowForm(false); }
    } else {
      const { data, error } = await supabase.from('productos').insert(row).select().single();
      console.log('[AProds save] insert result:', { data, error });
      if (error) { setSaveError(error.message); }
      else { await refresh(); toast('Producto creado'); setShowForm(false); }
    }
    setSaving(false);
  };

  const toggle = async (p) => { await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id); setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, activo: !x.activo } : x)); };
  const del    = async (id) => { if (!confirm('¿Eliminar?')) return; await supabase.from('productos').delete().eq('id', id); setProducts((ps) => ps.filter((x) => x.id !== id)); toast('Eliminado'); };

  const TALLES_R = ['XS','S','M','L','XL','XXL','Único'];
  const TALLES_C = ['35','36','37','38','39','40','41','42','43','44','45'];
  const tOpts    = ['calzado','zapatillas'].includes(form.tipo) ? TALLES_C : TALLES_R;

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,gap:12,flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Productos</h1>
          <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>{products.length} en total</p>
        </div>
        <button className="btn-g" style={{ borderRadius:6 }} onClick={openNew}><Ic n="pl" s={14} /> Nuevo Producto</button>
      </div>

      <div className="ac" style={{ marginBottom:16 }}>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap',alignItems:'center' }}>
          <div style={{ position:'relative',flex:1,minWidth:180 }}>
            <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#9ca3af' }}><Ic n="sr" s={15} /></span>
            <input className="ai" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft:34 }} />
          </div>
          <select className="as" style={{ width:'auto',minWidth:160 }} value={catF} onChange={(e) => setCatF(e.target.value)}>
            <option value="todos">Todas las categorías</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="ac">
        <table className="atbl">
          <thead><tr><th>Producto</th><th>Cat.</th><th>Género</th><th>Talles</th><th>Fotos</th><th>Estado</th><th style={{ textAlign:'right' }}>Acciones</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center',padding:'32px',color:'#9ca3af' }}>Sin resultados</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <img src={p.imagen_url || ''} style={{ width:40,height:50,objectFit:'cover',background:'#f3f4f6',borderRadius:4,flexShrink:0 }} onError={(e) => (e.target.style.display = 'none')} />
                    <span style={{ fontWeight:600,fontSize:14 }}>{p.nombre}</span>
                  </div>
                </td>
                <td><span style={{ background:'#f0fdf4',color:'#15803d',padding:'3px 9px',borderRadius:100,fontSize:12,fontWeight:600 }}>{cats.find((c) => c.id === p.tipo)?.label || p.tipo}</span></td>
                <td style={{ fontSize:13,color:'#6b7280',textTransform:'capitalize' }}>{p.categoria || '—'}</td>
                <td style={{ fontSize:12,color:'#6b7280' }}>{(p.talles_disponibles || []).join(', ') || 'Único'}</td>
                <td style={{ fontSize:12,color:'#6b7280' }}>{Array.isArray(p.fotos) ? p.fotos.length : (p.imagen_url ? 1 : 0)}</td>
                <td>
                  <button onClick={() => toggle(p)} style={{ background:p.activo!==false?'#dcfce7':'#fee2e2',color:p.activo!==false?'#15803d':'#dc2626',padding:'3px 11px',borderRadius:100,fontSize:12,fontWeight:700,border:'none',cursor:'pointer',fontFamily:"var(--fb)" }}>
                    {p.activo !== false ? 'Activo' : 'Oculto'}
                  </button>
                </td>
                <td>
                  <div style={{ display:'flex',gap:5,justifyContent:'flex-end' }}>
                    <button onClick={() => openEdit(p)} style={{ width:30,height:30,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280',borderRadius:5 }}><Ic n="pe" s={13} /></button>
                    <button onClick={() => del(p.id)}   style={{ width:30,height:30,border:'none',background:'#fee2e2',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:5 }}><Ic n="tr" s={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-ov">
          <div className="modal-bx" style={{ width:'min(700px,98%)',maxHeight:'96vh' }}>
            <div style={{ padding:'16px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
              <h2 style={{ fontFamily:"var(--fd)",fontSize:17,fontWeight:900,letterSpacing:'.06em',textTransform:'uppercase' }}>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width:30,height:30,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Ic n="x" s={14} /></button>
            </div>
            <div style={{ flex:1,overflowY:'auto',padding:20 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="albl">Nombre *</label>
                  <input className="ai" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre:e.target.value }))} placeholder="Ej: Remera Dry-Fit Pro" />
                </div>
                <div>
                  <label className="albl">Categoría</label>
                  <select className="as" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo:e.target.value }))}>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="albl">Género</label>
                  <select className="as" value={form.categoria || 'hombre'} onChange={(e) => setForm((f) => ({ ...f, categoria:e.target.value }))}>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="unisex">Unisex</option>
                    <option value="niños">Niños</option>
                  </select>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="albl">Descripción (opcional)</label>
                  <textarea className="ai" value={form.descripcion || ''} onChange={(e) => setForm((f) => ({ ...f, descripcion:e.target.value }))}
                    placeholder="Material, características, etc."
                    style={{ resize:'vertical',minHeight:68,fontFamily:"var(--fb)",lineHeight:1.6 }} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="albl">Talles disponibles</label>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginTop:4 }}>
                    {tOpts.map((t) => (
                      <button key={t} onClick={() => togT(t)}
                        style={{ padding:'7px 12px',border:`1.5px solid ${(form.talles_disponibles||[]).includes(t)?'#16a34a':'#e5e7eb'}`,background:(form.talles_disponibles||[]).includes(t)?'#dcfce7':'#fff',color:(form.talles_disponibles||[]).includes(t)?'#15803d':'#6b7280',cursor:'pointer',fontSize:13,fontWeight:700,borderRadius:6,fontFamily:"var(--fb)" }}>{t}</button>
                    ))}
                  </div>
                  <p style={{ fontSize:11,color:'#9ca3af',marginTop:5 }}>Dejá vacío si es talle único</p>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="albl">Fotos del producto (máx. 8)</label>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginTop:4 }}>
                    {(form.fotos || []).map((url, i) => (
                      <div key={i} style={{ position:'relative',width:80,height:80,flexShrink:0 }}>
                        <img src={url} style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:4 }} onError={(e) => (e.target.style.display = 'none')} />
                        <button onClick={() => setForm((f) => ({ ...f, fotos:(f.fotos||[]).filter((_,j)=>j!==i), imagen_url:i===0?(f.fotos||[])[1]||'':f.imagen_url }))}
                          style={{ position:'absolute',top:2,right:2,width:18,height:18,background:'rgba(0,0,0,.65)',border:'none',color:'#fff',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>✕</button>
                        {i === 0 && <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(22,163,74,.85)',color:'#fff',fontSize:8,fontWeight:700,textAlign:'center',padding:2,letterSpacing:'.03em' }}>PRINCIPAL</div>}
                      </div>
                    ))}

                    {/* Botón agregar fotos */}
                    {(form.fotos || []).length < 8 && (
                      <div style={{ width:80,height:80,border:`2px dashed ${photoUploading?'#16a34a':'#cbd5e1'}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:4,background:photoUploading?'#f0fdf4':'#f9fafb',position:'relative',gap:3,flexShrink:0,cursor:photoUploading?'not-allowed':'pointer' }}>
                        {photoUploading ? (
                          <>
                            <Spin g />
                            <span style={{ fontSize:8,fontWeight:600,color:'#16a34a',pointerEvents:'none' }}>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <input
                              type="file" accept="image/*" multiple
                              style={{ position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%' }}
                              disabled={photoUploading}
                              onChange={async (e) => {
                                const files = Array.from(e.target.files).slice(0, 8 - (form.fotos||[]).length);
                                if (!files.length) return;
                                setPhotoUploading(true);
                                setPhotoError(null);
                                const newUrls = [];
                                let failed = 0;
                                for (const file of files) {
                                  try {
                                    const compressed = await compressImage(file);
                                    const url = await uploadImage(compressed);
                                    newUrls.push(url);
                                  } catch (err) {
                                    console.error('[fotos] Error subiendo imagen:', err.message);
                                    failed++;
                                  }
                                }
                                if (failed > 0) {
                                  setPhotoError(`${failed} imagen(es) no se pudieron subir. Verificá tu conexión y el bucket "imagenes" en Supabase.`);
                                }
                                if (newUrls.length > 0) {
                                  setForm((f) => {
                                    const all = [...(f.fotos||[]), ...newUrls];
                                    return { ...f, fotos: all, imagen_url: all[0] || f.imagen_url };
                                  });
                                }
                                setPhotoUploading(false);
                                e.target.value = '';
                              }}
                            />
                            <span style={{ fontSize:20,pointerEvents:'none' }}>📸</span>
                            <span style={{ fontSize:9,fontWeight:600,color:'#6b7280',pointerEvents:'none' }}>Agregar</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Error de upload */}
                  {photoError && (
                    <div style={{ marginTop:8,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'8px 12px',display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontSize:12,color:'#dc2626',fontWeight:600,flex:1 }}>{photoError}</span>
                      <button onClick={() => setPhotoError(null)} style={{ background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:14,lineHeight:1 }}>✕</button>
                    </div>
                  )}

                  <p style={{ fontSize:11,color:'#9ca3af',marginTop:5 }}>La 1ra foto es la principal. Máx. 8 fotos. Si Supabase falla se usa base64.</p>
                </div>
              </div>
            </div>
            <div style={{ padding:'14px 20px',borderTop:'1px solid #f3f4f6',flexShrink:0 }}>
              {saveError && (
                <div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'8px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ fontSize:12,color:'#dc2626',fontWeight:600,flex:1 }}>⚠ {saveError}</span>
                  <button onClick={() => setSaveError(null)} style={{ background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:14,lineHeight:1 }}>✕</button>
                </div>
              )}
              <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                <button onClick={() => { setShowForm(false); setSaveError(null); }} style={{ padding:'9px 18px',border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,borderRadius:6,fontFamily:"var(--fb)" }}>Cancelar</button>
                <button onClick={save} disabled={saving} className="btn-g" style={{ padding:'9px 22px',borderRadius:6 }}>
                  {saving ? <Spin /> : (editing ? 'Guardar cambios' : 'Crear producto')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Categorías ────────────────────────────────────────────────
function ACats({ cats, setCats, toast, refresh }) {
  const [form, setForm] = useState({ id:'',label:'',icon:'🏷️' });
  const [saving, setSaving] = useState(false);
  const EMOJIS = ['👕','🧥','👖','🧤','👟','🎒','🧦','⌚','🏋️','⛸️','🎽','🧣','👗','👒','💼','🎿','🏊','🎾','⚽','🏀','🎯','🥾','🩴','👜'];

  const save = async () => {
    if (!form.label || !form.id) return;
    setSaving(true);
    const row = { id: form.id.toLowerCase().replace(/\s+/g, '-'), label: form.label, icon: form.icon, orden: cats.length };
    const { error } = await supabase.from('categorias').upsert(row);
    if (!error) { await refresh(); toast('Categoría guardada'); setForm({ id:'',label:'',icon:'🏷️' }); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('categorias').delete().eq('id', id);
    setCats((c) => c.filter((x) => x.id !== id));
    toast('Eliminada');
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Categorías</h1>
        <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>Tipos de productos</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:20 }}>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Nueva categoría</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:11 }}>
            <div><label className="albl">ID único</label><input className="ai" placeholder="ej: zapatillas" value={form.id} onChange={(e) => setForm((f) => ({ ...f, id:e.target.value.toLowerCase().replace(/\s+/g,'-') }))} /></div>
            <div><label className="albl">Nombre</label><input className="ai" placeholder="ej: Zapatillas" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label:e.target.value }))} /></div>
            <div>
              <label className="albl">Ícono</label>
              <div style={{ display:'flex',gap:5,flexWrap:'wrap',marginTop:4 }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setForm((f) => ({ ...f, icon:e }))} style={{ width:34,height:34,border:`2px solid ${form.icon===e?'#16a34a':'#e5e7eb'}`,background:form.icon===e?'#dcfce7':'#fff',fontSize:17,cursor:'pointer',borderRadius:6 }}>{e}</button>
                ))}
              </div>
            </div>
            <button className="btn-g" style={{ borderRadius:6 }} onClick={save} disabled={saving}>
              {saving ? <Spin /> : <><Ic n="pl" s={13} />Agregar</>}
            </button>
          </div>
        </div>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Categorías ({cats.length})</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
            {cats.map((c) => (
              <div key={c.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 11px',background:'#f9fafb',borderRadius:7,border:'1px solid #f3f4f6' }}>
                <span style={{ fontSize:20 }}>{c.icon || '🏷️'}</span>
                <div style={{ flex:1 }}><p style={{ fontSize:14,fontWeight:700 }}>{c.label}</p><p style={{ fontSize:11,color:'#9ca3af',fontFamily:'monospace' }}>{c.id}</p></div>
                <button onClick={() => del(c.id)} style={{ width:26,height:26,border:'none',background:'#fee2e2',color:'#ef4444',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Ic n="tr" s={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero Posters ──────────────────────────────────────────────
function AHero({ heros, setHeros, toast, refresh }) {
  const [form,   setForm]   = useState({ titulo:'',subtitulo:'',url_archivo:'',tipo_archivo:'image' });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.url_archivo) return;
    setSaving(true);
    const { error } = await supabase.from('hero_slides').insert({ url_archivo:form.url_archivo, tipo_archivo:form.tipo_archivo, titulo:form.titulo, subtitulo:form.subtitulo, activo:false });
    if (!error) { await refresh(); toast('Poster agregado'); setForm({ titulo:'',subtitulo:'',url_archivo:'',tipo_archivo:'image' }); }
    setSaving(false);
  };

  const setActive = async (id) => {
    await supabase.from('hero_slides').update({ activo:false }).neq('id', id);
    await supabase.from('hero_slides').update({ activo:true  }).eq('id',  id);
    setHeros((h) => h.map((x) => ({ ...x, activo: x.id === id })));
    toast('Hero actualizado');
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    setHeros((h) => h.filter((x) => x.id !== id));
    toast('Eliminado');
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Hero Posters</h1>
        <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>El poster activo se muestra en el inicio</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:20 }}>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Agregar Poster</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:11 }}>
            <div><label className="albl">Título</label><input className="ai" placeholder="NUEVA COLECCIÓN" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo:e.target.value }))} /></div>
            <div><label className="albl">Subtítulo</label><input className="ai" placeholder="Otoño 2025" value={form.subtitulo} onChange={(e) => setForm((f) => ({ ...f, subtitulo:e.target.value }))} /></div>
            <div><label className="albl">Imagen (1600px recomendado)</label>
              <ImageUploader value={form.url_archivo} onChange={(v) => setForm((f) => ({ ...f, url_archivo:v }))} label="Subir imagen del hero" />
            </div>
            <button className="btn-g" style={{ borderRadius:6 }} onClick={add} disabled={saving}>
              {saving ? <Spin /> : <><Ic n="pl" s={13} />Agregar poster</>}
            </button>
          </div>
        </div>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Posters ({heros.length})</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
            {heros.map((h) => (
              <div key={h.id} style={{ display:'flex',gap:11,padding:11,borderRadius:7,border:`2px solid ${h.activo?'#16a34a':'#f3f4f6'}`,background:h.activo?'#f0fdf4':'#fafafa',alignItems:'center' }}>
                <img src={h.url_archivo} style={{ width:76,height:48,objectFit:'cover',borderRadius:4,flexShrink:0 }} onError={(e) => (e.target.style.display='none')} />
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:'.04em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{h.titulo || 'Sin título'}</p>
                  <p style={{ fontSize:11,color:'#6b7280' }}>{h.subtitulo}</p>
                </div>
                {h.activo
                  ? <span style={{ background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:'.06em',flexShrink:0 }}>● ACTIVO</span>
                  : <button onClick={() => setActive(h.id)} style={{ padding:'4px 11px',border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,borderRadius:100,fontFamily:"var(--fb)",flexShrink:0 }}>Activar</button>
                }
                <button onClick={() => del(h.id)} style={{ width:26,height:26,border:'none',background:'#fee2e2',color:'#ef4444',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ic n="tr" s={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjetas ──────────────────────────────────────────────────
function ACards({ toast }) {
  const [cards,    setCards]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const EMPTY = { titulo:'',subtitulo:'',etiqueta:'',cta:'Ver colección',imagen_url:'',bloque:1,orden:0,activo:true };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    supabase.from('banner_cards').select('*').order('orden', { ascending:true })
      .then((r) => { if (r.data) setCards(r.data); setLoading(false); });
  }, []);

  const openNew  = () => { setForm({ ...EMPTY, orden:cards.length }); setEditing(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); setShowForm(true); };

  const save = async () => {
    if (!form.imagen_url) return;
    setSaving(true);
    const row = { titulo:form.titulo,subtitulo:form.subtitulo,etiqueta:form.etiqueta,cta:form.cta,imagen_url:form.imagen_url,bloque:parseInt(form.bloque)||1,orden:parseInt(form.orden)||0,activo:form.activo!==false };
    if (editing) {
      const { error } = await supabase.from('banner_cards').update(row).eq('id', editing);
      if (!error) { setCards((c) => c.map((x) => x.id === editing ? { ...x, ...row } : x)); toast('Tarjeta actualizada'); }
    } else {
      const { data, error } = await supabase.from('banner_cards').insert(row).select().single();
      if (!error && data) { setCards((c) => [...c, data]); toast('Tarjeta creada'); }
    }
    setSaving(false); setShowForm(false);
  };

  const toggle = async (c) => { await supabase.from('banner_cards').update({ activo:!c.activo }).eq('id', c.id); setCards((cs) => cs.map((x) => x.id === c.id ? { ...x, activo:!x.activo } : x)); };
  const del    = async (id) => { if (!confirm('¿Eliminar?')) return; await supabase.from('banner_cards').delete().eq('id', id); setCards((c) => c.filter((x) => x.id !== id)); toast('Eliminada'); };

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,gap:12,flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Tarjetas Promocionales</h1>
          <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>Cards con imagen entre secciones</p>
        </div>
        <button className="btn-g" style={{ borderRadius:6 }} onClick={openNew}><Ic n="pl" s={14} /> Nueva Tarjeta</button>
      </div>
      {loading ? <div style={{ textAlign:'center',padding:32 }}><Spin g /></div> : (
        <div className="ac">
          <p style={{ fontSize:12,color:'#6b7280',marginBottom:16,background:'#f0fdf4',padding:'10px 12px',borderRadius:6,border:'1px solid #86efac' }}>
            💡 <b>Bloque 1</b> aparece entre el hero y los carouseles. <b>Bloque 2</b> aparece antes del catálogo.
          </p>
          <table className="atbl">
            <thead><tr><th>Imagen</th><th>Título</th><th>Bloque</th><th>Estado</th><th style={{ textAlign:'right' }}>Acciones</th></tr></thead>
            <tbody>
              {cards.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center',padding:'32px',color:'#9ca3af' }}>Sin tarjetas.</td></tr>}
              {cards.map((c) => (
                <tr key={c.id}>
                  <td><img src={c.imagen_url} style={{ width:80,height:48,objectFit:'cover',borderRadius:4 }} onError={(e) => (e.target.style.display='none')} /></td>
                  <td><p style={{ fontWeight:700,fontSize:14 }}>{c.titulo || 'Sin título'}</p>{c.etiqueta && <span style={{ background:'#dcfce7',color:'#15803d',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:100 }}>{c.etiqueta}</span>}</td>
                  <td><span style={{ background:'#f3f4f6',padding:'3px 10px',borderRadius:100,fontSize:12,fontWeight:600 }}>Bloque {c.bloque||1}</span></td>
                  <td><button onClick={() => toggle(c)} style={{ background:c.activo!==false?'#dcfce7':'#fee2e2',color:c.activo!==false?'#15803d':'#dc2626',padding:'3px 11px',borderRadius:100,fontSize:12,fontWeight:700,border:'none',cursor:'pointer',fontFamily:"var(--fb)" }}>{c.activo!==false?'Visible':'Oculta'}</button></td>
                  <td><div style={{ display:'flex',gap:5,justifyContent:'flex-end' }}>
                    <button onClick={() => openEdit(c)} style={{ width:30,height:30,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280',borderRadius:5 }}><Ic n="pe" s={13} /></button>
                    <button onClick={() => del(c.id)}   style={{ width:30,height:30,border:'none',background:'#fee2e2',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:5 }}><Ic n="tr" s={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="modal-ov">
          <div className="modal-bx" style={{ width:'min(560px,98%)',maxHeight:'94vh' }}>
            <div style={{ padding:'16px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
              <h2 style={{ fontFamily:"var(--fd)",fontSize:17,fontWeight:900,letterSpacing:'.06em',textTransform:'uppercase' }}>{editing?'Editar Tarjeta':'Nueva Tarjeta'}</h2>
              <button onClick={() => setShowForm(false)} style={{ width:30,height:30,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Ic n="x" s={14} /></button>
            </div>
            <div style={{ flex:1,overflowY:'auto',padding:20 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                <div><label className="albl">Título</label><input className="ai" value={form.titulo||''} onChange={(e) => setForm((f)=>({...f,titulo:e.target.value}))} placeholder="NUEVA COLECCIÓN" /></div>
                <div><label className="albl">Badge verde</label><input className="ai" value={form.etiqueta||''} onChange={(e) => setForm((f)=>({...f,etiqueta:e.target.value}))} placeholder="Novedad" /></div>
                <div style={{ gridColumn:'1/-1' }}><label className="albl">Subtítulo</label><input className="ai" value={form.subtitulo||''} onChange={(e) => setForm((f)=>({...f,subtitulo:e.target.value}))} placeholder="Texto descriptivo" /></div>
                <div><label className="albl">Texto del botón</label><input className="ai" value={form.cta||''} onChange={(e) => setForm((f)=>({...f,cta:e.target.value}))} placeholder="Ver colección" /></div>
                <div><label className="albl">Bloque</label>
                  <select className="as" value={form.bloque||1} onChange={(e) => setForm((f)=>({...f,bloque:parseInt(e.target.value)}))}>
                    <option value={1}>Bloque 1 — Entre hero y carouseles</option>
                    <option value={2}>Bloque 2 — Antes del catálogo</option>
                  </select></div>
                <div style={{ gridColumn:'1/-1' }}><label className="albl">Imagen *</label>
                  <ImageUploader value={form.imagen_url||''} onChange={(v)=>setForm((f)=>({...f,imagen_url:v}))} label="Subir imagen (1200x600px)" /></div>
              </div>
            </div>
            <div style={{ padding:'14px 20px',borderTop:'1px solid #f3f4f6',display:'flex',gap:10,justifyContent:'flex-end',flexShrink:0 }}>
              <button onClick={()=>setShowForm(false)} style={{ padding:'9px 18px',border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,borderRadius:6,fontFamily:"var(--fb)" }}>Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-g" style={{ padding:'9px 22px',borderRadius:6 }}>{saving?<Spin/>:(editing?'Guardar':'Crear tarjeta')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ticker ────────────────────────────────────────────────────
function ATicker({ toast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    supabase.from('ticker_items').select('*').order('orden', { ascending: true })
      .then(({ data }) => { if (data) setItems(data); setLoading(false); });
  }, []);

  const add = async () => {
    const texto = newText.trim();
    if (!texto) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('ticker_items')
      .insert({ texto, activo: true, orden: items.length })
      .select().single();
    if (!error && data) { setItems((i) => [...i, data]); setNewText(''); toast('Item agregado'); }
    setSaving(false);
  };

  const toggle = async (item) => {
    await supabase.from('ticker_items').update({ activo: !item.activo }).eq('id', item.id);
    setItems((i) => i.map((x) => x.id === item.id ? { ...x, activo: !x.activo } : x));
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar este item del ticker?')) return;
    await supabase.from('ticker_items').delete().eq('id', id);
    setItems((i) => i.filter((x) => x.id !== id));
    toast('Eliminado');
  };

  const updateOrden = async (id, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    await supabase.from('ticker_items').update({ orden: n }).eq('id', id);
    setItems((i) =>
      i.map((x) => x.id === id ? { ...x, orden: n } : x)
       .sort((a, b) => a.orden - b.orden)
    );
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Ticker</h1>
        <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>Textos de la barra verde animada</p>
      </div>

      {/* Agregar item */}
      <div className="ac" style={{ marginBottom:20 }}>
        <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:12 }}>Nuevo item</h3>
        <div style={{ display:'flex',gap:10 }}>
          <input
            className="ai" style={{ flex:1 }}
            placeholder="Ej: NUEVA COLECCIÓN OTOÑO 2025"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="btn-g" style={{ borderRadius:6,flexShrink:0 }} onClick={add} disabled={saving}>
            {saving ? <Spin /> : <><Ic n="pl" s={13} /> Agregar</>}
          </button>
        </div>
        <p style={{ fontSize:11,color:'#9ca3af',marginTop:6 }}>El texto se muestra en mayúsculas por CSS. Podés escribirlo en minúsculas.</p>
      </div>

      {/* Lista de items */}
      <div className="ac">
        <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>
          Items ({items.filter((i) => i.activo).length} activos de {items.length})
        </h3>
        {loading ? (
          <div style={{ textAlign:'center',padding:24 }}><Spin g /></div>
        ) : items.length === 0 ? (
          <p style={{ color:'#9ca3af',fontSize:13,padding:'16px 0' }}>Sin items. Agregá el primero arriba.</p>
        ) : (
          <table className="atbl">
            <thead>
              <tr>
                <th style={{ width:60 }}>Orden</th>
                <th>Texto</th>
                <th style={{ width:100 }}>Estado</th>
                <th style={{ width:60,textAlign:'right' }}>Acc.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="number"
                      className="ai"
                      defaultValue={item.orden}
                      style={{ width:54,padding:'4px 8px',fontSize:13,textAlign:'center' }}
                      onBlur={(e) => updateOrden(item.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateOrden(item.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <span style={{ fontSize:13,fontFamily:"var(--fd)",fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase' }}>
                      {item.texto}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggle(item)}
                      style={{ background:item.activo?'#dcfce7':'#fee2e2',color:item.activo?'#15803d':'#dc2626',padding:'3px 11px',borderRadius:100,fontSize:12,fontWeight:700,border:'none',cursor:'pointer',fontFamily:"var(--fb)" }}
                    >
                      {item.activo ? 'Activo' : 'Oculto'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display:'flex',justifyContent:'flex-end' }}>
                      <button onClick={() => del(item.id)} style={{ width:30,height:30,border:'none',background:'#fee2e2',color:'#ef4444',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:5 }}>
                        <Ic n="tr" s={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Config ────────────────────────────────────────────────────
function ACfg() {
  return (
    <div>
      <div style={{ marginBottom:22 }}><h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Configuración</h1></div>
      <div className="ac" style={{ maxWidth:480 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {[['WhatsApp', process.env.NEXT_PUBLIC_WA_NUMBER||''],['Usuario admin', ADMIN_USER],['Supabase URL', process.env.NEXT_PUBLIC_SUPABASE_URL||'']].map(([lbl, val]) => (
            <div key={lbl}><label className="albl">{lbl}</label><input className="ai" value={val} readOnly style={{ background:'#f9fafb',color:'#6b7280',fontSize:13 }} /></div>
          ))}
          <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:7,padding:'11px 13px',marginTop:4 }}>
            <p style={{ fontSize:13,color:'#15803d',fontWeight:600 }}>🟢 Conectado a Supabase Pro</p>
            <p style={{ fontSize:11,color:'#16a34a',marginTop:2 }}>Base de datos activa · Plan Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────
export default function AdminPage() {
  const [logged,     setLogged]     = useState(false);
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
      const sb = getSupabaseClient();
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

  useEffect(() => { if (logged) fetchAll(); }, [logged, fetchAll]);

  const NAV = [
    { id:'dashboard',  n:'hm', label:'Dashboard'    },
    { id:'productos',  n:'pk', label:'Productos'     },
    { id:'categorias', n:'tg', label:'Categorías'    },
    { id:'hero',       n:'im', label:'Hero Posters'  },
    { id:'cards',      n:'st', label:'Tarjetas'      },
    { id:'ticker',     n:'st', label:'Ticker'        },
    { id:'config',     n:'sg', label:'Configuración' },
  ];

  if (!logged) return <LoginScreen onLogin={() => setLogged(true)} />;

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
            {sec === 'cards'      && <ACards   toast={showToast} />}
            {sec === 'ticker'     && <ATicker  toast={showToast} />}
            {sec === 'config'     && <ACfg />}
          </>
        )}
      </main>
    </div>
  );
}
