'use client';
import { useState } from 'react';
import { uploadImage } from '@/lib/supabase';
import { Ic } from './Icons';

export default function ImageUploader({ value, onChange, label = 'Subir imagen', bucket = 'imagenes' }) {
  const [over,    setOver]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, WebP, etc.)');
      return;
    }
    console.log('[ImageUploader] Iniciando upload:', file.name, file.type, file.size, 'bytes');
    setLoading(true);
    setError(null);

    try {
      const url = await uploadImage(file, bucket);
      console.log('[ImageUploader] URL obtenida:', url);
      onChange(url);
    } catch (err) {
      console.error('[ImageUploader] Error en Supabase Storage:', err.message, err);
      // Fallback a base64 para que el admin pueda seguir trabajando
      console.log('[ImageUploader] Usando fallback base64...');
      try {
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = (e) => { onChange(e.target.result); resolve(); };
          reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
          reader.readAsDataURL(file);
        });
        setError('Supabase no disponible — imagen guardada en base64 (funcionará pero no es ideal).');
      } catch {
        setError('No se pudo subir ni leer la imagen. Verificá el bucket "' + bucket + '" en Supabase.');
      }
    }

    setLoading(false);
  };

  if (value) return (
    <div className="iprev">
      <img src={value} alt="preview" onError={(e) => (e.target.style.display = 'none')} />
      <button
        onClick={() => { onChange(''); setError(null); }}
        style={{ position:'absolute',top:6,right:6,width:26,height:26,borderRadius:'50%',background:'rgba(0,0,0,.6)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}
      >
        <Ic n="x" s={12} />
      </button>
    </div>
  );

  return (
    <div>
      <div
        className={`idrop${over ? ' ov' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files[0]); }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }}
          disabled={loading}
        />
        {loading ? (
          <>
            <span className="spin spin-g" style={{ display:'block',margin:'0 auto 6px' }} />
            <p style={{ fontSize:12,color:'#16a34a',fontWeight:600 }}>Subiendo imagen...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize:26,marginBottom:4 }}>📸</div>
            <p style={{ fontSize:12,fontWeight:700,color:'#475569',marginBottom:2 }}>{label}</p>
            <p style={{ fontSize:11,color:'#9ca3af' }}>Tocá o arrastrá</p>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop:6,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'7px 11px',display:'flex',alignItems:'flex-start',gap:8 }}>
          <span style={{ fontSize:12,color:'#dc2626',fontWeight:600,flex:1,lineHeight:1.4 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:14,lineHeight:1,flexShrink:0 }}>✕</button>
        </div>
      )}
    </div>
  );
}
