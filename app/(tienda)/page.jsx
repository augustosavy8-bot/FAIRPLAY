import { getHome } from '@/lib/catalog';
import HomeClient from '@/components/store/HomeClient';

export default async function HomePage() {
  const { heros, bannerCards } = await getHome();
  return (
    <HomeClient heros={heros} bannerCards={bannerCards} />
  );
}
