'use client';
import { useState } from 'react';
import { uploadImage } from '@/lib/supabase';
import { Ic } from './Icons';

export default function ImageUploader({ value, onChange, label = 'Subir imagen', bucket = 'imagenes' }) {
  const [over, setOver]       = useState(false);
  const [loading, setLoading] = useState(false);

  const upload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setLoading(true);
    try {
      const url = await uploadImage(file, bucket);
      onChange(url);
    } catch {
      // fallback: base64
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target.result);
      reader.readAsDataURL(file);
    }
    setLoading(false);
  };

  if (value) return (
    <div className="iprev">
      <img src={value} alt="preview" onError={(e) => (e.target.style.display = 'none')} />
      <button
        onClick={() => onChange('')}
        style={{ position:'absolute',top:6,right:6,width:26,height:26,borderRadius:'50%',background:'rgba(0,0,0,.6)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}
      >
        <Ic n="x" s={12} />
      </button>
    </div>
  );

  return (
    <div
      className={`idrop${over ? ' ov' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files[0]); }}
    >
      <input type="file" accept="image/*" onChange={(e) => upload(e.target.files[0])} disabled={loading} />
      {loading ? (
        <>
          <span className="spin spin-g" style={{ display:'block',margin:'0 auto 6px' }} />
          <p style={{ fontSize:12,color:'#16a34a',fontWeight:600 }}>Subiendo...</p>
        </>
      ) : (
        <>
          <div style={{ fontSize:26,marginBottom:4 }}>📸</div>
          <p style={{ fontSize:12,fontWeight:700,color:'#475569',marginBottom:2 }}>{label}</p>
          <p style={{ fontSize:11,color:'#9ca3af' }}>Tocá o arrastrá</p>
        </>
      )}
    </div>
  );
}
