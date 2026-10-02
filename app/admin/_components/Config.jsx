'use client';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { saveAjuste } from '../actions';
import { signOut } from '../login/actions';

// ── Config ────────────────────────────────────────────────────
export default function ACfg({ userEmail, toast }) {
  const [nuevoDias, setNuevoDias] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSupabaseBrowser().from('ajustes').select('valor').eq('clave', 'nuevo_dias').maybeSingle()
      .then(({ data }) => setNuevoDias(String(data?.valor ?? 30)));
  }, []);

  const guardar = async () => {
    setSaving(true);
    const { error } = await saveAjuste('nuevo_dias', nuevoDias);
    setSaving(false);
    toast?.(error ? error.message : 'Ajuste guardado');
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}><h1 style={{ fontFamily:"var(--fd)",fontSize:26,fontWeight:900,letterSpacing:'.02em',textTransform:'uppercase' }}>Configuración</h1></div>
      <div className="ac" style={{ maxWidth:480,marginBottom:16 }}>
        <label className="albl">Días que un producto se muestra como “Nuevo”</label>
        <div style={{ display:'flex',gap:8 }}>
          <input className="ai" type="number" min="1" max="365" value={nuevoDias} onChange={(e) => setNuevoDias(e.target.value)} />
          <button className="btn-k" onClick={guardar} disabled={saving} style={{ padding:'0 18px',flexShrink:0 }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
      <div className="ac" style={{ maxWidth:480 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {[['WhatsApp', process.env.NEXT_PUBLIC_WA_NUMBER||''],['Usuario admin', userEmail || ''],['Supabase URL', process.env.NEXT_PUBLIC_SUPABASE_URL||'']].map(([lbl, val]) => (
            <div key={lbl}><label className="albl">{lbl}</label><input className="ai" value={val} readOnly style={{ background:'#f9fafb',color:'#6b7280',fontSize:13 }} /></div>
          ))}
          <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:7,padding:'11px 13px',marginTop:4 }}>
            <p style={{ fontSize:13,color:'#15803d',fontWeight:600 }}>🟢 Conectado a Supabase Pro</p>
            <p style={{ fontSize:11,color:'#16a34a',marginTop:2 }}>Base de datos activa · Plan Pro</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn-k" style={{ width:'100%',justifyContent:'center',padding:11 }}>Cerrar sesión</button>
          </form>
        </div>
      </div>
    </div>
  );
}
