'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { Ic } from '@/components/Icons';
import ImageUploader from '@/components/ImageUploader';
import { adminInsert, adminUpdate, adminDelete } from '../actions';
import { Spin } from './ui';

// ── Tarjetas ──────────────────────────────────────────────────
export default function ACards({ toast, cats = [] }) {
  const [cards,    setCards]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const EMPTY = { titulo:'',subtitulo:'',etiqueta:'',cta:'Ver colección',imagen_url:'',bloque:1,orden:0,activo:true,categoria:'' };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    getSupabaseBrowser().from('banner_cards').select('*').order('orden', { ascending:true })
      .then((r) => { if (r.data) setCards(r.data); setLoading(false); });
  }, []);

  const openNew  = () => { setForm({ ...EMPTY, orden:cards.length }); setEditing(null); setSaveError(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); setSaveError(null); setShowForm(true); };

  const save = async () => {
    setSaveError(null);
    if (!form.imagen_url || form.imagen_url.startsWith('data:')) {
      setSaveError('La imagen es requerida. Subí una imagen válida antes de guardar.');
      return;
    }
    setSaving(true);
    const row = {
      titulo:    form.titulo,
      subtitulo: form.subtitulo,
      etiqueta:  form.etiqueta,
      cta:       form.cta,
      imagen_url: form.imagen_url,
      bloque:    parseInt(form.bloque) || 1,
      orden:     parseInt(form.orden)  || 0,
      activo:    form.activo !== false,
      categoria: form.categoria || null,
    };
    if (editing) {
      const { error } = await adminUpdate('banner_cards', editing, row);
      if (error) { setSaveError(error.message); }
      else { setCards((c) => c.map((x) => x.id === editing ? { ...x, ...row } : x)); toast('Tarjeta actualizada'); setShowForm(false); }
    } else {
      const { error } = await adminInsert('banner_cards', row);
      if (error) { setSaveError(error.message); }
      else {
        const { data: newCards } = await getSupabaseBrowser().from('banner_cards').select('*').order('orden', { ascending:true });
        if (newCards) setCards(newCards);
        toast('Tarjeta creada');
        setShowForm(false);
      }
    }
    setSaving(false);
  };

  const toggle = async (c) => { const { error } = await adminUpdate('banner_cards', c.id, { activo:!c.activo }); if (error) { toast(error.message); return; } setCards((cs) => cs.map((x) => x.id === c.id ? { ...x, activo:!x.activo } : x)); };
  const del    = async (id) => { if (!confirm('¿Eliminar?')) return; const { error } = await adminDelete('banner_cards', id); if (error) { toast(error.message); return; } setCards((c) => c.filter((x) => x.id !== id)); toast('Eliminada'); };

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
                <div><label className="albl">Filtrar catálogo al hacer clic</label>
                  <select className="as" value={form.categoria||''} onChange={(e) => setForm((f)=>({...f,categoria:e.target.value}))}>
                    <option value="">— Sin filtro (solo scroll) —</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select></div>
                <div style={{ gridColumn:'1/-1' }}><label className="albl">Imagen *</label>
                  <ImageUploader value={form.imagen_url||''} onChange={(v)=>setForm((f)=>({...f,imagen_url:v}))} label="Subir imagen (1200x600px)" /></div>
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
                <button onClick={save} disabled={saving} className="btn-g" style={{ padding:'9px 22px',borderRadius:6 }}>{saving?<Spin/>:(editing?'Guardar':'Crear tarjeta')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
