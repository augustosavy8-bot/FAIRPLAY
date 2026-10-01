'use client';
import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Ic } from '@/components/Icons';
import { signIn } from './actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-k" style={{ width:'100%',justifyContent:'center',padding:13,marginTop:2 }}>
      {pending ? 'Ingresando…' : 'Ingresar al panel'}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useFormState(signIn, null);
  const [show, setShow] = useState(false);
  const [shk,  setShk]  = useState(false);

  useEffect(() => {
    if (!state?.error) return;
    setShk(true);
    const t = setTimeout(() => setShk(false), 500);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div style={{ minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#fff',width:'min(360px,95%)',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.5)' }}>
        <div style={{ background:'#0a0a0a',padding:'28px 28px 22px',textAlign:'center',position:'relative' }}>
          <Image src="/logo.png" alt="Fair Play" width={100} height={40} style={{ height:48,width:'auto',marginBottom:10 }} />
          <div style={{ fontSize:10,color:'#22c55e',fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',fontFamily:"var(--fd)" }}>Panel Administrador</div>
        </div>
        <form action={action} style={{ padding:'22px',display:'flex',flexDirection:'column',gap:12,animation:shk?'shake .4s':'none' }}>
          <div>
            <label className="albl">Email</label>
            <input className="ai" name="email" type="email" required placeholder="admin@ejemplo.com" autoComplete="username" />
          </div>
          <div>
            <label className="albl">Contraseña</label>
            <div style={{ position:'relative' }}>
              <input className="ai" name="password" type={show?'text':'password'} required placeholder="••••••••" style={{ paddingRight:40 }} autoComplete="current-password" />
              <button type="button" onClick={() => setShow((v) => !v)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',display:'flex',alignItems:'center' }}>
                <Ic n={show?'eo':'ey'} s={15} />
              </button>
            </div>
          </div>
          {state?.error && <div style={{ background:'#fef2f2',border:'1px solid #fecaca',padding:'7px 11px',fontSize:13,color:'#dc2626',fontWeight:600,borderRadius:6 }}>{state.error}</div>}
          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}
