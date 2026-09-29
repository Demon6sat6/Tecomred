import { ArrowLeftRight, ArrowRight, ShoppingCart, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartProductImage from '../components/CartProductImage';
import { useCart } from '../context/CartContext';
import { useProductLists } from '../context/useProductLists';
import { useStore } from '../context/StoreContext';
import { useCurrency } from '../hooks/useCurrency';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Compare() {
  usePageTitle('Comparar productos', 'Compara precio, disponibilidad y características de hasta tres productos.');
  const { compareIds, toggleCompare, clearCompare } = useProductLists();
  const { products } = useStore();
  const { addToCart } = useCart();
  const { formatShort } = useCurrency();
  const compared = compareIds.flatMap(id => {
    const product = products.find(item => item.id === id);
    return product ? [product] : [];
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0052cc]"><ArrowLeftRight className="h-6 w-6" /></span>
          <div><p className="text-xs font-bold uppercase tracking-widest text-[#348f00]">Elige con confianza</p><h1 className="text-3xl font-extrabold text-slate-900">Comparar productos</h1></div>
        </div>
        {compared.length > 0 && <button onClick={clearCompare} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Limpiar comparación</button>}
      </div>
      {compared.length ? (
        <>
          <p className="mb-5 text-sm text-slate-600">Compara hasta 3 productos. Desliza la tabla si estás en el móvil.</p>
          <div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead><tr className="bg-blue-50/70"><th scope="col" className="w-36 p-4 text-slate-600">Producto</th>{compared.map(product => (
                <th key={product.id} scope="col" className="min-w-52 border-l border-blue-100 p-4 align-top">
                  <div className="flex justify-end"><button onClick={() => toggleCompare(product.id)} aria-label={`Quitar ${product.name} de la comparación`} className="rounded-full p-1.5 text-slate-500 hover:bg-white hover:text-red-600"><X className="h-4 w-4" /></button></div>
                  <Link to={`/producto/${product.id}`} className="block text-center"><CartProductImage src={product.image} alt={product.name} className="mx-auto mb-3 h-32 w-36 rounded-xl bg-white object-contain" /><span className="font-bold text-slate-900 hover:text-[#0052cc]">{product.name}</span></Link>
                </th>
              ))}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                <tr><th scope="row" className="p-4 font-semibold text-slate-600">Precio</th>{compared.map(product => <td key={product.id} className="border-l border-slate-100 p-4 text-lg font-extrabold text-[#0052cc]">{product.price > 0 ? <>{formatShort(product.price)}{product.image.startsWith('/productos_tienda_tecnologia_20/') && product.stock === 0 && <span className="block text-xs font-medium text-slate-500">Referencial desde</span>}</> : 'Por consultar'}</td>)}</tr>
                <tr><th scope="row" className="p-4 font-semibold text-slate-600">Categoría</th>{compared.map(product => <td key={product.id} className="border-l border-slate-100 p-4 text-slate-800">{product.category}</td>)}</tr>
                <tr><th scope="row" className="p-4 font-semibold text-slate-600">Disponibilidad</th>{compared.map(product => <td key={product.id} className="border-l border-slate-100 p-4"><span className={product.stock ? 'font-semibold text-[#348f00]' : 'text-slate-500'}>{product.stock ? `${product.stock} unidades` : product.image.startsWith('/productos_tienda_tecnologia_20/') ? 'Por confirmar' : 'Agotado'}</span></td>)}</tr>
                <tr><th scope="row" className="p-4 align-top font-semibold text-slate-600">Características</th>{compared.map(product => <td key={product.id} className="border-l border-slate-100 p-4 align-top text-slate-700">{product.specs.length ? <ul className="list-inside list-disc space-y-1">{product.specs.map((spec, index) => <li key={`${spec}-${index}`}>{spec}</li>)}</ul> : <span className="text-slate-400">Por confirmar</span>}</td>)}</tr>
                <tr><th scope="row" className="p-4 font-semibold text-slate-600">Comprar</th>{compared.map(product => <td key={product.id} className="border-l border-slate-100 p-4">{product.price <= 0 || product.image.startsWith('/productos_tienda_tecnologia_20/') && product.stock === 0 ? <Link to={`/contacto?producto=${encodeURIComponent(product.name)}`} className="inline-flex min-h-10 items-center rounded-xl bg-[#0052cc] px-4 font-bold text-white">Consultar</Link> : <button disabled={product.stock === 0} onClick={() => addToCart(product)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0052cc] px-4 font-bold text-white hover:bg-[#003fa8] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><ShoppingCart className="h-4 w-4" />{product.stock ? 'Agregar' : 'Agotado'}</button>}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <Link to="/productos" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0052cc] hover:underline">{compared.length < 3 ? 'Agregar otro producto' : 'Volver al catálogo'} <ArrowRight className="h-4 w-4" /></Link>
        </>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 px-6 text-center">
          <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#0052cc] shadow-sm ring-1 ring-blue-100"><ArrowLeftRight className="h-9 w-9" /></span>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Elige qué comparar</h2>
          <p className="mb-7 max-w-sm text-sm leading-6 text-slate-600">Selecciona hasta tres productos desde el catálogo para revisar sus precios y características lado a lado.</p>
          <Link to="/productos" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0052cc] px-5 font-bold text-white hover:bg-[#003fa8]">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </main>
  );
}
