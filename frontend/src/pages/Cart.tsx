import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Tag, Network } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { useAdmin } from '../context/AdminContext';
import CartProductImage from '../components/CartProductImage';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppOrder, cartPriceIsEstimated } from '../utils/cartOrder';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { formatShort } = useCurrency();
  const { settings } = useAdmin();
  const { products } = useStore();
  const suggestedCategories = [...new Set(products.map(product => product.category))].slice(0, 3);

  const FREE_SHIPPING_THRESHOLD = Number(settings.freeShippingMin) || 300;
  const SHIPPING_COST = 15;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress  = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const whatsappUrl = buildWhatsAppOrder(items, settings.storePhone);
  const estimated = cartPriceIsEstimated(items);
  const shippingCost = estimated || remaining === 0 ? 0 : SHIPPING_COST;
  const grandTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <main className="bg-[#f7faff] px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[480px]">
          <div className="max-w-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 shadow-sm">
              <ShoppingBag className="w-8 h-8 text-[#0052cc]" aria-hidden="true" />
            </div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0052cc] mb-4">
              <span className="w-8 h-px bg-[#48bb07]" aria-hidden="true" />
              Tu compra
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 mb-5">
              Tu carrito está vacío
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Encuentra los equipos y componentes que necesitas. Cuando agregues un producto, aparecerá aquí para revisar tu pedido.
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-3 min-h-12 px-6 py-3 rounded-xl bg-[#0052cc] text-white font-bold hover:bg-[#003fa8] transition-colors shadow-lg shadow-blue-200"
            >
              Explorar catálogo <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-xl shadow-blue-100/60 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-50 pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-16 w-52 h-52 rounded-full bg-lime-50 pointer-events-none" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#348f00] mb-2">Empieza por aquí</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">{suggestedCategories.length ? 'Explora nuestras categorías' : 'Nuevos productos en preparación'}</h2>
              {!suggestedCategories.length && <p className="text-slate-600">Estamos completando precios y disponibilidad para publicar el nuevo catálogo.</p>}
              <div className="space-y-3">
                {suggestedCategories.map(label => (
                  <Link
                    key={label}
                    to={`/productos?categoria=${encodeURIComponent(label)}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/60 transition-all"
                  >
                    <span className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#0052cc] group-hover:bg-lime-50 group-hover:text-[#348f00] transition-colors">
                      <Network className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1 font-semibold text-slate-800">{label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7faff] min-h-[60vh] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Tu carrito <span className="text-slate-500 text-lg sm:text-xl font-normal">({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors self-start sm:self-auto"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* LEFT: Items + progress bar */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">

          {/* Free shipping progress bar */}
          {!estimated && <div className={`rounded-xl sm:rounded-2xl p-4 border ${
            remaining === 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Truck className={`w-4 h-4 shrink-0 ${remaining === 0 ? 'text-emerald-600' : 'text-slate-500'}`} />
              {remaining === 0 ? (
                <p className="text-emerald-700 text-sm font-semibold">🎉 ¡Tienes envío gratis!</p>
              ) : (
                <p className="text-slate-700 text-sm">
                  Agrega <span className="text-slate-900 font-bold">{formatShort(remaining)}</span> más para{' '}
                  <span className="text-[#0052cc] font-semibold">envío gratis</span>
                </p>
              )}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${remaining === 0 ? 'bg-emerald-500' : 'gradient-brand'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {remaining > 0 && (
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-400">{formatShort(0)}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Tag className="w-3 h-3" /> Gratis a partir de {formatShort(FREE_SHIPPING_THRESHOLD)}
                </span>
              </div>
            )}
          </div>}

          {/* Cart items */}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-xs">
              <CartProductImage
                src={product.image}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shrink-0 bg-slate-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-[#0052cc] mb-0.5 uppercase tracking-wide font-semibold">{product.category}</p>
                <Link
                  to={`/producto/${product.id}`}
                  className="text-slate-900 font-semibold text-xs sm:text-sm hover:text-[#0052cc] transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{formatShort(product.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-2 sm:p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors touch-manipulation"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-2 sm:px-3 sm:py-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors touch-manipulation"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-slate-900 font-semibold text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="p-2 sm:px-3 sm:py-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors touch-manipulation"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24 shadow-xs">
            <h2 className="text-slate-900 font-bold text-base sm:text-lg mb-4 sm:mb-6">Resumen del pedido</h2>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs sm:text-sm gap-2">
                  <span className="text-slate-600 truncate">{product.name} ×{quantity}</span>
                  <span className="text-slate-900 shrink-0 font-medium">{formatShort(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 sm:pt-4 mb-4 sm:mb-6 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900 font-medium">{formatShort(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600">Envío</span>
                <span className={remaining === 0 ? 'text-emerald-700 font-semibold' : 'text-slate-900 font-medium'}>
                  {estimated ? 'Por confirmar' : remaining === 0 ? 'Gratis' : formatShort(SHIPPING_COST)}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">{estimated ? 'Total referencial' : 'Total estimado'}</span>
                <span className="text-[#0052cc]">{formatShort(grandTotal)}</span>
              </div>
            </div>

            {estimated && <p className="mb-4 text-xs text-slate-600">El precio final y la disponibilidad se confirmarán por WhatsApp.</p>}
            {whatsappUrl && <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0052cc] text-white text-sm sm:text-base font-bold hover:bg-[#003fa8] active:scale-95 transition-all shadow-md shadow-blue-200 touch-manipulation"
            >
              Enviar pedido por WhatsApp <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>}

            <Link
              to="/productos"
              className="w-full flex items-center justify-center mt-3 py-2.5 sm:py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>

      </div>
      </div>
    </main>
  );
}


