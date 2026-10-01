import 'server-only';
import { createSupabaseServer } from '@/lib/supabase/server';

// Devuelve { sb, user } si hay sesión de un usuario registrado en la tabla `admins`; si no, { sb, user: null }.
export async function getAdmin() {
  const sb = createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, user: null };
  const { data: isAdmin, error } = await sb.rpc('is_admin');
  if (error || !isAdmin) return { sb, user: null };
  return { sb, user };
}
