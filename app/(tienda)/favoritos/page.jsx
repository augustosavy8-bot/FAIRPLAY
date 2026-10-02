import FavoritosClient from '@/components/store/FavoritosClient';

export const metadata = {
  title: 'Favoritos — Fair Play',
  robots: { index: false },
};

export default function FavoritosPage() {
  return <FavoritosClient />;
}
