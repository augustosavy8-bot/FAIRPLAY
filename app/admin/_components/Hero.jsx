'use client';
import { useState } from 'react';
import { Ic } from '@/components/Icons';
import ImageUploader from '@/components/ImageUploader';
import { adminInsert, adminDelete, setHeroActivo } from '../actions';
import { Spin } from './ui';

// ── Hero Posters ──────────────────────────────────────────────
export default function AHero({ heros, setHeros, toast, refresh }) {
  const [form,   setForm]   = useState({ titulo:'',subtitulo:'',url_archivo:'',tipo_archivo:'image' });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.url_archivo) return;
    setSaving(true);
    const { error } = await adminInsert('hero_slides', { url_archivo:form.url_archivo, tipo_archivo:form.tipo_archivo, titulo:form.titulo, subtitulo:form.subtitulo, activo:false });
    if (!error) { await refresh(); toast('Poster agregado'); setForm({ titulo:'',subtitulo:'',url_archivo:'',tipo_archivo:'image' }); }
    setSaving(false);
  };

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
