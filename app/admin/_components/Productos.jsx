'use client';
import { useState } from 'react';
import { uploadImage } from '@/lib/upload';
import { compressImage } from '@/lib/compress';
import { Ic } from '@/components/Icons';
import { adminInsert, adminUpdate, adminDelete } from '../actions';
import { Spin } from './ui';

// ── Productos ─────────────────────────────────────────────────
export default function AProds({ products, setProducts, cats, toast, refresh }) {
  const [search,         setSearch]         = useState('');
  const [catF,           setCatF]           = useState('todos');
  const [showForm,       setShowForm]       = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError,     setPhotoError]     = useState(null);
  const EMPTY = { nombre:'',tipo:cats[0]?.id||'remeras',categoria:'hombre',talles_disponibles:[],imagen_url:'',fotos:[],descripcion:'',activo:true,precio:'',precio_anterior:'',destacado:false };
  const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
  const [form, setForm] = useState(EMPTY);

  const filtered = products.filter((p) => {
    if (catF !== 'todos' && p.tipo !== catF) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openNew  = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ ...p, precio: p.precio ?? '', precio_anterior: p.precio_anterior ?? '', fotos: Array.isArray(p.fotos) ? p.fotos : (p.imagen_url ? [p.imagen_url] : []) }); setEditing(p.id); setShowForm(true); };
  const togT     = (t) => setForm((f) => { const a = f.talles_disponibles || []; return { ...f, talles_disponibles: a.includes(t) ? a.filter((x) => x !== t) : [...a, t] }; });

  const save = async () => {
    if (!form.nombre) { setSaveError('El nombre del producto es requerido'); return; }
    setSaving(true);
    setSaveError(null);

    // Solo guardar URLs reales de Supabase Storage — descartar base64 y cualquier otra cosa
    const fotosClean = (form.fotos || []).filter((f) => f && f.startsWith('http') && f.includes('supabase'));
    const rawMain    = form.fotos?.length > 0 ? form.fotos[0] : (form.imagen_url || '');
    const imagen_url = (rawMain.startsWith('http') && rawMain.includes('supabase')) ? rawMain : (fotosClean[0] || '');
    const dropped    = (form.fotos || []).length - fotosClean.length;
    if (dropped > 0) {
      setSaveError(`${dropped} foto(s) no se subieron a Supabase Storage y fueron descartadas. Solo se guardarán las URLs válidas.`);
    }

    const precio = num(form.precio), precio_anterior = num(form.precio_anterior);
    if (precio_anterior != null && (precio == null || precio_anterior <= precio)) {
      setSaveError('El precio anterior tiene que ser mayor al precio actual.'); setSaving(false); return;
    }
    const row = { nombre:form.nombre, tipo:form.tipo, categoria:form.categoria, talles_disponibles:form.talles_disponibles, imagen_url, fotos:fotosClean, descripcion:form.descripcion||'', activo:form.activo!==false, precio, precio_anterior, destacado:!!form.destacado };
    if (editing) {
      const { error } = await adminUpdate('productos', editing, row);
      if (error) { setSaveError(error.message); }
      else { await refresh(); toast('Producto actualizado'); setShowForm(false); }
    } else {
      const { data, error } = await adminInsert('productos', row);
      if (error) { setSaveError(error.message); }
      else { await refresh(); toast('Producto creado'); setShowForm(false); }
    }
    setSaving(false);
  };

  const toggle = async (p) => { const { error } = await adminUpdate('productos', p.id, { activo: !p.activo }); if (error) { toast(error.message); return; } setProducts((ps) => ps.map((x) => x.id === p.id ? { ...x, activo: !x.activo } : x)); };
  const del    = async (id) => { if (!confirm('¿Eliminar?')) return; const { error } = await adminDelete('productos', id); if (error) { toast(error.message); return; } setProducts((ps) => ps.filter((x) => x.id !== id)); toast('Eliminado'); };

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
                <div>
                  <label className="albl">Precio (opcional)</label>
                  <input className="ai" type="number" inputMode="decimal" min="0" step="1" value={form.precio ?? ''} onChange={(e) => setForm((f) => ({ ...f, precio:e.target.value }))} placeholder="Sin precio" />
                </div>
                <div>
                  <label className="albl">Precio anterior (opcional)</label>
                  <input className="ai" type="number" inputMode="decimal" min="0" step="1" value={form.precio_anterior ?? ''} onChange={(e) => setForm((f) => ({ ...f, precio_anterior:e.target.value }))} placeholder="Para mostrar % OFF" />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:600,cursor:'pointer' }}>
                    <input type="checkbox" checked={!!form.destacado} onChange={(e) => setForm((f) => ({ ...f, destacado:e.target.checked }))} style={{ width:16,height:16,accentColor:'#16a34a' }} />
                    Destacado (aparece en “Lo más buscado”)
                  </label>
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
