'use server';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function signIn(_prev, formData) {
  const email    = String(formData.get('email')    || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Completá email y contraseña' };

  const sb = createSupabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Credenciales incorrectas' };

  const { data: isAdmin } = await sb.rpc('is_admin');
  if (!isAdmin) {
    await sb.auth.signOut();
    return { error: 'Esta cuenta no tiene permisos de administrador' };
  }
  redirect('/admin');
}

export async function signOut() {
  const sb = createSupabaseServer();
  await sb.auth.signOut();
  redirect('/admin/login');
}
