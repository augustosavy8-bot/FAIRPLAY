# Fair Play — Vida Deportiva

Tienda online de indumentaria deportiva. La compra se cierra por WhatsApp (bolsa de consulta → `wa.me`).
Dominio: https://www.fairplayvidadeportiva.com.ar · Repo: `augustosavy8-bot/FAIRPLAY` (rama `main`).

## Stack
- **Next.js 14 (App Router)**, React 18, **JSX sin TypeScript** (alias `@/*` → raíz, ver `jsconfig.json`).
- **Supabase** (proyecto `fairplay`, ref `opuejtszcflwzccdwdsl`): Postgres + Storage (bucket público `imagenes`).
- Cliente `@supabase/supabase-js` v2. Sin librería de UI ni Tailwind.

## Estructura
```
app/
  layout.jsx        Fuentes (Barlow / Barlow Condensed vía next/font) + metadata
  page.jsx          Server component: lee Supabase por REST (revalidate 60s) y renderiza <StoreClient>
  admin/
    layout.jsx      noindex para todo /admin
    page.jsx        Server: valida admin (getAdmin) y renderiza <AdminPanel>
    AdminPanel.jsx  Shell del panel (client): navegación, carga inicial, toasts. Lee con lib/supabase/browser
    _components/    Una sección por archivo: Dashboard, Productos, Categorias, Hero, Tarjetas, Ticker, Config + ui.jsx (Spin, Toast, DCATS)
    actions.js      Server actions de escritura (whitelist de columnas + chequeo de admin)
    login/          Login con Supabase Auth (email + contraseña)
  globals.css       Variables de diseño, animaciones y clases compartidas
  robots.js, sitemap.js, icon.png
components/
  StoreClient.jsx   Tienda (header, hero, filtros, grilla, footer). Cache en localStorage
  ProductCard.jsx, ProductModal.jsx, CartPanel.jsx, Carousel.jsx, BannerCards.jsx
  ImageUploader.jsx Comprime (lib/compress.js) y sube a Storage
  Icons.jsx         Set de íconos SVG (<Ic n="..."/>)
middleware.js       Protege /admin/* (sin sesión → /admin/login) y refresca cookies de Supabase
lib/
  supabase/server.js  Cliente con cookies para server components/actions (server-only)
  supabase/browser.js Cliente del navegador con la sesión del admin
  auth.js           getAdmin(): usuario logueado + rpc is_admin()
  upload.js         Subida a Storage con URL firmada emitida por el servidor
  compress.js       Compresión de imágenes en canvas (JPEG, o PNG si hay transparencia)
public/             logo.png, LOGO_FOKO.png
```

## Tablas de Supabase (schema `public`, todas con RLS habilitado)
| Tabla | Columnas principales | Uso |
|---|---|---|
| `productos` | id uuid, nombre, categoria, tipo, talles_disponibles text[], imagen_url, fotos text[], descripcion, activo, created_at | Catálogo. **No tiene precio, stock ni colores** |
| `hero_slides` | id, url_archivo, tipo_archivo ('image'\|'video'), titulo, subtitulo, activo, created_at | Carrusel principal (uno activo) |
| `categorias` | id text (slug), label, icon (emoji), orden, created_at | Filtro de categorías |
| `banner_cards` | id, titulo, subtitulo, etiqueta, cta, imagen_url, bloque, orden, activo, categoria, link_categoria, created_at | Tarjetas promocionales por bloque |
| `ticker_items` | id, texto, activo, orden, created_at | Cinta de avisos animada |
| `banners_temporada` | id, url_archivo, titulo, subtitulo, categoria, activo | **Legacy, no se usa en el código** |

Las fotos se guardan como URLs públicas de Storage (`imagenes/public/<timestamp>-<rand>.<ext>`). Nunca guardar base64 en la base: `page.jsx` y el admin filtran todo lo que no sea `http…`.

## Seguridad
- Admins = filas de `public.admins` (user_id). Función SQL `public.is_admin()` usada por RLS y por `getAdmin()`.
- RLS: lectura pública solo de lo que muestra la tienda; INSERT/UPDATE/DELETE solo admins. Storage `imagenes`: escritura solo admins. SQL en `supabase/migrations/`.
- Toda escritura del admin pasa por `app/admin/actions.js`. Nunca escribir desde el cliente.
- `SUPABASE_SERVICE_ROLE_KEY` solo del lado del servidor (nunca `NEXT_PUBLIC_`).

## Convenciones
- Archivos `.jsx`, componentes en PascalCase, código y textos en español rioplatense.
- Estilos: tokens y clases en `app/globals.css` (`--g` verde, `--k` negro, `--fd` Barlow Condensed para títulos, `--fb` Barlow para texto). La mayoría de los componentes usa además **estilos inline**; seguir el patrón del archivo que se edita.
- Tipografías solo vía `next/font/google` en `layout.jsx` (Barlow y Barlow Condensed, pesos 400–900).
- No cambiar el diseño visual sin pedido explícito.
- Imágenes con `next/image`; dominios remotos permitidos en `next.config.js` (`*.supabase.co`, `images.unsplash.com`).

## Comandos
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (verificar antes de pushear)
npm run start
npm run lint
```

## Variables de entorno (`.env.local`, nunca commitear)
Ver README.md → "Variables de entorno".
