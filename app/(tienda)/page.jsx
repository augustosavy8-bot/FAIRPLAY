import { Suspense } from 'react';
import { getHome } from '@/lib/catalog';
import HomeClient from '@/components/store/HomeClient';

export default async function HomePage() {
  const { heros, bannerCards } = await getHome();
  return (
    <Suspense>
      <HomeClient heros={heros} bannerCards={bannerCards} />
    </Suspense>
  );
}
