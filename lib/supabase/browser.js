import { createBrowserClient } from '@supabase/ssr';

let _client = null;

// Cliente del navegador con la sesión del admin (cookies). Solo lecturas: las escrituras van por server actions.
export function getSupabaseBrowser() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _client;
}
