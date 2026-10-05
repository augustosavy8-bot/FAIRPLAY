# Fair Play — Vida Deportiva

Tienda online de indumentaria deportiva. La compra se cierra por WhatsApp (bolsa → `wa.me` con el pedido armado).
Dominio: https://www.fairplayvidadeportiva.com.ar · Repo: `augustosavy8-bot/FAIRPLAY` (rama `main`).

## Stack
- **Next.js 14 (App Router)**, React 18, **JSX sin TypeScript** (alias `@/*` → raíz, ver `jsconfig.json`).
- **Supabase** (proyecto `fairplay`, ref `opuejtszcflwzccdwdsl`): Postgres + Storage (bucket público `imagenes`).
- `@supabase/supabase-js` v2 + `@supabase/ssr`. Íconos de la tienda: `lucide-react`. Sin librería de UI ni Tailwind.

## Estructura
```
app/
  layout.jsx          Fuentes (Inter, Barlow, Barlow Condensed vía next/font) + metadata base
  globals.css         Tokens y clases del ADMIN (y keyframes compartidos)
  (tienda)/           Route group de la tienda pública (no cambia las URLs)
    layout.jsx        Server: trae productos, categorías, ajustes y ticker → <StoreProvider> + header, bottom nav, bolsa, búsqueda
    tienda.css        Design tokens y clases `s-*` de la tienda
    page.jsx          Home (/): hero, "Lo más buscado", promos, chips + grilla
    producto/[slug]/  Ficha (SSG + revalidate 60s, metadata OG y JSON-LD)
    favoritos/        Favoritos (localStorage)
  admin/
    layout.jsx        noindex para todo /admin
    page.jsx          Server: valida admin (getAdmin) y renderiza <AdminPanel>
    AdminPanel.jsx    Shell del panel (client): navegación, carga inicial, toasts. Lee con lib/supabase/browser
    _components/      Una sección por archivo: Dashboard, Productos, Categorias, Hero, Tarjetas, Ticker, Config + ui.jsx
    actions.js        Server actions de escritura (whitelist de columnas + chequeo de admin) y saveAjuste()
    login/            Login con Supabase Auth (email + contraseña)
  robots.js, sitemap.js (incluye /producto/*), icon.png
components/
  store/              Tienda: StoreProvider (bolsa, favoritos, toasts), Header, BottomNav, HeroCarousel, ProductCard,
                      ProductDetail, BagSheet, SearchOverlay, PromoCards, Footer, etc.
  ImageUploader.jsx   Comprime (lib/compress.js) y sube a Storage (admin)
  Icons.jsx           Set de íconos SVG del admin (<Ic n="..."/>)
middleware.js         Protege /admin/* (sin sesión → /admin/login) y refresca cookies de Supabase
lib/
  catalog.js          Lecturas públicas por REST con ISR (server-only): getProductos, getProducto, getCategorias, getHome, getAjustes
  product.js          Helpers compartidos: formatPrecio, pctOff, esNuevo, catLabel, waLink, WA_NUMBER, SITE_URL
  supabase/server.js  Cliente con cookies para server components/actions (server-only)
  supabase/browser.js Cliente del navegador con la sesión del admin
  auth.js             getAdmin(): usuario logueado + rpc is_admin()
  upload.js           Subida a Storage con URL firmada emitida por el servidor
  compress.js         Compresión de imágenes en canvas
public/               logo.png, LOGO_FOKO.png
```

## Tablas de Supabase (schema `public`, todas con RLS habilitado)
| Tabla | Columnas principales | Uso |
|---|---|---|
| `productos` | id uuid, slug (único, se genera al crear), nombre, categoria (género), tipo (id de categoría), talles_disponibles text[], imagen_url, fotos text[], descripcion, precio, precio_anterior, destacado, activo, created_at | Catálogo. Sin stock ni colores todavía |
| `hero_slides` | id, url_archivo (fondo desktop 16:7), url_archivo_mobile (4:5), url_recorte (persona transparente 40:21), url_recorte_mobile (2:3), tipo_archivo, titulo, subtitulo, activo | Carrusel principal. Con recorte: efecto 3D (la persona sobresale 20% arriba del marco) |
| `categorias` | id text (slug), label, icon (emoji), orden, created_at | Chips de categorías |
| `banner_cards` | id, titulo, subtitulo, etiqueta, cta, imagen_url, bloque, orden, activo, categoria, link_categoria, created_at | Tarjetas promocionales por bloque |
| `ticker_items` | id, texto, activo, orden, created_at | Cinta de avisos |
| `ajustes` | clave text pk, valor jsonb | Ajustes editables desde el admin (`nuevo_dias`) |
| `admins` | user_id | Usuarios con acceso al panel |
| `banners_temporada` | — | **Legacy, no se usa** |

- Precio vacío = no se muestra precio, % OFF ni total (la tienda funciona como "consultar por WhatsApp").
- El slug lo genera un trigger (`productos_set_slug`) y no cambia al renombrar, para no romper links compartidos.
- Las fotos son URLs públicas de Storage. Nunca guardar base64: `lib/catalog.js` y el admin filtran lo que no sea `http…`.

## Seguridad
- Admins = filas de `public.admins` (user_id). Función SQL `public.is_admin()` usada por RLS y por `getAdmin()`.
- RLS: lectura pública solo de lo que muestra la tienda; INSERT/UPDATE/DELETE solo admins. Storage `imagenes`: escritura solo admins. SQL en `supabase/migrations/`.
- Toda escritura del admin pasa por `app/admin/actions.js` (revalida todo el sitio con `revalidatePath('/', 'layout')`).
- `SUPABASE_SERVICE_ROLE_KEY` solo del lado del servidor (nunca `NEXT_PUBLIC_`).

## Convenciones
- Archivos `.jsx`, componentes en PascalCase, código y textos en español rioplatense.
- **Tienda**: estilos en `app/(tienda)/tienda.css` con tokens (`--surface`, `--text-2`, `--r-card`, `--r-pill`…) y clases `s-*`. Sin estilos inline salvo casos puntuales. Mobile-first; breakpoints 768 / 769 (nav) / 900 (ficha) / 1100 (grilla 4 col). Microinteracciones con `.s-press`.
- **Admin**: `app/globals.css` (`--g` verde, `--k` negro, `--fd` / `--fb`) y estilos inline. No rediseñar sin pedido explícito.
- Íconos: `lucide-react` en la tienda (strokeWidth 1.75), `components/Icons.jsx` en el admin.
- Tipografías solo vía `next/font/google` en `app/layout.jsx`: Inter (UI de la tienda), Barlow Condensed (títulos grandes), Barlow (admin).

## Comandos
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (verificar antes de pushear; no correrlo con `dev` prendido)
npm run start
npm run lint
```

## Variables de entorno (`.env.local`, nunca commitear)
Ver README.md → "Variables de entorno".
