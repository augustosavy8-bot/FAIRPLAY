# Fair Play — Vida Deportiva

Tienda online de indumentaria deportiva hecha con **Next.js 14** y **Supabase**. Los clientes arman una bolsa (talle + cantidad), guardan favoritos y envían el pedido por WhatsApp. Cada producto tiene su página `/producto/<slug>` para compartir. Incluye un panel de administración en `/admin` para cargar productos (con precio opcional y "destacado"), carrusel, categorías, banners, la cinta de avisos y ajustes.

## Requisitos
- Node.js 18.17 o superior
- Un proyecto de Supabase con las tablas `productos`, `hero_slides`, `categorias`, `banner_cards` y `ticker_items`, y un bucket **público** llamado `imagenes`

## Setup local
```bash
git clone https://github.com/augustosavy8-bot/FAIRPLAY.git
cd FAIRPLAY
npm install
# crear .env.local (ver abajo)
npm run dev
```
Abrí http://localhost:3000 (tienda) y http://localhost:3000/admin (panel).

## Variables de entorno
Crear `.env.local` en la raíz (está en `.gitignore`):

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (Supabase → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` |
| `NEXT_PUBLIC_WA_NUMBER` | Número de WhatsApp de la tienda, formato internacional sin `+` (ej. `549...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role`. **Solo servidor**, nunca con prefijo `NEXT_PUBLIC_` |

## Acceso al panel admin
El login de `/admin` usa **Supabase Auth** (email + contraseña). Para dar acceso a alguien:
1. Crear el usuario en Supabase → Authentication → Users → *Add user*.
2. Registrarlo como admin en SQL:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'persona@ejemplo.com';
   ```

Las políticas de seguridad (RLS) están en `supabase/migrations/`.

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

## Deploy
El proyecto se despliega en **Vercel** conectado al repo de GitHub:
1. Importar el repo en Vercel (framework: Next.js, sin configuración extra).
2. Cargar las variables de entorno de la tabla anterior en *Settings → Environment Variables* (Production y Preview).
3. Cada push a `main` despliega a producción automáticamente.
4. Dominio: `www.fairplayvidadeportiva.com.ar` (*Settings → Domains*).

La home se regenera cada 60 segundos (ISR), así que los cambios hechos en el admin aparecen en la tienda en hasta un minuto.
