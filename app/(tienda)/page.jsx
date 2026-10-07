import { getHome } from '@/lib/catalog';
import HomeClient from '@/components/store/HomeClient';

const MOBILE  = '(max-width: 767px)';
const DESKTOP = '(min-width: 768px)';

// Precarga con prioridad alta el fondo y el recorte del primer slide (lo primero que se ve),
// cada uno solo en el tamaño de pantalla que corresponde.
function HeroPreload({ h }) {
  if (!h || h.tipo_archivo === 'video') return null;
  const links = [];
  const add = (href, media) => href && links.push({ href, media });
  if (h.url_archivo_mobile) { add(h.url_archivo_mobile, MOBILE); add(h.url_archivo, DESKTOP); }
  else add(h.url_archivo);
  if (h.url_recorte && h.url_recorte_mobile) { add(h.url_recorte_mobile, MOBILE); add(h.url_recorte, DESKTOP); }
  else if (h.url_recorte_mobile) add(h.url_recorte_mobile, MOBILE);
  else if (h.url_recorte) add(h.url_recorte, DESKTOP);
  return links.map((l) => (
    <link key={`${l.href}${l.media || ''}`} rel="preload" as="image" href={l.href} media={l.media} fetchPriority="high" />
  ));
}

export default async function HomePage() {
  const { heros, bannerCards } = await getHome();
  return (
    <>
      <HeroPreload h={heros[0]} />
      <HomeClient heros={heros} bannerCards={bannerCards} />
    </>
  );
}
