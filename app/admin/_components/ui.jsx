'use client';
import { useEffect } from 'react';

export const DCATS = [
  {id:'remeras',label:'Remeras',icon:'👕'},{id:'buzos',label:'Buzos',icon:'🧥'},
  {id:'pantalones',label:'Pantalones',icon:'👖'},{id:'camperas',label:'Camperas',icon:'🧤'},
  {id:'calzado',label:'Calzado',icon:'👟'},{id:'mochilas',label:'Mochilas',icon:'🎒'},
  {id:'medias',label:'Medias',icon:'🧦'},{id:'accesorios',label:'Accesorios',icon:'⌚'},
];

export function Spin({ g }) { return <span className={g ? 'spin spin-g' : 'spin'} />; }

export function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">✓ {msg}</div>;
}
