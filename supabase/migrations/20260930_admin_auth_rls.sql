-- ── Admins ────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

insert into public.admins (user_id)
select id from auth.users where email = 'fairplayadmin@gmail.com'
on conflict do nothing;

-- ── Tablas de la tienda ───────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['productos','hero_slides','categorias','banner_cards','ticker_items','banners_temporada'] loop
    execute format('drop policy if exists "Public insert %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Public update %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Public delete %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Public read %1$s"   on public.%1$I', t);

    execute format('create policy "admin_select" on public.%I for select to authenticated using ((select public.is_admin()))', t);
    execute format('create policy "admin_insert" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "admin_update" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy "admin_delete" on public.%I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;

-- Lectura pública: solo lo que muestra la tienda
create policy "public_read" on public.productos    for select to anon, authenticated using (activo = true);
create policy "public_read" on public.banner_cards for select to anon, authenticated using (activo = true);
create policy "public_read" on public.ticker_items for select to anon, authenticated using (activo = true);
create policy "public_read" on public.hero_slides  for select to anon, authenticated using (true);  -- la tienda usa todos como carrusel
create policy "public_read" on public.categorias   for select to anon, authenticated using (true);
-- banners_temporada: tabla sin uso, queda solo para admins

-- ── Storage: bucket imagenes ──────────────────────────────────
-- El bucket es público: las URLs /object/public/... se sirven sin política de SELECT.
-- Sacar la política pública de SELECT evita que cualquiera liste todos los archivos.
drop policy if exists "Public read imagenes"   on storage.objects;
drop policy if exists "Public upload imagenes" on storage.objects;
drop policy if exists "Public update imagenes" on storage.objects;
drop policy if exists "Public delete imagenes" on storage.objects;

create policy "imagenes_admin_select" on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and (select public.is_admin()));
create policy "imagenes_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and (select public.is_admin()));
create policy "imagenes_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'imagenes' and (select public.is_admin()));
create policy "imagenes_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and (select public.is_admin()));
