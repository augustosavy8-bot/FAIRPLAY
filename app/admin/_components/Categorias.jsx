'use client';
import { useState } from 'react';
import { Ic } from '@/components/Icons';
import { adminUpsert, adminDelete } from '../actions';
import { Spin } from './ui';

// ── Categorías ────────────────────────────────────────────────
export default function ACats({ cats, setCats, toast, refresh }) {
  const [form, setForm] = useState({ id:'',label:'',icon:'🏷️' });
  const [saving, setSaving] = useState(false);
  const EMOJIS = ['👕','🧥','👖','🧤','👟','🎒','🧦','⌚','🏋️','⛸️','🎽','🧣','👗','👒','💼','🎿','🏊','🎾','⚽','🏀','🎯','🥾','🩴','👜'];

  const save = async () => {
    if (!form.label || !form.id) return;
    setSaving(true);
    const row = { id: form.id.toLowerCase().replace(/\s+/g, '-'), label: form.label, icon: form.icon, orden: cats.length };
    const { error } = await adminUpsert('categorias', row);
    if (!error) { await refresh(); toast('Categoría guardada'); setForm({ id:'',label:'',icon:'🏷️' }); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    const { error } = await adminDelete('categorias', id); if (error) { toast(error.message); return; }
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
