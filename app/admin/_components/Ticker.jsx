'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { Ic } from '@/components/Icons';
import { adminInsert, adminUpdate, adminDelete } from '../actions';
import { Spin } from './ui';

// ── Ticker ────────────────────────────────────────────────────
export default function ATicker({ toast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getSupabaseBrowser().from('ticker_items').select('*').order('orden', { ascending: true })
      .then(({ data }) => { if (data) setItems(data); setLoading(false); });
  }, []);

  const add = async () => {
    const texto = newText.trim();
    if (!texto) return;
    setSaving(true);
    const { data, error } = await adminInsert('ticker_items', { texto, activo: true, orden: items.length });
    if (!error && data) { setItems((i) => [...i, data]); setNewText(''); toast('Item agregado'); }
    setSaving(false);
  };

  const toggle = async (item) => {
    const { error } = await adminUpdate('ticker_items', item.id, { activo: !item.activo });
    if (error) { toast(error.message); return; }
    setItems((i) => i.map((x) => x.id === item.id ? { ...x, activo: !x.activo } : x));
  };

  const del = async (id) => {
    if (!confirm('¿Eliminar este item del ticker?')) return;
    const { error } = await adminDelete('ticker_items', id);
    if (error) { toast(error.message); return; }
    setItems((i) => i.filter((x) => x.id !== id));
    toast('Eliminado');
  };

  const updateOrden = async (id, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    const { error } = await adminUpdate('ticker_items', id, { orden: n });
    if (error) { toast(error.message); return; }
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
