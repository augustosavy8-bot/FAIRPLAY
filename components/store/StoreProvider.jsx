'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const BAG_KEY = 'fp_bolsa';
const FAV_KEY = 'fp_favoritos';

function load(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function StoreProvider({ products, cats, ajustes, children }) {
  const [bag,  setBag]  = useState([]);
  const [favs, setFavs] = useState([]);
  const [ready, setReady] = useState(false);
  const [bagOpen,    setBagOpen]    = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { setBag(load(BAG_KEY, [])); setFavs(load(FAV_KEY, [])); setReady(true); }, []);
  useEffect(() => { if (ready) save(BAG_KEY, bag);  }, [bag, ready]);
  useEffect(() => { if (ready) save(FAV_KEY, favs); }, [favs, ready]);

  const notify = useCallback((msg) => {
    setToast({ msg, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Items de la bolsa: { key, id, slug, nombre, foto, talle, cantidad, precio }
  const addToBag = useCallback((p, talle, cantidad = 1) => {
    const key = `${p.id}::${talle || 'unico'}`;
    setBag((b) => {
      const ex = b.find((x) => x.key === key);
      if (ex) return b.map((x) => (x.key === key ? { ...x, cantidad: x.cantidad + cantidad } : x));
      return [...b, { key, id: p.id, slug: p.slug, nombre: p.nombre, foto: p.fotos?.[0] || p.imagen_url || null, talle: talle || null, cantidad, precio: p.precio ?? null }];
    });
  }, []);
  const setQty = useCallback((key, cantidad) => {
    setBag((b) => (cantidad < 1 ? b.filter((x) => x.key !== key) : b.map((x) => (x.key === key ? { ...x, cantidad } : x))));
  }, []);
  const removeFromBag = useCallback((key) => setBag((b) => b.filter((x) => x.key !== key)), []);
  const clearBag      = useCallback(() => setBag([]), []);

  const isFav     = useCallback((id) => favs.includes(id), [favs]);
  const toggleFav = useCallback((id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), []);

  const bagCount = bag.reduce((n, x) => n + x.cantidad, 0);

  const value = useMemo(() => ({
    products, cats, ajustes,
    bag, bagCount, addToBag, setQty, removeFromBag, clearBag,
    favs, isFav, toggleFav,
    bagOpen, setBagOpen, searchOpen, setSearchOpen,
    notify,
  }), [products, cats, ajustes, bag, bagCount, addToBag, setQty, removeFromBag, clearBag, favs, isFav, toggleFav, bagOpen, searchOpen, notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div key={toast.id} className="s-toast" role="status">{toast.msg}</div>}
    </Ctx.Provider>
  );
}
