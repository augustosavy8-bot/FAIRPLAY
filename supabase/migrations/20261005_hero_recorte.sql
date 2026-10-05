-- Hero con efecto "pop-out": persona recortada que sobresale de la tarjeta
alter table public.hero_slides
  add column if not exists url_archivo_mobile text,   -- fondo vertical 4:5 para celular (opcional)
  add column if not exists url_recorte        text,   -- persona recortada, PNG/WebP transparente 40:21 (computadora)
  add column if not exists url_recorte_mobile text;   -- persona recortada 2:3 (celular)
