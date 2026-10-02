-- ── Productos: precio, precio anterior, destacado y slug ─────
alter table public.productos
  add column if not exists precio          numeric(12,2) check (precio >= 0),
  add column if not exists precio_anterior numeric(12,2) check (precio_anterior >= 0),
  add column if not exists destacado       boolean not null default false,
  add column if not exists slug            text;

create or replace function public.slugify(t text)
returns text language sql immutable set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(t, ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
    '[^a-z0-9]+', '-', 'g'))
$$;

-- El slug se genera una sola vez (al crear) para no romper links compartidos.
create or replace function public.productos_set_slug()
returns trigger language plpgsql set search_path = ''
as $$
declare base text; cand text; n int := 1;
begin
  if new.slug is not null and new.slug <> '' then return new; end if;
  base := coalesce(nullif(public.slugify(new.nombre), ''), 'producto');
  cand := base;
  while exists (select 1 from public.productos where slug = cand and id <> new.id) loop
    n := n + 1; cand := base || '-' || n;
  end loop;
  new.slug := cand;
  return new;
end $$;

drop trigger if exists productos_slug on public.productos;
create trigger productos_slug before insert or update on public.productos
  for each row execute function public.productos_set_slug();

do $$
declare r record;
begin
  for r in select id from public.productos where slug is null order by created_at loop
    update public.productos set slug = null where id = r.id;
  end loop;
end $$;

alter table public.productos alter column slug set not null;
create unique index if not exists productos_slug_key on public.productos (slug);

-- ── Ajustes de la tienda (clave/valor) ────────────────────────
create table if not exists public.ajustes (
  clave      text primary key,
  valor      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.ajustes enable row level security;
create policy "public_read"  on public.ajustes for select to anon, authenticated using (true);
create policy "admin_insert" on public.ajustes for insert to authenticated with check ((select public.is_admin()));
create policy "admin_update" on public.ajustes for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin_delete" on public.ajustes for delete to authenticated using ((select public.is_admin()));

insert into public.ajustes (clave, valor) values ('nuevo_dias', '30') on conflict do nothing;
