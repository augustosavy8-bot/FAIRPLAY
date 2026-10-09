import { getProductos, getCategorias, getAjustes, getHome } from '@/lib/catalog';
import StoreProvider from '@/components/store/StoreProvider';
import Ticker from '@/components/store/Ticker';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import BottomNav from '@/components/store/BottomNav';
import BagSheet from '@/components/store/BagSheet';
import SearchOverlay from '@/components/store/SearchOverlay';
import WhatsAppFab from '@/components/store/WhatsAppFab';
import { Analytics } from '@vercel/analytics/next';
import './tienda.css';

export default async function TiendaLayout({ children }) {
  const [products, cats, ajustes, { tickerItems }] = await Promise.all([
    getProductos(), getCategorias(), getAjustes(), getHome(),
  ]);

  return (
    <StoreProvider products={products} cats={cats} ajustes={ajustes}>
      <div className="s-root">
        <Ticker items={tickerItems} />
        <Header />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <WhatsAppFab />
        <BagSheet />
        <SearchOverlay />
      </div>
      {/* Visitas y páginas vistas de la tienda (no se carga en /admin) */}
      <Analytics />
    </StoreProvider>
  );
}
