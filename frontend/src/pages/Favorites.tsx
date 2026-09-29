import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProductLists } from '../context/useProductLists';
import { useStore } from '../context/StoreContext';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Favorites() {
  usePageTitle('Mis favoritos', 'Guarda y encuentra rápidamente tus productos favoritos.');
  const { favoriteIds } = useProductLists();
  const { products } = useStore();
  const favorites = favoriteIds.flatMap(id => {
    const product = products.find(item => item.id === id);
    return product ? [product] : [];
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0052cc]"><Heart className="h-6 w-6" /></span>
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#348f00]">Tu selección</p><h1 className="text-3xl font-extrabold text-slate-900">Mis favoritos</h1></div>
      </div>
      {favorites.length ? (
        <>
          <p className="mb-6 text-sm text-slate-600">{favorites.length} {favorites.length === 1 ? 'producto guardado' : 'productos guardados'}. Puedes quitarlos con el corazón de cada tarjeta.</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 px-6 text-center">
          <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#0052cc] shadow-sm ring-1 ring-blue-100"><Heart className="h-9 w-9" /></span>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Aún no tienes favoritos</h2>
          <p className="mb-7 max-w-sm text-sm leading-6 text-slate-600">Guarda los productos que te interesan para encontrarlos fácilmente después.</p>
          <Link to="/productos" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0052cc] px-5 font-bold text-white hover:bg-[#003fa8]">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </main>
  );
}
