'use client';
import { useState } from 'react';
import { Ic } from '@/components/Icons';
import ImageUploader from '@/components/ImageUploader';
import { adminInsert, adminUpdate, adminDelete, setHeroActivo } from '../actions';
import { Spin } from './ui';

const EMPTY = { titulo:'',subtitulo:'',url_archivo:'',tipo_archivo:'image',url_archivo_mobile:'',url_recorte:'',url_recorte_mobile:'' };

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="albl">{label}</label>
      {children}
      {hint && <p style={{ fontSize:11,color:'#9ca3af',marginTop:4,lineHeight:1.4 }}>{hint}</p>}
    </div>
  );
}

// ── Hero Posters ──────────────────────────────────────────────
export default function AHero({ heros, setHeros, toast, refresh }) {
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const row = () => ({
    url_archivo: form.url_archivo, tipo_archivo: form.tipo_archivo, titulo: form.titulo, subtitulo: form.subtitulo,
    url_archivo_mobile: form.url_archivo_mobile || null,
    url_recorte:        form.url_recorte        || null,
    url_recorte_mobile: form.url_recorte_mobile || null,
  });

  const save = async () => {
    if (!form.url_archivo) { toast('Subí la imagen de fondo'); return; }
    setSaving(true);
    const { error } = editing
      ? await adminUpdate('hero_slides', editing, row())
      : await adminInsert('hero_slides', { ...row(), activo:false });
    setSaving(false);
    if (error) { toast(error.message); return; }
    await refresh();
    toast(editing ? 'Poster actualizado' : 'Poster agregado');
    setForm(EMPTY); setEditing(null);
  };

  const edit = (h) => {
    setForm({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, h[k] ?? EMPTY[k]])) });
    setEditing(h.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancel = () => { setForm(EMPTY); setEditing(null); };

  const setActive = async (id) => {
    const { error } = await setHeroActivo(id);
    if (error) { toast(error.message); return; }
    setHeros((h) => h.map((x) => ({ ...x, activo: x.id === id })));
    toast('Hero actualizado');
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    const { error } = await adminDelete('hero_slides', id); if (error) { toast(error.message); return; }
    setHeros((h) => h.filter((x) => x.id !== id));
    if (editing === id) cancel();
    toast('Eliminado');
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Hero Posters</h1>
        <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>Se muestran como carrusel en el inicio (el activo primero)</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:20 }}>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>
            {editing ? 'Editar Poster' : 'Agregar Poster'}
          </h3>
          <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
            <Field label="Título"><input className="ai" placeholder="NUEVA COLECCIÓN" value={form.titulo} onChange={(e) => set('titulo')(e.target.value)} /></Field>
            <Field label="Subtítulo"><input className="ai" placeholder="Primavera / Verano 2026" value={form.subtitulo} onChange={(e) => set('subtitulo')(e.target.value)} /></Field>

            <Field label="Fondo · computadora *" hint="2400 × 1050 px (16:7). JPG o WebP. Dejá libre el tercio inferior izquierdo para el texto.">
              <ImageUploader value={form.url_archivo} onChange={set('url_archivo')} label="Subir fondo" maxWidth={2400} />
            </Field>
            <Field label="Fondo · celular (opcional)" hint="1080 × 1350 px (4:5). Si no lo subís, se recorta el de computadora.">
              <ImageUploader value={form.url_archivo_mobile} onChange={set('url_archivo_mobile')} label="Subir fondo vertical" maxWidth={1080} />
            </Field>

            <div style={{ borderTop:'1px solid #f3f4f6',paddingTop:12 }}>
              <p style={{ fontSize:12,fontWeight:700,color:'#111',marginBottom:2 }}>Efecto 3D (persona que sobresale)</p>
              <p style={{ fontSize:11,color:'#9ca3af',lineHeight:1.4 }}>Persona recortada con fondo transparente (PNG o WebP). El 20% superior es lo que sale por arriba de la tarjeta. Si no subís recorte, el slide se ve plano.</p>
            </div>
            <Field label="Recorte · computadora" hint="2400 × 1260 px (40:21), transparente. Mismo encuadre que el fondo de computadora + 210 px arriba.">
              <ImageUploader value={form.url_recorte} onChange={set('url_recorte')} label="Subir recorte PNG" maxWidth={2400} />
            </Field>
            <Field label="Recorte · celular" hint="1080 × 1620 px (2:3), transparente. Mismo encuadre que el fondo de celular + 270 px arriba.">
              <ImageUploader value={form.url_recorte_mobile} onChange={set('url_recorte_mobile')} label="Subir recorte PNG vertical" maxWidth={1080} />
            </Field>

            <div style={{ display:'flex',gap:8 }}>
              <button className="btn-g" style={{ borderRadius:6,flex:1 }} onClick={save} disabled={saving}>
                {saving ? <Spin /> : editing ? 'Guardar cambios' : <><Ic n="pl" s={13} />Agregar poster</>}
              </button>
              {editing && <button className="btn-k" style={{ borderRadius:6 }} onClick={cancel}>Cancelar</button>}
            </div>
          </div>
        </div>
        <div className="ac">
          <h3 style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:14 }}>Posters ({heros.length})</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
            {heros.map((h) => (
              <div key={h.id} style={{ display:'flex',gap:11,padding:11,borderRadius:7,border:`2px solid ${h.activo?'#16a34a':editing===h.id?'#0a0a0a':'#f3f4f6'}`,background:h.activo?'#f0fdf4':'#fafafa',alignItems:'center' }}>
                <div style={{ position:'relative',width:76,height:48,flexShrink:0 }}>
                  <img src={h.url_archivo} style={{ width:76,height:48,objectFit:'cover',borderRadius:4 }} onError={(e) => (e.target.style.display='none')} />
                  {h.url_recorte && <img src={h.url_recorte} style={{ position:'absolute',inset:0,width:76,height:48,objectFit:'contain' }} />}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:'.04em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{h.titulo || 'Sin título'}</p>
                  <p style={{ fontSize:11,color:'#6b7280' }}>{h.subtitulo}{(h.url_recorte || h.url_recorte_mobile) && <span style={{ marginLeft:6,color:'#16a34a',fontWeight:700 }}>· 3D</span>}</p>
                </div>
                {h.activo
                  ? <span style={{ background:'#16a34a',color:'#fff',padding:'3px 10px',borderRadius:100,fontSize:11,fontWeight:700,fontFamily:"var(--fd)",letterSpacing:'.06em',flexShrink:0 }}>● ACTIVO</span>
                  : <button onClick={() => setActive(h.id)} style={{ padding:'4px 11px',border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',fontSize:12,fontWeight:600,borderRadius:100,fontFamily:"var(--fb)",flexShrink:0 }}>Activar</button>
                }
                <button onClick={() => edit(h)} title="Editar" style={{ width:26,height:26,border:'1px solid #e5e7eb',background:'#fff',color:'#6b7280',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ic n="pe" s={12} /></button>
                <button onClick={() => del(h.id)} style={{ width:26,height:26,border:'none',background:'#fee2e2',color:'#ef4444',borderRadius:5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ic n="tr" s={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
